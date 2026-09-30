# ĐẶC TẢ NGHIỆP VỤ: TÀI KHOẢN NGÂN HÀNG & THỐNG KÊ THU NHẬP (TUTOR PORTAL)

> **Mã phân hệ:** TUT-REF-07  
> **Phân hệ:** Cổng Đối tác Gia sư (Tutor Portal)  
> **Đối tượng:** Gia sư (Tutor), Kế toán Trung tâm (Accountant)

---

## 1. Mục Tiêu Nghiệp Vụ

Gia sư cần một công cụ tài chính minh bạch để:
* Quản lý tài khoản ngân hàng chính chủ để trung tâm hoàn cọc khi có biến động.
* Tự động tổng hợp sổ tay thu nhập sau từng buổi dạy, tránh bị phụ huynh nợ hoặc quên trả học phí cuối tháng.
* Xem lịch sử dòng tiền tiền cọc: Lớp nào đã chốt phí, lớp nào được hoàn tiền.

---

## 2. Quản Lý Tài Khoản Ngân Hàng Nhận Tiền (`tutor_bank_accounts`)
* **Số lượng:** Cho phép lưu tối đa **3 tài khoản ngân hàng**.
* **Thông tin khai báo:**
  * Tên ngân hàng: Chọn từ danh sách ngân hàng Việt Nam (Vietcombank, MB Bank, Techcombank, BIDV...).
  * Số tài khoản: Từ 8 đến 16 số.
  * Tên chủ tài khoản: Chữ in hoa không dấu (ví dụ: `NGUYEN VAN AN`).
  * Đặt làm tài khoản nhận tiền mặc định: Có / Không.
* **Bảo mật:** Số tài khoản được mã hóa một phần trên giao diện (chỉ hiện 4 số cuối, ví dụ `**** **** 6789`).

---

## 3. Sổ Tay Thu Nhập & Đối Soát Học Phí Cuối Tháng

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ SỔ TAY ĐỐI SOÁT HỌC PHÍ THÁNG 09/2026                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Lớp Toán 10 - Bé Khôi (CC Hope 3, Long Biên)                             │
│    • Đơn giá: 200,000 đ / buổi                                              │
│    • Số buổi đã dạy trong tháng: 8 buổi (Đã ghi nhật ký đầy đủ)             │
│    • Tổng học phí cần thu: 1,600,000 đ                                      │
│    • Trạng thái: [ĐÃ THANH TOÁN TIỀN MẶT - Ngày 28/09]                      │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. Lớp Tiếng Anh 8 - Bé Linh (Trần Duy Hưng, Cầu Giấy)                       │
│    • Đơn giá: 250,000 đ / buổi                                              │
│    • Số buổi đã dạy trong tháng: 6 buổi                                     │
│    • Tổng học phí cần thu: 1,500,000 đ                                      │
│    • Trạng thái: [CHƯA THANH TOÁN - Dự kiến thanh toán 30/09]               │
├─────────────────────────────────────────────────────────────────────────────┤
│ 💰 TỔNG THU NHẬP THÁNG NÀY: 3,100,000 VNĐ                                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

* **Thao tác chốt tiền:** Khi phụ huynh trả tiền mặt hoặc chuyển khoản, gia sư bấm nút: **"Đánh dấu Đã nhận tiền"** $\rightarrow$ Hệ thống lưu vào lịch sử thu nhập cá nhân.
* **Cảnh báo nhắc nhở:** Nếu quá 5 ngày sau chu kỳ tháng mà phụ huynh chưa trả học phí, gia sư có thể bấm **"Nhờ trung tâm hỗ trợ nhắc nợ"** để bộ phận CSKH gọi điện hỗ trợ đòi quyền lợi thù lao cho gia sư.

---

## 4. Quản Lý Dòng Tiền Tiền Cọc Nhận Lớp (Deposit History)
Màn hình chi tiết theo dõi từng khoản cọc:
* **Mã lớp:** `SAM207`.
* **Số tiền cọc:** 500,000 đ.
* **Hình thức:** Chuyển khoản VietQR ngày 15/09/2026.
* **Trạng thái:**
  * `HELD`: Đang giữ trong đợt dạy thử.
  * `CONFIRMED_FEE`: Đã chốt lớp thành công (chuyển thành phí môi giới).
  * `REFUNDED_FULL`: Đã hoàn tiền 100% về STK ngân hàng (Kèm mã FT2409...).
  * `REFUNDED_PARTIAL`: Đã hoàn 50% tiền cọc do giảm số buổi.
  * `FORFEITED`: Bị tịch thu cọc do vi phạm bỏ dạy.
