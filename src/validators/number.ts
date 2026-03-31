import { createValidator } from "../validator";
import { parseStrictNumber } from "../utils/parse-number";

export function number() {
  return createValidator<number>({
    expected: "number",
    parse: (input) => parseStrictNumber(input),
  });
}
