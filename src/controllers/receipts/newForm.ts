import type { Request, Response } from "express";
import { peekNextDocumentNo } from "../../database/method/receipt";
import { yearFromDate } from "../../utils/documentNo";
import { todayIso } from "../../utils/convert-date";
import { defaultFormValues, renderPage } from "../helper";

export async function newForm(req: Request, res: Response): Promise<void> {
  const documentDate = todayIso();
  const suggestedDocumentNo = await peekNextDocumentNo(yearFromDate(documentDate));
  renderPage(res, "receipts/form", {
    title: "Tạo phiếu nhập kho",
    errors: [],
    suggestedDocumentNo,
    values: defaultFormValues(suggestedDocumentNo, documentDate),
  });
}
