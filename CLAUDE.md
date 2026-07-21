@AGENTS.md

## Project rule: verify against the regression checklist

After making ANY change to this site, run through `REGRESSION_CHECKLIST.md`
before reporting the work done. Multiple past rounds had one fix silently
breaking another page/section; the checklist is the guard against that cycle.

Key testing rule: verify **visibility**, not just DOM presence — content has
previously existed in the DOM while stuck invisible (`opacity: 0` from a
failed reveal animation). `textContent` checks alone are insufficient.

## Testing

Run with `npm test` (Vitest). Tests live next to their source file as
`<name>.test.ts`. See `TESTING.md` for framework details and conventions.

- 100% test coverage is the goal — tests make vibe coding safe.
- When writing a new function, write a corresponding test.
- When fixing a bug, write a regression test.
- When adding error handling, write a test that triggers the error.
- When adding a conditional (if/else, switch), write tests for BOTH paths.
- Never commit code that makes existing tests fail.
