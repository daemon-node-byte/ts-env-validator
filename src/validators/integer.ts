import { createNumberValidator } from "../validator";
import { formatReceivedValue } from "../utils/format-value";
import { parseStrictNumber } from "../utils/parse-number";

export function integer() {
  return createNumberValidator({
    expected: "integer",
    parse: (input) => {
      const parsed = parseStrictNumber(input, "integer");

      if (!parsed.success) {
        return parsed;
      }

      if (!Number.isInteger(parsed.value)) {
        return {
          message: `expected integer, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      return parsed;
    },
  });
}
