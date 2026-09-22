# API Specification (Đặc Tả API Hệ Thống)

Tài liệu này đặc tả chi tiết giao diện lập trình ứng dụng (API Endpoints) phục vụ kết nối giữa các phân hệ Client Portal, Tutor Portal và hệ thống Backend CRM.

**Phiên bản:** v1.3 (cập nhật 31/07/2026 - bổ sung response envelope, conventions, rate limiting, idempotency, observability)

---

## 1. Thông Tin Chung (General Information)

### 1.1. Base URL
*   **Môi trường Staging/UAT:** `https://api-staging.trungtamgiasu.com`
*   **Môi trường Production:** `https://api.trungtamgiasu.com`

### 1.2. Authentication
Hệ thống sử dụng JWT (JSON Web Token) để xác thực. Token phải được đính kèm ở header của mỗi request:
```http
Authorization: Bearer <JWT_TOKEN>
```
*   **Access Token:** Hết hạn sau 60 phút.
*   **Refresh Token:** Hết hạn sau 30 ngày, dùng cho endpoint `AUTH-02`.

### 1.3. Mã Lỗi Chung (Common Error Codes)

| Mã lỗi hệ thống | HTTP Status | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- |
| `UNAUTHORIZED` | 401 | Token không hợp lệ hoặc hết hạn. |
| `FORBIDDEN` | 403 | Tài khoản không có quyền gọi API này (Ví dụ: `STUDENT` gọi API tài chính). |
| `INVALID_PIN` | 400 | Mã PIN phụ huynh nhập không chính xác. |
| `PIN_LOCKED` | 423 | Tính năng xác nhận bị khóa 15 phút do nhập sai PIN quá 5 lần (BR-SEC-04). |
| `BALANCE_INSUFFICIENT` | 400 | Số dư tài khoản không đủ để mua gói/nạp tiền. |
| `ATTENDANCE_LOCKED` | 400 | Buổi học đã quá 24h kể từ thời gian kết thúc, không được phép điểm danh. |
| `LEAVE_LATE` | 400 | Xin nghỉ muộn hơn thời gian quy định (Tutor < 24h, Student < 4h). |
| `SCHEDULE_CONFLICT` | 400 | Trùng khung giờ với lịch dạy/lịch rảnh hiện tại (BR-MAT-02). |
| `SUBJECT_NOT_ALLOWED` | 400 | Môn học không nằm trong danh sách được duyệt (BR-MAT-01). |
| `NOT_FOUND` | 404 | Đối tượng không tồn tại hoặc đã bị xóa logic. |
| `VALIDATION_ERROR` | 422 | Dữ liệu đầu vào không hợp lệ. |
| `PACKAGE_EXHAUSTED` | 400 | Gói học đã hết buổi, không thể thực hiện thao tác (BR-FIN-04). |
| `LEAVE_NOT_ALLOWED` | 400 | Trạng thái đơn không cho phép thực hiện hành động (vd: đơn đã APPROVED). |

### 1.4. Quy ước phân trang
Các API trả danh sách dùng query params `page` (mặc định 1) và `limit` (mặc định 20, tối đa 100). Response bao gồm `total`, `page`, `limit`.

### 1.5. Cấu trúc Response chuẩn (Response Envelope)

**Response thành công:**
```json
{
  "success": true,
  "data": { },
  "message": "Tùy chọn",
  "timestamp": "2026-07-31T20:05:00Z"
}
```

