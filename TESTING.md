# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast,
trust your instincts, and ship with confidence — without them, vibe coding is
just yolo coding. With tests, it's a superpower.

## Framework

[Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com)
(`@testing-library/react`, `@testing-library/jest-dom`), with `jsdom` as the
DOM environment. Config: `vitest.config.ts` / `vitest.setup.ts`.

## Running tests

```bash
npm test
```

Runs every `*.test.ts` / `*.test.tsx` file once (CI mode, no watch). CI runs
the same command on every push and pull request (`.github/workflows/test.yml`).

## Test layers

- **Unit tests** — pure functions and small modules (e.g. `lib/media.ts`).
  Live next to the source file as `<name>.test.ts`.
- **Integration tests** — components or API routes that touch multiple
  pieces (e.g. an editable field wired to the content store). Mock external
  dependencies (Supabase, the filesystem, network).
- **Smoke tests** — not yet set up; `/qa` can add these against a running
  dev server.
- **E2E tests** — not yet set up; would live under `e2e/` with Playwright if
  added later.

## Conventions

- File naming: `<source-file>.test.ts` (or `.test.tsx` for components),
  colocated with the file it tests.
- Assertions: `expect(...).toBe(...)` / Testing Library matchers
  (`toBeInTheDocument`, etc.) from `@testing-library/jest-dom`.
- Structure: `describe("thing")` blocks grouping `it("does X")` cases.
- No mocking of the thing under test — mock its dependencies only.
