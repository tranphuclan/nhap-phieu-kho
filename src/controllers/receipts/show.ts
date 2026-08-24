import type { Request, Response } from "express";
import { findById } from "../../database/method/receipt";
import { formatVnd } from "../../utils/money";
import { formatQty, renderPage, splitIsoDate } from "../helper";

export async function show(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    res.status(404).send("Không tìm thấy phiếu.");
    return;
  }

  const receipt = await findById(id);
  if (!receipt) {
    res.status(404).send("Không tìm thấy phiếu.");
    return;
  }

  renderPage(res, "receipts/show", {
    title: `Phiếu nhập kho ${receipt.documentNo}`,
    receipt,
    formatVnd,
    formatQty,
    dateParts: splitIsoDate(receipt.documentDate),
    sourceDateParts: receipt.sourceDocDate ? splitIsoDate(receipt.sourceDocDate) : null,
  });
}
