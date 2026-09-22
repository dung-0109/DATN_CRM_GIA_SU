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
│   ├── nghiep-vu/                     # [MỚI] Bộ hồ sơ đặc tả nghiệp vụ chi tiết 3 cổng
│   │   ├── README.md                  # Tổng quan kiến trúc nghiệp vụ 3 cổng & ma trận RACI
│   │   ├── 1-client-portal/           # Hồ sơ nghiệp vụ Cổng Phụ huynh & Học sinh (5 tài liệu)
│   │   ├── 2-tutor-portal/            # Hồ sơ nghiệp vụ Cổng Gia sư (5 tài liệu)
│   │   └── 3-admin-crm/               # Hồ sơ nghiệp vụ Cổng Quản trị nội bộ CRM (6 tài liệu)
│   ├── guides/                        # Hướng dẫn sử dụng & vận hành
│   │   ├── HuongDanSuDung.md          # Quy trình sử dụng cho 3 đối tượng (PH, GS, CRM)
│   │   ├── HuongDanChayUngDung.md     # Hướng dẫn cài đặt PostgreSQL, Prisma, Node từ A-Z
│   │   └── TaiKhoanDangNhap.md        # Thông tin tài khoản đăng nhập & kiểm thử
│   ├── specifications/                # Hồ sơ phân tích nghiệp vụ & kỹ thuật tổng thể
│   │   ├── BRD.md                     # Business Requirements Document (Yêu cầu nghiệp vụ)
│   │   ├── SRS.md                     # Software Requirements Specification (Đặc tả hệ thống)
│   │   ├── Business_Rules.md          # 18+ quy tắc nghiệp vụ (Bảo mật, Dòng tiền, Nghỉ dạy...)
│   │   ├── Use_Cases.md               # 11 Use Cases chi tiết kèm kịch bản xử lý
│   │   ├── Database_Design.md         # Thiết kế 20 bảng PostgreSQL, Enums và Indexes
│   │   ├── API_Specification.md       # Đặc tả RESTful API, mã lỗi và Idempotency
│   │   └── TaiLieuNghiepVu.md         # Tài liệu phân tích luồng nghiệp vụ end-to-end
│   ├── reports/                       # Báo cáo học thuật & tiêu chuẩn làm việc
│   │   ├── BaoCaoDoAn.md              # Báo cáo đồ án tốt nghiệp/môn học hoàn chỉnh (Chương 1-5)
│   │   └── NguyenTacLamViec.md        # Chuẩn mực làm việc của Lead Business Analyst
│   └── diagrams/                      # Giao diện sơ đồ HTML trực quan & thư viện
│       ├── docs-huong-dan-su-dung.html
│       ├── docs-use-case-diagram.html
│       ├── docs-ux-journey.html
│       └── vendor/mermaid.min.js
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

