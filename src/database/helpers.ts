

export function asInt(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

export function asDecimal(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}