**Response thất bại:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PIN",
    "message": "Mã PIN không chính xác. Bạn còn 4 lần thử.",
    "details": { "field": "parent_pin", "remaining_attempts": 4 }
  },
  "timestamp": "2026-07-31T20:05:00Z"
}
```

| Quy tắc | Mô tả |
| :--- | :--- |
| `success` | Luôn có, `true`/`false` |
| `data` | Chỉ tồn tại khi `success = true` |
| `error` | Chỉ tồn tại khi `success = false`; `code` là mã lỗi (bảng 1.3) |
| `timestamp` | ISO-8601 UTC, định dạng `YYYY-MM-DDThh:mm:ssZ` |

### 1.6. Quy ước định dạng dữ liệu (Conventions)
| Loại | Định dạng chuẩn |
| :--- | :--- |
| **Thời gian** | ISO-8601 UTC: `2026-07-31T18:00:00Z`. Client tự đổi múi giờ hiển thị (Asia/Ho_Chi_Minh, GMT+7) |
| **Tiền tệ** | Số thập phân tối đa 2 chữ số (DECIMAL(12,2)). API trả số, không trả chuỗi |
| **ID** | UUID v4 |
| **Tên môn học** | Chữ thường PascalCase: `Math`, `Physics`, `English` |
| **Cấp lớp** | `Grade_1` ... `Grade_12` |
| **Enum** | UPPER_SNAKE_CASE |
| **Số điện thoại** | Dạng `0987654321` (10 chữ số, bắt đầu 0) |
| **Giới tính** | `MALE`, `FEMALE`, `ANY` |

### 1.7. Giới hạn tần suất (Rate Limiting)
| Đối tượng | Giới hạn | Hành vi vượt giới hạn |
| :--- | :--- | :--- |
| Mọi API (per user) | 120 requests/phút | HTTP 429 `RATE_LIMITED` + header `Retry-After` |
| `AUTH-01` login | 5 lần/phút | 429, chờ 60 giây |
| `AUTH-04` / OTP | 3 lần/phút | 429 |
| `SES-02` xác nhận (nhập PIN) | 10 lần/phút | 429 + theo dõi brute force (BR-SEC-04) |
| `AUTH-05` đổi PIN | 5 lần/phút | 429 |

> Header response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

### 1.8. Idempotency (Chống trùng request)
| Quy tắc | Mô tả |
| :--- | :--- |
| **Header** | Client gửi `Idempotency-Key` (UUID) cho các API tạo dữ liệu/tài chính: `PKG-02`, `PKG-03`, `PKG-04`, `SES-02`, `WAL-03` |
| **Cách hoạt động** | Server lưu key 24h; request trùng key trả về kết quả lần đầu (200) mà không thực thi lại |
| **Lợi ích** | Ngăn trừ tiền 2 lần khi mạng chập chờn (retry) |

### 1.9. Log & Giám sát (Observability)
*   Mọi request ghi log: `request_id`, `user_id`, `endpoint`, `status_code`, `duration_ms`.
*   Header response `X-Request-Id` để hỗ trợ truy vết lỗi.
*   Các API tài chính (`PKG-*`, `WAL-*`, `SES-02`) bắt buộc ghi `audit_logs` với `old_value`/`new_value`.

---

## 2. Danh Mục Endpoints Tổng Quan

| Nhóm | Mã | Endpoints |
| :--- | :--- | :--- |
| **AUTH** | AUTH-01..06 | Đăng nhập, refresh, đăng ký, OTP, đổi PIN, quên mật khẩu |
| **REQ** | REQ-01..03 | Yêu cầu tìm gia sư (Phụ huynh) |
| **TUT** | TUT-01..04 | Hồ sơ Gia sư công khai & cá nhân |
| **APPL** | APPL-01..03 | Ứng tuyển lớp (Gia sư) |
| **SCH** | SCH-01..02 | Lịch lớp & lịch rảnh Gia sư |
| **CLASS** | CLASS-01..03 | Lớp học & buổi học |
| **SES** | SES-01..03 | Điểm danh, duyệt, khiếu nại |
| **LEAVE** | LEAVE-01..05 | Xin nghỉ & dời lịch |
| **PKG** | PKG-01..04 | Gói học phí, nạp tiền, hoàn tiền |
| **WAL** | WAL-01..03 | Ví thu nhập Gia sư |
| **NOTI** | NOTI-01..03 | Trung tâm thông báo |
| **CRM** | CRM-01..09 | Quản trị nội bộ |

---

## 3. Đặc Tả Chi Tiết API Endpoints

### 3.1. Nhóm AUTH (Xác thực)

#### `AUTH-01: POST /api/v1/auth/login`
*   **Authorization:** Không cần token.
*   **Request Body:**
    ```json
    { "phone": "0987654321", "password": "******" }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "access_token": "<JWT>",
        "refresh_token": "<JWT>",
        "role": "PARENT",
        "profiles": [
          { "type": "PARENT", "id": "p1", "display_name": "Phụ huynh" },
          { "type": "STUDENT", "id": "s1", "display_name": "Bé Minh" }
        ]
      }
    }
    ```

#### `AUTH-02: POST /api/v1/auth/refresh`
*   **Request Body:** `{ "refresh_token": "<JWT>" }`
*   **Response:** Cặp token mới.

#### `AUTH-03: POST /api/v1/auth/register`
*   **Authorization:** Không cần token.
*   **Request Body:** `{ "phone": "...", "password": "...", "full_name": "...", "role": "PARENT" | "TUTOR" }`
*   **Response (200 OK):** `{ "success": true, "message": "Đăng ký thành công. Vui lòng xác thực OTP." }`

#### `AUTH-04: POST /api/v1/auth/otp/verify`
*   **Request Body:** `{ "phone": "...", "otp": "123456" }`
*   **Response:** Kích hoạt tài khoản, trả về cặp token đầu tiên.

#### `AUTH-05: PUT /api/v1/parents/pin` (Đổi mã PIN Phụ huynh)
*   **Authorization:** Role: `PARENT`.
*   **Request Body:**
    ```json
    { "old_pin": "5678", "new_pin": "1234" }
    ```
*   **Quy tắc:** Kiểm tra `old_pin` (trả `INVALID_PIN`/`PIN_LOCKED` nếu sai quá 5 lần), lưu `new_pin` dạng hash (BR-SEC-03).

#### `AUTH-06: POST /api/v1/auth/forgot-password`
*   **Request Body:** `{ "phone": "...", "otp": "123456", "new_password": "******" }`
*   **Response:** Reset mật khẩu sau khi xác thực OTP.

#### `AUTH-07: POST /api/v1/auth/profile-switch` (Chuyển đổi Profile bảo mật)
*   **Authorization:** Bearer Token (Role: `PARENT`).
*   **Request Body:**
    ```json
    {
      "profile_id": "p1", // ID của Profile muốn chuyển sang (Parent hoặc Student)
      "profile_type": "PARENT", // PARENT hoặc STUDENT
      "parent_pin": "1234" // Bắt buộc nếu profile_type = PARENT
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "access_token": "<JWT_TOKEN_MOI_CHUA_SCOPE_PROFILE>",
        "profile_type": "PARENT",
        "profile_id": "p1"
      }
    }
    ```
*   **Quy tắc:** Nếu chuyển sang `profile_type = PARENT`, bắt buộc kiểm tra `parent_pin`. Nếu nhập sai quá 5 lần sẽ kích hoạt khóa brute force theo `BR-SEC-04`. Nếu thành công, trả về Access Token mới có thời hạn 60 phút chứa profile context bảo mật.

---

### 3.2. Nhóm REQ (Yêu cầu tìm Gia sư)

#### `REQ-01: POST /api/v1/requests` (Phụ huynh tạo yêu cầu tìm gia sư)
*   **Authorization:** Bearer Token (Role: `PARENT`).
*   **Request Body:**
    ```json
    {
      "student_id": "s1",
      "subject": "Math",
      "grade": "Grade_9",
      "schedule_notes": "Tối 2-4-6 từ 19h-21h",
      "sessions_per_week": 3,
      "budget_per_session": 350000.00,
      "tutor_gender_pref": "ANY"
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": { "request_id": "r1", "status": "NEW", "estimated_match_time": "24h" }
    }
    ```

#### `REQ-02: GET /api/v1/requests/{request_id}` (Theo dõi trạng thái yêu cầu)
*   **Response:** Thông tin yêu cầu + danh sách gia sư được đề xuất (ẩn danh theo BR-SEC-01/02).

#### `REQ-03: POST /api/v1/requests/{request_id}/cancel` (Phụ huynh hủy yêu cầu)
*   **Quy tắc:** Chỉ hủy được khi yêu cầu chưa `MATCHED`. Hủy → trạng thái `CANCELLED`, gửi notification CRM.

---

### 3.3. Nhóm TUT (Hồ sơ Gia sư)

#### `TUT-01: GET /api/v1/tutors` (Phụ huynh tìm kiếm Gia sư ẩn danh)
*   **Authorization:** Bearer Token (Role: `PARENT`).
*   **Query Parameters:**
    *   `subject` (Môn học - String, ví dụ: `Math`)
    *   `grade` (Cấp học - String, ví dụ: `Grade_9`)
    *   `gender` (Giới tính gia sư - String: `MALE`, `FEMALE`, `ANY`)
    *   `district` (Quận/Huyện - String, ví dụ: `Cau_Giay`)
    *   `page`, `limit`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "total": 42,
      "page": 1,
      "limit": 20,
      "data": [
        {
          "tutor_id": "a3f5c7d9-0b2e-4a8f-8c9d-1e2f3a4b5c6d",
          "display_name": "Gia sư Hoàng M.",
          "gender": "MALE",
          "occupation": "Giáo viên THPT",
          "qualification": "Thạc sĩ sư phạm Toán",
          "rating_avg": 4.95,
          "preferred_hourly_rate": 300000.00,
          "bio": "10 năm kinh nghiệm đứng lớp ôn thi Chuyên..."
        }
      ]
    }
    ```

