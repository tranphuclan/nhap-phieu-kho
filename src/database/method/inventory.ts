import { sqlQuery } from "../../database";
import { asDecimal } from "../helpers";
import type { InventoryRow } from "../types/Inventory";

export async function listInventory(): Promise<InventoryRow[]> {
    const result = await sqlQuery<{
        warehouse_name: string;
        item_code: string;
        item_name: string;
        unit: string;
        quantity_inventory: string | number;
    }>(
        `SELECT r.warehouse_name,
              l.item_code,
              MAX(l.item_name) AS item_name,
              MAX(l.unit) AS unit,
              SUM(l.qty_received) AS quantity_inventory
       FROM receipts r
       JOIN product l ON l.receipt_id = r.id
       GROUP BY r.warehouse_name, l.item_code
       ORDER BY r.warehouse_name, l.item_code`
    );

    return result.rows.map((row) => ({
        warehouseName: row.warehouse_name,
        itemCode: row.item_code,
        itemName: row.item_name,
        unit: row.unit,
        quantityInventory: asDecimal(row.quantity_inventory),
    }));
}