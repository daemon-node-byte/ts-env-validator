import { createStringValidator } from "../validator";

export function string() {
  return createStringValidator({
    expected: "string",
    parse: (input) => ({
      success: true,
      value: input,
    }),
  });
}
