# HƯỚNG DẪN CẤU HÌNH & CHẠY ỨNG DỤNG (TỪ A ĐẾN Z)

Tài liệu này hướng dẫn chi tiết cách thiết lập, cài đặt thư viện và chạy ứng dụng Đồ án CRM Gia sư khi bạn chuyển (copy/gửi) thư mục mã nguồn này sang một máy tính khác.

---

## 🛠️ Bước 1: Chuẩn bị Môi trường Hệ thống

Trước khi chạy ứng dụng, máy tính đích cần được cài đặt đầy đủ các công cụ sau:

1.  **Node.js**:
    *   Tải bản cài đặt Node.js mới nhất (Khuyên dùng bản **v18, v20 hoặc v22 LTS**).
    *   Tải tại trang chủ: [https://nodejs.org/](https://nodejs.org/)
2.  **PostgreSQL**:
    *   Ứng dụng sử dụng cơ sở dữ liệu quan hệ PostgreSQL để lưu trữ thông tin.
    *   Tải và cài đặt PostgreSQL: [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
    *   *Lưu ý*: Trong quá trình cài đặt PostgreSQL, hãy ghi nhớ **Mật khẩu** của tài khoản quản trị `postgres` (mặc định cổng kết nối là `5432`).
3.  **Công cụ quản lý Database (Tùy chọn)**:
    *   Có thể sử dụng **pgAdmin 4** (cài đặt đi kèm PostgreSQL) hoặc **DBeaver** để xem các bảng dữ liệu trực quan.

---

## ⚙️ Bước 2: Thiết lập Cơ sở dữ liệu & Cấu hình Biến môi trường

Sau khi đã copy thư mục dự án sang máy mới:

1.  Mở tệp `.env` của thư mục Backend theo đường dẫn:  
    `crm-gia-su/backend/.env`
2.  Chỉnh sửa dòng cấu hình kết nối database `DATABASE_URL` sao cho khớp với thông tin PostgreSQL của máy mới:
    ```env
    DATABASE_URL="postgresql://<tên_đăng_nhập>:<mật_khẩu>@localhost:5432/<tên_database>?schema=public"
    ```
    *   `<tên_đăng_nhập>`: Thường mặc định là `postgres`
    *   `<mật_khẩu>`: Nhập mật khẩu tài khoản PostgreSQL trên máy của bạn.
    *   `<tên_database>`: Đặt tên cơ sở dữ liệu muốn tạo (Ví dụ: `tutor_crm`).

    *Ví dụ cấu hình thực tế:*
    ```env
    DATABASE_URL="postgresql://postgres:matkhau123@localhost:5432/tutor_crm?schema=public"
    ```
3.  Mở pgAdmin hoặc công cụ quản trị PostgreSQL bất kỳ, tạo mới một Database trống có tên trùng khớp với khai báo ở trên (Ví dụ: `tutor_crm`).

---

## 📦 Bước 3: Cài đặt Thư viện Dependencies

1.  Mở terminal (PowerShell, Command Prompt, Git Bash hoặc Terminal trong VS Code).
2.  Di chuyển con trỏ terminal vào thư mục gốc của dự án (`crm-gia-su`).
3.  Chạy lệnh sau để tự động tải và cài đặt toàn bộ package cho cả Frontend và Backend (luồng monorepo):
    ```bash
    npm install
    ```

---

## 🗃️ Bước 4: Khởi tạo Cấu trúc Bảng & Nạp Dữ liệu Mẫu (Prisma)

Sau khi cài đặt xong thư viện, chúng ta cần đồng bộ schema Prisma vào database và nạp dữ liệu mẫu ban đầu (seed data):

1.  Mở terminal tại thư mục **`crm-gia-su/backend`**:
    ```bash
    # (Di chuyển terminal vào thư mục backend từ thư mục gốc)
    cd backend
    ```
2.  Chạy lệnh tạo cấu trúc bảng tự động (Push Schema):
    ```bash
    npx prisma db push
    ```
3.  Chạy lệnh tạo Prisma Client cục bộ:
    ```bash
    npx prisma generate
    ```
4.  Chạy lệnh nạp dữ liệu mẫu khởi tạo (Seed data):
    ```bash
    npm run db:seed
    ```
    *(Quá trình seed thành công sẽ tự động tạo sẵn các tài khoản Phụ huynh, Gia sư, Admin mặc định kèm các lớp học demo để bạn kiểm thử ngay lập tức).*

---

## 🚀 Bước 5: Chạy ứng dụng

Sau khi hoàn thành các bước thiết lập ở trên, bạn có thể khởi động ứng dụng theo 2 cách:

### Cách 1: Khởi chạy đồng thời (Khuyên dùng)
Từ thư mục gốc của dự án (`crm-gia-su`), chạy lệnh:
```bash
npm run dev
```
Lệnh này sử dụng thư viện `concurrently` để chạy song song cả máy chủ Backend (NestJS cổng 3000) và máy chủ Frontend (Vite cổng 5173) trên cùng một cửa sổ terminal.

### Cách 2: Khởi chạy riêng biệt bằng 2 Terminal
Nếu muốn quản lý riêng nhật ký log (logs) của từng phần:
*   **Terminal 1 (Backend)**:
    ```bash
    cd crm-gia-su/backend
    npm run start:dev
    ```
*   **Terminal 2 (Frontend)**:
    ```bash
    cd crm-gia-su/frontend
    npm run dev
    ```

---

## 🖥️ Bước 6: Truy cập và Kiểm thử Hệ thống

*   **Trang chủ (Landing Page giới thiệu)**: [http://localhost:5173](http://localhost:5173)
*   **Màn hình đăng nhập**: [http://localhost:5173/login](http://localhost:5173/login)
*   **Thông tin tài khoản kiểm thử mặc định**:
    *   Xem chi tiết tài khoản, mật khẩu, và mã PIN của Admin, Phụ huynh, Gia sư trong tệp **`Tài khoản/TaiKhoanDangNhap.md`** cùng cấp với thư mục code.
