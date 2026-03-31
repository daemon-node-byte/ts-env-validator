import { describe, expect, expectTypeOf, it } from "vitest";

import {
  array,
  boolean,
  enumOf,
  float,
  integer,
  json,
  number,
  string,
  url,
} from "../src";
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

  it("parses integers and rejects non-integer values", () => {
    expect(integer().parse("3000")).toEqual({
      success: true,
      value: 3000,
    });
    expect(integer().parse("1e3")).toEqual({
      success: true,
      value: 1000,
    });
    expect(integer().parse("3.14")).toEqual({
      message: 'expected integer, received "3.14"',
      success: false,
    });
    expect(integer().parse("")).toEqual({
      message: 'expected integer, received ""',
      success: false,
    });
  });

  it("parses floats and rejects integer results", () => {
    expect(float().parse("3.14")).toEqual({
      success: true,
      value: 3.14,
    });
    expect(float().parse("1.5e2")).toEqual({
      success: true,
      value: 150,
    });
    expect(float().parse("42")).toEqual({
      message: 'expected float, received "42"',
      success: false,
    });
    expect(float().parse("1e3")).toEqual({
      message: 'expected float, received "1e3"',
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

  it("parses JSON values and returns unknown", () => {
    expect(json().parse('{"enabled":true,"count":2}')).toEqual({
      success: true,
      value: {
        count: 2,
        enabled: true,
      },
    });
    expect(json().parse("null")).toEqual({
      success: true,
      value: null,
    });
    expect(json().parse("{")).toEqual({
      message: 'expected JSON, received "{"',
      success: false,
    });
  });

  it("parses arrays with trimming and custom separators", () => {
    expect(array().parse("alpha, beta, gamma")).toEqual({
      success: true,
      value: ["alpha", "beta", "gamma"],
    });
    expect(array(";").parse("one; two;three")).toEqual({
      success: true,
      value: ["one", "two", "three"],
    });
    expect(array().parse("alpha,,gamma")).toEqual({
      message: 'expected array, received "alpha,,gamma"',
      success: false,
    });
    expect(array().parse("")).toEqual({
      message: 'expected array, received ""',
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
    expectTypeOf(integer().parse).toBeCallableWith("42");
    expectTypeOf(float().default(1.5).defaultValue).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(array().default(["a"]).defaultValue).toEqualTypeOf<
      string[] | undefined
    >();
    expectTypeOf(json().default({ enabled: true } as unknown).defaultValue).toEqualTypeOf<
      unknown
    >();
    expectTypeOf(enumOf(["development", "production"])).toMatchTypeOf(
      enumOf(["development", "production"]),
    );
  });
});
