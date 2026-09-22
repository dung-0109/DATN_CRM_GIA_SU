# TÀI LIỆU NGHIỆP VỤ — HỆ THỐNG CRM TRUNG TÂM GIA SƯ

> Phiên bản: 1.0 — Cập nhật: 08/2026
> Tài liệu mô tả đầy đủ nghiệp vụ đang vận hành trên hệ thống (Backend NestJS + PostgreSQL, Frontend React/Vite).

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Mục tiêu
Số hóa toàn bộ quy trình vận hành của trung tâm gia sư: từ lúc phụ huynh gửi nhu cầu tìm gia sư → trung tâm khớp lớp → dạy thử → dạy chính thức → điểm danh từng buổi → phụ huynh xác nhận trừ học phí → trả lương gia sư → quyết toán kế toán.

### 1.2. Ba cổng tương tác
| Cổng | Đường dẫn | Đối tượng | Vai trò chính |
|---|---|---|---|
| **CRM Back-office** | `/admin-crm` | Nhân viên trung tâm (Admin, Sales, Học vụ, Kế toán) | Duyệt hồ sơ, khớp lớp, giải quyết khiếu nại, quyết toán lương |
| **Client Portal** | `/client` | Phụ huynh / Học sinh | Quản lý con, ví tiền, yêu cầu tìm gia sư, mua gói, duyệt điểm danh |
| **Tutor Portal** | `/tutor` | Gia sư | Hồ sơ, lịch rảnh, ứng tuyển lớp, điểm danh buổi dạy, ví lương |

### 1.3. Nguyên tắc thiết kế cốt lõi
- **Tách bạch dòng tiền theo từng con**: 1 phụ huynh có nhiều con → mỗi con có yêu cầu, lớp, gói học phí riêng; ví tiền là dùng chung.
- **Ẩn danh thông tin liên lạc**: khi lớp chưa chốt, gia sư chỉ thấy quận + môn + lịch của yêu cầu, KHÔNG thấy tên/SĐT phụ huynh; ngược lại phụ huynh chỉ thấy hồ sơ gia sư công khai.
- **Mọi giao dịch tiền đều qua mã PIN** của phụ huynh (nạp tiền, mua gói, xác nhận điểm danh).

---

## 2. DIỄN GIẢI THUẬT NGỮ

| Thuật ngữ | Ý nghĩa |
|---|---|
| Tutor Request (YCGS) | Yêu cầu tìm gia sư do phụ huynh tạo cho 1 con cụ thể |
| Application | Đơn ứng tuyển của gia sư vào 1 YCGS đang mở |
| Match (Khớp lớp) | Nhân viên chọn 1 đơn ứng tuyển → sinh lớp dạy thử |
| Dạy thử (Trial) | Buổi học thử để phụ huynh đánh giá gia sư |
| Session (Buổi học) | 1 buổi dạy cụ thể, có giờ bắt đầu/kết thúc và trạng thái riêng |
| Package (Gói học phí) | Gói 10/20 buổi phụ huynh mua trước cho 1 lớp |
| Attendance (Điểm danh) | Gia sư ghi nhận đã dạy 1 buổi trong vòng 24h sau giờ kết thúc |
| Auto-Confirm | Quét tự động chuyển buổi ATTENDED quá hạn duyệt sang CONFIRMED |
| Dispute (Khiếu nại) | Phụ huynh từ chối 1 buổi điểm danh, đưa ra trung tâm phán quyết |
| Payout (Quyết toán) | Kế toán chuyển khoản lương ví gia sư về 0 |

---

## 3. TÁC NHÂN & PHÂN QUYỀN

### 3.1. Vai trò hệ thống (UserRole)
| Vai trò | Thuộc | Quyền hạn chính |
|---|---|---|
| ADMIN | Nội bộ | Toàn quyền CRM: thống kê, duyệt gia sư, khớp lớp, phán quyết, payout |
| SALES | Nội bộ | Xem gia sư, duyệt/trạng thái gia sư, tham gia khớp lớp |
| ACADEMIC | Nội bộ | Quản lý lớp, xử lý khiếu nại, đối soát |
| ACCOUNTANT | Nội bộ | Xem lớp, quyết toán lương gia sư (payout) |
| PARENT | Khách hàng | Mọi nghiệp vụ Client Portal |
| TUTOR | Cộng tác viên | Mọi nghiệp vụ Tutor Portal |

