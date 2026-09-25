# Decision 004 - Notes Save On Blur

**Date:** 2026-09-25
**Review by:** 2026-12-24
**Status:** Active

**Decision:** A personal note persists when its textarea loses focus, wired as
a single delegated `focusout` listener on `document` in `index.js` (guarded by
the `#watchlist-page` check), and `handleNoteChange` deliberately does not call
`renderHtml()`.

**Rationale:** Saving on blur keeps the note field consistent with how every
other control in this app behaves — click or leave it and the change is
already persisted — without adding a Save button and a saved/unsaved state to
every card. The listener uses `focusout` rather than `blur` because `blur`
does not bubble, so the delegated-listener pattern this app uses everywhere
else would silently never fire. The handler skips re-rendering because
`renderHtml()` replaces `#main-wrapper`'s `innerHTML`, which would destroy the
textarea the user is typing in and drop focus mid-edit.

**Alternatives rejected:** An explicit Save button was ruled out as more UI
state than this feature warrants. Saving on every keystroke was ruled out
because it writes to localStorage constantly and makes the re-render hazard
above much easier to trip. The accepted cost of blur-saving: text typed and
then abandoned by closing the tab, without leaving the field first, is lost.

**Depends on:** Two things must stay true or this silently breaks. `blur` must
not be substituted for `focusout` in `index.js` — it looks like a harmless
cleanup and would stop all saving. And `handleNoteChange` in `src/watchlist.js`
must not gain a `renderHtml()` call to match the other handlers, which all end
with one.
