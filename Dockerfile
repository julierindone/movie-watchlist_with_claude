FROM node:24-slim

WORKDIR /workspace

RUN apt-get update && apt-get install -y \
    curl \
    git \
    bash \
    ca-certificates \
    nano \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

# Set up Claude Code configuration directory and copy settings template
RUN mkdir -p /root/.claude/skills
COPY .claude/skills/ /root/.claude/skills/

# Copy agents into Claude Code agents directory
RUN mkdir -p /root/.claude/agents
COPY .claude/agents/ /root/.claude/agents/

# Claude Code configuration: default settings + status line
COPY settings.json /root/.claude/settings.json
COPY statusline.sh /root/.claude/statusline.sh
RUN chmod +x /root/.claude/statusline.sh

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Student shell quality-of-life improvements
RUN echo 'export PS1="ai-course:\\w# "' >> /root/.bashrc && \
    echo 'alias ll="ls -alF"' >> /root/.bashrc && \
    echo 'alias la="ls -A"' >> /root/.bashrc && \
    echo 'alias l="ls -CF"' >> /root/.bashrc

# Configure git
RUN git config --global user.name "Julie Rindone" && \
    git config --global user.email "julie.rindone@gmail.com" && \
    git config --global core.autocrlf input && \
    git config --global --add safe.directory /workspace

COPY package.json .
COPY package-lock.json .

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["/bin/bash"]
