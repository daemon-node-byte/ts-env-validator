import { createValidator } from "../validator";
import { formatReceivedValue } from "../utils/format-value";

export function url() {
  return createValidator<string>({
    expected: "URL",
    parse: (input) => {
      if (input === "") {
        return {
          message: `expected URL, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      try {
        return {
          success: true,
          value: new URL(input).toString(),
        };
      } catch {
        return {
          message: `expected URL, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }
    },
  });
}
