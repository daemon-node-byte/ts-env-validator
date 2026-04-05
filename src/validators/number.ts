import { createNumberValidator } from "../validator";
import { parseStrictNumber } from "../utils/parse-number";

export function number() {
  return createNumberValidator({
    expected: "number",
    parse: (input) => parseStrictNumber(input),
  });
}
