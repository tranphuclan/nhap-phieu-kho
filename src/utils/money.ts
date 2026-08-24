export function roundLineAmount(qtyReceived: number, unitPrice: number): number {
  return Math.round(qtyReceived * unitPrice);
}

export function computeTotals(
  lines: Array<{ qtyReceived: number; unitPrice: number }>
): { lineAmounts: number[]; totalAmount: number } {
  const lineAmounts = lines.map((line) =>
    roundLineAmount(line.qtyReceived, line.unitPrice)
  );
  const totalAmount = lineAmounts.reduce((sum, amount) => sum + amount, 0);
  return { lineAmounts, totalAmount };
}

export function formatVnd(amount: number): string {
  return Math.round(amount).toLocaleString("vi-VN");
}