#### `TUT-02: GET /api/v1/tutors/{tutor_id}` (Xem chi tiết hồ sơ công khai)
*   **Response:** Chi tiết hồ sơ ẩn danh + đánh giá gần đây (không có thông tin liên hệ).

#### `TUT-03: POST /api/v1/tutor/certificates` (Gia sư upload chứng chỉ)
*   **Authorization:** Role: `TUTOR`.
*   **Request:** Multipart file upload (bằng cấp/chứng chỉ số hóa, mỗi file ≤ 10MB).
*   **Response:** Lưu URL vào `tutors.certificates_json`, hồ sơ chuyển `PENDING_REVIEW`.

#### `TUT-04: GET /api/v1/tutor/profile` (Xem/sửa hồ sơ cá nhân Gia sư)
*   **Authorization:** Role: `TUTOR`.
*   **Response:** Thông tin cá nhân (trả 4 số cuối CCCD), danh sách `tutor_subjects`, `tutor_schedules`.

---

### 3.4. Nhóm APPL (Ứng tuyển lớp - Gia sư)

#### `APPL-01: GET /api/v1/applications` (Danh sách đơn ứng tuyển của Gia sư)
*   **Query Parameters:** `status` (PENDING, SHORTLISTED, SELECTED_FOR_TRIAL, REJECTED, WITHDRAWN), `page`, `limit`.
*   **Response:** Danh sách đơn + trạng thái yêu cầu liên quan.

