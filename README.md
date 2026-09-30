# 🎓 Hệ Thống CRM Trung Tâm Gia Sư & Client/Tutor Portal

Hệ thống quản lý quan hệ khách hàng (CRM) kết hợp cổng thông tin đa đối tượng (Family Account cho Phụ huynh/Học viên và Tutor Portal cho Gia sư) giúp tự động hóa toàn diện quy trình tìm kiếm gia sư, xếp lớp, điểm danh, gói học phí trả trước và quyết toán tài chính minh bạch.

---

## 📁 Cấu Trúc Dự Án Sau Tối Ưu

```text
CRM-Gia sư/
├── .gitignore                         # Bộ lọc tệp log, node_modules, dist...
├── README.md                          # Tài liệu cẩm nang tổng quan dự án (tệp này)
├── package.json                       # Script điều phối khởi chạy hệ thống từ root
├── docs/                              # Toàn bộ tài liệu nghiệp vụ & kỹ thuật
│   ├── nghiep-vu/                     # Bộ hồ sơ đặc tả nghiệp vụ chi tiết 3 cổng (Đã cải tạo)
│   │   ├── TongHopNghiepVuCRM.md      # Tài liệu Master tổng hợp toàn bộ 3 cổng
│   │   ├── 1-client-portal/           # Hồ sơ nghiệp vụ Cổng Phụ huynh & Học sinh (5 tài liệu)
│   │   ├── 2-tutor-portal/            # Hồ sơ nghiệp vụ Cổng Gia sư (7 tài liệu)
│   │   └── 3-admin-crm/               # Hồ sơ nghiệp vụ Cổng Quản trị nội bộ CRM (7 tài liệu)
│   ├── guides/                        # Hướng dẫn sử dụng & vận hành
│   │   ├── HuongDanSuDung.md          # Quy trình sử dụng cho 3 đối tượng (PH, GS, CRM)
│   │   ├── HuongDanChayUngDung.md     # Hướng dẫn cài đặt PostgreSQL, Prisma, Node từ A-Z
│   │   └── TaiKhoanDangNhap.md        # Thông tin tài khoản đăng nhập & kiểm thử
│   ├── reports/                       # Báo cáo học thuật & tiêu chuẩn làm việc
│   │   ├── BaoCaoDoAn.md              # Báo cáo đồ án tốt nghiệp/môn học hoàn chỉnh (Chương 1-5)
│   │   └── NguyenTacLamViec.md        # Chuẩn mực làm việc của Lead Business Analyst
│   └── API_Specification.md           # Tài liệu đặc tả API Backend (Đã cập nhật mới)
└── crm-gia-su/                        # Thư mục mã nguồn ứng dụng
    ├── backend/                       # NestJS + Prisma ORM + PostgreSQL
    ├── frontend/                      # React + Vite + TypeScript + TailwindCSS
    ├── package.json                   # Cấu hình monorepo của code
    └── README.md                      # Hướng dẫn chi tiết cho developer
```

---

## 🚀 Khởi Động Nhanh (Quick Start)

