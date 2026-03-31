import { createEnv, string } from "../src/index";

export const env = createEnv({
  NEXT_PUBLIC_API_URL: string(),
});
