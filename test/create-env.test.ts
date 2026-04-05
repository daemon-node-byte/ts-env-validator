import { describe, expect, expectTypeOf, it } from "vitest";

import {
  EnvValidationError,
  array,
  boolean,
  createEnv,
  createValidator,
  enumOf,
  float,
  integer,
  json,
  number,
  string,
  url,
} from "../src";

describe("createEnv", () => {
  it("creates a typed environment object from a schema", () => {
    const env = createEnv(
      {
        ALLOWED_HOSTS: array(),
        DATABASE_URL: url(),
        ENABLE_CACHE: boolean().default(false),
        FEATURE_FLAGS: json<{ enabled: boolean; limit: number }>().optional(),
        LATENCY_THRESHOLD: float().min(0.1).max(2).default(0.75),
        MAX_RETRIES: integer().min(1).max(10).default(3),
        JWT_SECRET: string().minLength(32),
        LOG_LEVEL: enumOf(["debug", "info", "warn", "error"]).optional(),
        NODE_ENV: enumOf(["development", "test", "production"]),
        PORT: number().min(1).max(65535).default(3000),
      },
      {
        env: {
          ALLOWED_HOSTS: "api.example.com, cdn.example.com",
          DATABASE_URL: "https://db.example.com",
          JWT_SECRET: "super-secret-signing-key-12345678",
          NODE_ENV: "production",
        },
      },
    );

    expect(env).toEqual({
      ALLOWED_HOSTS: ["api.example.com", "cdn.example.com"],
      DATABASE_URL: "https://db.example.com/",
      ENABLE_CACHE: false,
      FEATURE_FLAGS: undefined,
      JWT_SECRET: "super-secret-signing-key-12345678",
      LATENCY_THRESHOLD: 0.75,
      LOG_LEVEL: undefined,
      MAX_RETRIES: 3,
      NODE_ENV: "production",
      PORT: 3000,
    });

    expectTypeOf(env.PORT).toEqualTypeOf<number>();
    expectTypeOf(env.MAX_RETRIES).toEqualTypeOf<number>();
    expectTypeOf(env.LATENCY_THRESHOLD).toEqualTypeOf<number>();
    expectTypeOf(env.ENABLE_CACHE).toEqualTypeOf<boolean>();
    expectTypeOf(env.ALLOWED_HOSTS).toEqualTypeOf<string[]>();
    expectTypeOf(env.FEATURE_FLAGS).toEqualTypeOf<
      { enabled: boolean; limit: number } | undefined
    >();
    expectTypeOf(env.LOG_LEVEL).toEqualTypeOf<
      "debug" | "info" | "warn" | "error" | undefined
    >();
    expectTypeOf(env.NODE_ENV).toEqualTypeOf<
      "development" | "test" | "production"
    >();
    expectTypeOf(env.DATABASE_URL).toEqualTypeOf<string>();
  });

  it("prefers provided values over defaults", () => {
    const env = createEnv(
      {
        PORT: number().min(1).max(65535).default(3000),
      },
      {
        env: {
          PORT: "4500",
        },
      },
    );

    expect(env.PORT).toBe(4500);
  });

  it("supports custom env objects without reading process.env", () => {
    const env = createEnv(
      {
        API_KEY: string(),
      },
      {
        env: {
          API_KEY: "test-key",
        },
      },
    );

    expect(env.API_KEY).toBe("test-key");
  });

  it("supports custom validators alongside built-in validators", () => {
    const port = createValidator<number>({
      expected: "port",
      parse: (input) => {
        const value = Number.parseInt(input, 10);

        if (!Number.isInteger(value) || value < 1 || value > 65535) {
          return {
            message: `expected port, received ${JSON.stringify(input)}`,
            success: false,
          };
        }

        return {
          success: true,
          value,
        };
      },
    });

    const env = createEnv(
      {
        API_URL: url(),
        LOG_LEVEL: enumOf(["debug", "info"]).optional(),
        PORT: integer().min(1).max(65535).default(3000),
        SECURE_PORT: port.default(443),
      },
      {
        env: {
          API_URL: "https://example.com",
        },
      },
    );

    expect(env).toEqual({
      API_URL: "https://example.com/",
      LOG_LEVEL: undefined,
      PORT: 3000,
      SECURE_PORT: 443,
    });
    expectTypeOf(env.PORT).toEqualTypeOf<number>();
    expectTypeOf(env.SECURE_PORT).toEqualTypeOf<number>();
    expectTypeOf(env.LOG_LEVEL).toEqualTypeOf<"debug" | "info" | undefined>();
  });

  it("parses new v0.2.0 validators in mixed schemas", () => {
    const env = createEnv(
      {
        FEATURE_FLAGS: json<{ beta: boolean; limit: number }>(),
        LATENCY_THRESHOLD: float(),
        MAX_RETRIES: integer(),
        SCOPES: array(";"),
      },
      {
        env: {
          FEATURE_FLAGS: '{"beta":true,"limit":2}',
          LATENCY_THRESHOLD: "1.25",
          MAX_RETRIES: "5",
          SCOPES: "read; write;admin",
        },
      },
    );

    expect(env).toEqual({
      FEATURE_FLAGS: {
        beta: true,
        limit: 2,
      },
      LATENCY_THRESHOLD: 1.25,
      MAX_RETRIES: 5,
      SCOPES: ["read", "write", "admin"],
    });
  });

  it("throws a single formatted error with missing and invalid variables", () => {
    expect(() =>
      createEnv(
        {
          DATABASE_URL: url().describe("Primary database connection string"),
          ENABLE_CACHE: boolean(),
          JWT_SECRET: string().describe("Token signing secret"),
          PORT: number().describe("HTTP port"),
        },
        {
          env: {
            DATABASE_URL: "not-a-url",
            ENABLE_CACHE: "TRUE",
          },
        },
      ),
    ).toThrowError(
      new EnvValidationError({
        invalid: [
          {
            description: "Primary database connection string",
            key: "DATABASE_URL",
            message: 'expected URL, received "not-a-url"',
          },
          {
            key: "ENABLE_CACHE",
            message: 'expected boolean, received "TRUE"',
          },
        ],
        missing: [
          {
            description: "Token signing secret",
            key: "JWT_SECRET",
          },
          {
            description: "HTTP port",
            key: "PORT",
          },
        ],
      }),
    );
  });

  it("preserves exact error formatting", () => {
    try {
      createEnv(
        {
          DATABASE_URL: url().describe("Database URL"),
          NODE_ENV: enumOf(["development", "production"]),
          PORT: number().describe("HTTP port"),
        },
        {
          env: {
            DATABASE_URL: "ftp://",
            NODE_ENV: "prod",
          },
        },
      );
      throw new Error("Expected createEnv to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as EnvValidationError).message).toBe(
        [
          "Environment validation failed",
          "",
          "Missing required variables:",
          "- PORT (HTTP port)",
          "",
          "Invalid variables:",
          '- DATABASE_URL (Database URL): expected URL, received "ftp://"',
          '- NODE_ENV: expected one of development | production, received "prod"',
        ].join("\n"),
      );
    }
  });

  it("aggregates errors for new validator failures", () => {
    try {
      createEnv(
        {
          FEATURE_FLAGS: json().describe("Feature flag payload"),
          LATENCY_THRESHOLD: float().describe("Latency warning threshold"),
          MAX_RETRIES: integer().describe("Retry budget"),
          SCOPES: array(";").describe("Allowed scopes"),
        },
        {
          env: {
            FEATURE_FLAGS: "{",
            LATENCY_THRESHOLD: "42",
            MAX_RETRIES: "3.14",
            SCOPES: "read;;write",
          },
        },
      );
      throw new Error("Expected createEnv to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as EnvValidationError).message).toBe(
        [
          "Environment validation failed",
          "",
          "Invalid variables:",
          '- FEATURE_FLAGS (Feature flag payload): expected JSON, received "{"',
          '- LATENCY_THRESHOLD (Latency warning threshold): expected float, received "42"',
          '- MAX_RETRIES (Retry budget): expected integer, received "3.14"',
          '- SCOPES (Allowed scopes): expected array, received "read;;write"',
        ].join("\n"),
      );
    }
  });

  it("aggregates custom validator failures with missing variables", () => {
    const port = createValidator<number>({
      expected: "port",
      parse: () => {
        throw new Error("port must be between 1 and 65535");
      },
    });

    try {
      createEnv(
        {
          API_KEY: string().describe("Service API key"),
          PORT: port.describe("Application port"),
        },
        {
          env: {
            PORT: "70000",
          },
        },
      );
      throw new Error("Expected createEnv to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as EnvValidationError).message).toBe(
        [
          "Environment validation failed",
          "",
          "Missing required variables:",
          "- API_KEY (Service API key)",
          "",
          "Invalid variables:",
          "- PORT (Application port): port must be between 1 and 65535",
        ].join("\n"),
      );
    }
  });

  it("infers required, optional, and defaulted custom validator results", () => {
    const dateString = createValidator<Date>({
      expected: "date",
      parse: (input) => ({
        success: true,
        value: new Date(input),
      }),
    });

    const env = createEnv(
      {
        END_DATE: dateString.optional(),
        RELEASE_DATE: dateString,
        START_DATE: dateString.default(new Date("2026-01-01T00:00:00.000Z")),
      },
      {
        env: {
          RELEASE_DATE: "2026-04-01T12:00:00.000Z",
        },
      },
    );

    expect(env.END_DATE).toBeUndefined();
    expect(env.RELEASE_DATE).toBeInstanceOf(Date);
    expect(env.START_DATE).toBeInstanceOf(Date);
    expectTypeOf(env.END_DATE).toEqualTypeOf<Date | undefined>();
    expectTypeOf(env.RELEASE_DATE).toEqualTypeOf<Date>();
    expectTypeOf(env.START_DATE).toEqualTypeOf<Date>();
  });

  it("allows optional values to resolve to undefined", () => {
    const env = createEnv(
      {
        LOG_LEVEL: enumOf(["debug", "info"]).optional(),
        TOKEN_SUFFIX: string().minLength(4).optional(),
      },
      {
        env: {},
      },
    );

    expect(env.LOG_LEVEL).toBeUndefined();
    expect(env.TOKEN_SUFFIX).toBeUndefined();
    expectTypeOf(env.LOG_LEVEL).toEqualTypeOf<"debug" | "info" | undefined>();
    expectTypeOf(env.TOKEN_SUFFIX).toEqualTypeOf<string | undefined>();
  });

  it("uses defaults even when optional was chained first", () => {
    const env = createEnv(
      {
        PORT: number().min(1).optional().default(3000),
      },
      {
        env: {},
      },
    );

    expect(env.PORT).toBe(3000);
    expectTypeOf(env.PORT).toEqualTypeOf<number>();
  });

  it("treats empty strings as invalid for non-string validators", () => {
    expect(() =>
      createEnv(
        {
          FEATURE_FLAGS: json(),
          HOSTS: array(),
          ENABLE_CACHE: boolean(),
          LATENCY_THRESHOLD: float(),
          MAX_RETRIES: integer(),
          PORT: number(),
          SERVICE_URL: url(),
        },
        {
          env: {
            ENABLE_CACHE: "",
            FEATURE_FLAGS: "",
            HOSTS: "",
            LATENCY_THRESHOLD: "",
            MAX_RETRIES: "",
            PORT: "",
            SERVICE_URL: "",
          },
        },
      ),
    ).toThrowError(EnvValidationError);
  });

  it("aggregates constraint failures with missing variables", () => {
    try {
      createEnv(
        {
          JWT_SECRET: string().minLength(32).describe("Token signing secret"),
          LATENCY_THRESHOLD: float()
            .min(0.1)
            .max(2)
            .describe("Latency warning threshold"),
          MAX_RETRIES: integer().min(1).max(5).describe("Retry budget"),
          PORT: number().min(1).max(65535).describe("HTTP port"),
        },
        {
          env: {
            JWT_SECRET: "short-secret",
            LATENCY_THRESHOLD: "2.5",
            MAX_RETRIES: "0",
          },
        },
      );
      throw new Error("Expected createEnv to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      expect((error as EnvValidationError).message).toBe(
        [
          "Environment validation failed",
          "",
          "Missing required variables:",
          "- PORT (HTTP port)",
          "",
          "Invalid variables:",
          '- JWT_SECRET (Token signing secret): expected string length >= 32, received "short-secret"',
          '- LATENCY_THRESHOLD (Latency warning threshold): expected float <= 2, received "2.5"',
          '- MAX_RETRIES (Retry budget): expected integer >= 1, received "0"',
        ].join("\n"),
      );
    }
  });
});
