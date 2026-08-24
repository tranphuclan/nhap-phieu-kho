import type { Request, Response } from "express";
import { listReceipts } from "../../database/method/receipt";
import { formatVnd } from "../../utils/money";
import { renderPage } from "../helper";

export async function list(req: Request, res: Response): Promise<void> {
  //TODO: Thiếu phân trang, lọc, sắp xếp, tìm kiếm
  const receipts = await listReceipts();
  renderPage(res, "receipts/index", {
    title: "Danh sách phiếu nhập kho",
    receipts,
    formatVnd,
  });
}