#### `APPL-02: POST /api/v1/applications` (Gia sư ứng tuyển)
*   **Authorization:** Bearer Token (Role: `TUTOR`).
*   **Request Body:**
    ```json
    { "tutor_request_id": "r1", "cover_letter": "Em có 2 năm kinh nghiệm dạy Toán 9..." }
    ```
*   **Các mã lỗi có thể trả về:** `SUBJECT_NOT_ALLOWED` (BR-MAT-01), `SCHEDULE_CONFLICT` (BR-MAT-02).
*   **Response (201 Created):**
    ```json
    { "success": true, "data": { "application_id": "ap1", "status": "PENDING" } }
    ```

#### `APPL-03: POST /api/v1/applications/{application_id}/withdraw` (Rút đơn)
*   **Response:** Chuyển đơn sang `WITHDRAWN` (chỉ khi đang `PENDING`/`SHORTLISTED`).

---

### 3.5. Nhóm SCH (Lịch học)

#### `SCH-01: GET /api/v1/classes/{class_id}/schedules` (Lịch định kỳ của lớp)
*   **Response:**
    ```json
    {
      "success": true,
      "data": [
        { "schedule_id": "cs1", "day_of_week": 2, "slot_start": "19:00", "slot_end": "21:00" }
      ]
    }
    ```

#### `SCH-01b: PUT /api/v1/classes/{class_id}/schedules` (CRM đổi lịch định kỳ - sau khi hai bên duyệt)
*   **Authorization:** Role: `SALES`, `ACADEMIC`.
*   **Request Body:** `{ "schedules": [ { "day_of_week": 3, "slot_start": "18:00", "slot_end": "20:00" } ] }`
*   **Quy tắc:** Có hiệu lực từ tuần sau (BR-SCH-03), ghi audit log.

#### `SCH-02: GET/POST/PUT/DELETE /api/v1/tutor/schedules` (Quản lý lịch rảnh Gia sư)
*   **Authorization:** Role: `TUTOR`.
*   **GET Response:**
    ```json
    {
      "success": true,
      "data": [
        { "schedule_id": "ts1", "day_of_week": 2, "slot_start": "08:00", "slot_end": "12:00", "is_active": true }
      ]
    }
    ```