### 3.2. Xác thực
- **Đăng nhập**: Số điện thoại + mật khẩu → JWT token.
- **Đăng ký**: tự do với vai trò PARENT hoặc TUTOR; tài khoản nội bộ do trung tâm cấp.
- **OTP**: quên mật khẩu / xác thực đăng ký dùng mã OTP (bản demo mã cố định `123456`).
- **Mã PIN 4 số**: gắn với hồ sơ Parent, dùng xác nhận mọi giao dịch tiền + profile switch. Nhập sai bị khóa tạm thời (có log cảnh báo SYSTEM).
- **Audit Log**: mọi thao tác quan trọng được ghi vết user + hành động + giá trị trước/sau.

---

## 4. LUỒNG NGHIỆP VỤ TỔNG (END-TO-END)

```
Phụ huynh                    Trung tâm                      Gia sư
   │                            │                             │
   │ 1. Tạo hồ sơ con           │                             │
   │ 2. Nạp tiền vào ví (PIN)   │                             │
   │ 3. Tạo YCGS ──────────────►│ 4. Duyệt hồ sơ gia sư       │◄── Đăng ký hồ sơ,
   │                            │    (NEW→CONSULTING→         │    lịch rảnh, STK
   │                            │       PUBLISHED)            │
   │                            │ 5. Gia sư ứng tuyển ◄───────┤ (xem YCGS ẩn danh)
   │                            │ 6. Chọn đơn → Giao dạy thử  │
   │                            │    (Class: TRIAL_PENDING)   │
   │ 7. Duyệt kết quả dạy thử   │◄─────── kết quả dạy thử ────┤
   │    ► Lớp TEACHING          │                             │
   │ 8. Mua gói 10/20 buổi(PIN) │                             │
   │    [vòng lặp mỗi tuần]     │                             │
   │                            │      9. Điểm danh ≤24h ─────┤
   │ 10. Xác nhận buổi (PIN)    │                             │
   │    ► Trừ gói + trả lương GS│                             │
   │    hoặc Khiếu nại ────────►│ 11. Phán quyết              │
   │ 12. Báo nghỉ cho con ─────►│◄──── Báo nghỉ dạy (24h) ────┤
   │                            │ 13. Payout lương tháng ─────┤► Ví lương → RK
```

---

## 5. CHI TIẾT NGHIỆP VỤ THEO PHÂN HỆ

### 5.1. Quản lý hồ sơ học viên (Client Portal)
- Phụ huynh khai **nhiều hồ sơ con** (họ tên, giới tính, ngày sinh, trường, lớp, ghi chú).
- CRUD con: thêm/sửa/xóa; xóa con chỉ khi chưa phát sinh lớp học.
- Mỗi YCGS phải gắn với **đúng 1 con**.

### 5.2. Ví tiền & Gói học phí (Finance)
| Nghiệp vụ | Luồng xử lý |
|---|---|
| **Nạp tiền** | Phụ huynh nhập số tiền → nhập PIN → tạo Transaction `TUITION_DEPOSIT` → cộng ví. Bản demo nạp giả lập. |
| **Mua gói** | Chọn lớp + gói 10/20 buổi → PIN → trừ ví (`SESSION_DEDUCTION` tại thời điểm xác nhận từng buổi, gói chỉ ghi nhận usedSessions) → Package trạng thái ACTIVE |
| **Hết gói** | Khi usedSessions = totalSessions → EXHAUSTED, phụ huynh phải mua gói mới trước khi tiếp tục xác nhận |
| **Hoàn tiền** | Transaction `REFUND` (dùng khi hủy lớp/phán quyết hoàn) |

Nguyên tắc: **tiền không bao giờ tự trừ** — chỉ trừ khi phụ huynh nhập PIN xác nhận hoặc Auto-Confirm kích hoạt sau khi hết hạn duyệt.

