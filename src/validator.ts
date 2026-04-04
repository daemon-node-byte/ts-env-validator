import type { Parser, ValidationResult } from "./types";
import {
  createConstrainedParser,
  type ValueConstraint,
  validateDefaultValue,
} from "./utils/constraints";
import { formatReceivedValue } from "./utils/format-value";

type ValidatorState<T> = {
  defaultValue?: T;
  description?: string;
  expected: string;
  hasDefault: boolean;
  isOptional: boolean;
};

export interface Validator<
  T,
  TOptional extends boolean = false,
  THasDefault extends boolean = false,
> {
  readonly __output?: T;
  readonly __optional?: TOptional;
  readonly __hasDefault?: THasDefault;
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

export interface StringValidator<
  TOptional extends boolean = false,
  THasDefault extends boolean = false,
> extends Validator<string, TOptional, THasDefault> {
  optional(): StringValidator<true, THasDefault>;
  default(value: string): StringValidator<false, true>;
  describe(text: string): StringValidator<TOptional, THasDefault>;
  nonempty(): StringValidator<TOptional, THasDefault>;
  minLength(length: number): StringValidator<TOptional, THasDefault>;
  maxLength(length: number): StringValidator<TOptional, THasDefault>;
  pattern(
    regex: RegExp,
    label?: string,
  ): StringValidator<TOptional, THasDefault>;
}

export interface NumberValidator<
  TOptional extends boolean = false,
  THasDefault extends boolean = false,
> extends Validator<number, TOptional, THasDefault> {
  optional(): NumberValidator<true, THasDefault>;
  default(value: number): NumberValidator<false, true>;
  describe(text: string): NumberValidator<TOptional, THasDefault>;
  min(value: number): NumberValidator<TOptional, THasDefault>;
  max(value: number): NumberValidator<TOptional, THasDefault>;
}

abstract class BaseEnvValidator<T> {
  protected readonly state: ValidatorState<T>;

  protected constructor(state: ValidatorState<T>) {
    this.state = state;
  }

  public abstract parse(input: string): ValidationResult<T>;

  protected abstract validateDefault(value: T): string | undefined;

  protected getDefaultOverrides(value: T): ValidatorState<T> {
    const message = this.validateDefault(value);

    if (message) {
      throw new TypeError(message);
    }

    return {
      ...this.state,
      defaultValue: value,
      hasDefault: true,
      isOptional: false,
    };
  }

  public get expected(): string {
    return this.state.expected;
  }

  public get description(): string | undefined {
    return this.state.description;
  }

  public get hasDefault(): boolean {
    return this.state.hasDefault;
  }

  public get isOptional(): boolean {
    return this.state.isOptional;
  }

  public get defaultValue(): T | undefined {
    return this.state.defaultValue;
  }
}

class EnvValidator<
  T,
  TOptional extends boolean = false,
  THasDefault extends boolean = false,
>
  extends BaseEnvValidator<T>
  implements Validator<T, TOptional, THasDefault>
{
  private readonly parser: Parser<T>;

  public constructor(state: ValidatorState<T>, parser: Parser<T>) {
    super(state);
    this.parser = parser;
  }

  public parse(input: string): ValidationResult<T> {
    return this.parser(input);
  }

  protected validateDefault(): string | undefined {
    return undefined;
  }

  public optional(): Validator<T, true, THasDefault> {
    return this.clone({
      isOptional: true,
    });
  }

  public default(value: T): Validator<T, false, true> {
    return this.clone<false, true>(this.getDefaultOverrides(value));
  }

  public describe(text: string): Validator<T, TOptional, THasDefault> {
    return this.clone({
      description: text,
    });
  }

  private clone<
    TNextOptional extends boolean = TOptional,
    TNextHasDefault extends boolean = THasDefault,
  >(
    overrides: Partial<ValidatorState<T>>,
  ): Validator<T, TNextOptional, TNextHasDefault> {
    return new EnvValidator<T, TNextOptional, TNextHasDefault>(
      {
        ...this.state,
        ...overrides,
      },
      this.parser,
    );
  }
}

class ConstrainedStringEnvValidator<
  TOptional extends boolean = false,
  THasDefault extends boolean = false,
>
  extends BaseEnvValidator<string>
  implements StringValidator<TOptional, THasDefault>
{
  private readonly baseParse: Parser<string>;

  private readonly constraints: readonly ValueConstraint<string>[];

  private readonly parser: Parser<string>;

  public constructor(
    state: ValidatorState<string>,
    baseParse: Parser<string>,
    constraints: readonly ValueConstraint<string>[] = [],
  ) {
    super(state);
    this.baseParse = baseParse;
    this.constraints = constraints;
    this.parser = createConstrainedParser(baseParse, constraints);
  }

  public parse(input: string): ValidationResult<string> {
    return this.parser(input);
  }

  protected validateDefault(value: string): string | undefined {
    return validateDefaultValue(value, this.constraints);
  }

  public optional(): StringValidator<true, THasDefault> {
    return this.clone({
      isOptional: true,
    });
  }

  public default(value: string): StringValidator<false, true> {
    return this.clone<false, true>(this.getDefaultOverrides(value));
  }

  public describe(text: string): StringValidator<TOptional, THasDefault> {
    return this.clone({
      description: text,
    });
  }

  public nonempty(): StringValidator<TOptional, THasDefault> {
    return this.minLength(1);
  }

  public minLength(length: number): StringValidator<TOptional, THasDefault> {
    assertNonNegativeInteger(length, "minLength");
    return this.withConstraint({
      expected: `string length >= ${length}`,
      validate: (value) => value.length >= length,
    });
  }

  public maxLength(length: number): StringValidator<TOptional, THasDefault> {
    assertNonNegativeInteger(length, "maxLength");
    return this.withConstraint({
      expected: `string length <= ${length}`,
      validate: (value) => value.length <= length,
    });
  }

  public pattern(
    regex: RegExp,
    label?: string,
  ): StringValidator<TOptional, THasDefault> {
    return this.withConstraint({
      expected: label ? `string matching ${label}` : `string matching ${regex}`,
      validate: (value) => {
        regex.lastIndex = 0;
        const matches = regex.test(value);
        regex.lastIndex = 0;
        return matches;
      },
    });
  }

  private withConstraint(
    constraint: ValueConstraint<string>,
  ): StringValidator<TOptional, THasDefault> {
    return this.clone({}, [...this.constraints, constraint]);
  }

  private clone<
    TNextOptional extends boolean = TOptional,
    TNextHasDefault extends boolean = THasDefault,
  >(
    overrides: Partial<ValidatorState<string>>,
    constraints: readonly ValueConstraint<string>[] = this.constraints,
  ): StringValidator<TNextOptional, TNextHasDefault> {
    return new ConstrainedStringEnvValidator<TNextOptional, TNextHasDefault>(
      {
        ...this.state,
        ...overrides,
      },
      this.baseParse,
      constraints,
    );
  }
}

class ConstrainedNumberEnvValidator<
  TOptional extends boolean = false,
  THasDefault extends boolean = false,
>
  extends BaseEnvValidator<number>
  implements NumberValidator<TOptional, THasDefault>
{
  private readonly baseParse: Parser<number>;

  private readonly constraints: readonly ValueConstraint<number>[];

  private readonly parser: Parser<number>;

  public constructor(
    state: ValidatorState<number>,
    baseParse: Parser<number>,
    constraints: readonly ValueConstraint<number>[] = [],
  ) {
    super(state);
    this.baseParse = baseParse;
    this.constraints = constraints;
    this.parser = createConstrainedParser(baseParse, constraints);
  }

  public parse(input: string): ValidationResult<number> {
    return this.parser(input);
  }

  protected validateDefault(value: number): string | undefined {
    return validateDefaultValue(value, this.constraints);
  }

  public optional(): NumberValidator<true, THasDefault> {
    return this.clone({
      isOptional: true,
    });
  }

  public default(value: number): NumberValidator<false, true> {
    return this.clone<false, true>(this.getDefaultOverrides(value));
  }

  public describe(text: string): NumberValidator<TOptional, THasDefault> {
    return this.clone({
      description: text,
    });
  }

  public min(value: number): NumberValidator<TOptional, THasDefault> {
    assertFiniteNumber(value, "min");
    return this.withConstraint({
      expected: `${this.expected} >= ${value}`,
      validate: (received) => received >= value,
    });
  }

  public max(value: number): NumberValidator<TOptional, THasDefault> {
    assertFiniteNumber(value, "max");
    return this.withConstraint({
      expected: `${this.expected} <= ${value}`,
      validate: (received) => received <= value,
    });
  }

  private withConstraint(
    constraint: ValueConstraint<number>,
  ): NumberValidator<TOptional, THasDefault> {
    return this.clone({}, [...this.constraints, constraint]);
  }

  private clone<
    TNextOptional extends boolean = TOptional,
    TNextHasDefault extends boolean = THasDefault,
  >(
    overrides: Partial<ValidatorState<number>>,
    constraints: readonly ValueConstraint<number>[] = this.constraints,
  ): NumberValidator<TNextOptional, TNextHasDefault> {
    return new ConstrainedNumberEnvValidator<TNextOptional, TNextHasDefault>(
      {
        ...this.state,
        ...overrides,
      },
      this.baseParse,
      constraints,
    );
  }
}

export type AnyValidator = Validator<unknown, boolean, boolean>;

export type InferValidator<TValidator> = TValidator extends {
  readonly __output?: infer TValue;
  readonly __optional?: infer TOptional;
  readonly __hasDefault?: infer THasDefault;
}
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

  return new EnvValidator<T>(
    {
      expected: config.expected,
      hasDefault: false,
      isOptional: false,
    },
    parse,
  );
}

export function createStringValidator(config: {
  expected: string;
  parse: Parser<string>;
}): StringValidator {
  return new ConstrainedStringEnvValidator(
    {
      expected: config.expected,
      hasDefault: false,
      isOptional: false,
    },
    config.parse,
  );
}

export function createNumberValidator(config: {
  expected: string;
  parse: Parser<number>;
}): NumberValidator {
  return new ConstrainedNumberEnvValidator(
    {
      expected: config.expected,
      hasDefault: false,
      isOptional: false,
    },
    config.parse,
  );
}

function assertNonNegativeInteger(value: number, methodName: string): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(`${methodName} length must be a non-negative integer`);
  }
}

function assertFiniteNumber(value: number, methodName: string): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${methodName} value must be a finite number`);
  }
}
