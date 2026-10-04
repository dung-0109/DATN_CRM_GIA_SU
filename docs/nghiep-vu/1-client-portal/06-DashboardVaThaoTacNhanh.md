# ĐẶC TẢ NGHIỆP VỤ: TỔNG QUAN DASHBOARD & THAO TÁC NHANH (CLIENT PORTAL)

> **Mã phân hệ:** CLI-REF-06  
> **Phân hệ:** Cổng Khách hàng (Client Portal)  
> **Đối tượng:** Phụ huynh (Parent)

---

## 1. Mục Tiêu Nghiệp Vụ
Dashboard của Phụ huynh được thiết kế theo hướng **Hành động nhanh (Action-Oriented)**. Thay vì hiển thị quá nhiều biểu đồ phức tạp, hệ thống tập trung cung cấp các cảnh báo quan trọng và lối tắt (shortcuts) đến những tác vụ mà phụ huynh thường xuyên sử dụng nhất, giúp tối ưu hóa thời gian tương tác.

## 2. Giao Diện "Thao Tác Nhanh" (Quick Actions)
Khu vực thao tác nhanh được đặt ngay vị trí trang trọng nhất (đầu trang), cung cấp các liên kết tức thì (1-click navigation) đến các chức năng cốt lõi:
1. **Quản lý Con cái:** Truy cập danh sách hồ sơ các con trong gia đình.
2. **Yêu cầu gia sư:** Xem danh sách các yêu cầu tìm gia sư đã đăng (có hiển thị kèm số lượng yêu cầu đang chờ xử lý).
3. **Báo Nghỉ & Dời Lịch:** Xử lý nhanh các trường hợp con ốm, bận đột xuất cần báo cho trung tâm và gia sư.
4. **Đánh Giá Dạy Thử:** Lối tắt để phụ huynh vào chấm điểm, nhận xét gia sư sau đợt dạy thử.
5. **Nút "Đăng Ký Tìm Gia Sư" nổi bật:** Khuyến khích phụ huynh tạo yêu cầu mới mọi lúc.

## 3. Cảnh Báo Thông Minh (Smart Alert Banners)
Hệ thống tích hợp các banner cảnh báo thông minh tự động xuất hiện dựa trên bối cảnh dữ liệu của phụ huynh:
* **Cảnh báo thiếu thông tin địa chỉ:** Nếu hồ sơ Phụ huynh chưa cập nhật `address, district, province`, một banner cảnh báo màu cam sẽ tự động hiện lên với thông điệp: *"Bạn chưa hoàn thiện địa chỉ giao dịch. Cập nhật ngay địa chỉ chi tiết để hệ thống dễ dàng gợi ý và ưu tiên các gia sư ở gần khu vực của bạn nhất."*
* Giúp tăng tỷ lệ thu thập dữ liệu chính xác cho thuật toán Smart Matching mà không cần ép buộc người dùng điền ngay từ bước đăng ký.

## 4. Bảng Thống Kê (Metric Badges)
Các chỉ số quan trọng được tổng hợp nhanh bằng các thẻ thông tin (Badges):
* Tổng số hồ sơ Học sinh.
* Số lượng Lớp học Đang dạy chính thức.
* Các yêu cầu tìm gia sư đang ở trạng thái Chờ (Pending).

## 5. Trải Nghiệm Người Dùng (UX) Nâng Cao
* **Toast Notifications:** Tương tự như Admin CRM, mọi phản hồi hệ thống tại Client Portal (khiếu nại buổi học thành công, đăng ký gia sư thành công, v.v.) đều sử dụng Toast Notifications (`react-hot-toast`), thân thiện, tự động ẩn và không gây gián đoạn luồng sử dụng như các popup `alert()` thông thường.
