import { createValidator } from "../validator";
import { formatReceivedValue } from "../utils/format-value";

export function json() {
  return createValidator<unknown>({
    expected: "JSON",
    parse: (input) => {
      if (input === "") {
        return {
          message: `expected JSON, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      try {
        return {
          success: true,
          value: JSON.parse(input) as unknown,
        };
      } catch {
        return {
          message: `expected JSON, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }
    },
  });
}
