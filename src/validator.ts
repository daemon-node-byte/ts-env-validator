import type { Parser, ValidationResult, ValidatorConfig } from "./types";
import { formatReceivedValue } from "./utils/format-value";

export interface Validator<
  T,
  TOptional extends boolean = false,
  THasDefault extends boolean = false,
> {
  parse(input: string): ValidationResult<T>;
  optional(): Validator<T, true, THasDefault>;
  default(value: T): Validator<T, false, true>;
  describe(text: string): Validator<T, TOptional, THasDefault>;
  readonly expected: string;
  readonly description: string | undefined;
  readonly hasDefault: boolean;
  readonly isOptional: boolean;
  readonly defaultValue: T | undefined;
}

class EnvValidator<
  T,
  TOptional extends boolean = false,
  THasDefault extends boolean = false,
> implements Validator<T, TOptional, THasDefault>
{
  private readonly config: ValidatorConfig<T>;

  public constructor(config: ValidatorConfig<T>) {
    this.config = config;
  }

  public parse(input: string): ValidationResult<T> {
    return this.config.parse(input);
  }

  public optional(): Validator<T, true, THasDefault> {
    return this.clone({
      isOptional: true,
    });
  }

  public default(value: T): Validator<T, false, true> {
    return this.clone({
      defaultValue: value,
      hasDefault: true,
      isOptional: false,
    });
  }

  public describe(text: string): Validator<T, TOptional, THasDefault> {
    return this.clone({
      description: text,
    });
  }

  public get expected(): string {
    return this.config.expected;
  }

  public get description(): string | undefined {
    return this.config.description;
  }

  public get hasDefault(): boolean {
    return this.config.hasDefault;
  }

  public get isOptional(): boolean {
    return this.config.isOptional;
  }

  public get defaultValue(): T | undefined {
    return this.config.defaultValue;
  }

  private clone<
    TNextOptional extends boolean = TOptional,
    TNextHasDefault extends boolean = THasDefault,
  >(
    overrides: Partial<ValidatorConfig<T>>,
  ): Validator<T, TNextOptional, TNextHasDefault> {
    return new EnvValidator<T, TNextOptional, TNextHasDefault>({
      ...this.config,
      ...overrides,
    });
  }
}

export type AnyValidator = Validator<unknown, boolean, boolean>;

export type InferValidator<TValidator> = TValidator extends Validator<
  infer TValue,
  infer TOptional,
  infer THasDefault
>
  ? THasDefault extends true
    ? TValue
    : TOptional extends true
      ? TValue | undefined
      : TValue
  : never;

export type EnvSchema = Record<string, AnyValidator>;

export type InferEnv<TSchema extends EnvSchema> = {
  [TKey in keyof TSchema]: InferValidator<TSchema[TKey]>;
};

export function createValidator<T>(config: {
  expected: string;
  parse: Parser<T>;
}): Validator<T> {
  const parse: Parser<T> = (input) => {
    try {
      return config.parse(input);
    } catch (error) {
      if (error instanceof Error) {
        return {
          message: error.message,
          success: false,
        };
      }

      return {
        message: `expected ${config.expected}, received ${formatReceivedValue(input)}`,
        success: false,
      };
    }
  };

  return new EnvValidator<T>({
    expected: config.expected,
    hasDefault: false,
    isOptional: false,
    parse,
  });
}
