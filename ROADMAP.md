# ts-env-validator — Roadmap

`ROADMAP.md` is the single source of truth for planned releases.

## Vision

Build a lightweight, TypeScript-first environment validator that:

- validates at runtime
- infers types at compile time
- stays small and framework-agnostic
- gives helpful startup failures instead of late runtime surprises

## Shipped

### v0.1.0 — Core MVP

- `createEnv(schema, options?)`
- validators: `string()`, `number()`, `boolean()`, `enumOf([...])`, `url()`
- modifiers: `.optional()`, `.default(value)`, `.describe(text)`
- aggregated error reporting
- custom env source support

### v0.2.0 — Extended Types

- `integer()`
- `float()`
- `json<T>()`
- `array(separator?)`

## Next

### v0.3.0 — Extensibility Foundation

Goal: let users create first-class custom validators without expanding the validation model yet.

- public `createValidator({ expected, parse })` API
- public validator and parser result types
- custom validators work with `createEnv`
- custom validators support `.optional()`, `.default()`, and `.describe()`
- thrown parser errors are normalized into validation failures

Explicitly deferred:

- `.transform(fn)`
- `.refine(fn)`
- constraint-style modifiers like `.min()` and `.max()`

## Provisional

### v0.4.0 — Validation Constraints

Potential focus:

- string and number constraints
- `.transform(fn)`
- `.refine(fn, message?)`
- more composable validator pipelines

### v0.5.0 — Tooling

Potential focus:

- dotenv helper
- `.env.example` generation or validation
- schema-driven docs or CLI support

### v0.6.0 — Framework DX

Potential focus:

- Next.js helpers for server and client separation
- prefix enforcement for client-safe env keys
- framework-specific docs, not core package coupling

### v1.0.0 — Stable Release

- stable public API
- polished docs
- performance review
- community feedback incorporated

## Design Principles

- minimal API surface
- strong typing by default
- readable errors
- sync, startup-time validation
- composable internals without overengineering

## Non-Goals

- nested schemas
- async validation
- framework-specific wrappers in the core package
- broad transform pipelines before the base validator contract is stable
