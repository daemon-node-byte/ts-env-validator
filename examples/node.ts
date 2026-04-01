import {
  array,
  createEnv,
  float,
  integer,
  json,
  number,
  string,
  url,
} from "../src/index";

export const env = createEnv({
  ALLOWED_HOSTS: array(),
  DATABASE_URL: url(),
  JWT_SECRET: string(),
  LATENCY_THRESHOLD: float().default(0.75),
  MAX_RETRIES: integer().default(3),
  PORT: number().default(3000),
  SERVICE_METADATA: json<{ region: string; team: string }>().optional(),
});
