# ts-env-validator — Tasks

## 🧱 Phase 1: Project Setup

- [ ] Initialize project (pnpm or npm)
- [ ] Create `src/` structure
- [ ] Setup TypeScript config
- [ ] Install dependencies:
  - typescript
  - tsup
  - vitest
  - eslint
  - prettier
- [ ] Configure tsup build
- [ ] Configure Vitest
- [ ] Configure ESLint + Prettier
- [ ] Add scripts:
  - build
  - dev
  - test
  - lint
  - typecheck

---

## ⚙️ Phase 2: Core Types & Architecture

- [ ] Create base validator type
- [ ] Define schema type system
- [ ] Implement fluent modifier chaining:
  - optional()
  - default()
  - describe()
- [ ] Define internal parsing contract

---

## 🔧 Phase 3: Validators

### Primitive Validators

- [ ] Implement `string()`
- [ ] Implement `number()`
  - parseFloat
  - handle NaN
- [ ] Implement `boolean()`
  - true/false parsing
- [ ] Implement `enumOf(values)`
- [ ] Implement `url()`

---

## 🧠 Phase 4: createEnv()

- [ ] Read from `process.env`
- [ ] Support custom env input
- [ ] Iterate schema keys
- [ ] Apply parsing per validator
- [ ] Handle:
  - missing values
  - default values
  - optional values
- [ ] Collect all errors
- [ ] Return typed result object

---

## ❌ Phase 5: Error Handling

- [ ] Create `EnvValidationError`
- [ ] Structure error data:
  - missing
  - invalid
- [ ] Build error formatter
- [ ] Add readable CLI output
- [ ] Add snapshot tests

---

## 🧪 Phase 6: Testing

### Unit Tests
- [ ] string validator
- [ ] number validator
- [ ] boolean validator
- [ ] enum validator
- [ ] url validator

### Integration Tests
- [ ] full schema success case
- [ ] missing variables
- [ ] invalid values
- [ ] mixed errors
- [ ] default behavior
- [ ] optional behavior

---

## 📚 Phase 7: Documentation

- [ ] Write README:
  - intro
  - install
  - quick start
  - API reference
  - examples
- [ ] Add examples:
  - Node.js
  - Next.js

---

## 🔁 Phase 8: CI/CD

- [ ] Setup GitHub Actions:
  - install
  - lint
  - typecheck
  - test
  - build

---

## 📦 Phase 9: Packaging

- [ ] Configure `package.json`:
  - name
  - version
  - exports
  - types
  - files
- [ ] Verify:
  - ESM + CJS output
  - `.d.ts` files generated
- [ ] Run `npm pack` and inspect output

---

## 🚀 Phase 10: Publish

- [ ] Create GitHub repo
- [ ] Push code
- [ ] Tag `v0.1.0`
- [ ] Publish to npm
- [ ] Verify install in fresh project

---

## ✅ Definition of Done

- [ ] All tests pass
- [ ] Lint/typecheck/build pass
- [ ] README matches real API
- [ ] Package installs cleanly
- [ ] Errors are readable
- [ ] Types are inferred correctly