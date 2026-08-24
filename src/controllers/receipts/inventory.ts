import type { Request, Response } from "express";
import { listInventory } from "../../database/method/inventory";
import { formatQty, renderPage } from "../helper";

export async function inventory(req: Request, res: Response): Promise<void> {
  const rows = await listInventory();
  renderPage(res, "receipts/inventory", {
    title: "Tồn kho",
    rows,
    formatQty,
  });
}
