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
  JWT_SECRET: string().minLength(32),
  LATENCY_THRESHOLD: float().min(0.1).max(2).default(0.75),
  MAX_RETRIES: integer().min(1).max(10).default(3),
  PORT: number().min(1).max(65535).default(3000),
  SERVICE_METADATA: json<{ region: string; team: string }>().optional(),
});