### 5.3. Nghiệp vụ Gia sư (Tutor Portal + duyệt bởi CRM)
1. **Đăng ký hồ sơ**: họ tên, CMND/CCCD (mã hóa lưu hash), nghề nghiệp, bằng cấp, môn dạy, khu vực.
2. **Trạng thái hồ sơ**: `PENDING_REVIEW` → nhân viên duyệt thành `ACTIVE` (được ứng tuyển) hoặc `BANNED`.
3. **Lịch rảnh (TutorSchedule)**: đăng ký khung giờ rảnh theo thứ trong tuần — dữ liệu đầu vào cho gợi ý khớp lớp.
4. **Tài khoản ngân hàng (TutorBankAccount)**: thêm/xóa STK nhận lương; payout sẽ chuyển về STK mặc định.
5. **Ví lương (walletBalance)**: cộng real-time khi buổi dạy được xác nhận; rút lương qua nghiệp vụ quyết toán của kế toán.

### 5.4. Yêu cầu tìm gia sư & Khớp lớp (Matching)

**5.4.1. Vòng đời YCGS (RequestStatus):**
```
NEW → CONSULTING → PUBLISHED → MATCHED
 ↳ CANCELLED (phụ huynh hủy / trung tâm từ chối)
```
- NEW: vừa tạo, chờ tư vấn. CONSULTING: đang tư vấn thống nhất nội dung. PUBLISHED: công bố cho gia sư ứng tuyển. MATCHED: đã chốt gia sư, sinh lớp.

**5.4.2. Nội dung YCGS**: con nào, môn, lớp học, lịch mong muốn, số buổi/tuần, ngân sách/buổi, giới tính gia sư ưu tiên.

**5.4.3. Ứng tuyển (ApplicationStatus):**
```
PENDING → SHORTLISTED → SELECTED_FOR_TRIAL
        → REJECTED / WITHDRAWN
```
- Gia sư chỉ thấy YCGS ở trạng thái PUBLISHED, hiển thị **ẩn danh** (quận + môn + lịch + ngân sách).
- Nhân viên xem danh sách ứng tuyển của từng YCGS, sàng lọc và **chọn 1 người giao dạy thử**.

**5.4.4. Sinh lớp & dạy thử (ClassStatus):**
```
TRIAL_PENDING ── dạy thử thành công ──► TEACHING ──► COMPLETED
       └──────── dạy thử thất bại ────► TRIAL_FAILED (chọn gia sư khác, quay lại bước ứng tuyển)
TEACHING → SUSPENDED (tạm dừng đặc biệt)
```
- Khi match: tạo Class với giá thuê `hourlyRate` (phụ huynh trả) và `tutorWageRate` (trả gia sư) — **biên lợi nhuận trung tâm = hiệu số 2 giá này**.
- Kết quả dạy thử do phụ huynh phê duyệt: đồng ý → TEACHING; từ chối → TRIAL_FAILED kèm ghi chú.

### 5.5. Điểm danh & Xác nhận buổi học (Session) — quy trình trọng yếu

**5.5.1. Vòng đời buổi học (SessionStatus):**
```
SCHEDULED → ATTENDED → CONFIRMED
               │  ↑ (quá 24h không duyệt → Auto-Confirm)
               ├─► DISPUTED → (phán quyết) CONFIRMED / huỷ
               └─► CANCELLED_BY_TUTOR / CANCELLED_BY_STUDENT (qua nghiệp vụ nghỉ)
```

**5.5.2. Luồng chuẩn:**
1. Gia sư dạy xong, **điểm danh trong vòng 24h** kể từ giờ kết thúc buổi (BR-SCH-04). Quá hạn: hệ thống từ chối, buổi bị treo → xử lý qua Auto-Confirm/khiếu nại.
2. Nội dung điểm danh: giờ bắt đầu/kết thúc thực tế + nhận xét bài học.
3. Buổi chuyển sang **ATTENDED**, gửi thông báo cho phụ huynh.
4. Phụ huynh vào Chi tiết lớp:
   - **Xác nhận** (nhập PIN) → buổi CONFIRMED → trừ 1 buổi gói → **cộng lương gia sư ngay** (tutorWageRate) → tạo Transaction `TUTOR_SALARY` + `WALLET_UPDATE` thông báo.
   - **Khiếu nại** → buổi DISPUTED, **chưa trừ tiền**, đính kèm bằng chứng (tối đa 5 ảnh), chờ trung tâm.

