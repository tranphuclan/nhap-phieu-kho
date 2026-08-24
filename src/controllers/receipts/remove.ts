import { findReceiptById, removeReceipt } from "../../database/method/receipt";
import type { Request, Response } from "express";

export async function remove(req: Request, res: Response) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        res.status(404).send("Không tìm thấy phiếu.");
        return;
    }


    const receipt = await findReceiptById(id);
    if (!receipt) {
        res.status(404).send("Không tìm thấy phiếu.");
        return;
    }
    await removeReceipt(Number(id));
    res.redirect("/receipts");
}