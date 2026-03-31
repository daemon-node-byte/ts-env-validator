# ts-env-validator — Tasks

## 🧱 Phase 1: Project Setup

- [x] Initialize project (pnpm or npm)
- [x] Create `src/` structure
- [x] Setup TypeScript config
- [x] Install dependencies:
  - typescript
  - tsup
  - vitest
  - eslint
  - prettier
- [x] Configure tsup build
- [x] Configure Vitest
- [x] Configure ESLint + Prettier
- [x] Add scripts:
  - build
  - dev
  - test
  - lint
  - typecheck

---

## ⚙️ Phase 2: Core Types & Architecture

- [x] Create base validator type
- [x] Define schema type system
- [x] Implement fluent modifier chaining:
  - optional()
  - default()
  - describe()
- [x] Define internal parsing contract

---

## 🔧 Phase 3: Validators

### Primitive Validators

- [x] Implement `string()`
- [x] Implement `number()`
  - parseFloat
  - handle NaN
- [x] Implement `boolean()`
  - true/false parsing
- [x] Implement `enumOf(values)`
- [x] Implement `url()`

---

## 🧠 Phase 4: createEnv()

- [x] Read from `process.env`
- [x] Support custom env input
- [x] Iterate schema keys
- [x] Apply parsing per validator
- [x] Handle:
  - missing values
  - default values
  - optional values
- [x] Collect all errors
- [x] Return typed result object

---

## ❌ Phase 5: Error Handling

- [x] Create `EnvValidationError`
- [x] Structure error data:
  - missing
  - invalid
- [x] Build error formatter
- [x] Add readable CLI output
- [ ] Add snapshot tests

---

## 🧪 Phase 6: Testing

### Unit Tests
- [x] string validator
- [x] number validator
- [x] boolean validator
- [x] enum validator
- [x] url validator

### Integration Tests
- [x] full schema success case
- [x] missing variables
- [x] invalid values
- [x] mixed errors
- [x] default behavior
- [x] optional behavior

---

## 📚 Phase 7: Documentation

- [x] Write README:
  - intro
  - install
  - quick start
  - API reference
  - examples
- [x] Add examples:
  - Node.js
  - Next.js

---

## 🔁 Phase 8: CI/CD

- [x] Setup GitHub Actions:
  - install
  - lint
  - typecheck
  - test
  - build

---

## 📦 Phase 9: Packaging

- [x] Configure `package.json`:
  - name
  - version
  - exports
  - types
  - files
- [x] Verify:
  - ESM + CJS output
  - `.d.ts` files generated
- [x] Run `npm pack` and inspect output

---

## 🚀 Phase 10: Publish

- [x] Create GitHub repo
- [x] Push code
- [x] Tag `v0.1.0`
- [x] Publish to npm
- [x] Verify install in fresh project

---

## ✅ Definition of Done

- [x] All tests pass
- [x] Lint/typecheck/build pass
- [x] README matches real API
- [x] Package installs cleanly
- [x] Errors are readable
- [x] Types are inferred correctly

---

## 🆕 v0.2.0: Extended Types

- [x] Add `integer()`
- [x] Add `float()`
- [x] Add `json()`
- [x] Add `array(separator?)`
- [x] Reuse existing validator architecture and modifiers
- [x] Add unit tests for all new validators
- [x] Add integration coverage for mixed schemas using new validators
- [x] Add type inference assertions for new validators
- [x] Update README examples and API reference for extended types
- [x] Update roadmap for the next milestone
- [x] Bump package version to `0.2.0`
- [x] Re-run lint, typecheck, tests, build, and `npm pack --dry-run`
