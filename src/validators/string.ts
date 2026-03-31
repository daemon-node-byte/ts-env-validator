import { createValidator } from "../validator";

export function string() {
  return createValidator<string>({
    expected: "string",
    parse: (input) => ({
      success: true,
      value: input,
    }),
  });
}
