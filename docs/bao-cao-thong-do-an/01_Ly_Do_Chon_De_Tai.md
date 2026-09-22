# 📄 BÁO CÁO THÔNG ĐỒ ÁN: LÝ DO CHỌN ĐỀ TÀI

> **Đề tài:** Xây dựng Hệ thống Web CRM Quản lý và Kết nối Trung tâm Gia sư Trực tuyến  
> **Học phần:** Đồ án Tốt nghiệp / Báo cáo Tiến độ Đồ án Chuyên ngành  
> **Nền tảng:** Web Application (Web Browser-First & Responsive Web / PWA)  
> **Mô hình cốt lõi:** Sàn Kết nối Tự động hóa (Automated Marketplace) kết hợp Quản trị Khách hàng & Đối soát Cọc Minh bạch (Pure CRM).

---

## 1. Tính Cấp Thiết Của Đề Tài (Background & Problem Statement)

### 1.1. Thực trạng bùng nổ nhu cầu giáo dục bổ trợ tại Việt Nam
* Tại Việt Nam, việc đầu tư cho giáo dục luôn là ưu tiên hàng đầu của mọi gia đình. Theo các nghiên cứu xã hội học, chi phí dành cho việc học tập của con cái chiếm từ **30% đến 45% tổng thu nhập** của các hộ gia đình đô thị.
* Áp lực từ các kỳ thi chuyển cấp (vào lớp 6 chất lượng cao, vào lớp 10 THPT công lập, thi tốt nghiệp THPT và xét tuyển Đại học) khiến nhu cầu tìm kiếm gia sư dạy kèm 1-1 tại nhà tăng trưởng vượt bậc qua từng năm.
* Lực lượng gia sư tại Việt Nam vô cùng đông đảo, chủ yếu gồm **hàng trăm nghìn sinh viên** các trường đại học lớn (Sư Phạm, Bách Khoa, Ngoại Thương, Kinh Tế...) có nhu cầu làm thêm chính đáng, cùng đội ngũ **giáo viên tự do** muốn nâng cao thu nhập.

### 1.2. Những "nỗi đau" nhức nhối của thị trường gia sư truyền thống
Mặc dù nhu cầu cung - cầu đều rất lớn, thị trường gia sư hiện nay vẫn vận hành theo phương thức phân tán, thiếu quy chuẩn và tồn tại nhiều vấn nạn nghiêm trọng:

