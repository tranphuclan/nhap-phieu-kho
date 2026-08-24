import { ProductInput, ReceiptInput } from "./type";

export type { ReceiptInput, ProductInput } from "./type";

function isEmptyText(value: string): boolean {
  return value.trim() === "";
}

function isEmptyNumber(value: number): boolean {
  return !Number.isFinite(value);
}

export function isBlankProduct(product: ProductInput): boolean {
  return (
    isEmptyText(product.itemName) &&
    isEmptyText(product.itemCode) &&
    isEmptyText(product.unit) &&
    isEmptyNumber(product.qtyOnDocument) &&
    isEmptyNumber(product.qtyReceived) &&
    isEmptyNumber(product.unitPrice)
  );
}

export function nonBlankProducts(products: ProductInput[]): ProductInput[] {
  return products.filter((product) => !isBlankProduct(product));
}

function requireText(value: string, message: string, errors: string[]): void {
  if (isEmptyText(value)) {
    errors.push(message);
  }
}

function requireDate(value: string, emptyMessage: string, invalidMessage: string, errors: string[]): void {
  if (isEmptyText(value)) {
    errors.push(emptyMessage);
    return;
  }
  if (Number.isNaN(Date.parse(value))) {
    errors.push(invalidMessage);
  }
}

export function validateReceipt(input: ReceiptInput): string[] {
  const errors: string[] = [];
  const products = nonBlankProducts(input.products);

  requireText(input.organizationName, "Đơn vị không được để trống.", errors);
  requireText(input.departmentName, "Bộ phận không được để trống.", errors);
  requireDate(
    input.documentDate,
    "Ngày nhập không được để trống.",
    "Ngày nhập không hợp lệ.",
    errors
  );
  requireText(input.documentNo, "Số phiếu không được để trống.", errors);
  requireText(input.debitAccount, "Tài khoản nợ không được để trống.", errors);
  requireText(input.creditAccount, "Tài khoản có không được để trống.", errors);
  requireText(input.warehouseName, "Kho nhập không được để trống.", errors);
  requireText(input.warehouseLocation, "Địa điểm kho không được để trống.", errors);
  requireText(input.deliveredBy, "Họ tên người giao không được để trống.", errors);
  requireText(input.sourceDocType, "Loại chứng từ không được để trống.", errors);
  requireText(input.sourceDocNo, "Số chứng từ không được để trống.", errors);
  requireDate(
    input.sourceDocDate,
    "Ngày chứng từ không được để trống.",
    "Ngày chứng từ không hợp lệ.",
    errors
  );
  requireText(input.sourceDocIssuer, "Đơn vị phát hành chứng từ không được để trống.", errors);
  requireText(input.attachedOriginalCount, "Số chứng từ gốc kèm theo không được để trống.", errors);

  if (products.length === 0) {
    errors.push("Phiếu phải có ít nhất một dòng hàng.");
  }

  products.forEach((product, index) => {
    const label = `Dòng ${index + 1}`;
    requireText(product.itemName, `${label}: tên hàng không được để trống.`, errors);
    requireText(product.itemCode, `${label}: mã số không được để trống.`, errors);
    requireText(product.unit, `${label}: đơn vị tính không được để trống.`, errors);

    if (isEmptyNumber(product.qtyOnDocument) || isEmptyNumber(product.qtyReceived)) {
      errors.push(`${label}: số lượng không được để trống.`);
    } else if (product.qtyOnDocument < 0 || product.qtyReceived < 0) {
      errors.push(`${label}: số lượng không được âm.`);
    }

    if (isEmptyNumber(product.unitPrice)) {
      errors.push(`${label}: đơn giá không được để trống.`);
    } else if (product.unitPrice < 0) {
      errors.push(`${label}: đơn giá không được âm.`);
    } else if (!Number.isInteger(product.unitPrice)) {
      errors.push(`${label}: đơn giá phải là số nguyên (đồng).`);
    }
  });

  return errors;
}
