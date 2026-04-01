import { describe, expect, expectTypeOf, it } from "vitest";

import {
  EnvValidationError,
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
} from "../src";

describe("createEnv", () => {
  it("creates a typed environment object from a schema", () => {
    const env = createEnv(
      {
        ALLOWED_HOSTS: array(),
        DATABASE_URL: url(),
        ENABLE_CACHE: boolean().default(false),
        FEATURE_FLAGS: json<{ enabled: boolean; limit: number }>().optional(),
        LATENCY_THRESHOLD: float().default(0.75),
        MAX_RETRIES: integer().default(3),
        JWT_SECRET: string(),
        LOG_LEVEL: enumOf(["debug", "info", "warn", "error"]).optional(),
        NODE_ENV: enumOf(["development", "test", "production"]),
        PORT: number().default(3000),
      },
      {
        env: {
          ALLOWED_HOSTS: "api.example.com, cdn.example.com",
          DATABASE_URL: "https://db.example.com",
          JWT_SECRET: "secret",
          NODE_ENV: "production",
        },
      },
    );

    expect(env).toEqual({
      ALLOWED_HOSTS: ["api.example.com", "cdn.example.com"],
      DATABASE_URL: "https://db.example.com/",
      ENABLE_CACHE: false,
      FEATURE_FLAGS: undefined,
      JWT_SECRET: "secret",
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
        PORT: number().default(3000),
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

  it("allows optional values to resolve to undefined", () => {
    const env = createEnv(
      {
        LOG_LEVEL: enumOf(["debug", "info"]).optional(),
      },
      {
        env: {},
      },
    );

    expect(env.LOG_LEVEL).toBeUndefined();
    expectTypeOf(env.LOG_LEVEL).toEqualTypeOf<"debug" | "info" | undefined>();
  });

  it("uses defaults even when optional was chained first", () => {
    const env = createEnv(
      {
        PORT: number().optional().default(3000),
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
});
