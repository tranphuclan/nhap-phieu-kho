export type Product = {
    id: number;
    lineNo: number;
    itemCode: string;
    itemName: string;
    unit: string;
    qtyOnDocument: number;
    qtyReceived: number;
    unitPrice: number;
    lineAmount: number;
};

export type InsertProductInput = {
    lineNo: number;
    itemCode: string;
    itemName: string;
    unit: string;
    qtyOnDocument: number;
    qtyReceived: number;
    unitPrice: number;
    lineAmount: number;
};

export type ProductRow = {
    id: number;
    line_no: number;
    item_code: string;
    item_name: string;
    unit: string;
    qty_on_document: string | number;
    qty_received: string | number;
    unit_price: string | number;
    line_amount: string | number;
};