*   **POST/PUT Body:** `{ "day_of_week": 4, "slot_start": "13:00", "slot_end": "17:00" }`
*   **Quy tắc:** Không cho tạo khung giờ trùng nhau; hệ thống kiểm tra không ảnh hưởng `class_schedules` đang dạy (BR-MAT-02).

---

### 3.6. Nhóm CLASS (Lớp học & Buổi học)

#### `CLASS-01: GET /api/v1/classes/{class_id}` (Xem chi tiết lớp học)
*   **Authorization:** Role: `PARENT`, `TUTOR` (chủ lớp), `SALES`, `ACADEMIC`.
*   **Response:** Thông tin lớp + `remaining_sessions` + lịch định kỳ + danh sách buổi học sắp tới.

#### `CLASS-02: GET /api/v1/my-classes` (Danh sách lớp của Gia sư)
*   **Authorization:** Role: `TUTOR`.
*   **Query Parameters:** `status` (TEACHING, SUSPENDED, TRIAL_PENDING...).
*   **Response:** Danh sách lớp + thời khóa biểu tuần + `remaining_sessions` của từng lớp.

#### `CLASS-03: GET /api/v1/classes/{class_id}/sessions` (Danh sách buổi học của lớp)
*   **Query Parameters:** `status`, `from`, `to`, `page`, `limit`.
*   **Response:** Danh sách buổi học (dùng cho lịch biểu và lịch sử điểm danh).

---

### 3.7. Nhóm SES (Điểm danh & Duyệt)

#### `SES-01: POST /api/v1/sessions/attendance` (Gia sư báo điểm danh buổi dạy)
*   **Authorization:** Bearer Token (Role: `TUTOR`).
*   **Request Body:**
    ```json
    {
      "session_id": "s7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "actual_start": "2026-07-31T18:00:00Z",
      "actual_end": "2026-07-31T20:00:00Z",
      "tutor_notes": "Học sinh hôm nay đi học đúng giờ, tiếp thu bài tốt."
    }
    ```
*   **Mã lỗi:** `ATTENDANCE_LOCKED` (quá 24h, BR-SCH-04).
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Báo cáo điểm danh thành công. Vui lòng chờ Phụ huynh phê duyệt.",
      "data": { "session_id": "s7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d", "status": "ATTENDED" }
    }
    ```

#### `SES-02: POST /api/v1/sessions/{session_id}/confirm` (Phụ huynh duyệt điểm danh & thanh toán)
*   **Authorization:** Bearer Token (Role: `PARENT`).
*   **Request Body:**
    ```json
    {
      "action": "CONFIRM", // Hoặc "DISPUTE"
      "parent_pin": "5678", // Bắt buộc
      "rating": 5, // Gửi khi CONFIRM (1-5)
      "feedback": "Gia sư nhiệt tình, bài giảng dễ hiểu.", // Không bắt buộc
      "dispute_reason": "" // Bắt buộc nếu action = DISPUTE
    }
    ```
*   **Mã lỗi:** `INVALID_PIN`, `PIN_LOCKED` (BR-SEC-04), `PACKAGE_EXHAUSTED` (BR-FIN-04).
*   **Ghi chú tài chính:** Khi `CONFIRM`, hệ thống chỉ tăng `used_sessions` + trả lương GS; **không trừ `balance` lần nữa** (BR-FIN-01).
*   **Response (200 OK - CONFIRM thành công):**
    ```json
    {
      "success": true,
      "message": "Duyệt buổi dạy thành công. Đã khấu trừ 1 buổi trong gói học.",
      "data": {
        "session_id": "s7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
        "status": "CONFIRMED",
        "remaining_sessions": 8
      }
    }
    ```

#### `SES-03: POST /api/v1/sessions/{session_id}/dispute-evidence` (Đính kèm minh chứng khiếu nại)
*   **Request:** Multipart file upload (tối đa 5 ảnh, mỗi ảnh ≤ 5MB).
*   **Response:** Danh sách URL minh chứng lưu trong `dispute_evidence`.

---

### 3.8. Nhóm LEAVE (Xin nghỉ & Dời lịch)

#### `LEAVE-01: POST /api/v1/sessions/leave-requests` (Gia sư hoặc Học viên xin nghỉ dời lịch)
*   **Authorization:** Bearer Token (Role: `TUTOR`, `PARENT`, `STUDENT`).
*   **Request Body:**
    ```json
    {
      "session_id": "s7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
      "reason": "Học sinh bị sốt xuất huyết nhập viện.",
      "reschedule_suggested_time": "2026-08-03T19:00:00Z"
    }
    ```
*   **Quy tắc:** Gia sư gửi ≥ 24h (BR-SCH-02), Học viên gửi ≥ 4h và chờ Phụ huynh duyệt (BR-SCH-01). Nếu nghỉ muộn vẫn chấp nhận nhưng trả `LEAVE_LATE` kèm cảnh báo (Gia sư bị ghi nhận vi phạm).
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Gửi yêu cầu xin nghỉ thành công. Chờ bên đối tác phê duyệt lịch bù.",
      "data": { "leave_request_id": "l4a5b6c7-d8e9-0f1a-2b3c-4d5e6f7a8b9c", "status": "PENDING" }
    }
    ```

