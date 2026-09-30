# Tài liệu Đặc tả API (API Specification) - Phiên bản Mới (Refactored)
*Cập nhật: 2026-09-30*

Tài liệu này cung cấp danh sách các API đã được tái cấu trúc, loại bỏ hoàn toàn mô hình Ví Điện Tử (Wallet) và áp dụng mô hình "Thu cọc - Thanh toán trực tiếp".

## 1. Authentication (Xác thực)
Các API liên quan đến Đăng nhập, Đăng ký và Quản lý phiên đăng nhập không thay đổi về cấu trúc cơ bản, nhưng mã PIN của phụ huynh đã bị loại bỏ.
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/auth/me`

## 2. Finance & Transactions (Tài chính & Giao dịch)
Loại bỏ hoàn toàn Ví (Wallet) và Gói học phí (Package). Thay bằng hệ thống ghi nhận giao dịch trực tiếp.

### 2.1. Đóng cọc nhận lớp (Gia sư)
- **Endpoint**: `POST /api/v1/finance/deposit`
- **Mô tả**: Gia sư quét mã QR thanh toán 500k để nhận lớp đang ở trạng thái `DEPOSIT`.
- **Body Payload**:
  ```json
  {
    "classId": "cls_123456",
    "amount": 500000
  }
  ```
- **Kết quả**: Tạo Transaction `FEE_PAID`, đổi ClassStatus sang `TRIAL`.

## 3. Session & Trial Review (Buổi học & Dạy thử)

### 3.1. Đánh giá Dạy thử (Phụ huynh)
- **Endpoint**: `POST /api/v1/sessions/class/:classId/trial-review`
- **Mô tả**: Sau khi dạy thử 1 buổi, Phụ huynh vào đánh giá để chốt Gia sư hoặc đổi/huỷ lớp.
- **Body Payload**:
  ```json
  {
    "action": "ACCEPT" | "REJECT_TUTOR" | "REJECT_PARENT" | "SCALE_DOWN",
    "reason": "Lý do nếu từ chối (Tuỳ chọn)"
  }
  ```
- **Kết quả**:
  - `ACCEPT`: Lớp chuyển sang `TEACHING`, Cọc được tính là `FEE_CONFIRMED`.
  - `REJECT_TUTOR`: Lớp về `OPEN`, Cọc được `DEPOSIT_REFUNDED`, Karma gia sư -5.
  - `REJECT_PARENT`: Lớp `CLOSED`, Cọc `FORFEITED`.
  - `SCALE_DOWN`: Lớp `OPEN`, Hoàn 50% cọc, Karma gia sư -2.

## 4. Smart Matching Engine (Ghép lớp thông minh)

### 4.1. Gợi ý Gia sư (Admin/Sales)
- **Endpoint**: `GET /api/v1/matching/requests/:id/suggest`
- **Mô tả**: Trả về danh sách các gia sư đã ứng tuyển vào Yêu cầu, được sắp xếp theo **Match Score** (Dựa trên Karma, Học vị, Lịch sử khiếu nại).

### 4.2. Chốt Gia sư cho Lớp
- **Endpoint**: `POST /api/v1/matching/requests/:id/assign`
- **Body Payload**:
  ```json
  {
    "tutorId": "tut_12345"
  }
  ```
- **Kết quả**: 
  - Tạo Lớp học (Class) mới với trạng thái `DEPOSIT`.
  - Đóng Yêu cầu (TutorRequest).

## 5. Classes & Kanban (Quản lý lớp học)
- **Endpoint**: `GET /api/v1/classes`
- **Mô tả**: Lấy danh sách lớp học hiện tại (Admin lấy tất cả, Tutor/Parent lấy theo ID của họ). Được dùng để render Kanban board.
