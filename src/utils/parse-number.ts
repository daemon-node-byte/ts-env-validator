import type { ValidationResult } from "../types";
import { formatReceivedValue } from "./format-value";

const NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

export function parseStrictNumber(
  input: string,
  expectedLabel = "number",
): ValidationResult<number> {
  if (input === "" || !NUMBER_PATTERN.test(input)) {
    return {
      message: `expected ${expectedLabel}, received ${formatReceivedValue(input)}`,
      success: false,
    };
  }

  const parsed = Number.parseFloat(input);

  if (!Number.isFinite(parsed)) {
    return {
      message: `expected ${expectedLabel}, received ${formatReceivedValue(input)}`,
      success: false,
    };
  }

  return {
    success: true,
    value: parsed,
  };
}
