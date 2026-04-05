# ts-env-validator

Type-safe environment variable validation for Node.js applications.

`ts-env-validator` validates your environment at runtime, coerces values into useful types, and gives you full TypeScript inference from the same schema.

## Why use it?

Environment variables are always strings, but your app usually expects real types:

- numbers like `PORT`
- booleans like feature flags
- enums like `NODE_ENV`
- URLs like `DATABASE_URL`
- integers like retry counts
- floats like latency thresholds
- JSON payloads for structured config
- string lists like host allowlists

Without validation, bad config leaks into runtime and fails late. `ts-env-validator` fails fast at startup with a single readable error.

## Installation

```bash
npm install ts-env-validator
```

Node.js `>=18` is supported.

## Quick start

```ts
import {
  array,
  boolean,
  createEnv,
  enumOf,
  float,
  integer,
  json,
  number,
  string,
  url,
} from "ts-env-validator";

export const env = createEnv({
  ALLOWED_HOSTS: array(),
  NODE_ENV: enumOf(["development", "test", "production"]),
  PORT: number().min(1).max(65535).default(3000),
  DATABASE_URL: url(),
  JWT_SECRET: string().minLength(32),
  ENABLE_CACHE: boolean().default(false),
  MAX_RETRIES: integer().min(1).max(10).default(3),
  LATENCY_THRESHOLD: float().min(0.1).max(2).default(0.75),
  FEATURE_FLAGS: json<{ enabled: boolean; limit: number }>().optional(),
  LOG_LEVEL: enumOf(["debug", "info", "warn", "error"]).optional(),
});
```

Inferred result:

```ts
env.NODE_ENV;
// "development" | "test" | "production"

env.PORT;
// number

env.MAX_RETRIES;
// number

env.LATENCY_THRESHOLD;
// number

env.ENABLE_CACHE;
// boolean

env.ALLOWED_HOSTS;
// string[]

env.FEATURE_FLAGS;
// { enabled: boolean; limit: number } | undefined

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
API_KEY: string();
```

Empty strings are allowed.

Built-in string constraints:

- `.nonempty()`
- `.minLength(length)`
- `.maxLength(length)`
- `.pattern(regex, label?)`

#### `number()`

Parses a string into a number.

```ts
PORT: number();
```

- Uses `parseFloat`
- Rejects invalid numeric input
- Rejects `NaN`, `Infinity`, and empty strings

Built-in number constraints:

- `.min(value)`
- `.max(value)`

#### `integer()`

Parses numeric strings whose resulting value is a finite integer.

```ts
MAX_RETRIES: integer();
```

Accepted examples:

- `"3"`
- `"1e3"`

Rejected examples:

- `"3.14"`
- `"abc"`

Supports `.min(value)` and `.max(value)`.

#### `float()`

Parses numeric strings intended for fractional or decimal-style values.

```ts
LATENCY_THRESHOLD: float();
```

Accepted examples:

- `"3.14"`
- `"1.5e2"`

Rejected examples:

- `"42"`
- `"1e3"`

Supports `.min(value)` and `.max(value)`.

#### `boolean()`

Parses exact string boolean values.

```ts
ENABLE_CACHE: boolean();
```

Accepted values:

- `"true"`
- `"false"`
- `"1"`
- `"0"`

#### `enumOf([...])`

Validates exact case-sensitive string values.

```ts
NODE_ENV: enumOf(["development", "test", "production"]);
```

#### `url()`

Validates using the built-in `URL` constructor and returns a normalized string.

```ts
DATABASE_URL: url();
```

For example, `"https://example.com"` becomes `"https://example.com/"`.

#### `json<T>()`

Parses any valid JSON and returns the caller-provided type.

```ts
FEATURE_FLAGS: json<{ enabled: boolean; limit: number }>();
```

This validator accepts JSON objects, arrays, primitives, and `null`.
Typing is compile-time only; runtime validation is still plain `JSON.parse`.

#### `array(separator?)`

Splits a string into a trimmed `string[]`.

```ts
ALLOWED_HOSTS: array();
SCOPES: array(";");
```

- Default separator is `","`
- Each item is trimmed
- Empty items are rejected
- Separators are treated literally

### Custom validators

#### `createValidator({ expected, parse })`

Creates a custom validator that works with `createEnv`, type inference, and all existing modifiers.

```ts
import { createValidator } from "ts-env-validator";

const port = createValidator<number>({
  expected: "port",
  parse: (input) => {
    const value = Number.parseInt(input, 10);

    if (!Number.isInteger(value) || value < 1 || value > 65535) {
      return {
        success: false,
        message: `expected port, received ${JSON.stringify(input)}`,
      };
    }

    return {
      success: true,
      value,
    };
  },
});
```

Use it in schemas just like a built-in validator:

```ts
const env = createEnv({
  PORT: port.default(3000),
});
```

Parser contract:

- `parse` receives the raw string value
- return `{ success: true, value }` on success
- return `{ success: false, message }` on failure
- keep parsers synchronous
- if `parse` throws an `Error`, its `message` is surfaced as the validation failure
- if `parse` throws a non-`Error` value, `ts-env-validator` falls back to `expected ${expected}, received ...`

### Modifiers

#### `.optional()`

Marks a variable as optional and returns `undefined` when missing.

```ts
LOG_LEVEL: enumOf(["debug", "info"]).optional();
```

#### `.default(value)`

Supplies a default when the env key is missing.

```ts
PORT: number().default(3000);
```

Defaults win over `optional()`, so a defaulted field is always inferred as required.

#### `.describe(text)`

Adds extra context to error messages.

```ts
DATABASE_URL: url().describe("Primary database connection string");
```

### Built-in constraint examples

```ts
createEnv({
  PORT: number().min(1).max(65535).default(3000),
  JWT_SECRET: string().minLength(32),
  REQUEST_ID: string().pattern(/^[a-f0-9-]+$/i, "UUID pattern"),
  MAX_RETRIES: integer().min(1).max(10).default(3),
  LATENCY_THRESHOLD: float().min(0.1).max(2).default(0.75),
});
```

Constraint modifiers are immutable and compose with `.optional()`, `.default()`, and `.describe()`.
Defaults for constrained built-ins are validated immediately, so invalid defaults throw a `TypeError` during schema creation.

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
import {
  array,
  createEnv,
  float,
  integer,
  json,
  number,
  string,
  url,
} from "ts-env-validator";

export const env = createEnv({
  ALLOWED_HOSTS: array(),
  PORT: number().min(1).max(65535).default(3000),
  DATABASE_URL: url(),
  JWT_SECRET: string().minLength(32),
  MAX_RETRIES: integer().min(1).max(10).default(3),
  LATENCY_THRESHOLD: float().min(0.1).max(2).default(0.75),
  SERVICE_METADATA: json<{ region: string; team: string }>().optional(),
});
```

### Next.js

```ts
import { array, createEnv, json, string } from "ts-env-validator";

export const env = createEnv({
  NEXT_PUBLIC_ENABLED_LOCALES: array(),
  NEXT_PUBLIC_API_URL: string().pattern(/^https?:\/\//, "HTTP URL"),
  NEXT_PUBLIC_THEME_CONFIG: json<{
    accent: string;
    compact: boolean;
  }>().optional(),
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

Maintainers: pushing a version tag like `v0.4.0` runs the publish workflow, releasing `ts-env-validator` to npmjs and `@<repository-owner>/ts-env-validator` to GitHub Packages. The published npm tarball includes both `README.md` and `LICENSE`.

## License

MIT
