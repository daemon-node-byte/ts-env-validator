export type ValidationSuccess<T> = {
  success: true;
  value: T;
};

export type ValidationFailure = {
  success: false;
  message: string;
};

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

export type Parser<T> = (input: string) => ValidationResult<T>;

export type ValidatorConfig<T> = {
  defaultValue?: T;
  description?: string;
  expected: string;
  hasDefault: boolean;
  isOptional: boolean;
  parse: Parser<T>;
  validateDefault?: (value: T) => string | undefined;
};
