import { describe, expect, expectTypeOf, it } from "vitest";

import { boolean, enumOf, number, string, url } from "../src";
import { EnvValidationError } from "../src/errors";

describe("validators", () => {
  it("accepts string values including empty strings", () => {
    const result = string().parse("");

    expect(result).toEqual({
      success: true,
      value: "",
    });
  });

  it("parses strict numbers", () => {
    expect(number().parse("3000")).toEqual({
      success: true,
      value: 3000,
    });
    expect(number().parse("1e3")).toEqual({
      success: true,
      value: 1000,
    });
    expect(number().parse("123abc")).toEqual({
      message: 'expected number, received "123abc"',
      success: false,
    });
    expect(number().parse("")).toEqual({
      message: 'expected number, received ""',
      success: false,
    });
  });

  it("parses booleans from accepted string values only", () => {
    expect(boolean().parse("true")).toEqual({
      success: true,
      value: true,
    });
    expect(boolean().parse("0")).toEqual({
      success: true,
      value: false,
    });
    expect(boolean().parse("TRUE")).toEqual({
      message: 'expected boolean, received "TRUE"',
      success: false,
    });
  });

  it("validates enum values with exact matching", () => {
    const validator = enumOf(["debug", "info", "warn", "error"]);

    expect(validator.parse("warn")).toEqual({
      success: true,
      value: "warn",
    });
    expect(validator.parse("Warn")).toEqual({
      message: 'expected one of debug | info | warn | error, received "Warn"',
      success: false,
    });
  });

  it("validates urls and returns normalized strings", () => {
    expect(url().parse("https://example.com")).toEqual({
      success: true,
      value: "https://example.com/",
    });
    expect(url().parse("")).toEqual({
      message: 'expected URL, received ""',
      success: false,
    });
  });

  it("supports immutable modifier chaining", () => {
    const base = number();
    const described = base.describe("HTTP port");
    const optional = described.optional();
    const withDefault = optional.default(3000);

    expect(base.description).toBeUndefined();
    expect(base.isOptional).toBe(false);
    expect(base.hasDefault).toBe(false);

    expect(described.description).toBe("HTTP port");
    expect(described.isOptional).toBe(false);
    expect(described.hasDefault).toBe(false);

    expect(optional.description).toBe("HTTP port");
    expect(optional.isOptional).toBe(true);
    expect(optional.hasDefault).toBe(false);

    expect(withDefault.description).toBe("HTTP port");
    expect(withDefault.isOptional).toBe(false);
    expect(withDefault.hasDefault).toBe(true);
    expect(withDefault.defaultValue).toBe(3000);
  });

  it("exposes helpful error metadata", () => {
    const error = new EnvValidationError({
      invalid: [
        {
          key: "PORT",
          message: 'expected number, received "abc"',
        },
      ],
      missing: [
        {
          description: "Database URL",
          key: "DATABASE_URL",
        },
      ],
    });

    expect(error.name).toBe("EnvValidationError");
    expect(error.message).toContain("Environment validation failed");
  });

  it("infers validator output types", () => {
    expectTypeOf(string()).toHaveProperty("parse");
    expectTypeOf(number().default(3000).defaultValue).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(enumOf(["development", "production"])).toMatchTypeOf(
      enumOf(["development", "production"]),
    );
  });
});