```text
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                  3 NỖI ĐAU CỐT LÕI CỦA THỊ TRƯỜNG GIA SƯ HIỆN TẠI                    │
├──────────────────────┬───────────────────────────────┬───────────────────────────────┤
│ 1. ĐỐI VỚI PHỤ HUYNH │ 2. ĐỐI VỚI GIA SƯ (SINH VIÊN) │ 3. ĐỐI VỚI TRUNG TÂM MÔI GIỚI │
├──────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ • Sợ bị lừa đảo thông│ • Nỗi ám ảnh "TRUNG TÂM MA":  │ • Quản lý thủ công bằng sổ    │
│   tin gia sư ảo.     │   Bị lừa đóng tiền cọc nhận   │   sách, file Excel, tin nhắn  │
│ • Bị ép nạp tiền mua │   lớp (40-50% tháng lương)    │   Zalo rời rạc, dễ sót việc.  │
│   gói trước khi học. │   xong bị phụ huynh ảo hủy    │ • Tốn chi phí nuôi đội ngũ    │
│ • Khó đổi gia sư khi │   kèo mà không đòi lại được.  │   telesales gọi điện làm phiền│
│   dạy không hiệu quả.│ • Gia sư bùng kèo, bỏ lớp vô  │ • Không đối soát được số buổi │
│ • Thiếu công cụ theo │   trách nhiệm vì không có cơ  │   học thực tế hàng tháng giữa │
│   dõi tiến độ của con│   chế ràng buộc cam kết.      │   phụ huynh và gia sư.        │
└──────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

---

## 2. Bất Cập Của Các Giải Pháp Hiện Có Trên Thị Trường

Hiện nay, các giải pháp chắp vá trên thị trường đều bộc lộ nhiều khuyết điểm lớn:

1. **Các Hội nhóm Facebook / Zalo tự phát:**
   * Thông tin lớp học và hồ sơ gia sư hoàn toàn ẩn danh, không được xác thực danh tính (KYC).
   * Là "mảnh đất màu mỡ" của các đối tượng lừa đảo cọc sinh viên, môi giới không có pháp nhân bảo lãnh.
   * Hoàn toàn không có chế tài xử phạt khi gia sư bỏ dạy giữa chừng hoặc phụ huynh quỵt tiền học phí.

2. **Các Hệ thống ứng dụng đóng gói cũ (Mô hình Ví trả trước / Nạp gói học):**
   * Ép phụ huynh phải nạp ví hàng triệu đồng để mua gói 10 - 20 buổi học trước khi biết mặt gia sư $\rightarrow$ Tạo tâm lý e ngại mất tiền, tỷ lệ từ bỏ dịch vụ (Drop-off) lên tới 60-70%.
   * Ép người dùng phải tải Native App dung lượng lớn trên App Store / Google Play, bắt đăng ký tài khoản phức tạp.
   * Cơ chế trừ tiền buổi học qua mã OTP/mã PIN gượng ép, không phù hợp với thói quen trả tiền trực tiếp (tiền mặt/chuyển khoản) cuối tháng của người Việt Nam.
   * Cào bằng mọi gia sư như nhau, không phân định số buổi dạy thử giữa Giáo viên chuyên nghiệp và Sinh viên.

---

## 3. Mục Tiêu Nghiên Cứu & Hướng Tiếp Cận Đột Phá Của Đề Tài

Xuất phát từ thực tiễn trên, đề tài **"Xây dựng Hệ thống Web CRM Quản lý và Kết nối Trung tâm Gia sư Trực tuyến"** được nghiên cứu và phát triển với mục tiêu giải quyết triệt để bài toán niềm tin và tối ưu hóa chi phí vận hành:

### 3.1. Mô hình kinh doanh thực tế, nhân văn và an toàn:
* **Phụ huynh (Khách hàng):** **Miễn phí 100% đăng tuyển**. Không ép nạp ví trước. Được trải nghiệm dạy thử (**Giáo viên 1 buổi, Sinh viên 2 buổi**) để đánh giá chất lượng; ưng ý mới chốt lớp. Thanh toán học phí trực tiếp cho gia sư cuối tháng. Cam kết **Bảo hành đổi gia sư miễn phí trong 30 ngày (SLA 24 giờ)**.
* **Gia sư (Đối tác):** Nhận lớp có trách nhiệm thông qua **Khoản tiền cọc cam kết (500,000 đ qua VietQR)**. Hệ thống bảo vệ gia sư bằng **Cơ chế trọng tài đối soát cọc minh bạch: Hoàn trả 100% tiền cọc trong 24 giờ nếu lỗi do phía phụ huynh**.
* **Trung tâm (Đơn vị vận hành):** Đóng vai trò là nền tảng quản trị thông minh (Pure CRM), đảm bảo tính minh bạch, hỗ trợ ghép lớp và làm trọng tài bảo vệ quyền lợi chính đáng cho cả 2 bên.

### 3.2. Đột phá về công nghệ & trải nghiệm người dùng:
* **Nền tảng 100% Web Trình duyệt (Web Browser-First & Responsive Web):** Tiếp cận tức thì (Zero-Install), không bắt người dùng cài app. Chạy mượt mà trên cả máy tính để bàn (Desktop/Laptop) và trình duyệt điện thoại (Mobile Web).
* **Tự động hóa 100% (Zero-Touch Ingestion):** Phụ huynh đăng tin trên web $\rightarrow$ Hệ thống tự duyệt và đẩy lên sàn lớp trong 1 giây $\rightarrow$ Thuật toán **Smart Matching Engine** tự động quét và bắn chuông thông báo Web tới Top 5 gia sư phù hợp nhất. **Loại bỏ hoàn toàn đội ngũ telesales gọi điện làm phiền khách hàng.**
* **Thanh toán VietQR động:** Sinh mã QR chứa số tiền và cú pháp chuẩn, lắng nghe Webhook ngân hàng tự động mở khóa lớp tức thì.
* **Hệ thống Điểm tín nhiệm Karma (100 điểm khởi tạo):** Xây dựng hồ sơ uy tín lâu dài cho gia sư, thưởng điểm người dạy tốt, trừng phạt và khóa tài khoản gia sư bùng kèo.

---

## 4. Ý Nghĩa Khoa Học & Thực Tiễn Của Đề Tài

### 4.1. Về mặt học thuật và kỹ thuật:
* Ứng dụng quy trình **Kỹ nghệ phần mềm chuẩn mực (Software Engineering)**: Từ phân tích yêu cầu nghiệp vụ (BRS), thiết kế cơ sở dữ liệu quan hệ chuẩn hóa, xây dựng kiến trúc liên cổng (Cross-Portal Architecture) đến triển khai API RESTful và WebSocket thời gian thực.
* Xây dựng thuật toán gợi ý đa trọng số (**Smart Matching Engine**) kết hợp giữa chuyên môn, thời gian rảnh, khu vực địa bàn và chỉ số uy tín.
* Hiện thực hóa mô hình phân quyền chặt chẽ (**Role-Based Access Control - RBAC**) và kiểm toán an toàn tài chính (**Immutable Audit Trail**).

### 4.2. Về mặt thực tiễn đời sống:
* **Tạo dựng một môi trường kết nối văn minh, an toàn:** Xóa bỏ hoàn toàn nạn lừa đảo cọc đối với sinh viên và đem lại sự an tâm tuyệt đối cho các bậc phụ huynh.
* **Thúc đẩy chuyển đổi số ngành giáo dục:** Số hóa hoàn toàn quy trình tìm kiếm, xếp lịch học, ghi nhật ký giảng dạy và đối soát học phí cuối tháng.
* **Tính khả thi thương mại cao:** Mô hình có thể đưa vào vận hành thực tế ngay tại các trung tâm gia sư hoặc nhân rộng thành sàn thương mại dịch vụ giáo dục trên toàn quốc.
