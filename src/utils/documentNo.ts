const PREFIX = "PNK";

export function formatDocumentNo(year: number, sequence: number): string {
  if (!Number.isInteger(year) || year < 1) {
    throw new Error("Invalid year");
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error("Invalid sequence");
  }
  return `${PREFIX}-${year}-${String(sequence).padStart(4, "0")}`;
}

export function documentNoPrefix(year: number): string {
  return `${PREFIX}-${year}-`;
}

export function nextSequence(lastDocumentNo: string | null, year: number): number {
  const prefix = documentNoPrefix(year);
  if (!lastDocumentNo || !lastDocumentNo.startsWith(prefix)) {
    return 1;
  }
  const parsed = Number(lastDocumentNo.slice(prefix.length));
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }
  return parsed + 1;
}

export function yearFromDate(isoDate: string): number {
  const year = Number(isoDate.slice(0, 4));
  if (!Number.isInteger(year) || year < 1) {
    throw new Error("Invalid document date");
  }
  return year;
}
