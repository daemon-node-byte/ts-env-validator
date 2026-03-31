import type { Parser, ValidationResult, ValidatorConfig } from "./types";

export class EnvValidator<
  T,
  TOptional extends boolean = false,
  THasDefault extends boolean = false,
> {
  private readonly config: ValidatorConfig<T>;

  public constructor(config: ValidatorConfig<T>) {
    this.config = config;
  }

  public parse(input: string): ValidationResult<T> {
    return this.config.parse(input);
  }

  public optional(): EnvValidator<T, true, THasDefault> {
    return this.clone({
      isOptional: true,
    });
  }

  public default(value: T): EnvValidator<T, false, true> {
    return this.clone({
      defaultValue: value,
      hasDefault: true,
      isOptional: false,
    });
  }

  public describe(text: string): EnvValidator<T, TOptional, THasDefault> {
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
  ): EnvValidator<T, TNextOptional, TNextHasDefault> {
    return new EnvValidator<T, TNextOptional, TNextHasDefault>({
      ...this.config,
      ...overrides,
    });
  }
}

export type AnyValidator = EnvValidator<unknown, boolean, boolean>;

export type InferValidator<TValidator> = TValidator extends EnvValidator<
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
}): EnvValidator<T> {
  return new EnvValidator<T>({
    expected: config.expected,
    hasDefault: false,
    isOptional: false,
    parse: config.parse,
  });
}
