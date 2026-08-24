import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatDocumentNo, nextSequence } from "../src/utils/documentNo";
import { computeTotals, roundLineAmount } from "../src/utils/money";
import {
  validateReceipt,
  type ReceiptInput,
} from "../src/utils/validateReceipt";

function sampleInput(overrides: Partial<ReceiptInput> = {}): ReceiptInput {
  return {
    documentNo: "PNK-2026-0001",
    documentDate: "2026-08-21",
    organizationName: "Bệnh viện VIMES",
    departmentName: "Khoa Dược",
    debitAccount: "156",
    creditAccount: "331",
    deliveredBy: "Nguyễn Văn A",
    sourceDocType: "Hóa đơn",
    sourceDocNo: "HD-123",
    sourceDocDate: "2026-08-20",
    sourceDocIssuer: "Công ty ABC",
    warehouseName: "Kho tổng",
    warehouseLocation: "Tầng 1, nhà A",
    attachedOriginalCount: "2",
    products: [
      {
        itemName: "Gạc vô trùng 10x10",
        itemCode: "VT-001",
        unit: "Gói",
        qtyOnDocument: 100,
        qtyReceived: 100,
        unitPrice: 12000,
      },
    ],
    ...overrides,
  };
}

describe("roundLineAmount", () => {
  it("uses half-up per line", () => {
    assert.equal(roundLineAmount(0.333, 10_000), 3330);
    assert.equal(roundLineAmount(1.5, 1), 2);
    assert.equal(roundLineAmount(0.5, 1), 1);
  });
});

describe("computeTotals", () => {
  it("rounds each line then sums, without rounding the grand total again", () => {
    const { lineAmounts, totalAmount } = computeTotals([
      { qtyReceived: 0.333, unitPrice: 10_000 },
      { qtyReceived: 48, unitPrice: 18_500 },
    ]);
    assert.deepEqual(lineAmounts, [3330, 888_000]);
    assert.equal(totalAmount, 891_330);
  });
});

describe("validateReceipt", () => {
  it("accepts a fully filled receipt", () => {
    assert.deepEqual(validateReceipt(sampleInput()), []);
  });

  it("rejects a receipt with no lines", () => {
    const errors = validateReceipt(sampleInput({ products: [] }));
    assert.ok(errors.some((message) => message.includes("ít nhất một dòng")));
  });

  it("treats fully blank rows as missing lines", () => {
    const errors = validateReceipt(
      sampleInput({
        products: [
          {
            itemName: "",
            itemCode: "",
            unit: "",
            qtyOnDocument: Number.NaN,
            qtyReceived: Number.NaN,
            unitPrice: Number.NaN,
          },
        ],
      })
    );
    assert.ok(errors.some((message) => message.includes("ít nhất một dòng")));
  });

  it("rejects empty header fields", () => {
    const errors = validateReceipt(
      sampleInput({
        organizationName: "",
        departmentName: "",
        documentNo: "",
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
      })
    );
    assert.ok(errors.some((message) => message.includes("Đơn vị")));
    assert.ok(errors.some((message) => message.includes("Bộ phận")));
    assert.ok(errors.some((message) => message.includes("Số phiếu")));
    assert.ok(errors.some((message) => message.includes("Tài khoản nợ")));
    assert.ok(errors.some((message) => message.includes("Tài khoản có")));
    assert.ok(errors.some((message) => message.includes("Kho nhập")));
    assert.ok(errors.some((message) => message.includes("Địa điểm")));
    assert.ok(errors.some((message) => message.includes("người giao")));
    assert.ok(errors.some((message) => message.includes("Loại chứng từ")));
    assert.ok(errors.some((message) => message.includes("Số chứng từ không")));
    assert.ok(errors.some((message) => message.includes("Ngày chứng từ")));
    assert.ok(errors.some((message) => message.includes("phát hành")));
    assert.ok(errors.some((message) => message.includes("chứng từ gốc")));
  });

  it("rejects a line missing item fields or numbers", () => {
    const errors = validateReceipt(
      sampleInput({
        products: [
          {
            itemName: "",
            itemCode: "",
            unit: "",
            qtyOnDocument: Number.NaN,
            qtyReceived: 1,
            unitPrice: 1000,
          },
        ],
      })
    );
    assert.ok(errors.some((message) => message.includes("tên hàng")));
    assert.ok(errors.some((message) => message.includes("mã số")));
    assert.ok(errors.some((message) => message.includes("đơn vị tính")));
    assert.ok(errors.some((message) => message.includes("số lượng")));
  });

  it("rejects negative quantity and unit price", () => {
    const errors = validateReceipt(
      sampleInput({
        products: [
          {
            itemName: "Gạc",
            itemCode: "VT-001",
            unit: "Gói",
            qtyOnDocument: -1,
            qtyReceived: -2,
            unitPrice: -100,
          },
        ],
      })
    );
    assert.ok(errors.some((message) => message.includes("số lượng")));
    assert.ok(errors.some((message) => message.includes("đơn giá")));
  });

  it("allows qty on document to differ from qty received", () => {
    const errors = validateReceipt(
      sampleInput({
        products: [
          {
            itemName: "Cồn 70 độ 500ml",
            itemCode: "VT-014",
            unit: "Chai",
            qtyOnDocument: 50,
            qtyReceived: 48,
            unitPrice: 18500,
          },
        ],
      })
    );
    assert.deepEqual(errors, []);
  });
});

describe("documentNo", () => {
  it("formats year and a 4-digit sequence", () => {
    assert.equal(formatDocumentNo(2026, 1), "PNK-2026-0001");
    assert.equal(formatDocumentNo(2026, 12), "PNK-2026-0012");
  });

  it("increments the sequence for the same year", () => {
    assert.equal(nextSequence(null, 2026), 1);
    assert.equal(nextSequence("PNK-2026-0001", 2026), 2);
    assert.equal(nextSequence("PNK-2025-0099", 2026), 1);
  });
});
