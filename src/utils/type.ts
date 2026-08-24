export type FormProductValues = {
    itemName: string;
    itemCode: string;
    unit: string;
    qtyOnDocument: string;
    qtyReceived: string;
    unitPrice: string;
};

export type FormValues = {
    organizationName: string;
    departmentName: string;
    documentDate: string;
    documentNo: string;
    debitAccount: string;
    creditAccount: string;
    warehouseName: string;
    warehouseLocation: string;
    deliveredBy: string;
    sourceDocType: string;
    sourceDocNo: string;
    sourceDocDate: string;
    sourceDocIssuer: string;
    attachedOriginalCount: string;
    products: FormProductValues[];
};


export type ProductInput = {
    itemName: string;
    itemCode: string;
    unit: string;
    qtyOnDocument: number;
    qtyReceived: number;
    unitPrice: number;
};

export type ReceiptInput = {
    documentNo: string;
    documentDate: string;
    organizationName: string;
    departmentName: string;
    debitAccount: string;
    creditAccount: string;
    deliveredBy: string;
    sourceDocType: string;
    sourceDocNo: string;
    sourceDocDate: string;
    sourceDocIssuer: string;
    warehouseName: string;
    warehouseLocation: string;
    attachedOriginalCount: string;
    products: ProductInput[];
};