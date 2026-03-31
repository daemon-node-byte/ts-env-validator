# ts-env-validator

Type-safe environment variable validation for Node.js applications.

`ts-env-validator` validates your environment at runtime, coerces values into useful types, and gives you full TypeScript inference from the same schema.

## Why use it?

Environment variables are always strings, but your app usually expects real types:

- numbers like `PORT`
- booleans like feature flags
- enums like `NODE_ENV`
- URLs like `DATABASE_URL`

Without validation, bad config leaks into runtime and fails late. `ts-env-validator` fails fast at startup with a single readable error.

## Installation

```bash
npm install ts-env-validator
```

Node.js `>=20` is supported.

## Quick start

```ts
import { boolean, createEnv, enumOf, number, string, url } from "ts-env-validator";

export const env = createEnv({
  NODE_ENV: enumOf(["development", "test", "production"]),
  PORT: number().default(3000),
  DATABASE_URL: url(),
  JWT_SECRET: string(),
  ENABLE_CACHE: boolean().default(false),
  LOG_LEVEL: enumOf(["debug", "info", "warn", "error"]).optional(),
});
```

Inferred result:

```ts
env.NODE_ENV;
// "development" | "test" | "production"

env.PORT;
// number

env.ENABLE_CACHE;
// boolean

env.LOG_LEVEL;
// "debug" | "info" | "warn" | "error" | undefined
```

## API

### `createEnv(schema, options?)`

Creates a validated environment object.

```ts
const env = createEnv(schema, {
  env: {
    PORT: "4000",
  },
});
```

If `options.env` is omitted, `createEnv` reads from `process.env`.

### Validators

#### `string()`

Returns the raw string value.

```ts
API_KEY: string()
```

Empty strings are allowed.

#### `number()`

Parses a string into a number.

```ts
PORT: number()
```

- Uses `parseFloat`
- Rejects invalid numeric input
- Rejects `NaN`, `Infinity`, and empty strings

#### `boolean()`

Parses exact string boolean values.

```ts
ENABLE_CACHE: boolean()
```

Accepted values:

- `"true"`
- `"false"`
- `"1"`
- `"0"`

#### `enumOf([...])`

Validates exact case-sensitive string values.

```ts
NODE_ENV: enumOf(["development", "test", "production"])
```

#### `url()`

Validates using the built-in `URL` constructor and returns a normalized string.

```ts
DATABASE_URL: url()
```

For example, `"https://example.com"` becomes `"https://example.com/"`.

### Modifiers

#### `.optional()`

Marks a variable as optional and returns `undefined` when missing.

```ts
LOG_LEVEL: enumOf(["debug", "info"]).optional()
```

#### `.default(value)`

Supplies a default when the env key is missing.

```ts
PORT: number().default(3000)
```

Defaults win over `optional()`, so a defaulted field is always inferred as required.

#### `.describe(text)`

Adds extra context to error messages.

```ts
DATABASE_URL: url().describe("Primary database connection string")
```

## Error handling

Validation failures are collected across the whole schema and thrown as one `EnvValidationError`.

```txt
Environment validation failed

Missing required variables:
- JWT_SECRET (Token signing secret)

Invalid variables:
- PORT (HTTP port): expected number, received "abc"
- NODE_ENV: expected one of development | production, received "prod"
```

The error instance exposes:

- `error.missing`
- `error.invalid`
- `error.message`

## Custom env objects

Passing a custom env object is useful in tests, scripts, and edge runtimes:

```ts
const env = createEnv(
  {
    PORT: number().default(3000),
    ENABLE_CACHE: boolean(),
  },
  {
    env: {
      ENABLE_CACHE: "true",
    },
  },
);
```

## Examples

### Node.js

```ts
import { createEnv, number, string, url } from "ts-env-validator";

export const env = createEnv({
  PORT: number().default(3000),
  DATABASE_URL: url(),
  JWT_SECRET: string(),
});
```

### Next.js

```ts
import { createEnv, string } from "ts-env-validator";

export const env = createEnv({
  NEXT_PUBLIC_API_URL: string(),
});
```

## Development

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## License

MIT
