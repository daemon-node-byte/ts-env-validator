import { createValidator } from "../validator";
import { formatReceivedValue } from "../utils/format-value";

const NUMBER_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

export function number() {
  return createValidator<number>({
    expected: "number",
    parse: (input) => {
      if (input === "" || !NUMBER_PATTERN.test(input)) {
        return {
          message: `expected number, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      const parsed = Number.parseFloat(input);

      if (!Number.isFinite(parsed)) {
        return {
          message: `expected number, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      return {
        success: true,
        value: parsed,
      };
    },
  });
}
