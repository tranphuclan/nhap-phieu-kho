# Phiếu nhập kho 01-VT

Ứng dụng web nhập, lưu, xem/in và xóa **phiếu nhập kho** theo mẫu số 01-VT (Thông tư 200/2014/TT-BTC).

Kiến trúc MVC: **Node.js + Express + TypeScript**, giao diện **EJS**, cơ sở dữ liệu **PostgreSQL**. Tồn kho được tính từ phiếu nhập (chưa có phiếu xuất).

## Công nghệ


| Thành phần | Công nghệ                    |
| ---------- | ---------------------------- |
| Runtime    | Node.js (ES2021)             |
| Server     | Express 5                    |
| Ngôn ngữ   | TypeScript                   |
| View       | EJS                          |
| Database   | PostgreSQL (`pg`)            |
| Test       | `node:test` (chạy qua `tsx`) |


## Yêu cầu

- [Node.js](https://nodejs.org/) 20+ (khuyến nghị)
- [PostgreSQL](https://www.postgresql.org/download/) 16+, **hoặc** Docker để chạy Postgres local

User Postgres cần quyền tạo database (app tự tạo DB nếu chưa có).

## Cài đặt



### 1. Clone và cài dependency

```bash
cd e:\nhap-phieu-kho
npm install
```



### 2. PostgreSQL

**Cách A — Postgres đã cài trên máy**

Tạo database (tùy chọn: app cũng tự tạo nếu user có quyền):

```sql
CREATE DATABASE nhap_phieu_kho;
```

**Cách B — Docker Compose**

File `deployments/docker-composer.postgres.yml` chạy Postgres 16 (user/password `postgres`, database mặc định `appdb`) và pgAdmin tại [http://localhost:5050](http://localhost:5050).

```bash
docker compose -f deployments/docker-composer.postgres.yml up -d
```



### 3. Biến môi trường

Sao chép file mẫu rồi điền giá trị:

```text
copy .env.example .env
```

Trên macOS/Linux: `cp .env.example .env`.

Nội dung `.env` (các biến dưới đây **bắt buộc**, server sẽ không chạy nếu thiếu):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nhap_phieu_kho
DATABASE_NAME=nhap_phieu_kho
PORT=3000
```


| Biến            | Ý nghĩa                                                                      |
| --------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`  | Connection string PostgreSQL, pathname phải trùng tên database               |
| `DATABASE_NAME` | Tên database. Nếu chưa tồn tại, app kết nối `postgres` rồi `CREATE DATABASE` |
| `PORT`          | Cổng HTTP (mặc định gợi ý `3000`)                                            |


Khi server khởi động, schema trong `src/database/schema.sql` được áp dụng tự động (`CREATE TABLE IF NOT EXISTS`)..

### 4. Chạy

```bash
npm test
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) — chuyển hướng tới danh sách phiếu.


| Script          | Mô tả                                           |
| --------------- | ----------------------------------------------- |
| `npm run dev`   | Dev server (`tsx watch`)                        |
| `npm start`     | Chạy một lần bằng `tsx`                         |
| `npm run build` | Compile TypeScript ra `dist/`                   |
| `npm test`      | Unit test (số phiếu, làm tròn tiền, validation) |




## Routes / API


| Method | Path                   | Mô tả                                                     | Kết quả thành công                                           |
| ------ | ---------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `GET`  | `/`                    | Trang gốc                                                 | Redirect `302` → `/receipts`                                 |
| `GET`  | `/receipts`            | Danh sách phiếu (số, ngày, kho, tổng tiền)                | HTML                                                         |
| `GET`  | `/receipts/new`        | Form tạo phiếu (một màn, hai phần: thông tin + dòng hàng) | HTML; số phiếu gợi ý `PNK-YYYY-0001`                         |
| `POST` | `/receipts`            | Lưu phiếu mới                                             | Redirect `302` → `/receipts/:id`; lỗi validate: `400` + form |
| `GET`  | `/receipts/:id`        | Xem / in mẫu 01-VT                                        | HTML; sai id hoặc không có: `404`                            |
| `POST` | `/receipts/delete/:id` | Xóa phiếu (cascade dòng hàng)                             | Redirect `302` → `/receipts`; không tìm thấy: `404`          |
| `GET`  | `/inventory`           | Tồn kho: `SUM(qty_received)` theo kho + mã hàng           | HTML                                                         |




### `POST /receipts` — trường form

**Header phiếu**


| Name                      | Bắt buộc | Ghi chú                                |
| ------------------------- | -------- | -------------------------------------- |
| `organization_name`       | Có       | Đơn vị                                 |
| `department_name`         | Có       | Bộ phận                                |
| `document_date`           | Có       | Ngày nhập (`YYYY-MM-DD`)               |
| `document_no`             | Có       | Số phiếu; form điền sẵn, user được sửa |
| `debit_account`           | Có       | Tài khoản nợ (vd. `156`)               |
| `credit_account`          | Có       | Tài khoản có (vd. `331`)               |
| `warehouse_name`          | Có       | Kho nhập                               |
| `warehouse_location`      | Có       | Địa điểm kho                           |
| `delivered_by`            | Có       | Người giao hàng                        |
| `source_doc_type`         | Có       | Loại chứng từ (hóa đơn / biên bản…)    |
| `source_doc_no`           | Có       | Số chứng từ                            |
| `source_doc_date`         | Có       | Ngày chứng từ                          |
| `source_doc_issuer`       | Có       | Đơn vị phát hành                       |
| `attached_original_count` | Có       | Số chứng từ gốc kèm theo               |


**Dòng hàng** (mảng, ít nhất một dòng không trống)


| Name                | Bắt buộc | Ghi chú                                      |
| ------------------- | -------- | -------------------------------------------- |
| `item_name[]`       | Có       | Tên hàng                                     |
| `item_code[]`       | Có       | Mã số                                        |
| `unit[]`            | Có       | Đơn vị tính                                  |
| `qty_on_document[]` | Có       | Số lượng theo chứng từ (`NUMERIC`, không âm) |
| `qty_received[]`    | Có       | Số lượng thực nhập (có thể khác chứng từ)    |
| `unit_price[]`      | Có       | Đơn giá **nguyên đồng** (VND)                |


### `POST /receipts/delete/:id`

Không có body. UI xác nhận trước khi gửi. Xóa `receipts` sẽ xóa luôn `product` (`ON DELETE CASCADE`).

## Cơ sở dữ liệu

Hai bảng, quan hệ **1–n**: một phiếu (`receipts`) có nhiều dòng hàng (`product`).

![Sơ đồ cơ sở dữ liệu](./CSDL.png)

Schema khai báo tại `src/database/schema.sql`.

### `receipts` — header phiếu


| Cột                       | Kiểu          | Ràng buộc                | Ý nghĩa                         |
| ------------------------- | ------------- | ------------------------ | ------------------------------- |
| `id`                      | `SERIAL`      | PK                       | Khóa chính                      |
| `document_no`             | `TEXT`        | `NOT NULL UNIQUE`        | Số phiếu, dạng `PNK-YYYY-0001`  |
| `document_date`           | `DATE`        | `NOT NULL`               | Ngày nhập                       |
| `organization_name`       | `TEXT`        | `NOT NULL`               | Đơn vị                          |
| `department_name`         | `TEXT`        | `NOT NULL`               | Bộ phận                         |
| `debit_account`           | `TEXT`        | `NOT NULL`               | TK nợ                           |
| `credit_account`          | `TEXT`        | `NOT NULL`               | TK có                           |
| `delivered_by`            | `TEXT`        | `NOT NULL`               | Người giao                      |
| `source_doc_type`         | `TEXT`        | `NOT NULL`               | Loại chứng từ nguồn             |
| `source_doc_no`           | `TEXT`        | `NOT NULL`               | Số chứng từ nguồn               |
| `source_doc_date`         | `DATE`        | `NOT NULL`               | Ngày chứng từ nguồn             |
| `source_doc_issuer`       | `TEXT`        | `NOT NULL`               | Đơn vị phát hành chứng từ       |
| `warehouse_name`          | `TEXT`        | `NOT NULL`               | Tên kho                         |
| `warehouse_location`      | `TEXT`        | `NOT NULL`               | Địa điểm kho                    |
| `attached_original_count` | `TEXT`        | `NOT NULL`               | Số chứng từ gốc kèm theo        |
| `total_amount`            | `BIGINT`      | `NOT NULL`, `>= 0`       | Tổng tiền (đồng)                |
| `total_amount_in_words`   | `TEXT`        | `NOT NULL`               | Tổng tiền bằng chữ (tiếng Việt) |
| `created_at`              | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Thời điểm tạo                   |




### `product` — dòng hàng


| Cột               | Kiểu             | Ràng buộc                               | Ý nghĩa          |
| ----------------- | ---------------- | --------------------------------------- | ---------------- |
| `id`              | `SERIAL`         | PK                                      | Khóa chính       |
| `receipt_id`      | `INTEGER`        | FK → `receipts(id)` `ON DELETE CASCADE` | Phiếu cha        |
| `line_no`         | `INTEGER`        | `NOT NULL`, unique cùng `receipt_id`    | Số thứ tự dòng   |
| `item_code`       | `TEXT`           | `NOT NULL`                              | Mã hàng          |
| `item_name`       | `TEXT`           | `NOT NULL`                              | Tên hàng         |
| `unit`            | `TEXT`           | `NOT NULL`                              | Đơn vị tính      |
| `qty_on_document` | `NUMERIC(12, 3)` | `NOT NULL`, `>= 0`                      | SL theo chứng từ |
| `qty_received`    | `NUMERIC(12, 3)` | `NOT NULL`, `>= 0`                      | SL thực nhập     |
| `unit_price`      | `BIGINT`         | `NOT NULL`, `>= 0`                      | Đơn giá (đồng)   |
| `line_amount`     | `BIGINT`         | `NOT NULL DEFAULT 0`                    | Thành tiền dòng  |


`UNIQUE (receipt_id, line_no)`.

## Quy tắc nghiệp vụ

- **Số phiếu:** `PNK-YYYY-0001` (năm + sequence 4 chữ số). Tự sinh theo năm; user có thể sửa. Unique toàn bảng. Khi tạo, app dùng advisory lock theo năm để tránh trùng số.
- **Tiền:** VND, 0 chữ số thập phân, lưu `BIGINT`. `line_amount = round(qty_received * unit_price)` (half-up), `total_amount = sum(line_amount)`.
- **Số lượng:** cho phép lẻ, `NUMERIC(12, 3)`.
- **Phiếu** phải có ít nhất một dòng hàng. Dòng trống trên form bị bỏ qua.
- **Chữ ký** trên mẫu in chỉ là nhãn (không lưu tên người ký).



## Cấu trúc thư mục

```
src/
  index.ts                 # Entry: connect DB + start HTTP
  app.ts                   # Express, EJS, static, error handler
  config/                  # Biến môi trường
  routes/index.ts          # Khai báo route
  controllers/receipts/    # list, new, create, show, remove, inventory
  database/
    schema.sql
    method/                # SQL: receipt, product, inventory
    types/
  views/receipts/          # form, index, show, inventory
  public/                  # CSS, JS
  utils/                   # validation, tiền, số phiếu, ngày
tests/
deployments/docker-composer.postgres.yml
CSDL.png                   # ERD
```

Luồng: **route → controller → database method → view**.