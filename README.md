# 🎓 Hệ Thống CRM Trung Tâm Gia Sư & Client / Tutor Portal

> **Hệ thống Quản lý Quan hệ Khách hàng (CRM) kết hợp Đa Cổng thông tin (Client Portal - Tutor Portal - Admin CRM)** giúp tự động hóa toàn diện quy trình tìm kiếm gia sư, sàng lọc năng lực, khớp lớp thông minh (Smart Matching Engine), giám sát dạy thử qua bảng Kanban thời gian thực, trọng tài tranh chấp và đối soát tài chính minh bạch.

---

## 📌 Bảng Điều Khiển & Trạng Thái Dịch Vụ

* 🌐 **Frontend Web App (Client / Tutor / Admin)**: [http://localhost:5173](http://localhost:5173)
* ⚙️ **Backend API Server (NestJS REST API)**: [http://localhost:3000](http://localhost:3000)
* 🗄️ **Database (PostgreSQL + Prisma ORM)**: `localhost:5432/tutor_crm`

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
DATN_CRM_GIA_SU/
├── .gitignore                         # Bộ lọc tệp log, node_modules, build artifacts
├── README.md                          # Cẩm nang tổng quan dự án (tệp này)
├── package.json                       # Script điều phối khởi chạy hệ thống monorepo
├── dev-accounts.json                  # Danh mục tài khoản kiểm thử nhanh
├── docs/                              # Toàn bộ tài liệu nghiệp vụ & kỹ thuật
│   ├── nghiep-vu/                     # BỘ 23 HỒ SƠ ĐẶC TẢ USE CASE CHUẨN ENTERPRISE (6 PHẦN)
│   │   ├── 1-client-portal/           # Hồ sơ Cổng Phụ huynh & Học sinh (UC-CLI-01 -> UC-CLI-06)
│   │   ├── 2-tutor-portal/            # Hồ sơ Cổng Gia sư & Đối tác (UC-TUT-01 -> UC-TUT-08)
│   │   ├── 3-admin-crm/               # Hồ sơ Cổng Quản trị Trung tâm (UC-ADM-01 -> UC-ADM-09)
│   │   └── TongHopNghiepVuCRM.md      # Tài liệu Master tổng hợp nghiệp vụ toàn hệ thống
│   ├── guides/                        # Tài liệu hướng dẫn sử dụng & cài đặt
│   │   ├── HuongDanSuDung.md          # Hướng dẫn quy trình 3 cổng người dùng
│   │   ├── HuongDanChayUngDung.md     # Hướng dẫn thiết lập môi trường từ A-Z
│   │   └── TaiKhoanDangNhap.md        # Danh sách tài khoản đăng nhập mẫu
│   ├── reports/                       # Báo cáo học thuật & tiêu chuẩn đồ án
│   │   ├── BaoCaoDoAn.md              # Báo cáo đồ án tốt nghiệp đầy đủ
│   │   └── NguyenTacLamViec.md        # Tiêu chuẩn làm việc của Business Analyst / Dev
│   └── API_Specification.md           # Đặc tả kỹ thuật RESTful API Backend
└── crm-gia-su/                        # Thư mục mã nguồn chính của ứng dụng
    ├── backend/                       # NestJS 10, Prisma ORM, PostgreSQL, JWT, BCrypt
    ├── frontend/                      # React 18, Vite, TypeScript, TailwindCSS, Lucide, Hot-Toast
    ├── package.json                   # Monorepo script (concurrently)
    └── README.md                      # Hướng dẫn chi tiết dành cho Developer
```

---

## 💼 BỘ HỒ SƠ ĐẶC TẢ NGHIỆP VỤ 23 USE CASE (`docs/nghiep-vu/`)

Toàn bộ **23 Use Case** đã được hoàn thiện theo tiêu chuẩn tài liệu phân tích nghiệp vụ phần mềm doanh nghiệp (Enterprise Specification) gồm 6 phần cấu trúc:
1. **Giới thiệu chức năng**: Mục đích, Tác nhân (Actor), Điều kiện tiên quyết, Danh mục Sub-features.
2. **Dữ liệu nghiệp vụ đầu vào**: Biểu mẫu (Forms), Tham số lọc, Sơ đồ trạng thái (State Diagram).
3. **Quy tắc nghiệp vụ (Business Rules)**: Bảng mã BR chuẩn hóa (`BR-xxx-yy`), tình huống, xử lý, mã lỗi HTTP.
4. **Đặc tả chi tiết các Use Case con**: Sơ đồ phân rã Use Case Mermaid và bảng đặc tả 8 mục chi tiết.
5. **Sơ đồ tuần tự nghiệp vụ**: Mermaid Sequence Diagrams cho tương tác Actor - Frontend - Controller - Service - Database.
6. **Kịch bản kiểm thử & Nghiệm thu**: Test Scenarios Given / When / Then cụ thể.

---

### 👨‍👩‍👧 1. Cổng Khách Hàng - Client Portal (`docs/nghiep-vu/1-client-portal/`)

| Mã Use Case | Tên tài liệu đặc tả nghiệp vụ | Tóm tắt phạm vi & Chức năng cốt lõi |
| :--- | :--- | :--- |
| **[UC-CLI-01](docs/nghiep-vu/1-client-portal/01-HoSoGiaDinhVaHocSinh.md)** | Quản lý Hồ sơ Gia đình & Học sinh (Family & Student Profiling) | Quản lý hồ sơ gia đình tập trung, thêm/sửa học sinh, đặc điểm học lực, phong cách học tập, mã PIN bảo mật. |
| **[UC-CLI-02](docs/nghiep-vu/1-client-portal/02-DangTinTimGiaSuMienPhi.md)** | Đăng ký & Quản lý Yêu cầu Tìm Gia sư Miễn phí (Free Tutor Request Posting) | Đăng tin tìm gia sư 0 đồng, chọn môn học/khối lớp/lịch học, kiểm duyệt tự động và theo dõi trạng thái khớp lớp. |
| **[UC-CLI-03](docs/nghiep-vu/1-client-portal/03-TraiNghiemDayThuVaDanhGia.md)** | Trải nghiệm Dạy thử & Đánh giá Chốt lớp (Trial Experience & Evaluation) | Theo dõi số buổi dạy thử (GV 1 buổi, SV 2 buổi), biểu mẫu đánh giá sao & nhận xét năng lực, xác nhận chốt hợp đồng. |
| **[UC-CLI-04](docs/nghiep-vu/1-client-portal/04-ThanhToanVaBaoHanh30Ngay.md)** | Phê duyệt Buổi học, Đối soát Học phí & Bảo hành 30 ngày (Session Approval & Warranty) | Đối soát học phí cuối tháng thanh toán trực tiếp cho gia sư, kích hoạt bảo hành đổi gia sư miễn phí trong 30 ngày (SLA $\le 24$h). |
| **[UC-CLI-05](docs/nghiep-vu/1-client-portal/05-TheoDoiLichHocVaNhanXet.md)** | Theo dõi Lịch học, Nhật ký Buổi học & Báo nghỉ (Schedule, Logs & Leave Request) | Thời khóa biểu tuần trực quan, đọc nhật ký tiến độ từng buổi học, duyệt đơn xin nghỉ có lịch dạy bù từ gia sư. |
| **[UC-CLI-06](docs/nghiep-vu/1-client-portal/06-DashboardVaThaoTacNhanh.md)** | Dashboard Tổng quan, Thao tác nhanh & Cảnh báo Thông minh (Executive Client Dashboard) | Bảng điều khiển tổng quan cho phụ huynh, widget đếm số buổi học, cảnh báo sự kiện học tập quan trọng, thao tác 1 chạm. |

---

### 👨‍🏫 2. Cổng Gia Sư & Đối Tác - Tutor Portal (`docs/nghiep-vu/2-tutor-portal/`)

| Mã Use Case | Tên tài liệu đặc tả nghiệp vụ | Tóm tắt phạm vi & Chức năng cốt lõi |
| :--- | :--- | :--- |
| **[UC-TUT-01](docs/nghiep-vu/2-tutor-portal/01-HoSoNangLucVaPhanLoai.md)** | Hồ sơ Năng lực, Định danh CCCD & Phân loại Gia sư (KYC Profile & Classification) | Tải ảnh CCCD 2 mặt, thẻ sinh viên, bằng cấp sư phạm, phân loại nhóm Giáo viên (Teacher) vs Sinh viên (Student). |
| **[UC-TUT-02](docs/nghiep-vu/2-tutor-portal/02-DiemTinNhiemKarma.md)** | Hệ thống Điểm Tín nhiệm Karma & Xếp hạng Gia sư (Karma Credit & Reputation Engine) | Quản lý điểm uy tín Karma (cơ sở 100 điểm, thưởng $+15$ khi chốt lớp, phạt $-30$ khi bùng lớp), xếp hạng danh hiệu. |
| **[UC-TUT-03](docs/nghiep-vu/2-tutor-portal/03-SanLopVaDatCocNhanLop.md)** | Bảng tin Tuyển dụng, Ứng tuyển & Nộp cọc Nhận lớp (Job Board & Deposit Placement) | Bảng tin Sàn lớp bảo mật (che SĐT phụ huynh), viết thư ngỏ ứng tuyển, nộp cọc 500,000 VNĐ qua VietQR để nhận lớp. |
| **[UC-TUT-04](docs/nghiep-vu/2-tutor-portal/04-QuyTrinhDayThuVaQuyetToanCoc.md)** | Quy trình Dạy thử & Quyết toán Tiền cọc (Trial Workflow & Deposit Settlement) | Hẹn lịch dạy thử trong 2 giờ, thực hiện dạy thử 1-2 buổi, quyết toán chuyển cọc thành phí môi giới hoặc hoàn trả 100%. |
| **[UC-TUT-05](docs/nghiep-vu/2-tutor-portal/05-NhatKyBuoiHocVaTienDo.md)** | Điểm danh, Ghi nhận Nhật ký Buổi học & Tiến độ (Attendance & Session Logging) | Điểm danh Check-in GPS thực tế, ghi chép nhật ký bài học, bài tập về nhà, đánh giá thái độ học tập của học sinh. |
| **[UC-TUT-06](docs/nghiep-vu/2-tutor-portal/06-LichDayBaoNghiVaDayBu.md)** | Quản lý Lịch rảnh, Báo nghỉ & Lên lịch Dạy bù (Availability & Rescheduling) | Cấu hình khung giờ rảnh hàng tuần, gửi đơn xin phép nghỉ trước 4 giờ kèm đề xuất lịch học bù bắt buộc. |
| **[UC-TUT-07](docs/nghiep-vu/2-tutor-portal/07-TaiKhoanNganHangVaThuNhap.md)** | Quản lý Tài khoản Ngân hàng, Ví thù lao & Rút tiền (Bank Account & Salary Payout) | Liên kết tài khoản ngân hàng chính chủ, theo dõi biến động số dư ví thù lao, lập lệnh rút tiền và xem lịch sử đối soát. |
| **[UC-TUT-08](docs/nghiep-vu/2-tutor-portal/08-DashboardVaTraiNghiemNguoiDung.md)** | Dashboard Tổng quan Gia sư & Trung tâm Điều hành (Tutor Command Dashboard) | Giao diện tổng quan trung tâm dành cho gia sư, widget thu nhập tháng, lịch dạy hôm nay, điểm Karma, thông báo lớp mới. |

---

### 🏢 3. Cổng Quản Trị Trung Tâm - Admin CRM (`docs/nghiep-vu/3-admin-crm/`)

| Mã Use Case | Tên tài liệu đặc tả nghiệp vụ | Tóm tắt phạm vi & Chức năng cốt lõi |
| :--- | :--- | :--- |
| **[UC-ADM-01](docs/nghiep-vu/3-admin-crm/01-TiepNhanVaPhanBoLead.md)** | Tiếp nhận Lead Yêu cầu & Tự động Đẩy Lớp lên Sàn (Zero-Touch Lead Ingestion) | Bộ lọc Auto-Validation quét giá sàn, chặn từ khóa cấm, cấp mã lớp SAMxxx và niêm yết lên Sàn lớp trong $\le 1.0$ giây. |
| **[UC-ADM-02](docs/nghiep-vu/3-admin-crm/02-PheubanHangKanban.md)** | Bảng Kanban Giám sát Vòng đời Lớp học (Class Lifecycle Kanban & Dual-View) | 4 cột trạng thái (`OPEN` $\rightarrow$ `TRIAL` $\rightarrow$ `TEACHING` $\rightarrow$ `CLOSED`), chế độ xem kép (Kanban dạng thẻ vs Table phân trang 10 dòng). |
| **[UC-ADM-03](docs/nghiep-vu/3-admin-crm/03-Customer360VaNhatKyTuVan.md)** | Hồ sơ Khách hàng Customer 360 & Nhật ký Quản trị (Customer 360 & Consultation Trail) | Nắm bắt toàn bộ gia đình, học sinh, lớp học và review trong 60 giây; tự động phân khúc VIP/Tiềm năng/Nguy cơ, lưu vết `audit_logs`. |
| **[UC-ADM-04](docs/nghiep-vu/3-admin-crm/04-SmartMatchingEngine.md)** | Động cơ Ghép lớp Thông minh (Smart Matching Engine & Multi-factor Scoring) | Thuật toán tính điểm khớp lớp: Karma + Học vị Sư phạm + Buổi dạy thành công - Phạt khiếu nại $\times 20$; gán lớp nguyên tử. |
| **[UC-ADM-05](docs/nghiep-vu/3-admin-crm/05-TrongTaiVaDoiSoatCoc.md)** | Trọng tài Khiếu nại Buổi học & Đối soát Tiền cọc (Dispute Arbitration & Settlement) | Thẩm tra bằng chứng tranh chấp, phán quyết hợp lệ (`RESOLVED_CONFIRM` cộng ví lương) vs hủy buổi học (`RESOLVED_CANCEL`), quyết toán hoàn cọc. |
| **[UC-ADM-06](docs/nghiep-vu/3-admin-crm/06-BaoHanhCSKHVaBaoCaoKPI.md)** | Quy trình Bảo hành Đổi gia sư 30 ngày & Báo cáo KPI Vận hành (Warranty & KPI Dashboard) | Xử lý Ticket bảo hành đổi gia sư miễn phí SLA $\le 24$h, công cụ quét tự động phê duyệt buổi học 48h (`Auto-Confirm`), chỉ số Win Rate và TTM. |
| **[UC-ADM-07](docs/nghiep-vu/3-admin-crm/07-PhanQuyenVaCauHinhHeThong.md)** | Phân quyền Vai trò RBAC & Quản trị Tham số Hệ thống (RBAC & System Config) | Ma trận phân quyền 4 vai trò (`ADMIN`, `SALES`, `ACADEMIC`, `ACCOUNTANT`), NestJS `RolesGuard`, bảng cấu hình tiền cọc và SLA. |
| **[UC-ADM-08](docs/nghiep-vu/3-admin-crm/08-QuanLyNguoiDung.md)** | Quản lý Người dùng Tập trung & Cấp phát Tài khoản (User Identity Management) | Data Table tìm kiếm theo thời gian thực, Add User Modal tự động sinh Profile (`Auto-Provisioning`), đóng băng tài khoản `BANNED`. |
| **[UC-ADM-09](docs/nghiep-vu/3-admin-crm/09-GiaoDienVaTraiNghiemNguoiDung.md)** | Kiến trúc Giao diện Sneat & Trải nghiệm Người dùng Điều hành (Executive UI/UX) | Hệ màu Sneat chuẩn (`#696cff`), tiêu đề động tự ẩn (Context-Aware Headers), thông báo nổi `react-hot-toast`, hộp thoại xác nhận `ConfirmModal`. |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### 1. Yêu cầu môi trường
* **Node.js**: Phiên bản v18, v20 hoặc v22 LTS ([Tải Node.js](https://nodejs.org/)).
* **PostgreSQL**: Đang chạy tại cổng `5432` ([Tải PostgreSQL](https://www.postgresql.org/)).

### 2. Cài đặt các gói phụ thuộc (Dependencies)
Ngay tại thư mục gốc của dự án, chạy lệnh:
```bash
npm run install:all
```
Lệnh này sẽ tự động cài đặt các thư viện cần thiết cho cả thư mục gốc, backend và frontend.

### 3. Cấu hình Cơ sở dữ liệu
1. Tạo một cơ sở dữ liệu mới trong PostgreSQL có tên là: `tutor_crm`.
2. Kiểm tra tệp cấu hình `crm-gia-su/backend/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:1@localhost:5432/tutor_crm?schema=public"
   JWT_SECRET="crm_tutor_super_secret_key_12345"
   PORT=3000
   ```
   *(Thay đổi tài khoản/mật khẩu nếu PostgreSQL của bạn sử dụng mật khẩu khác).*

3. Đồng bộ bảng dữ liệu Prisma và nạp dữ liệu mẫu ban đầu:
   ```bash
   cd crm-gia-su/backend
   npx prisma db push
   npx prisma db seed
   cd ../..
   ```

### 4. Khởi chạy Ứng dụng
Khởi chạy đồng thời cả Backend và Frontend chỉ với **1 lệnh duy nhất** từ thư mục gốc:
```bash
npm run dev
```

Hệ thống sẽ đồng thời kích hoạt:
* 🌐 **Frontend (Vite SPA)**: [http://localhost:5173/](http://localhost:5173/)
* ⚙️ **Backend (NestJS API)**: [http://localhost:3000/](http://localhost:3000/)

---

## 🔑 Tài Khoản Đăng Nhập & Kiểm Thử Mẫu (Dev Accounts)

Hệ thống đã chuẩn bị sẵn các tài khoản demo đại diện cho từng vai trò nghiệp vụ:

| Vai trò người dùng | Số điện thoại | Mật khẩu mặc định | Cổng trải nghiệm | Quyền hạn & Chức năng kiểm thử chính |
| :--- | :---: | :---: | :--- | :--- |
| **Quản trị viên (Admin)** | `0123456789` | `admin123` | [Admin CRM](http://localhost:5173/admin-crm) | Toàn quyền quản trị hệ thống, giám sát Kanban, đối soát cọc, duyệt tài khoản. |
| **Chuyên viên Tư vấn (Sales)**| `0901234567` | `admin123` | [Admin CRM](http://localhost:5173/admin-crm) | Tiếp nhận lead, xem gợi ý Smart Matching, chỉ định gia sư dạy thử. |
| **Chuyên viên Học vụ (Academic)**| `0901000003` | `123456` | [Disputes CRM](http://localhost:5173/admin-crm/disputes) | Trọng tài khiếu nại buổi học, xác minh bằng chứng, chốt phân xử. |
| **Kế toán (Accountant)** | `0901000004` | `123456` | [Payouts CRM](http://localhost:5173/admin-crm) | Quản lý dòng tiền cọc 500k, duyệt hoàn tiền, quyết toán rút ví thù lao gia sư. |
| **Gia sư (Tutor)** | `0111111111` | `admin123` | [Tutor Portal](http://localhost:5173/tutor) | Nhận lớp trên sàn, nộp cọc VietQR, xem điểm Karma, điểm danh buổi dạy. |
| **Phụ huynh (Parent)** | `0222222222` | `admin123` | [Client Portal](http://localhost:5173/client) | Đăng tin tìm gia sư, đánh giá sau dạy thử, theo dõi nhật ký học tập của con. |

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

* **Backend**:
  * [NestJS 10](https://nestjs.com/) (Kiến trúc Module, Dependency Injection, Validation Pipes).
  * [Prisma ORM](https://www.prisma.io/) (Object-Relational Mapping với PostgreSQL, Migrations, Transactions).
  * [PostgreSQL](https://www.postgresql.org/) (Cơ sở dữ liệu quan hệ ACID tiêu chuẩn).
  * [Passport & JWT](http://www.passportjs.org/) (Bảo mật đăng nhập token, RBAC Guard phân quyền theo vai trò).
  * [BCrypt](https://github.com/kelektiv/node.bcrypt.js) (Mã hóa một chiều mật khẩu độ an toàn cao).
* **Frontend**:
  * [React 18](https://react.dev/) + [Vite 8](https://vitejs.dev/) (Single Page Application tốc độ cao).
  * [TypeScript](https://www.typescriptlang.org/) (Đảm bảo Type-safety toàn diện từ giao diện tới API).
  * [TailwindCSS](https://tailwindcss.com/) + [Sneat Dashboard Theme](https://themeselection.com/) (Giao diện chuẩn Enterprise, bố cục công thái học).
  * [Lucide React](https://lucide.dev/) (Bộ biểu tượng hiện đại, tối giản).
  * [React Hot Toast](https://react-hot-toast.com/) (Hệ thống thông báo trạng thái không chặn màn hình).
