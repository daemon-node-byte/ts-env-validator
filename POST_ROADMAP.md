# ts-env-validator — Post v0.3.0 Roadmap

## Vision

Evolve `ts-env-validator` into:

> A type-safe configuration contract toolkit for TypeScript applications

Not just validation, but:

- environment correctness
- developer tooling
- CI enforcement
- documentation generation
- framework integration

## Strategy Overview

We will expand in 5 directions:

1. Core Library Depth
2. CLI & Tooling
3. Framework Adapters
4. CI / DevOps Integration
5. Ecosystem Expansion

## Version Roadmap

## v0.4.0 — Advanced Validators

### Goal

Make the library production-ready for most real-world apps.

### Features

#### New Validators

- `integer()`
- `float()`
- `port()`
- `email()`
- `uuid()`
- `json<T>()`
- `array(separator?)`
- `date()`
- `duration()`

#### Enhancements

- Improved parsing error messages
- Better boolean parsing edge cases

## v0.5.0 — Constraints & Transformations

### Goal

Move from parsing to validation contracts.

### Features

#### Constraints

- `.min(n)`
- `.max(n)`
- `.length(n)`
- `.nonempty()`
- `.matches(regex)`

#### Transformations

- `.transform(fn)`
- `.refine(fn, message?)`
- `.pipe(validator)`

### Example

```ts
API_KEY: string().min(32)

BASE_URL: string()
  .transform((v) => v.trim())
  .refine((v) => v.startsWith("https://"), "Must use HTTPS")
```

## v0.6.0 — CLI (Major Feature)

### Goal

Make the package useful beyond runtime.

### New Package

- `@ts-env-validator/cli`

### Commands

#### `check`

Validate environment without running the app.

```bash
ts-env-validator check
```

#### `generate-example`

Generate `.env.example` from schema.

```bash
ts-env-validator generate-example
```

#### `sync-docs`

Generate Markdown docs from schema.

```bash
ts-env-validator sync-docs
```

#### `diff`

Compare schema vs actual env.

```bash
ts-env-validator diff
```

## v0.7.0 — Framework Adapters

### Goal

Drive adoption through framework-specific DX.

### New Packages

- `@ts-env-validator/next`
- `@ts-env-validator/vite`

### Next.js Adapter

```ts
const env = createNextEnv({
  server: {
    DATABASE_URL: url(),
    JWT_SECRET: string(),
  },
  client: {
    NEXT_PUBLIC_API_URL: url(),
  },
});
```

### Features

- server/client separation
- prefix enforcement
- build-time validation option

### Vite Adapter

- enforce `VITE_` prefix
- typed client env

## v0.8.0 — Security & Secrets

### Goal

Introduce production-grade safety.

### Features

#### Secret Awareness

- `.secret()`
- `.sensitive()`

#### Behavior

- hide values in error output
- redact logs

#### Security Checks

- detect weak secrets
- warn on default placeholders like `changeme`

## v0.9.0 — Namespaces & Monorepo Support

### Goal

Support large systems and microservices.

### Features

#### Namespaces

```ts
db: namespace("DB_", {
  HOST: string(),
  PORT: port(),
})
```

#### Monorepo Support

- shared schemas
- workspace validation CLI
- multi-service env validation

## v1.0.0 — Stable Release

### Goal

Production-ready ecosystem.

### Requirements

- Stable API
- Full documentation
- Performance optimizations
- Plugin system (optional)
- CLI maturity
- Framework adapters stable

## Cross-Cutting Features

These evolve across versions.

### Documentation Generation

#### Features

- Generate Markdown config docs
- Include:
  - type
  - required/optional
  - default
  - description

### Schema Export

#### Features

- export schema to JSON
- reusable across tools

### CI Integration

#### GitHub Action

- `@ts-env-validator/github-action`

#### Features

- validate `.env.example`
- enforce schema consistency
- PR feedback

### Testing Utilities

Future helpers:

- mock env generator
- test schema validation
- snapshot env configs

## Ecosystem Plan

Split into modular packages:

- `ts-env-validator` (core)
- `@ts-env-validator/cli`
- `@ts-env-validator/next`
- `@ts-env-validator/vite`
- `@ts-env-validator/github-action`
- `@ts-env-validator/docs`

## High Impact Features (Priority)

If limited time, prioritize:

- `.env.example` generation
- CLI (`check`, `generate-example`)
- Next.js adapter
- secret-aware validation
- documentation generation

## Success Metrics

- npm downloads growth
- GitHub stars
- usage in real projects
- adoption in CI pipelines
- developer feedback

## Long-Term Vision

Position the library as:

> The standard way to define and validate configuration in TypeScript applications

## Guiding Principle

Do not just add validators.

Build:

- a system
- a workflow
- a developer habit