**5.5.3. Auto-Confirm:** nhân viên bấm "Kích hoạt Auto-Confirm" → hệ thống quét các buổi ATTENDED đã quá hạn duyệt mà phụ huynh không phản hồi → tự động CONFIRMED + trừ gói + trả lương. Mục đích: không giữ tiền của 2 bên vô thời hạn.

### 5.6. Khiếu nại & Phán quyết (Dispute)
- Danh sách khiếu nại = các buổi trạng thái DISPUTED, hiện đủ: gia sư – phụ huynh – học viên – nội dung – bằng chứng.
- Nhân viên Học vụ/Admin đối chiếu 2 bên, ra phán quyết:

| Outcome | Hậu quả tài chính |
|---|---|
| `RESOLVED_CONFIRM` — buổi dạy hợp lệ | Trừ gói phụ huynh + trả đủ lương gia sư |
| `RESOLVED_CANCEL` — khiếu nại thắng | Không trừ gói, không trả lương |
| `RESOLVED_PARTIAL` — thỏa hiệp (tham chiếu SRS) | Trừ buổi nhưng trả một phần lương |

### 5.7. Nghỉ dạy / Nghỉ học (Leave)
| Loại | Quy tắc báo trước | Nếu báo muộn | Duyệt bởi |
|---|---|---|---|
| **Gia sư báo nghỉ dạy lẻ** | **24 giờ** so với giờ dạy | Bị ghi **vi phạm** chất lượng (BR-PEN-01); kèm đề xuất lịch bù | Phụ huynh đồng ý |
| **Phụ huynh báo nghỉ hộ con** | **4 giờ** so với giờ dạy | Vẫn tính 1 buổi | Gia sư đồng ý dời lịch |

- Đơn nghỉ có trạng thái `PENDING → APPROVED / REJECTED`; buổi liên quan chuyển CANCELLED_BY_TUTOR/CANCELLED_BY_STUDENT và lên lịch bù.
- Vi phạm nhiều lần → cảnh báo giám sát chất lượng, trung tâm liên hệ phụ huynh.

### 5.8. Kế toán & Quyết toán lương (Payout)
- Kế toán xem tổng ví lương từng gia sư theo kỳ → bấm **Quyết toán** → hệ thống:
  1. Tạo Transaction `SALARY_WITHDRAWAL` (trạng thái SUCCESSFUL sau khi nhập mã giao dịch ngân hàng),
  2. Đưa ví gia sư về 0,
  3. Gửi thông báo `WALLET_UPDATE` cho gia sư.
- Lương chỉ quyết toán trên phần đã CONFIRMED — phần đang chờ/khiếu nại chưa tính.

### 5.9. Thông báo (Notification)
Ma trận thông báo chính:

| Sự kiện | Người nhận | Loại |
|---|---|---|
| Buổi học chờ duyệt | Phụ huynh | SESSION_CONFIRM_REQUEST |
| Buổi được duyệt / Auto-Confirm | Gia sư | WALLET_UPDATE |
| Yêu cầu duyệt nghỉ | Phụ huynh / Gia sư (bên còn lại) | LEAVE_APPROVAL |
| Lớp đổi trạng thái (match, dạy thử, kết thúc) | 2 bên | CLASS_UPDATE |
| Có khiếu nại | Nhân viên Học vụ | DISPUTE_ALERT |
| Biến động ví/lương | Chủ ví | WALLET_UPDATE |

---

## 6. QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

