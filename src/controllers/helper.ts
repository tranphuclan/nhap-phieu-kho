import type { Response } from "express";
import { FormProductValues, ReceiptInput, FormValues, ProductInput } from "../utils/type";


export function formatQty(value: number): string {
  return Number(value).toLocaleString("vi-VN", { maximumFractionDigits: 3 });
}

export function splitIsoDate(iso: string): { day: string; month: string; year: string } {
  const [year, month, day] = iso.split("-");
  return { day: day ?? "", month: month ?? "", year: year ?? "" };
}

export function renderPage(
  res: Response,
  view: string,
  data: Record<string, unknown>
): void {
  res.render(view, data, (error, html) => {
    if (error) {
      console.error(error);
      res.status(500).send("Lỗi hiển thị trang.");
      return;
    }
    res.render("layouts/main", { ...data, body: html });
  });
}

export function parseReceiptForm(body: Record<string, unknown>): {
  input: ReceiptInput;
  values: FormValues;
} {
  const itemNames = asArray(body.item_name ?? body["item_name[]"]);
  const itemCodes = asArray(body.item_code ?? body["item_code[]"]);
  const units = asArray(body.unit ?? body["unit[]"]);
  const qtyOnDocuments = asArray(body.qty_on_document ?? body["qty_on_document[]"]);
  const qtyReceiveds = asArray(body.qty_received ?? body["qty_received[]"]);
  const unitPrices = asArray(body.unit_price ?? body["unit_price[]"]);
  const rowCount = Math.max(
    itemNames.length,
    itemCodes.length,
    units.length,
    qtyOnDocuments.length,
    qtyReceiveds.length,
    unitPrices.length,
    1
  );

  const formProducts: FormProductValues[] = [];
  const products: ProductInput[] = [];

  for (let index = 0; index < rowCount; index += 1) {
    const formProduct: FormProductValues = {
      itemName: itemNames[index] ?? "",
      itemCode: itemCodes[index] ?? "",
      unit: units[index] ?? "",
      qtyOnDocument: qtyOnDocuments[index] ?? "",
      qtyReceived: qtyReceiveds[index] ?? "",
      unitPrice: unitPrices[index] ?? "",
    };
    formProducts.push(formProduct);
    products.push({
      itemName: formProduct.itemName.trim(),
      itemCode: formProduct.itemCode.trim(),
      unit: formProduct.unit.trim(),
      qtyOnDocument: parseQty(formProduct.qtyOnDocument),
      qtyReceived: parseQty(formProduct.qtyReceived),
      unitPrice: parseMoney(formProduct.unitPrice),
    });
  }

  const values: FormValues = {
    organizationName: String(body.organization_name ?? ""),
    departmentName: String(body.department_name ?? ""),
    documentDate: String(body.document_date ?? ""),
    documentNo: String(body.document_no ?? ""),
    debitAccount: String(body.debit_account ?? ""),
    creditAccount: String(body.credit_account ?? ""),
    warehouseName: String(body.warehouse_name ?? ""),
    warehouseLocation: String(body.warehouse_location ?? ""),
    deliveredBy: String(body.delivered_by ?? ""),
    sourceDocType: String(body.source_doc_type ?? ""),
    sourceDocNo: String(body.source_doc_no ?? ""),
    sourceDocDate: String(body.source_doc_date ?? ""),
    sourceDocIssuer: String(body.source_doc_issuer ?? ""),
    attachedOriginalCount: String(body.attached_original_count ?? ""),
    products: formProducts,
  };

  const input: ReceiptInput = {
    documentNo: values.documentNo.trim(),
    documentDate: values.documentDate.trim(),
    organizationName: values.organizationName.trim(),
    departmentName: values.departmentName.trim(),
    debitAccount: values.debitAccount.trim(),
    creditAccount: values.creditAccount.trim(),
    deliveredBy: values.deliveredBy.trim(),
    sourceDocType: values.sourceDocType.trim(),
    sourceDocNo: values.sourceDocNo.trim(),
    sourceDocDate: values.sourceDocDate.trim(),
    sourceDocIssuer: values.sourceDocIssuer.trim(),
    warehouseName: values.warehouseName.trim(),
    warehouseLocation: values.warehouseLocation.trim(),
    attachedOriginalCount: values.attachedOriginalCount.trim(),
    products,
  };

  return { input, values };
}

function asArray(value: unknown): string[] {
  if (value == null) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  return [String(value)];
}

function parseQty(raw: string): number {
  const text = raw.trim();
  if (!text) {
    return Number.NaN;
  }
  return Number(text.replace(",", "."));
}

function parseMoney(raw: string): number {
  const text = raw.trim();
  if (!text) {
    return Number.NaN;
  }
  if (/^\d{1,3}(\.\d{3})+$/.test(text)) {
    return Number(text.replaceAll(".", ""));
  }
  return Number(text.replace(",", "."));
}

export function defaultFormValues(
  documentNo: string,
  documentDate: string
): FormValues {
  const emptyProduct: FormProductValues = {
    itemName: "",
    itemCode: "",
    unit: "",
    qtyOnDocument: "",
    qtyReceived: "",
    unitPrice: "",
  };

  return {
    organizationName: "",
    departmentName: "",
    documentDate,
    documentNo,
    debitAccount: "",
    creditAccount: "",
    warehouseName: "",
    warehouseLocation: "",
    deliveredBy: "",
    sourceDocType: "",
    sourceDocNo: "",
    sourceDocDate: "",
    sourceDocIssuer: "",
    attachedOriginalCount: "",
    products: [{ ...emptyProduct }],
  };
}