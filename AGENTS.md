# shallow-react-snapshot — Agent Guide

## Project overview

`shallow-react-snapshot` is a small utility library that brings Enzyme-style *shallow* snapshot testing to projects using React Testing Library. It inspects React's internal Fiber tree on an already-rendered DOM element and returns a jest-friendly shallow JSON object representing only the immediate children of the component under test — without rendering or mocking nested components.

Supports React 16–19 from a single build.

## Repository layout

```
src/                    # Library source
  index.ts              # Exported shallow() function
  types.ts              # TypeScript interfaces (Fiber, ReactTestObject, etc.)
  reactSymbols.ts       # React internal Symbol.for() constants (avoids react-is dep)
  __tests__/
    functional.test.tsx # Tests for functional components
    class.test.tsx      # Tests for class components
    __snapshots__/      # Auto-generated Jest snapshots
dependencies/           # Isolated React installs per version
  react-16/             # React 16 + @testing-library/react
  react-17/
  react-18/
  react-19/
scripts/
  lib/findDependency.mjs  # Resolves per-version dep paths for jest moduleNameMapper
  playground.sh           # Starts browser playground
playground/             # Interactive JSX playground
dist/                   # Build output (gitignored, published to npm)
```

## Public API

```typescript
function shallow(
  rootElement: Element | null,
  RootReactComponent: ReactComponent | string
): ReactTestChild | null
```

Takes an already-rendered DOM `rootElement` and the component constructor (or display name string) whose shallow output you want. Returns a `ReactTestObject` compatible with `toMatchSnapshot()`.

## Development workflow

Install dependencies (required before any other command):

```bash
npm ci
```

| Task | Command |
|---|---|
| Build | `npm run build` |
| Build (watch) | `npm run dev` |
| Test (all React versions) | `npm test` |
| Test (single React version) | `npm test -- --selectProjects react-16` |
| Lint | `npm run lint` |
| Lint + auto-fix | `npm run lint:fix` |
| Browser playground | `npm run playground` |

## Testing

Tests run against **four isolated React versions** (16, 17, 18, 19) in parallel via Jest projects. Each project in `dependencies/<react-version>/` has its own `node_modules` with a pinned React, react-dom, and @testing-library/react.

`jest.config.mjs` dynamically generates one Jest project per `dependencies/` subdirectory and maps module imports to the correct version using `moduleNameMapper`.

Test files use `toMatchSnapshot()`. After any intentional output change, update snapshots:

```bash
npm test -- --updateSnapshot
```

All PRs must include tests for new behaviour.

This repo has an unusual snapshot setup: all four React version projects share the same snapshot files. This means every React version must produce identical output for the same test — if they don't, the second run will fail with snapshot mismatches even though the first run passed (because one version wrote the snapshot and another version disagrees with it).

The correct workflow after any output change:

```bash
npm test -- --updateSnapshot  # re-generate snapshots from current output
npm test                      # second run verifies all versions agree
```

If the second run fails with snapshot mismatches, it means React versions are producing different output — the implementation needs to be fixed to be consistent, not the snapshots.

## Code style

Enforced by [Biome](https://biomejs.dev/):
- Spaces (not tabs), double quotes for JS strings.
- `recommended` lint rules; some rules relaxed inside `__tests__/`.
- `dist/`, `playground/`, and `package.json` excluded from linting.

```bash
npm run lint        # check
npm run lint:fix    # auto-fix safe issues
```

Always run lint before considering work done. Biome enforces a line length limit — long chained expressions (e.g. `??` chains) will need line breaks.

## TypeScript

- `tsconfig.json` — full config including tests (used by IDE and ts-jest).
- `tsconfig.build.json` — same but excludes `__tests__/` (used by `npm run build`).
- Compiler target: `es2016`, `module: commonjs`, `strict: true`.

## Release process

Releases are managed with [Changesets](https://github.com/changesets/changesets).

Create a changeset file manually in `.changeset/<descriptive-name>.md` with the following format:

```md
---
"shallow-react-snapshot": patch
---

Short user-facing description of the change. Focus on what users need to know, not implementation details. Use `patch` for bug fixes and new features that are backward-compatible, `minor` for new functionality, `major` for breaking changes.
```

## Local development against a consumer project

```bash
# In this repo
npm link
npm run dev

# In the consumer project
npm link shallow-react-snapshot
```

## Key internals

- **Fiber discovery** — `getFirstNestedFiberOrInternalInstance()` walks DOM children looking for `__reactFiber$…` (React 17+) or `__reactInternalInstance$…` (React 16) properties.
- **Component matching** — climbs the `.return` (parent) Fiber chain until `.type` matches the provided component reference or display name string.
- **State handling** — traverses `.alternate` linked list to find the currently committed `memoizedProps`, handling the stale-alternate edge case that caused the every-other-update bug fixed in v0.2.1.
- **React symbols** — `src/reactSymbols.ts` declares Fragment, Memo, ForwardRef, Portal, etc. via `Symbol.for()` instead of importing from `react-is`, enabling cross-version compatibility.
- **React internals differ per version** — when adding support for a new React type, always verify the actual object shape (keys, `$$typeof`, back-references) across all four React versions using `node -e` with each version's `node_modules`. React 19 in particular restructured Context: `ctx.Provider === ctx` (the Provider IS the context object, `$$typeof: react.context`, no `_context`), and `Context.Consumer` uses a new `$$typeof: react.consumer`. React 16–18 use `$$typeof: react.provider` for Provider and `$$typeof: react.context` for Consumer, both carrying a `_context` back-reference to the parent context. The `displayName` always lives on the context object itself (`ctx.displayName`), reachable as `type._context.displayName` from Provider/Consumer in React 16–18, and as `type.displayName` directly in React 19.

## CI

GitHub Actions runs on Node 18, 20, 22, and 24 for every push/PR to `main`:
1. `npm ci`
2. `npm run build`
3. `npm test`
4. `npm run lint`
