# HƯỚNG DẪN CÀI ĐẶT & CHẠY HỆ THỐNG CRM GIA SƯ

Tài liệu này hướng dẫn chi tiết cách thiết lập cơ sở dữ liệu PostgreSQL, chạy Migration cơ sở dữ liệu, nạp dữ liệu mẫu (Seed) và khởi chạy cả hai phân hệ Backend và Frontend đồng thời.

---

## 📌 YÊU CẦU PHẦN MỀM TRƯỚC KHI CÀI ĐẶT
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã được cài đặt:
1.  **Node.js** (Phiên bản v18 trở lên).
2.  **PostgreSQL** (Đang chạy tại cổng `5432`).

---

## 🛠️ BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU (POSTGRESQL)

Do PostgreSQL là một dịch vụ hệ điều hành riêng, hệ thống tự động không thể tự khởi động dịch vụ này trên máy của bạn. Bạn hãy làm theo các bước sau để thiết lập:

1.  **Khởi động dịch vụ PostgreSQL** trên máy của bạn (Ví dụ bằng: PgAdmin 4, Services của Windows, hoặc Docker).
2.  **Tạo một Database** trống tên là: `tutor_crm`.
3.  **Cập nhật cấu hình kết nối**: 
    Mở file cấu hình [backend/.env](file:///c:/Users/admin/Downloads/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/crm-gia-su/backend/.env) và chỉnh sửa thông số tài khoản/mật khẩu Postgres của bạn (nếu khác mặc định):
    ```env
    DATABASE_URL="postgresql://<tên_đăng_nhập>:<mật_khẩu>@localhost:5432/tutor_crm?schema=public"
    ```
    *(Mặc định đang để tài khoản/mật khẩu là: `postgres` / `postgres`)*

---

## 🚀 BƯỚC 2: CÀI ĐẶT & DI CƯ DATABASE (MIGRATION & SEED)

Sau khi dịch vụ PostgreSQL đã hoạt động và kết nối thành công, hãy mở terminal tại thư mục [crm-gia-su/backend](file:///c:/Users/admin/Downloads/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/crm-gia-su/backend) và chạy chuỗi lệnh sau để tự động tạo 20 bảng cơ sở dữ liệu và nạp dữ liệu tài khoản mẫu:

```bash
# 1. Di chuyển vào thư mục backend
cd backend

# 2. Đồng bộ các bảng dữ liệu qua Prisma
npx prisma db push

# 3. Nạp dữ liệu tài khoản mẫu (Seed data)
npx prisma db seed
```

---

## 💻 BƯỚC 3: KHỞI CHẠY HỆ THỐNG (BACKEND + FRONTEND)

Hệ thống đã được thiết lập lệnh khởi chạy đồng thời vô cùng tiện lợi. Bạn quay lại thư mục gốc [crm-gia-su](file:///c:/Users/admin/Downloads/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/crm-gia-su) và chạy:

```bash
# Khởi chạy đồng thời cả Backend và Frontend
npm run dev
```

*   **Website hoạt động tại**: `http://localhost:5173`
*   **API Server hoạt động tại**: `http://localhost:3000`

---

## 🔑 DANH SÁCH TÀI KHOẢN MẪU ĐỂ CHẠY THỬ (DỮ LIỆU SEED)

Sau khi chạy lệnh `npx prisma db seed`, hệ thống chỉ tạo **một tài khoản Admin**. Tài khoản Phụ huynh / Gia sư do người dùng **tự đăng ký** qua các cổng Client / Tutor.

### 1. Tài khoản nhân viên nội bộ (Staff / Admin / Sales / Academic)
*   **Số điện thoại**: `0123456789`
*   **Mật khẩu đăng nhập**: `admin123`
*   **Mã PIN bảo mật** (Sử dụng để switch profile / đối soát): `1234`
*   *Quyền hạn kiểm thử*: Sếp đăng nhập tài khoản này để trải nghiệm **Sales Portal** duyệt và khớp lớp dạy thử, hoặc **Academic Portal** giải quyết khiếu nại đối soát ví tiền.

### 2. Tài khoản Khách hàng (Phụ huynh / Học sinh) & Gia sư (Tutor)
*   Không có tài khoản mẫu — truy cập `localhost:5173/client` hoặc `localhost:5173/tutor` và tự đăng ký.
