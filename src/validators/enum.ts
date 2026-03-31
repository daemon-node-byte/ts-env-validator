import { createValidator } from "../validator";
import { formatReceivedValue } from "../utils/format-value";

export function enumOf<const TValues extends readonly [string, ...string[]]>(
  values: TValues,
) {
  return createValidator<TValues[number]>({
    expected: `one of ${values.join(" | ")}`,
    parse: (input) => {
      if (input === "" || !values.includes(input)) {
        return {
          message: `expected one of ${values.join(" | ")}, received ${formatReceivedValue(input)}`,
          success: false,
        };
      }

      return {
        success: true,
        value: input as TValues[number],
      };
    },
  });
}
