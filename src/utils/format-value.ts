export function formatReceivedValue(value: string): string {
  return JSON.stringify(value);
}

export function formatValue(value: unknown): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  const serialized = JSON.stringify(value);

  if (serialized !== undefined) {
    return serialized;
  }

  return String(value);
}
