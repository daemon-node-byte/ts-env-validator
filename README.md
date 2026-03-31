# ts-env-validator

Type-safe environment variable validation for Node.js and Next.js.

[![npm version](https://img.shields.io/npm/v/ts-env-validator)](https://www.npmjs.com/package/ts-env-validator)
[![npm downloads](https://img.shields.io/npm/dm/ts-env-validator)](https://www.npmjs.com/package/ts-env-validator)
[![license](https://img.shields.io/npm/l/ts-env-validator)](LICENSE)

Validate your environment variables at runtime and get fully inferred TypeScript types — no manual casting, no surprises.

---

## ✨ Why this exists

Environment variables are one of the most common sources of runtime bugs:

- Everything is a **string**
- Missing values crash apps unpredictably
- Invalid configs go unnoticed until production

This package solves that by:

- ✅ Validating at startup
- 🔒 Enforcing correct types
- ⚡ Failing fast with clear errors
- 🧠 Inferring types automatically

---

## ✨ Features

- ✅ Runtime validation of environment variables
- 🔒 Fully inferred TypeScript types
- ⚡ Fail-fast with clear error messages
- 🧩 Simple, minimal API
- 🌐 Works with Node.js, Next.js, and serverless environments
- 🧼 Zero dependencies

---

## 📦 Installation

```bash
npm install ts-env-validator
# or
pnpm add ts-env-validator
# or
yarn add ts-env-validator
```

## 🚀 Quick Start

```typescript
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

### Result

```typescript
env.PORT        // number
env.ENABLE_CACHE // boolean
env.LOG_LEVEL   // "debug" | "info" | "warn" | "error" | undefined
```

## 🧠 Why use this?

Environment variables are always strings — but your app expects:

- numbers (PORT)
- booleans (ENABLE_CACHE)
- enums (NODE_ENV)
- URLs (DATABASE_URL)

### Without validation:

- ❌ runtime bugs
- ❌ invalid configs
- ❌ hard-to-debug crashes

`ts-env-validator` fixes this by:

- validating at startup
- coercing types safely
- giving you full TypeScript inference

## 🔧 API

#### `createEnv(schema, options?)`

Creates a validated environment object.

```ts
const env = createEnv(schema);
```

#### Options

```ts
createEnv(schema, {
  env: customEnvObject
});
```

### 🔤 Validators

#### `string()`

```ts
API_KEY: string()
```

#### `number()`

```ts
PORT: number()
```

Automatically parses using parseFloat.

#### `boolean()`

```ts
ENABLE_CACHE: boolean()
```

Accepts:

- `"true"`, `"false"`
- `"1"`, `"0"`

#### `enumOf([...])`

```ts
NODE_ENV: enumOf(["development", "production"])
```

#### `url()`

```ts
DATABASE_URL: url()
```

Validates using the built-in URL constructor.

### 🔁 Modifiers

#### `.optional()`

```ts
LOG_LEVEL: enumOf(["debug", "info"]).optional()
```

#### `.default(value)`

```ts
PORT: number().default(3000)
```

#### `.describe(text)`

```ts
API_KEY: string().describe("API key for external service")
```

Used in error messages.

## ❌ Error Handling

If validation fails, an error is thrown at startup:

Environment validation failed

```ascii
Missing required variables:
- DATABASE_URL
- JWT_SECRET

Invalid variables:
- PORT: expected number, received "abc"
- NODE_ENV: expected one of development | production, received "prod"
```

## 🧪 Using a Custom Env Object

```ts
createEnv(schema, {
  env: {
    PORT: "4000"
  }
});
```

## ⚙️ TypeScript Support

Types are automatically inferred:

```ts
const env = createEnv({
  PORT: number(),
});

// env.PORT is number
```

No casting required.

## 🌐 Works With

- Node.js
- Express
- Next.js
- Vercel / serverless
- Docker environments

## 🧱 Example (Node.js)

```ts
// env.ts
import { createEnv, string, number } from "ts-env-validator";

export const env = createEnv({
  PORT: number().default(3000),
  DATABASE_URL: string(),
});
```

```ts
// server.ts
import { env } from "./env";

app.listen(env.PORT);
```

## 🧭 Example (Next.js)

```ts
// env.ts
export const env = createEnv({
  NEXT_PUBLIC_API_URL: string(),
});
```


## 🚧 Roadmap

### v0.1.0

- Core validators
- Type inference
- Error handling

### v0.2.0

- integer()
- json()
- array()

### v0.3.0

- custom validators
- transform/refine hooks

## 🤝 Contributing

Contributions welcome!

Open issues for bugs or feature requests
Submit PRs for improvements

## 📄 License

MIT

## ⭐ Support

If you find this useful, consider starring the repo!

## 🧑‍💻 Author

Built by Josh McLain
