import { createValidator } from "../validator";
import { formatReceivedValue } from "../utils/format-value";

const BOOLEAN_MAP = {
  "0": false,
  "1": true,
  false: false,
  true: true,
} as const;

export function boolean() {
  return createValidator<boolean>({
    expected: "boolean",
    parse: (input) => {
      if (input === "" || !(input in BOOLEAN_MAP)) {
        return {
          message: `expected boolean, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      return {
        success: true,
        value: BOOLEAN_MAP[input as keyof typeof BOOLEAN_MAP],
      };
    },
  });
}
