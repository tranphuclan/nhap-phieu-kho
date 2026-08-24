import type { Request, Response } from "express";
import {
  createReceipt,
  peekNextDocumentNo,
} from "../../database/method/receipt";
import type { CreateReceiptFailureReason } from "../../database/types/Receipt";
import { yearFromDate } from "../../utils/documentNo";
import { validateReceipt } from "../../utils/validateReceipt";
import { parseReceiptForm, renderPage } from "../helper";
import { todayIso } from "../../utils/convert-date";

const failureMessages: Record<CreateReceiptFailureReason, string> = {
  duplicate_document_no: "Số phiếu đã tồn tại.",
};

export async function create(req: Request, res: Response): Promise<void> {
  const { input, values } = parseReceiptForm((req.body ?? {}) as Record<string, unknown>)
  const errors = validateReceipt(input);
  const fallbackDate =
    input.documentDate && !Number.isNaN(Date.parse(input.documentDate))
      ? input.documentDate
      : todayIso();
  const suggestedDocumentNo =
    values.documentNo.trim() ||
    (await peekNextDocumentNo(yearFromDate(fallbackDate)));

  if (errors.length > 0) {
    res.status(400);
    renderPage(res, "receipts/form", {
      title: "Tạo phiếu nhập kho",
      errors,
      suggestedDocumentNo,
      values,
    });
    return;
  }

  const result = await createReceipt(input);
  if (!result.ok) {
    res.status(400);
    renderPage(res, "receipts/form", {
      title: "Tạo phiếu nhập kho",
      errors: [failureMessages[result.reason]],
      suggestedDocumentNo,
      values,
    });
    return;
  }

  res.redirect(`/receipts/${result.id}`);
}
