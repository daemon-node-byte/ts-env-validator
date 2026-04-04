import { array, createEnv, json, string } from "../src/index";

export const env = createEnv({
  NEXT_PUBLIC_ENABLED_LOCALES: array(),
  NEXT_PUBLIC_API_URL: string().pattern(/^https?:\/\//, "HTTP URL"),
  NEXT_PUBLIC_THEME_CONFIG: json<{
    accent: string;
    compact: boolean;
  }>().optional(),
});
