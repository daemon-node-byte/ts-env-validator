import { createValidator } from "../validator";
import { formatReceivedValue } from "../utils/format-value";
import { parseStrictNumber } from "../utils/parse-number";

export function float() {
  return createValidator<number>({
    expected: "float",
    parse: (input) => {
      const parsed = parseStrictNumber(input, "float");

      if (!parsed.success) {
        return parsed;
      }

      const usesDecimalNotation = input.includes(".");

      if (Number.isInteger(parsed.value) && !usesDecimalNotation) {
        return {
          message: `expected float, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      return parsed;
    },
  });
}
