# HƯỚNG DẪN CÀI ĐẶT & CHẠY HỆ THỐNG CRM GIA SƯ (DEVELOPER GUIDE)

Tài liệu này hướng dẫn chi tiết cho Developer cách thiết lập môi trường, cơ sở dữ liệu PostgreSQL, chạy Migration qua Prisma ORM, nạp dữ liệu mẫu (Seed) và khởi chạy ứng dụng Monorepo.

---

## 📌 YÊU CẦU PHẦN MỀM TRƯỚC KHI CÀI ĐẶT
1. **Node.js**: Phiên bản v18, v20 hoặc v22 LTS ([Tải Node.js](https://nodejs.org/)).
2. **PostgreSQL**: Đang chạy tại cổng mặc định `5432` ([Tải PostgreSQL](https://www.postgresql.org/)).

---

## 🛠️ BƯỚC 1: KHỞI TẠO CƠ SỞ DỮ LIỆU (POSTGRESQL)

1. Mở công cụ quản trị PostgreSQL (PgAdmin 4, DBeaver, hoặc command line psql).
2. Tạo một Database trống có tên là: `tutor_crm`.
3. Kiểm tra tệp cấu hình môi trường `backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:1@localhost:5432/tutor_crm?schema=public"
   JWT_SECRET="crm_tutor_super_secret_key_12345"
   PORT=3000
   ```
   *(Chỉnh sửa username/password tương ứng với tài khoản Postgres trên máy của bạn).*

---

## 🚀 BƯỚC 2: CÀI ĐẶT & DI CƯ DATABASE (PRISMA MIGRATION & SEED)

Tại thư mục `crm-gia-su`, mở Terminal và chạy chuỗi lệnh sau để tạo bảng dữ liệu và nạp dữ liệu mẫu ban đầu:

```bash
# 1. Cài đặt các thư viện cần thiết
npm run install:all

# 2. Di chuyển vào thư mục backend để đồng bộ bảng qua Prisma
cd backend
npx prisma db push

# 3. Nạp dữ liệu tài khoản và nghiệp vụ mẫu (Seed data)
npx prisma db seed
cd ..
```

---

## 💻 BƯỚC 3: KHỞI CHẠY HỆ THỐNG (BACKEND + FRONTEND)

Hệ thống đã được thiết lập công cụ `concurrently` để chạy song song cả 2 dịch vụ:

```bash
# Khởi chạy đồng thời cả Backend và Frontend
npm run dev
```

* 🌐 **Frontend (Vite SPA)**: [http://localhost:5173](http://localhost:5173)
* ⚙️ **Backend (NestJS API)**: [http://localhost:3000](http://localhost:3000)

---

## 🔑 TÀI KHOẢN ĐĂNG NHẬP MẪU KIỂM THỬ

| Vai trò | Số điện thoại | Mật khẩu | URL Portal | Ghi chú quyền hạn |
| :--- | :---: | :---: | :--- | :--- |
| **Quản trị viên (Admin)** | `0123456789` | `admin123` | `/admin-crm` | Toàn quyền xem và quản trị mọi nghiệp vụ |
| **Chuyên viên Bán hàng (Sales)** | `0901234567` | `admin123` | `/admin-crm` | Khớp lớp và chỉ định gia sư dạy thử |
| **Gia sư (Tutor)** | `0111111111` | `admin123` | `/tutor-portal` | Nhận lớp trên sàn, nộp cọc VietQR, điểm danh |
| **Phụ huynh (Parent)** | `0222222222` | `admin123` | `/parent-portal` | Đăng tin tìm gia sư, đánh giá sau dạy thử |

Chi tiết bộ 23 Use Case đặc tả nghiệp vụ: xem tại thư mục `docs/nghiep-vu/` ở thư mục gốc.
