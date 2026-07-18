@AGENTS.md

## Project rule: verify against the regression checklist

After making ANY change to this site, run through `REGRESSION_CHECKLIST.md`
before reporting the work done. Multiple past rounds had one fix silently
breaking another page/section; the checklist is the guard against that cycle.

Key testing rule: verify **visibility**, not just DOM presence — content has
previously existed in the DOM while stuck invisible (`opacity: 0` from a
failed reveal animation). `textContent` checks alone are insufficient.
