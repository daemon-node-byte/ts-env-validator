import { createEnv, number, string, url } from "../src/index";

export const env = createEnv({
  DATABASE_URL: url(),
  JWT_SECRET: string(),
  PORT: number().default(3000),
});
