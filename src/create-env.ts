import { EnvValidationError } from "./errors";
import type { InvalidEnvVariable, MissingEnvVariable } from "./errors";
import type { EnvSchema, InferEnv } from "./validator";

export type CreateEnvOptions = {
  env?: Record<string, string | undefined>;
};

export function createEnv<TSchema extends EnvSchema>(
  schema: TSchema,
  options?: CreateEnvOptions,
): InferEnv<TSchema> {
  const source = options?.env ?? process.env;
  const missing: MissingEnvVariable[] = [];
  const invalid: InvalidEnvVariable[] = [];
  const result: Partial<InferEnv<TSchema>> = {};

  for (const [key, validator] of Object.entries(schema) as [
    keyof TSchema & string,
    TSchema[keyof TSchema],
  ][]) {
    const rawValue = source[key];

    if (rawValue !== undefined) {
      const parsed = validator.parse(rawValue);

      if (parsed.success) {
        result[key] = parsed.value as InferEnv<TSchema>[typeof key];
      } else {
        invalid.push(
          validator.description
            ? {
                description: validator.description,
                key,
                message: parsed.message,
              }
            : {
                key,
                message: parsed.message,
              },
        );
      }

      continue;
    }

    if (validator.hasDefault) {
      result[key] = validator.defaultValue as InferEnv<TSchema>[typeof key];
      continue;
    }

    if (validator.isOptional) {
      result[key] = undefined as InferEnv<TSchema>[typeof key];
      continue;
    }

    missing.push(
      validator.description
        ? {
            description: validator.description,
            key,
          }
        : {
            key,
          },
    );
  }

  if (missing.length > 0 || invalid.length > 0) {
    throw new EnvValidationError({
      invalid,
      missing,
    });
  }

  return result as InferEnv<TSchema>;
}
