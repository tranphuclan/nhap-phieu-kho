import type { Product, ProductRow } from "../types/Product";
import { asDecimal, asInt } from "../helpers";
import type { PoolClient } from "pg";
import { sqlQuery } from "../../database";
import type { InsertProductInput } from "../types/Product";

function mapProduct(row: ProductRow): Product {
    return {
        id: row.id,
        lineNo: row.line_no,
        itemCode: row.item_code,
        itemName: row.item_name,
        unit: row.unit,
        qtyOnDocument: asDecimal(row.qty_on_document),
        qtyReceived: asDecimal(row.qty_received),
        unitPrice: asInt(row.unit_price),
        lineAmount: asInt(row.line_amount),
    };
}

export async function insertProducts(
    postgresqlClient: PoolClient,
    receiptId: number,
    products: InsertProductInput[]
): Promise<void> {
    for (const product of products) {
        await postgresqlClient.query(
            `INSERT INTO product (
           receipt_id, line_no, item_code, item_name, unit,
           qty_on_document, qty_received, unit_price, line_amount
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                receiptId,
                product.lineNo,
                product.itemCode,
                product.itemName,
                product.unit,
                product.qtyOnDocument,
                product.qtyReceived,
                product.unitPrice,
                product.lineAmount,
            ]
        );
    }
}

export async function findProductsByReceiptId(
    receiptId: number
): Promise<Product[]> {
    const result = await sqlQuery<ProductRow>(
        `SELECT *
       FROM product
       WHERE receipt_id = $1
       ORDER BY line_no ASC`,
        [receiptId]
    );
    return result.rows.map(mapProduct);
}
