import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { create } from "../controllers/receipts/create";
import { list } from "../controllers/receipts/list";
import { newForm } from "../controllers/receipts/newForm";
import { show } from "../controllers/receipts/show";
import { inventory } from "../controllers/receipts/inventory";
import { remove } from "../controllers/receipts/remove";

const router = Router();

function wrap(
  handler: (req: Request, res: Response) => Promise<void>
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    handler(req, res).catch(next);
  };
}

router.get("/", (_req, res) => {
  res.redirect("/receipts");
});

router.get("/inventory", wrap(inventory));

router.get("/receipts", wrap(list));
router.get("/receipts/new", wrap(newForm));
router.post("/receipts", wrap(create));
router.get("/receipts/:id", wrap(show));
router.post("/receipts/delete/:id", wrap(remove));

export default router;
