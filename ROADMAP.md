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

### v0.3.x — Extensibility Foundation

- public `createValidator({ expected, parse })` API
- public validator and parser result types
- custom validators work with `createEnv`
- custom validators support `.optional()`, `.default()`, and `.describe()`
- thrown parser errors are normalized into validation failures

Shipped across:

- `v0.3.0`
- `v0.3.1`
- `v0.3.2`

## Next

### v0.4.0 — Core Constraints

Goal: add first-party validation constraints to built-in validators without expanding into full transform/refine pipelines yet.

- `string().nonempty()`
- `string().minLength(length)`
- `string().maxLength(length)`
- `string().pattern(regex, label?)`
- `number().min(value)` / `.max(value)`
- `integer().min(value)` / `.max(value)`
- `float().min(value)` / `.max(value)`
- constrained defaults fail immediately when `.default(value)` is invalid
- immutable modifier chaining preserved across constraints
- README/examples updated around constrained schemas

Explicitly deferred:

- `.transform(fn)`
- `.refine(fn)`
- array/url/enum-specific constraints

## Provisional

### v0.5.0 — Validation Pipelines

Potential focus:

- `.refine(fn, message?)`
- carefully scoped `.transform(fn)` exploration
- more composable validator pipelines once constraint ergonomics settle

### v0.6.0 — Tooling

Potential focus:

- dotenv helper
- `.env.example` generation or validation
- schema-driven docs or CLI support

### v0.7.0 — Framework DX

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
- broad transform pipelines before the constraints layer is proven stable
