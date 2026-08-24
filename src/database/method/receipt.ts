import { findProductsByReceiptId } from "./product";
import type { ReceiptHeader, ReceiptRow } from "../types/Receipt";
import { asInt } from "../helpers";
import { Pool, PoolClient } from "pg";
import { postgresql, sqlQuery } from "../../database";
import { documentNoPrefix } from "../../utils/documentNo";
import { formatDocumentNo } from "../../utils/documentNo";
import { computeTotals } from "../../utils/money";
import { numberToVietnameseWords } from "../../utils/numberToVietnameseWords";
import { yearFromDate } from "../../utils/documentNo";
import { withConnection } from "../../database";
import { insertProducts } from "./product";
import { isUniqueViolation } from "../helpers";
import { nonBlankProducts } from "../../utils/validateReceipt";
import { ReceiptInput } from "../../utils/type";
import { CreateReceiptResult, ReceiptListItem, InsertReceiptInput } from "../types/Receipt";
import { Receipt } from "../types/Receipt";
import { asDateText } from "../../utils/convert-date";

function mapHeader(row: ReceiptRow): ReceiptHeader {
    return {
        id: row.id,
        documentNo: row.document_no,
        documentDate: asDateText(row.document_date) ?? "",
        organizationName: row.organization_name,
        departmentName: row.department_name,
        debitAccount: row.debit_account,
        creditAccount: row.credit_account,
        deliveredBy: row.delivered_by,
        sourceDocType: row.source_doc_type,
        sourceDocNo: row.source_doc_no,
        sourceDocDate: asDateText(row.source_doc_date),
        sourceDocIssuer: row.source_doc_issuer,
        warehouseName: row.warehouse_name,
        warehouseLocation: row.warehouse_location,
        attachedOriginalCount: String(row.attached_original_count ?? ""),
        totalAmount: asInt(row.total_amount),
        totalAmountInWords: row.total_amount_in_words,
        createdAt:
            row.created_at instanceof Date
                ? row.created_at.toISOString()
                : String(row.created_at),
    };
}

export async function maxSequenceForYear(
    executor: Pool | PoolClient,
    year: number
): Promise<number> {
    const prefix = documentNoPrefix(year);
    const result = await sqlQuery<{ max: string | number | null }>(
        `SELECT COALESCE(MAX(CAST(substr(document_no, $2::integer) AS INTEGER)),0) AS max
         FROM receipts
         WHERE document_no LIKE $1
           AND substr(document_no, $2::integer) ~ '^[0-9]+$'`,
        [`${prefix}%`, prefix.length + 1],
        executor
    );
    return asInt(result.rows[0]?.max ?? 0);
}

export async function peekNextDocumentNo(year: number): Promise<string> {
    const max = await maxSequenceForYear(postgresql, year);
    return formatDocumentNo(year, max + 1);
}

export async function insertReceipt(
    postgresqlClient: PoolClient,
    input: InsertReceiptInput
): Promise<number> {
    const result = await postgresqlClient.query<{ id: number }>(
        `INSERT INTO receipts (
         document_no, document_date, organization_name, department_name,
         debit_account, credit_account, delivered_by,
         source_doc_type, source_doc_no, source_doc_date, source_doc_issuer,
         warehouse_name, warehouse_location, attached_original_count,
         total_amount, total_amount_in_words
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
       )
       RETURNING id`,
        [
            input.documentNo,
            input.documentDate,
            input.organizationName,
            input.departmentName,
            input.debitAccount,
            input.creditAccount,
            input.deliveredBy,
            input.sourceDocType,
            input.sourceDocNo,
            input.sourceDocDate,
            input.sourceDocIssuer,
            input.warehouseName,
            input.warehouseLocation,
            input.attachedOriginalCount,
            input.totalAmount,
            input.totalAmountInWords,
        ]
    );
    return result.rows[0].id;
}

export async function listReceipts(): Promise<ReceiptListItem[]> {
    const result = await sqlQuery<{
        id: number;
        document_no: string;
        document_date: Date | string;
        warehouse_name: string;
        total_amount: string | number;
    }>(
        `SELECT id, document_no, document_date, warehouse_name, total_amount
       FROM receipts
       ORDER BY document_date DESC, id DESC`
    );

    return result.rows.map((row) => ({
        id: row.id,
        documentNo: row.document_no,
        documentDate: asDateText(row.document_date) ?? "",
        warehouseName: row.warehouse_name,
        totalAmount: asInt(row.total_amount),
    }));
}

export async function findReceiptById(
    id: number
): Promise<ReceiptHeader | null> {
    const result = await sqlQuery<ReceiptRow>(
        `SELECT *
       FROM receipts
       WHERE id = $1`,
        [id]
    );
    if (result.rowCount === 0) {
        return null;
    }
    return mapHeader(result.rows[0]);
}

export async function createReceipt(
    input: ReceiptInput
): Promise<CreateReceiptResult> {
    const products = nonBlankProducts(input.products);
    const { lineAmounts, totalAmount } = computeTotals(
        products.map((product) => ({
            qtyReceived: product.qtyReceived,
            unitPrice: product.unitPrice,
        }))
    );
    const totalAmountInWords = numberToVietnameseWords(totalAmount);
    const year = yearFromDate(input.documentDate);
    const sourceDocDate = input.sourceDocDate === "" ? null : input.sourceDocDate;

    return withConnection(async (postgresqlClient) => {
        try {
            await postgresqlClient.query("BEGIN");
            await postgresqlClient.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
                `receipts:${year}`,
            ]);

            let documentNo = input.documentNo.trim();
            if (!documentNo) {
                const max = await maxSequenceForYear(postgresqlClient, year);
                documentNo = formatDocumentNo(year, max + 1);
            }

            const receiptId = await insertReceipt(postgresqlClient, {
                documentNo,
                documentDate: input.documentDate,
                organizationName: input.organizationName,
                departmentName: input.departmentName,
                debitAccount: input.debitAccount,
                creditAccount: input.creditAccount,
                deliveredBy: input.deliveredBy,
                sourceDocType: input.sourceDocType,
                sourceDocNo: input.sourceDocNo,
                sourceDocDate,
                sourceDocIssuer: input.sourceDocIssuer,
                warehouseName: input.warehouseName,
                warehouseLocation: input.warehouseLocation,
                attachedOriginalCount: input.attachedOriginalCount,
                totalAmount,
                totalAmountInWords,
            });

            await insertProducts(
                postgresqlClient,
                receiptId,
                products.map((product, index) => ({
                    lineNo: index + 1,
                    itemCode: product.itemCode,
                    itemName: product.itemName,
                    unit: product.unit,
                    qtyOnDocument: product.qtyOnDocument,
                    qtyReceived: product.qtyReceived,
                    unitPrice: product.unitPrice,
                    lineAmount: lineAmounts[index],
                }))
            );

            await postgresqlClient.query("COMMIT");
            return { ok: true, id: receiptId };
        } catch (error) {
            await postgresqlClient.query("ROLLBACK");
            if (isUniqueViolation(error)) {
                return { ok: false, reason: "duplicate_document_no" };
            }
            throw error;
        }
    });
}



export async function findById(id: number): Promise<Receipt | null> {
    const header = await findReceiptById(id);
    if (!header) {
        return null;
    }

    const products = await findProductsByReceiptId(id);
    return { ...header, products };
}

export async function removeReceipt(id: number): Promise<void> {
    await sqlQuery(`DELETE FROM receipts WHERE id = $1`, [id]);
}