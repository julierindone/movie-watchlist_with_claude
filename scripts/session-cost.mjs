#!/usr/bin/env node
// Computes token usage and $ cost for a Claude Code session transcript.
//
// Usage:
//   node scripts/session-cost.mjs [sessionId]
//     sessionId defaults to $CLAUDE_CODE_SESSION_ID, then falls back to the
//     most recently modified transcript for this project. Only correct for
//     a top-level session's own transcript.
//
//   node scripts/session-cost.mjs --agent <agentId> [--parent <sessionId>]
//     Scores a subagent run instead (e.g. the test-writer agent spawned via
//     the Agent tool). A subagent has no way to know its own agentId, so
//     this must be run by whoever called Agent, using the agentId returned
//     in that tool's result. --parent defaults to $CLAUDE_CODE_SESSION_ID
//     (correct when run in the same session that spawned the agent).

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// $ per million tokens: [input, output]. Cache write/read are derived from
// input price (5m write = 1.25x, 1h write = 2x, cache read = 0.1x).
const PRICING = {
  "claude-fable-5-1": [10, 50],
  "claude-mythos-5-1": [10, 50],
  "claude-fable-5": [10, 50],
  "claude-opus-5": [5, 25],
  "claude-opus-4-8": [5, 25],
  "claude-opus-4-7": [5, 25],
  "claude-opus-4-6": [5, 25],
  "claude-sonnet-5": [2, 10],
  "claude-sonnet-4-6": [3, 15],
  "claude-haiku-4-5": [1, 5],
};

function projectSlug() {
  return process.cwd().replace(/\//g, "-");
}

function findTranscript(sessionId) {
  const projectsDir = path.join(os.homedir(), ".claude", "projects");
  const preferred = path.join(projectsDir, projectSlug(), `${sessionId}.jsonl`);
  if (fs.existsSync(preferred)) return preferred;

  // Fall back to searching every project dir in case cwd doesn't match
  // the slug the transcript was recorded under.
  for (const dir of fs.readdirSync(projectsDir)) {
    const candidate = path.join(projectsDir, dir, `${sessionId}.jsonl`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function findSubagentTranscript(parentSessionId, agentId) {
  const projectsDir = path.join(os.homedir(), ".claude", "projects");
  const preferred = path.join(
    projectsDir,
    projectSlug(),
    parentSessionId,
    "subagents",
    `agent-${agentId}.jsonl`,
  );
  if (fs.existsSync(preferred)) return preferred;

  for (const dir of fs.readdirSync(projectsDir)) {
    const candidate = path.join(projectsDir, dir, parentSessionId, "subagents", `agent-${agentId}.jsonl`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function latestTranscript() {
  const dir = path.join(os.homedir(), ".claude", "projects", projectSlug());
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => {
      const full = path.join(dir, f);
      return { full, mtime: fs.statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  return files[0]?.full ?? null;
}

function resolveTranscriptPath(sessionIdArg) {
  const sessionId = sessionIdArg || process.env.CLAUDE_CODE_SESSION_ID;
  if (sessionId) {
    const found = findTranscript(sessionId);
    if (found) return found;
    console.error(`No transcript found for session ${sessionId}; falling back to most recent.`);
  }
  return latestTranscript();
}

function loadUsage(transcriptPath) {
  const lines = fs.readFileSync(transcriptPath, "utf8").split("\n").filter(Boolean);
  const seenIds = new Set();
  const byModel = {};

  for (const line of lines) {
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      continue;
    }
    const msg = obj.message;
    if (!msg || typeof msg !== "object") continue;
    const usage = msg.usage;
    if (!usage) continue;

    const mid = msg.id;
    if (mid) {
      if (seenIds.has(mid)) continue;
      seenIds.add(mid);
    }

    const model = msg.model || "unknown";
    const bucket = (byModel[model] ??= {
      input: 0,
      output: 0,
      cache5m: 0,
      cache1h: 0,
      cacheRead: 0,
    });

    bucket.input += usage.input_tokens || 0;
    bucket.output += usage.output_tokens || 0;
    bucket.cacheRead += usage.cache_read_input_tokens || 0;

    if (usage.cache_creation) {
      bucket.cache5m += usage.cache_creation.ephemeral_5m_input_tokens || 0;
      bucket.cache1h += usage.cache_creation.ephemeral_1h_input_tokens || 0;
    } else {
      // Older transcripts without the ephemeral breakdown: assume 5m (the default TTL).
      bucket.cache5m += usage.cache_creation_input_tokens || 0;
    }
  }

  return byModel;
}

function computeCost(byModel) {
  let totalIn = 0;
  let totalOut = 0;
  let totalCost = 0;
  const unpriced = [];

  for (const [model, u] of Object.entries(byModel)) {
    const inTokens = u.input + u.cache5m + u.cache1h + u.cacheRead;
    totalIn += inTokens;
    totalOut += u.output;

    const rate = PRICING[model];
    if (!rate) {
      unpriced.push(model);
      continue;
    }
    const [inRate, outRate] = rate;
    totalCost +=
      (u.input * inRate) / 1e6 +
      (u.output * outRate) / 1e6 +
      (u.cache5m * inRate * 1.25) / 1e6 +
      (u.cache1h * inRate * 2) / 1e6 +
      (u.cacheRead * inRate * 0.1) / 1e6;
  }

  return { totalIn, totalOut, totalCost, unpriced };
}

function parseArgs(argv) {
  const agentIdx = argv.indexOf("--agent");
  if (agentIdx === -1) return { mode: "session", sessionId: argv[0] };

  const agentId = argv[agentIdx + 1];
  const parentIdx = argv.indexOf("--parent");
  const parentSessionId = parentIdx === -1 ? process.env.CLAUDE_CODE_SESSION_ID : argv[parentIdx + 1];
  return { mode: "agent", agentId, parentSessionId };
}

const args = parseArgs(process.argv.slice(2));

let transcriptPath;
if (args.mode === "agent") {
  if (!args.agentId || !args.parentSessionId) {
    console.error("Usage: node scripts/session-cost.mjs --agent <agentId> [--parent <sessionId>]");
    process.exit(1);
  }
  transcriptPath = findSubagentTranscript(args.parentSessionId, args.agentId);
} else {
  transcriptPath = resolveTranscriptPath(args.sessionId);
}

if (!transcriptPath) {
  console.error("No transcript found.");
  process.exit(1);
}

const byModel = loadUsage(transcriptPath);
const { totalIn, totalOut, totalCost, unpriced } = computeCost(byModel);

if (unpriced.length) {
  console.error(`Warning: no pricing table entry for model(s): ${unpriced.join(", ")} — their tokens are counted but not costed.`);
}

console.log(`Cost per run: $${totalCost.toFixed(2)} (${totalIn.toLocaleString()} in / ${totalOut.toLocaleString()} out)`);