#### `LEAVE-02: POST /api/v1/leaves/{leave_request_id}/approve` (Phê duyệt đơn dời lịch bù)
*   **Authorization:** Role: `PARENT`, `TUTOR`.
*   **Response:** Chuyển đơn dời lịch sang `APPROVED`, tự động sinh buổi học mới (`sessions` trạng thái `SCHEDULED`) với `rescheduled_to`, gửi thông báo cho bên yêu cầu dời lịch.
*   **Quy tắc:** Phụ huynh duyệt đề xuất dời lịch của Gia sư; hoặc Gia sư duyệt đề xuất dời lịch của Học sinh (sau khi đã được Phụ huynh duyệt qua `LEAVE-04`).

#### `LEAVE-03: POST /api/v1/leaves/{leave_request_id}/reject` (Từ chối đề xuất dời lịch & đề xuất giờ khác)
*   **Authorization:** Role: `PARENT`, `TUTOR`.
*   **Request Body:** `{ "alternative_time": "2026-08-04T18:00:00Z" }`
*   **Quy tắc:** Vòng lặp đề xuất tối đa 2 lần giữa hai bên (Phụ huynh và Gia sư), sau đó nếu không thống nhất được thì chuyển cho nhân viên Học vụ xử lý thủ công.

#### `LEAVE-04: POST /api/v1/leaves/student/{leave_request_id}/parent-confirm` (Phụ huynh xác nhận đơn nghỉ của Học viên)
*   **Authorization:** Role: `PARENT`.
*   **Response:** `student_leaves.parent_approved = true` rồi mới chuyển sang Gia sư (BR-SCH-01).

#### `LEAVE-05: GET /api/v1/leaves` (Lịch sử đơn xin nghỉ)
*   **Query Parameters:** `status`, `type` (TUTOR, STUDENT), `page`.
*   **Response:** Danh sách đơn nghỉ của người dùng hiện tại.

---

### 3.9. Nhóm PKG (Gói học phí & Dòng tiền)

#### `PKG-01: GET /api/v1/classes/{class_id}/packages` (Danh sách gói của lớp)
*   **Response:** Tổng buổi, buổi đã dùng, buổi còn lại, trạng thái từng gói.

#### `PKG-02: POST /api/v1/packages/purchase` (Phụ huynh mua gói học phí)
*   **Authorization:** Role: `PARENT`. Yêu cầu nhập mã PIN.
*   **Request Body:**
    ```json
    {
      "class_id": "c1",
      "name": "Gói 10 buổi Toán",
      "total_sessions": 10,
      "price": 3000000.00,
      "parent_pin": "5678"
    }
    ```
