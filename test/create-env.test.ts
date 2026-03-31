import { describe, expect, expectTypeOf, it } from "vitest";

import {
  EnvValidationError,
  boolean,
  createEnv,
  enumOf,
  number,
  string,
  url,
} from "../src";

describe("createEnv", () => {
  it("creates a typed environment object from a schema", () => {
    const env = createEnv(
      {
        DATABASE_URL: url(),
        ENABLE_CACHE: boolean().default(false),
        JWT_SECRET: string(),
        LOG_LEVEL: enumOf(["debug", "info", "warn", "error"]).optional(),
        NODE_ENV: enumOf(["development", "test", "production"]),
        PORT: number().default(3000),
      },
      {
        env: {
          DATABASE_URL: "https://db.example.com",
          JWT_SECRET: "secret",
          NODE_ENV: "production",
        },
      },
    );

    expect(env).toEqual({
      DATABASE_URL: "https://db.example.com/",
      ENABLE_CACHE: false,
      JWT_SECRET: "secret",
      LOG_LEVEL: undefined,
      NODE_ENV: "production",
      PORT: 3000,
    });

    expectTypeOf(env.PORT).toEqualTypeOf<number>();
    expectTypeOf(env.ENABLE_CACHE).toEqualTypeOf<boolean>();
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
          ENABLE_CACHE: boolean(),
          PORT: number(),
          SERVICE_URL: url(),
        },
        {
          env: {
            ENABLE_CACHE: "",
            PORT: "",
            SERVICE_URL: "",
          },
        },
      ),
    ).toThrowError(EnvValidationError);
  });
});
