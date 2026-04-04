import type { Parser, ValidationResult } from "../types";
import { formatReceivedValue, formatValue } from "./format-value";

export type ValueConstraint<T> = {
  expected: string;
  validate: (value: T) => boolean;
};

export function createConstrainedParser<T>(
  baseParse: Parser<T>,
  constraints: readonly ValueConstraint<T>[],
): Parser<T> {
  return (input) => {
    const parsed = baseParse(input);

    if (!parsed.success) {
      return parsed;
    }

    return runConstraints(parsed.value, constraints, () =>
      formatReceivedValue(input),
    );
  };
}

export function validateDefaultValue<T>(
  value: T,
  constraints: readonly ValueConstraint<T>[],
): string | undefined {
  const result = runConstraints(value, constraints, (receivedValue) =>
    formatValue(receivedValue),
  );

  if (result.success) {
    return undefined;
  }

  return result.message;
}

function runConstraints<T>(
  value: T,
  constraints: readonly ValueConstraint<T>[],
  formatReceived: (value: T) => string,
): ValidationResult<T> {
  for (const constraint of constraints) {
    if (!constraint.validate(value)) {
      return {
        message: `expected ${constraint.expected}, received ${formatReceived(value)}`,
        success: false,
      };
    }
  }

  return {
    success: true,
    value,
  };
}