| Phân hệ | Đường dẫn truy cập | Tài khoản | Mật khẩu / Mã PIN |
| :--- | :--- | :--- | :--- |
| **CRM Back-office** (Admin / Sales / Học vụ / Kế toán) | [localhost:5173/admin-crm](http://localhost:5173/admin-crm) | `0123456789` | Mật khẩu: `admin123`<br>PIN: `1234` |
| **Client Portal** (Phụ huynh & Học sinh) | [localhost:5173/client](http://localhost:5173/client) | Tự đăng ký mới trên Web | Tự tạo mật khẩu & mã PIN |
| **Tutor Portal** (Gia sư) | [localhost:5173/tutor](http://localhost:5173/tutor) | Tự đăng ký mới trên Web | Tự tạo mật khẩu |

Chi tiết xem tại: [`docs/guides/TaiKhoanDangNhap.md`](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/guides/TaiKhoanDangNhap.md).

---

## 💼 BỘ HỒ SƠ ĐẶC TẢ NGHIỆP VỤ 3 CỔNG TƯƠNG TÁC (`docs/nghiep-vu/`)

Toàn bộ nghiệp vụ được mổ xẻ chuyên sâu theo tư duy Lead Business Analyst, có đầy đủ sơ đồ Mermaid, Validation Rules, Exception Paths và mã lỗi:

* 🗺️ **[Tổng quan kiến trúc nghiệp vụ 3 cổng & Ma trận RACI](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/README.md)**

### 👨‍👩‍👧 1. Cổng Phụ Huynh & Học Sinh (`1-client-portal/`)
* [01 - Hồ sơ gia đình (Family Account) & Profile Switcher](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/1-client-portal/01-HoSoGiaDinhVaProfile.md)
* [02 - Quản lý ví tiền & Gói học phí trả trước tiêu thụ FIFO](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/1-client-portal/02-ViTienVaGoiHocPhi.md)
* [03 - Tạo yêu cầu tìm gia sư & Tìm kiếm danh bạ ẩn danh](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/1-client-portal/03-YeuCauTimGiaSu.md)
* [04 - Xác nhận điểm danh (Mã PIN) & Khiếu nại (Dispute)](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/1-client-portal/04-DiemDanhVaKhieuNai.md)
* [05 - Thời khóa biểu & Quy tắc báo nghỉ trước 4 giờ](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/1-client-portal/05-LichHocVaBaoNghi.md)

### 👨‍🏫 2. Cổng Gia Sư (`2-tutor-portal/`)
* [01 - Đăng ký hồ sơ, Môn dạy được duyệt & Ma trận lịch rảnh](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/2-tutor-portal/01-HoSoVaLichRanh.md)
* [02 - Sàn lớp mới tuyển & Quy trình ứng tuyển chống trùng lịch](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/2-tutor-portal/02-UngTuyenLopMoi.md)
* [03 - Điểm danh buổi dạy trong 24h & Báo cáo tiến độ học sinh](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/2-tutor-portal/03-DiemDanhBuoiDay.md)
* [04 - Quy tắc báo nghỉ trước 24h, Đề xuất dạy bù & Kỷ luật](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/2-tutor-portal/04-BaoNghiVaDayBu.md)
* [05 - Ví lương real-time, Quản lý STK & Quyết toán thu nhập](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/2-tutor-portal/05-ViLuongVaQuyetToan.md)

### 🏢 3. Cổng Quản Trị CRM (`3-admin-crm/`)
* [01 - Phân quyền vai trò nội bộ RBAC & Nhật ký kiểm toán Audit Log](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/3-admin-crm/01-PhanQuyenVaNhanSu.md)
* [02 - Quy trình thẩm định bằng cấp & Phê duyệt môn dạy gia sư](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/3-admin-crm/02-DuyetGiaSuVaMonDay.md)
* [03 - Thuật toán khớp lớp Matching Engine & Điều phối dạy thử](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/3-admin-crm/03-KhopLopVaDayThu.md)
* [04 - Quản lý vòng đời lớp học & Giám sát gói học phí](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/3-admin-crm/04-QuanLyLopVaGoiHoc.md)
* [05 - Quy trình giải quyết khiếu nại (Dispute), SLA 48h & Phán quyết](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/3-admin-crm/05-GiaiQuyetKhieuNai.md)
* [06 - Kế toán quyết toán bảng lương Payout & Báo cáo KPI](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/nghiep-vu/3-admin-crm/06-QuyetToanVaTaiChinh.md)

---

## 📚 Tài Liệu Bổ Trợ Khác

### 📘 Hướng Dẫn & Vận Hành
* [Hướng dẫn sử dụng nhanh 3 cổng](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/guides/HuongDanSuDung.md)
* [Hướng dẫn chạy ứng dụng từ A-Z](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/guides/HuongDanChayUngDung.md)
* [Danh sách tài khoản kiểm thử](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/guides/TaiKhoanDangNhap.md)

### 📐 Hồ Sơ Kỹ Thuật Tổng Thể
* [Tài liệu yêu cầu nghiệp vụ (BRD)](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/specifications/BRD.md)
* [Đặc tả yêu cầu phần mềm (SRS)](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/specifications/SRS.md)
* [Bộ 18+ Quy tắc nghiệp vụ (Business Rules)](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/specifications/Business_Rules.md)
* [Đặc tả chi tiết 11 Use Cases](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/specifications/Use_Cases.md)
* [Thiết kế Cơ sở dữ liệu (ERD, 20 Tables, Enums)](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/specifications/Database_Design.md)
* [Đặc tả RESTful API](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/specifications/API_Specification.md)

### 🎓 Báo Cáo Đồ Án & Chuẩn Mực
* [Báo cáo đồ án môn học hoàn chỉnh (Chương 1 đến 5)](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/reports/BaoCaoDoAn.md)
* [Nguyên tắc & tiêu chuẩn làm việc của Lead BA](file:///f:/CRM-Gia%20s%C6%B0/CRM-Gia%20s%C6%B0/docs/reports/NguyenTacLamViec.md)
