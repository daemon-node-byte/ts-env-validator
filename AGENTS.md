# ts-env-validator — Agent Instructions

## 🎯 Objective

Build and publish an npm package named `ts-env-validator`.

The package must:
- Validate environment variables at runtime
- Provide full TypeScript type inference
- Offer a clean and minimal API
- Be production-ready and publishable

---

## 🧱 Core Requirements

### Public API

```ts
import { createEnv, string, number, boolean, enumOf, url } from "ts-env-validator";

export const env = createEnv({
  NODE_ENV: enumOf(["development", "test", "production"]),
  PORT: number().default(3000),
  DATABASE_URL: url(),
  JWT_SECRET: string(),
  ENABLE_CACHE: boolean().default(false),
  LOG_LEVEL: enumOf(["debug", "info", "warn", "error"]).optional(),
});
```

## 🔧 Required Features

### Validators

- string()
- number()
- boolean()
- enumOf([...])
- url()

### Modifiers

- optional()
- default(value)
- describe(text)

## ⚙️ Behavior

- Read from process.env by default
- Accept custom env object override
- Coerce string values into correct types
- Collect all validation errors before throwing
- Throw a single formatted error

## 🧠 TypeScript Requirements

- Fully inferred return types
- No manual type casting required
- Strong typing for:

    - optional fields
    - default values
    - enums

## 🏗️ Architecture Guidelines

- Use a base validator abstraction
- Each validator returns a typed schema node
- Modifiers should return new chained instances
- Avoid mutation where possible
- Keep internal logic simple and composable

## ❌ Constraints

### Do **NOT** include:

- nested schemas
- async validation
- array parsing
- JSON parsing
- framework-specific wrappers
- transform/refine hooks

## 🧪 Testing Requirements

- Unit tests for each validator
- Integration tests for createEnv
- Test error formatting
- Ensure edge cases are covered

## 📦 Tooling Requirements

- TypeScript
- tsup (build)
- Vitest (testing)
- ESLint + Prettier
- GitHub Actions CI

## 📁 Expected Structure

```bash
src/
  index.ts
  create-env.ts
  errors.ts
  types.ts
  validators/
  utils/

test/
examples/
```

## 📚 Documentation Requirements

### README must include:

- problem description
- installation
- quick start
- API reference
- examples
- error handling explanation

## 🚀 Build & Output

- Output ESM + CJS
- Generate .d.ts files
- Clean build output
- No unnecessary files in package

## 🚀 Publish Requirements

- Version: 0.1.0
- Valid package.json
- Public npm package
- GitHub repo with tag

## ✅ Definition of Done

### The task is complete when:

- All tests pass
- Lint/typecheck/build succeed
- Types are inferred correctly
- Errors are readable and helpful
- Package installs in a clean project
- README reflects actual usage
- Package is ready for npm publish

## 🧠 Execution Order

- Scaffold project
- Build validator system
- Implement primitive validators
- Implement createEnv
- Add error handling
- Write tests
- Write README
- Setup CI
- Verify build output
- Prepare for publish

## ⚡ Priority

### Focus on:

- API clarity
- type inference
- error UX

#### Avoid overengineering.

Ship a clean MVP.