*   **Quy tắc (BR-FIN-01):**
    1. Kiểm tra mã PIN (`INVALID_PIN`/`PIN_LOCKED`).
    2. Kiểm tra `total_sessions ≥ 10`.
    3. Kiểm tra `balance ≥ price`, **trừ ngay price khỏi `balance`** (sai trả `BALANCE_INSUFFICIENT`).
    4. Tạo `packages`; nếu lớp đang `SUSPENDED` vì hết buổi → tự chuyển lại `TEACHING` (BR-FIN-04).
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "package_id": "pk1",
        "remaining_sessions": 10,
        "class_status": "TEACHING",
        "balance_after": 500000.00
      }
    }
    ```

#### `PKG-03: POST /api/v1/packages/{package_id}/refund` (Yêu cầu hoàn tiền)
*   **Authorization:** Role: `PARENT`. Yêu cầu mã PIN.
*   **Request Body:** `{ "reason": "Đổi gia sư không thành công", "parent_pin": "5678" }`
*   **Quy tắc (BR-FIN-05):** Tiền hoàn = Số buổi chưa dùng × `hourly_rate`. Tạo transaction `REFUND` trạng thái `PENDING`, chờ Kế toán duyệt trên CRM-05.

#### `PKG-04: POST /api/v1/parents/top-up` (Phụ huynh nạp tiền vào tài khoản)
*   **Authorization:** Role: `PARENT`. Yêu cầu mã PIN.
*   **Request Body:**
    ```json
    { "amount": 5000000.00, "payment_method": "BANK_TRANSFER", "parent_pin": "5678" }
    ```
*   **Quy tắc:** Tạo transaction `TUITION_DEPOSIT` trạng thái `PENDING`, chờ Kế toán đối soát (CRM-05) → `SUCCESSFUL`, cộng `balance`.

---

### 3.10. Nhóm WAL (Ví thu nhập Gia sư)

#### `WAL-01: GET /api/v1/wallet` (Xem ví thu nhập)
*   **Authorization:** Role: `TUTOR`.
*   **Response:**
    ```json
    {
      "success": true,
      "data": {
        "wallet_balance": 4500000.00,
        "pending_confirm": 2,
        "transactions": [
          { "transaction_id": "t1", "type": "TUTOR_SALARY", "amount": 200000.00, "status": "SUCCESSFUL", "session_id": "s7b8...", "created_at": "2026-07-31T20:05:00Z" }
        ]
      }
    }
    ```

#### `WAL-02: POST /api/v1/wallet/bank-accounts` (Thêm tài khoản nhận lương)
*   **Request Body:** `{ "bank_name": "Vietcombank", "account_holder": "Nguyễn Văn A", "account_number": "0123456789" }`
*   **Response:** Lưu số tài khoản mã hóa AES-256 (BR-SEC-03), trả về 4 số cuối để hiển thị.

#### `WAL-03: POST /api/v1/wallet/withdraw-request` (Yêu cầu rút lương)
*   **Request Body:** `{ "amount": 3000000.00, "bank_account_id": "ba1" }`
*   **Quy tắc:** `amount ≤ wallet_balance`, nếu vượt trả `BALANCE_INSUFFICIENT`. Tạo transaction `SALARY_WITHDRAWAL` trạng thái `PENDING`, Kế toán xử lý trên CRM-05.

---

### 3.11. Nhóm NOTI (Trung tâm thông báo)

#### `NOTI-01: GET /api/v1/notifications`
*   **Query Parameters:** `type`, `is_read`, `page`, `limit`.
*   **Response:** Danh sách thông báo + `unread_count`.

#### `NOTI-02: PATCH /api/v1/notifications/{id}/read`
*   **Response:** Đánh dấu đã đọc.

#### `NOTI-03: PATCH /api/v1/notifications/read-all`
*   **Response:** Đánh dấu toàn bộ đã đọc.

---

### 3.12. Nhóm CRM (Quản trị nội bộ)

#### `CRM-01: GET /api/v1/crm/disputes` (Học vụ xem danh sách khiếu nại)
*   **Authorization:** Role: `ACADEMIC`, `ADMIN`.
*   **Query Parameters:** `status` (DISPUTED), `resolved`, `page`.
*   **Response:** Danh sách buổi `DISPUTED` + minh chứng + thông tin hai bên (ẩn định danh theo BR-SEC-01/02).

#### `CRM-02: POST /api/v1/crm/disputes/{session_id}/resolve` (Học vụ ra phán quyết)
*   **Request Body:**
    ```json
    {
      "resolution": "RESOLVED_CONFIRM", // RESOLVED_CONFIRM | RESOLVED_CANCEL | RESOLVED_PARTIAL
      "note": "Xác nhận buổi dạy có diễn ra",
      "partial_percent": 0 // Chỉ dùng khi RESOLVED_PARTIAL
    }
    ```
*   **Response:** Thực thi theo kết quả (trừ buổi / trả lương / trả 50%), cập nhật session, gửi notification hai bên, ghi audit log.

#### `CRM-03: GET /api/v1/crm/reports/overview` (Dashboard tổng quan - theo KPI BRD)
*   **Authorization:** Role: `ADMIN`, `SALES`, `ACCOUNTANT`.
*   **Query Parameters:** `from`, `to`.
*   **Response:**
    ```json
    {
      "success": true,
      "data": {
        "time_to_match_avg_hours": 18,
        "class_change_rate": 0.03,
        "active_classes": 200,
        "active_tutors": 120,
        "revenue": 850000000.00,
        "dispute_unresolved": 2
      }
    }
    ```

#### `CRM-04: GET /api/v1/crm/salary-report` (Kết toán lương theo kỳ)
*   **Authorization:** Role: `ACCOUNTANT`, `ADMIN`.
*   **Query Parameters:** `from`, `to`, `status`.
*   **Response:** Tổng hợp lương theo gia sư (tổng buổi dạy, tổng tiền, tài khoản nhận lương - chỉ 4 số cuối).

#### `CRM-05: POST /api/v1/crm/salary/{transaction_id}/approve` (Kế toán duyệt chi lương / nạp tiền / hoàn tiền)
*   **Authorization:** Role: `ACCOUNTANT`, `ADMIN`.
*   **Request Body:** `{ "action": "APPROVE" | "REJECT", "reference": "NH1234567890" }`
*   **Quy tắc:**
    *   `SALARY_WITHDRAWAL` APPROVE → trừ `tutors.wallet_balance`, transaction `SUCCESSFUL`.
    *   `TUITION_DEPOSIT` APPROVE → cộng `parents.balance`, transaction `SUCCESSFUL`.
    *   `REFUND` APPROVE → cộng `parents.balance`, gói chuyển `REFUNDED`.

#### `CRM-06: POST /api/v1/crm/applications/{application_id}/review` (Sales duyệt đơn ứng tuyển)
*   **Authorization:** Role: `SALES`, `ADMIN`.
*   **Request Body:**
    ```json
    { "action": "APPROVE" | "REJECT" | "SHORTLIST", "note": "Hồ sơ khớp tốt" }
    ```
*   **Quy tắc (BR-MAT-03):** Tối đa 3 đơn `SHORTLISTED`/`SELECTED_FOR_TRIAL` cho 1 yêu cầu.

#### `CRM-07: POST /api/v1/crm/applications/{application_id}/assign-trial` (Sales giao lớp dạy thử)
*   **Authorization:** Role: `SALES`, `ADMIN`.
*   **Request Body:** `{ "hourly_rate": 350000.00, "tutor_wage_rate": 250000.00, "schedules": [ { "day_of_week": 2, "slot_start": "19:00", "slot_end": "21:00" } ] }`
*   **Hành động hệ thống:**
    1. Chuyển đơn → `SELECTED_FOR_TRIAL`.
    2. Tạo `classes` trạng thái `TRIAL_PENDING` + `class_schedules`.
    3. **Mở khóa thông tin liên hệ** Phụ huynh cho gia sư này (BR-SEC-01).
    4. Chuyển yêu cầu → `MATCHED`; các đơn khác tự chuyển `REJECTED`.

#### `CRM-08: GET/POST/PUT /api/v1/crm/tutors` (Quản lý hồ sơ Gia sư - CRM)
*   **Authorization:** Role: `SALES`, `ACADEMIC`, `ADMIN`.
*   **Tính năng:** Duyệt hồ sơ (`PENDING_REVIEW → ACTIVE`), khóa/khôi phục (`BANNED`), quản lý `tutor_subjects` (BR-MAT-01), xem lịch sử vi phạm (BR-PEN-03).

#### `CRM-09: GET /api/v1/crm/requests` (Quản lý yêu cầu tìm gia sư)
*   **Authorization:** Role: `SALES`, `ADMIN`.
*   **Query Parameters:** `status`, `from`, `to`, `page`.
*   **Tính năng:** Xem danh sách yêu cầu, cập nhật trạng thái (`NEW → CONSULTING → PUBLISHED`), xem danh sách đơn ứng tuyển từng yêu cầu.
