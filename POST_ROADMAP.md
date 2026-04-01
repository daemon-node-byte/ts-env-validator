# Post-Roadmap Notes

This file is intentionally retired from active planning.

Use [ROADMAP.md](/Users/joshmclain/code/ts-env-validator/ROADMAP.md) as the only roadmap and release-planning source of truth.

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
