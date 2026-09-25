# Decision 005 - Escape User Text Before innerHTML

**Date:** 2026-09-25
**Review by:** 2026-12-24
**Status:** Active

**Decision:** Text the user typed is escaped through `escapeHtml()` in
`src/helpers.js` before being interpolated into any `innerHTML` template
string. Fields sourced from the OMDb API continue to be interpolated
unescaped, as they always have been.

**Rationale:** `src/render.js` builds every card as a template literal and
assigns it with `innerHTML`, so a note containing `</textarea>` or a stray `<`
would break the card's markup or inject elements. Notes are the first field in
this project whose content comes from the user rather than the API, which is
why the existing unescaped pattern was safe until now and isn't anymore.
Keeping the escaping in one exported helper rather than inline at each call
site means future user-entered fields get the same treatment by default.

**Alternatives rejected:** Building the note with `createElement` and
`textContent`, which is safe without any escaping, was ruled out because it
would make note rendering the only DOM-API code path in a file that is
otherwise entirely template strings. Escaping inline at each call site was
ruled out because the implementations drift apart as call sites multiply.

**Depends on:** `escapeHtml()` handles `&`, `<`, `>`, and `"` — enough for
element content and double-quoted attributes, but **not** for an unquoted
attribute value, which would also need `'`. Check this before putting user
text anywhere but a textarea body. Separately: `src/render.test.js` mocks
`./helpers.js` with an explicit factory listing each export by name, so adding
any export to `helpers.js` breaks that mock until it's added there too. Two
`generateWatchlistHtml` tests are failing for exactly this reason as of
2026-09-25 and were left unfixed on purpose.