| Mã | Quy tắc | Hệ quả vi phạm |
|---|---|---|
| BR-FIN-01 | Mọi giao dịch tiền của phụ huynh phải có mã PIN | Chặn thực hiện |
| BR-FIN-02 | Chỉ xác nhận buổi khi gói còn buổi (used < total) | Bắt mua gói mới |
| BR-SCH-04 | Gia sư điểm danh **trong 24h** sau giờ kết thúc buổi | Từ chối điểm danh thủ công |
| BR-LEV-01 | Gia sư báo nghỉ trước **24h** | Muộn hơn → ghi vi phạm |
| BR-LEV-02 | Phụ huynh báo nghỉ cho con trước **4h** | Muộn hơn → vẫn tính buổi |
| BR-MAT-01 | YCGS chỉ nhận ứng tuyển khi ở trạng thái PUBLISHED | Ẩn khỏi danh sách ứng tuyển |
| BR-MAT-02 | 1 YCGS chỉ tồn tại 1 lớp ACTIVE tại một thời điểm | Chặn match trùng |
| BR-PEN-01 | Đánh giá xấu liên tiếp / vi phạm nhắc nhở nhiều lần | Cảnh báo giám sát, trung tâm can thiệp |
| BR-AUT-01 | Buổi ATTENDED quá hạn duyệt sẽ bị Auto-Confirm | Trừ tiền + trả lương tự động |

---

## 7. SƠ ĐỒ TRẠNG THÁI DÒNG TIỀN (MONEY FLOW)

```
[Phụ huynh nạp] ─► Ví PHU HUYNH ─┬─ Mua gói ─► Package (10/20 buổi)
                                 │                 │ xác nhận buổi (PIN/Auto)
                                 │                 ▼
                                 │          Trừ 1 buổi gói
                                 │                 │
                                 │    ┌────────────┴───────────┐
                                 │    ▼                        ▼
                                 │ hourlyRate×? (ghi nhận)  tutorWageRate
                                 │                     ─► VÍ LƯƠNG GIA SƯ
                                 │                            │ Payout (kế toán)
                                 │                            ▼
                                 │                    Chuyển khoản ngân hàng
                                 └─ REFUND (hoàn tiền khi hủy/phán quyết)
```

Doanh thu ghi nhận của trung tâm (KPI "Doanh thu gói học") = tổng giá trị gói đã mua; lương gia sư là khoản chi đối ứng theo từng buổi CONFIRMED.

---

## 8. DANH MỤC API THEO NGHIỆP VỤ (tham khảo kỹ thuật)

| Nhóm nghiệp vụ | Endpoint chính |
|---|---|
| Xác thực | `POST /auth/login`, `/auth/register`, `/auth/verify-otp`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/profile-switch` |
| Hồ sơ & CRM | `GET/POST /crm/stats`, `/crm/tutors`, `/crm/tutors/:id/status`, `/crm/tutors/:id/payout`, `/crm/tutor/profile`, `/crm/parent/profile`, `/crm/tutor/bank-accounts`, `/crm/tutor/schedules` |
| Con của phụ huynh | `GET/POST/PUT/DELETE /students` |
| Ví & gói | `POST /wallet/topup`, `GET /wallet/balance`, `POST /packages/purchase`, `GET /classes/:id/packages` |
| Khớp lớp | `POST /tutor-requests`, `GET /tutor-requests`, `/tutor-requests/:id/apply`, `/tutor-requests/:id/applications`, `/tutor-requests/:id/match`, `/classes/:id/trial-resolve` |
| Buổi học | `POST /sessions/attendance`, `GET /sessions`, `/sessions/:id/resolve`, `GET /disputes`, `/disputes/:id/resolve`, `/sessions/trigger-auto-confirm` |
| Nghỉ phép | `POST /leaves/tutor`, `/leaves/tutor/:id/approve`, `/leaves/student`, `/leaves/student/:id/approve`, `GET /leaves` |

---

## 9. TÀI KHOẢN & TRIỂN KHAI

- Tài khoản Admin duy nhất do seed tạo: **`0123456789 / admin123`**, PIN `1234`. Phụ huynh/Gia sư **tự đăng ký** qua web.
- Seed chỉ reset dữ liệu mẫu, **không xóa** tài khoản người dùng tự đăng ký.
- Hướng dẫn chạy hệ thống: xem `Tài khoản/HuongDanChayUngDung.md`. Hướng dẫn thao tác từng vai: xem `HuongDanSuDung.md`.

---
*Tài liệu này đồng bộ với mã nguồn tại thời điểm cập nhật. Khi sửa nghiệp vụ (trạng thái, luật 24h/4h, phân quyền...) cần cập nhật cả SRS.md và tài liệu này.*
