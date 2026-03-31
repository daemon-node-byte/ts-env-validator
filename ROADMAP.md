# ts-env-validator — Roadmap

## 🎯 Vision

A lightweight, TypeScript-first environment variable validator that:
- Validates at runtime
- Infers types at compile time
- Provides excellent developer experience
- Works across Node, Next.js, and serverless environments

---

## 🚀 Milestones

### v0.1.0 — MVP (Initial Release)

#### Core Features
- `createEnv(schema, options?)`
- Validators:
  - `string()`
  - `number()`
  - `boolean()`
  - `enumOf([...])`
  - `url()`

#### Modifiers
- `.optional()`
- `.default(value)`
- `.describe(text)`

#### Behavior
- Reads from `process.env`
- Supports custom env object
- Coerces types (string → number/boolean/etc.)
- Collects ALL errors before throwing
- Strong TypeScript inference

#### DX Features
- Clean error formatting
- Helpful error messages
- Zero config usage

---

### v0.2.0 — Extended Types

- `integer()`
- `float()`
- `json()`
- `array(separator?)`

---

### v0.3.0 — Extensibility

- Custom validator API
- `.transform(fn)`
- `.refine(fn)`

---

### v0.4.0 — Ecosystem Enhancements

- dotenv helper
- `.env.example` validator CLI
- Next.js helpers (server/client env separation)

---

### v1.0.0 — Stable Release

- Finalized API
- Performance optimizations
- Full documentation
- Community feedback incorporated

---

## 🧠 Design Principles

- Minimal API surface
- Strong typing by default
- Fail fast at runtime
- Clear, readable errors
- Framework agnostic
- No unnecessary dependencies

---

## ❌ Explicit Non-Goals (v1)

- Nested schemas
- Async validation
- Framework-specific wrappers
- Over-engineered abstractions

---

## 📦 Release Strategy

| Version | Focus |
|--------|------|
| 0.1.0 | Core functionality |
| 0.2.0 | More types |
| 0.3.0 | Extensibility |
| 1.0.0 | Stability |

---

## 📈 Success Metrics

- Easy adoption in new projects
- Clean TypeScript inference
- Positive developer feedback
- GitHub stars / npm downloads