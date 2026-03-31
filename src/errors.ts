export type MissingEnvVariable = {
  description?: string;
  key: string;
};

export type InvalidEnvVariable = {
  description?: string;
  key: string;
  message: string;
};

function formatLabel(key: string, description?: string): string {
  return description ? `${key} (${description})` : key;
}

function formatMissingSection(entries: MissingEnvVariable[]): string[] {
  return [
    "Missing required variables:",
    ...entries.map((entry) => `- ${formatLabel(entry.key, entry.description)}`),
  ];
}

function formatInvalidSection(entries: InvalidEnvVariable[]): string[] {
  return [
    "Invalid variables:",
    ...entries.map(
      (entry) =>
        `- ${formatLabel(entry.key, entry.description)}: ${entry.message}`,
    ),
  ];
}

export function formatEnvValidationError(options: {
  invalid: InvalidEnvVariable[];
  missing: MissingEnvVariable[];
}): string {
  const sections: string[] = ["Environment validation failed"];

  if (options.missing.length > 0) {
    sections.push("", ...formatMissingSection(options.missing));
  }

  if (options.invalid.length > 0) {
    sections.push("", ...formatInvalidSection(options.invalid));
  }

  return sections.join("\n");
}

export class EnvValidationError extends Error {
  public readonly invalid: InvalidEnvVariable[];

  public readonly missing: MissingEnvVariable[];

  public constructor(options: {
    invalid: InvalidEnvVariable[];
    missing: MissingEnvVariable[];
  }) {
    const message = formatEnvValidationError(options);
    super(message);
    this.name = "EnvValidationError";
    this.invalid = options.invalid;
    this.missing = options.missing;
  }
}