### 1. Yêu Cầu Môi Trường
* **Node.js**: Phiên bản v18, v20 hoặc v22 LTS ([Tải Node.js](https://nodejs.org/)).
* **PostgreSQL**: Đang chạy tại cổng `5432` ([Tải PostgreSQL](https://www.postgresql.org/)).

### 2. Thiết Lập Cơ Sở Dữ Liệu
1. Mở PostgreSQL (PgAdmin hoặc DBeaver), tạo một Database trống tên là: `tutor_crm`.
2. Kiểm tra chuỗi kết nối trong tệp [`crm-gia-su/backend/.env`](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/crm-gia-su/backend/.env):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tutor_crm?schema=public"
   ```
   *(Thay đổi username/password tương ứng với tài khoản Postgres trên máy của bạn).*

3. Đồng bộ bảng dữ liệu & nạp dữ liệu mẫu ban đầu:
   ```bash
   cd crm-gia-su/backend
   npx prisma db push
   npm run db:seed
   cd ../..
   ```

### 3. Khởi Chạy Ứng Dụng
Ngay tại thư mục gốc, bạn chỉ cần chạy 1 lệnh duy nhất:
```bash
npm run dev
```
Hệ thống sẽ đồng thời khởi động:
* 🌐 **Frontend (Vite)**: [http://localhost:5173](http://localhost:5173)
* ⚙️ **Backend (NestJS API)**: [http://localhost:3000](http://localhost:3000)

---

## 🔑 Tài Khoản Đăng Nhập Mặc Định

| Phân hệ | Đường dẫn truy cập | Tài khoản | Mật khẩu |
| :--- | :--- | :--- | :--- |
| **CRM Back-office** (Admin / Sales) | [localhost:5173/admin-crm](http://localhost:5173/admin-crm) | `0123456789` | Mật khẩu: `admin123` |
| **Client Portal** (Phụ huynh & Học sinh) | [localhost:5173/client](http://localhost:5173/client) | Tự đăng ký mới trên Web | Tự tạo mật khẩu & mã PIN |
| **Tutor Portal** (Gia sư) | [localhost:5173/tutor](http://localhost:5173/tutor) | Tự đăng ký mới trên Web | Tự tạo mật khẩu |

Chi tiết xem tại: [`docs/guides/TaiKhoanDangNhap.md`](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/guides/TaiKhoanDangNhap.md).

---

## 💼 BỘ HỒ SƠ ĐẶC TẢ NGHIỆP VỤ 3 CỔNG TƯƠNG TÁC (`docs/nghiep-vu/`)

Toàn bộ nghiệp vụ đã được cải tạo tối ưu theo quy trình tự động hóa, loại bỏ gói học phí trả trước, áp dụng cơ chế nộp cọc nhận lớp và thanh toán trực tiếp:

> 🌟 **TÀI LIỆU MASTER TỔNG HỢP TOÀN BỘ:** [TongHopNghiepVuCRM.md](docs/nghiep-vu/TongHopNghiepVuCRM.md) *(Đọc liền một mạch toàn bộ 3 cổng)*

### 👨‍👩‍👧 1. Cổng Khách Hàng (`1-client-portal/`)
* Quản lý tài khoản phụ huynh, hồ sơ các con
* Đăng tin tìm gia sư miễn phí 100%
* Trải nghiệm dạy thử và form đánh giá sau dạy thử
* Thanh toán trực tiếp và bảo hành 30 ngày
* Theo dõi lịch học và nhận xét của gia sư

### 👨‍🏫 2. Cổng Đối Tác Gia Sư (`2-tutor-portal/`)
* Xác minh CCCD/Bằng cấp
* Sàn lớp ẩn danh và luồng đóng cọc (500k)
* Điểm uy tín Karma, thưởng phạt
* Nhật ký giảng dạy, theo dõi tiến độ
* Quản lý tài khoản ngân hàng nhận tiền hoàn cọc

### 🏢 3. Cổng Quản Trị Trung Tâm (`3-admin-crm/`)
* Phễu Kanban giám sát vòng đời lớp học tự động
* Bộ máy Smart Matching Engine gợi ý Top 5 gia sư
* Trọng tài đối soát cọc và phán quyết
* Hồ sơ khách hàng 360 độ

---

## 📚 Tài Liệu Bổ Trợ Khác

### 📘 Hướng Dẫn & Vận Hành
* [Hướng dẫn sử dụng nhanh 3 cổng](docs/guides/HuongDanSuDung.md)
* [Hướng dẫn chạy ứng dụng từ A-Z](docs/guides/HuongDanChayUngDung.md)
* [Danh sách tài khoản kiểm thử](docs/guides/TaiKhoanDangNhap.md)
* [Đặc tả API Kỹ thuật](docs/API_Specification.md)

### 🎓 Báo Cáo Đồ Án & Chuẩn Mực
* [Báo cáo đồ án môn học hoàn chỉnh (Chương 1 đến 5)](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/reports/BaoCaoDoAn.md)
* [Nguyên tắc & tiêu chuẩn làm việc của Lead BA](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/reports/NguyenTacLamViec.md)
