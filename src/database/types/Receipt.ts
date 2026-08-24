import { Product } from "./Product";

export type ReceiptHeader = {
    id: number;
    documentNo: string;
    documentDate: string;
    organizationName: string;
    departmentName: string;
    debitAccount: string;
    creditAccount: string;
    deliveredBy: string;
    sourceDocType: string;
    sourceDocNo: string;
    sourceDocDate: string | null;
    sourceDocIssuer: string;
    warehouseName: string;
    warehouseLocation: string;
    attachedOriginalCount: string;
    totalAmount: number;
    totalAmountInWords: string;
    createdAt: string;
};

export type ReceiptListItem = {
    id: number;
    documentNo: string;
    documentDate: string;
    warehouseName: string;
    totalAmount: number;
};

export type InsertReceiptInput = {
    documentNo: string;
    documentDate: string;
    organizationName: string;
    departmentName: string;
    debitAccount: string;
    creditAccount: string;
    deliveredBy: string;
    sourceDocType: string;
    sourceDocNo: string;
    sourceDocDate: string | null;
    sourceDocIssuer: string;
    warehouseName: string;
    warehouseLocation: string;
    attachedOriginalCount: string;
    totalAmount: number;
    totalAmountInWords: string;
};

export type ReceiptRow = {
    id: number;
    document_no: string;
    document_date: Date | string;
    organization_name: string;
    department_name: string;
    debit_account: string;
    credit_account: string;
    delivered_by: string;
    source_doc_type: string;
    source_doc_no: string;
    source_doc_date: Date | string | null;
    source_doc_issuer: string;
    warehouse_name: string;
    warehouse_location: string;
    attached_original_count: string;
    total_amount: string | number;
    total_amount_in_words: string;
    created_at: Date | string;
};

export type Receipt = ReceiptHeader & {
    products: Product[];
};

export type CreateReceiptFailureReason = "duplicate_document_no";

export type CreateReceiptResult =
    | { ok: true; id: number }
    | { ok: false; reason: CreateReceiptFailureReason };
