import { createValidator } from "../validator";
import { formatReceivedValue } from "../utils/format-value";

export function array(separator = ",") {
  return createValidator<string[]>({
    expected: "array",
    parse: (input) => {
      if (input === "") {
        return {
          message: `expected array, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      const values = input.split(separator).map((value) => value.trim());

      if (values.some((value) => value === "")) {
        return {
          message: `expected array, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      return {
        success: true,
        value: values,
      };
    },
  });
}
