CREATE TABLE IF NOT EXISTS receipts (
  id SERIAL PRIMARY KEY,
  document_no TEXT NOT NULL UNIQUE,
  document_date DATE NOT NULL,
  organization_name TEXT NOT NULL DEFAULT '',
  department_name TEXT NOT NULL DEFAULT '',
  debit_account TEXT NOT NULL DEFAULT '',
  credit_account TEXT NOT NULL DEFAULT '',
  delivered_by TEXT NOT NULL DEFAULT '',
  source_doc_type TEXT NOT NULL DEFAULT '',
  source_doc_no TEXT NOT NULL DEFAULT '',
  source_doc_date DATE NOT NULL,
  source_doc_issuer TEXT NOT NULL DEFAULT '',
  warehouse_name TEXT NOT NULL DEFAULT '',
  warehouse_location TEXT NOT NULL DEFAULT '',
  attached_original_count TEXT NOT NULL DEFAULT '',
  total_amount BIGINT NOT NULL CHECK (total_amount >= 0),
  total_amount_in_words TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER NOT NULL REFERENCES receipts (id) ON DELETE CASCADE,
  line_no INTEGER NOT NULL,
  item_code TEXT NOT NULL DEFAULT '',
  item_name TEXT NOT NULL DEFAULT '',
  unit TEXT NOT NULL DEFAULT '',
  qty_on_document NUMERIC(12, 3) NOT NULL DEFAULT 0,
  qty_received NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unit_price BIGINT NOT NULL DEFAULT 0,
  line_amount BIGINT NOT NULL DEFAULT 0,
  UNIQUE (receipt_id, line_no),
  CHECK (
    qty_on_document >= 0
    AND qty_received >= 0
    AND unit_price >= 0
  )
);