# 📘 HƯỚNG DẪN SỬ DỤNG CHI TIẾT
## Hệ thống Quản lý Phòng khám Nha khoa
### Phiên bản Tiếng Việt (vi-VN)

---

**Phiên bản tài liệu:** 1.0.0  
**Ngày cập nhật:** 13/02/2026  
**Dành cho:** Người dùng cuối

---

## 📖 MỤC LỤC

1. [Tổng quan Hệ thống](#1-tổng-quan-hệ-thống)
2. [Truy cập và Khởi động](#2-truy-cập-và-khởi-động)
3. [Giao diện Chính](#3-giao-diện-chính)
4. [Quản lý Bệnh nhân](#4-quản-lý-bệnh-nhân)
5. [Quản lý Lịch hẹn](#5-quản-lý-lịch-hẹn)
6. [Tìm kiếm và Lọc](#6-tìm-kiếm-và-lọc)
7. [Làm việc với Bảng Dữ liệu](#7-làm-việc-với-bảng-dữ-liệu)
8. [Xử lý Lỗi Thường gặp](#8-xử-lý-lỗi-thường-gặp)
9. [Mẹo và Thủ thuật](#9-mẹo-và-thủ-thuật)
10. [Câu hỏi Thường gặp](#10-câu-hỏi-thường-gặp)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Hệ thống làm gì?

Hệ thống Quản lý Phòng khám Nha khoa giúp bạn:

✅ **Quản lý Bệnh nhân:**
- Lưu trữ thông tin cá nhân (họ tên, năm sinh, giới tính)
- Quản lý số điện thoại và địa chỉ liên hệ
- Theo dõi lịch sử khám và điều trị

✅ **Quản lý Lịch hẹn:**
- Đặt và theo dõi lịch hẹn khám
- Ghi chú chẩn đoán và phương pháp điều trị  
- Quản lý chi phí điều trị (VNĐ)
- Đánh dấu nhu cầu điều trị đặc biệt (Implant, Hàm giả, Chỉnh nha)

✅ **Tìm kiếm và Thống kê:**
- Tìm nhanh theo tên hoặc số điện thoại
- Lọc theo loại điều trị
- Xem tổng quan dữ liệu

### 1.2. Đặc điểm Bản địa hóa Việt Nam

Hệ thống được thiết kế đặc biệt cho Việt Nam với:

📅 **Ngày tháng:** dd/mm/yyyy (31/12/2025)  
💰 **Tiền tệ:** Đồng Việt Nam (₫) - 1.000.000₫  
📱 **Số điện thoại:** 10-11 số (09x, 08x, 07x, 05x, 03x, 02x)  
🇻🇳 **Giao diện:** 100% Tiếng Việt

### 1.3. Yêu cầu Hệ thống

**Trình duyệt:** Chrome/Edge/Firefox (phiên bản mới)  
**Kết nối:** Internet ổn định (tối thiểu 1 Mbps)  
**Màn hình:** Tối thiểu 1024x768 pixels  
**Thiết bị:** Desktop/Laptop (khuyến nghị), Tablet (hỗ trợ)

---

## 2. TRUY CẬP VÀ KHỞI ĐỘNG

### 2.1. Mở Hệ thống

**Bước 1:** Mở trình duyệt web  
**Bước 2:** Nhập địa chỉ: `http://localhost:8080` (hoặc địa chỉ do quản trị viên cung cấp)  
**Bước 3:** Nhấn Enter và chờ hệ thống tải (vài giây)

### 2.2. Kiểm tra Kết nối

Sau khi trang tải, kiểm tra góc trên bên phải:

- **● Trực tuyến** (xanh lá) = Kết nối tốt ✅
- **● Ngoại tuyến** (đỏ) = Mất kết nối ⚠️  
- **Đang kết nối...** (xám) = Đang kiểm tra 🔄

**Nếu hiện "Ngoại tuyến":**
1. Kiểm tra kết nối internet
2. Liên hệ quản trị viên kiểm tra server
3. Thử tải lại trang (F5)

### 2.3. Lưu Bookmark

Để truy cập nhanh sau này:
- **Chrome/Edge:** Nhấn Ctrl+D
- **Firefox:** Nhấn Ctrl+D
- Đặt tên và lưu vào thư mục yêu thích

---

## 3. GIAO DIỆN CHÍNH

### 3.1. Cấu trúc Màn hình

```
┌─────────────────────────────────────────────────────┐
│ 🦷 Quản lý Phòng khám Nha khoa    [● Trực tuyến]   │ ← HEADER
├─────────────────────────────────────────────────────┤
│ [➕ Bệnh nhân mới] [✏️ Sửa BN] [📅 Lịch hẹn mới]  │ ← NÚT CHÍNH
├─────────────────────────────────────────────────────┤
│ 🔍 [Tìm theo tên bệnh nhân hoặc số điện thoại...] │ ← TÌM KIẾM
├─────────────────────────────────────────────────────┤
│ Lọc: □ Implant  □ Hàm giả  □ Chỉnh nha            │ ← BỘ LỌC
├─────────────────────────────────────────────────────┤
│ Tìm thấy 25 lịch hẹn                               │ ← KẾT QUẢ
├─────────────────────────────────────────────────────┤
│ [BẢNG DỮ LIỆU LỊCH HẸN]                           │ ← BẢNG
└─────────────────────────────────────────────────────┘
```

### 3.2. Ba Nút Chính

**1. ➕ Bệnh nhân mới**
- Thêm bệnh nhân mới vào hệ thống
- Nhấn khi có bệnh nhân lần đầu đến khám

**2. ✏️ Sửa bệnh nhân**  
- Chỉnh sửa hoặc xóa thông tin bệnh nhân
- Dùng khi cần cập nhật số điện thoại, địa chỉ

**3. 📅 Lịch hẹn mới**
- Tạo lịch hẹn khám cho bệnh nhân
- Dùng khi đặt lịch hoặc ghi nhận buổi khám

---

## 4. QUẢN LÝ BỆNH NHÂN

### 4.1. Thêm Bệnh nhân Mới

**Bước 1:** Nhấn **"➕ Bệnh nhân mới"**

**Bước 2:** Điền thông tin trong form:

#### **Họ và tên** (Bắt buộc*)
- Gõ tên đầy đủ của bệnh nhân
- Tối thiểu 2 ký tự
- Ví dụ: Nguyễn Văn An, Trần Thị Bích Ngọc

#### **Năm sinh** (Bắt buộc*)  
- Gõ 4 chữ số năm sinh
- Phạm vi: 1900 đến năm hiện tại
- Ví dụ: 1990, 1985, 2005

#### **Giới tính** (Bắt buộc*)
- Chọn từ dropdown: Nam / Nữ / Khác
- Nhấp vào dropdown và chọn

#### **Số điện thoại** (Bắt buộc*)
- Gõ 10-11 số
- Đầu số hợp lệ: 09x, 08x, 07x, 05x, 03x, 02x
- Ví dụ: 0912345678, 0987654321
- ⚠️ Không được trùng với bệnh nhân khác

#### **Địa chỉ** (Bắt buộc*)
- Gõ địa chỉ đầy đủ
- Bao gồm: số nhà, đường, phường, quận, thành phố
- Ví dụ: 123 Phố Huế, Hai Bà Trưng, Hà Nội

**Bước 3:** Kiểm tra lại thông tin

**Bước 4:** Nhấn **"Lưu"**
- Nếu thành công: Thông báo ✅ "Đã tạo bệnh nhân thành công!"
- Nếu lỗi: Sửa các trường có thông báo màu đỏ

### 4.2. Sửa Bệnh nhân

**Bước 1:** Nhấn **"✏️ Sửa bệnh nhân"**

**Bước 2:** Chọn bệnh nhân từ dropdown
- Danh sách hiện dạng: "Nguyễn Văn A (0912345678)"
- Nhấp vào bệnh nhân cần sửa

**Bước 3:** Xem thông báo số lịch hẹn
- Ví dụ: "ℹ️ Bệnh nhân này có 3 lịch hẹn"
- Quan trọng khi muốn xóa

**Bước 4:** Sửa thông tin cần thiết
- Có thể sửa bất kỳ trường nào
- Quy tắc validation vẫn áp dụng

**Bước 5:** Nhấn **"Lưu"**
- Thông báo: ✅ "Đã cập nhật bệnh nhân thành công!"

### 4.3. Xóa Bệnh nhân

⚠️ **CẢNH BÁO: KHÔNG THỂ HOÀN TÁC!**

**Bước 1:** Mở form "Sửa bệnh nhân"

**Bước 2:** Chọn bệnh nhân cần xóa

**Bước 3:** Kiểm tra số lịch hẹn sẽ bị xóa
- Xóa bệnh nhân = Xóa TOÀN BỘ lịch hẹn của họ

**Bước 4:** Nhấn nút **"Xóa"** (màu đỏ, góc dưới trái)

**Bước 5:** Đọc kỹ cảnh báo xác nhận
```
Xóa bệnh nhân này?

Bệnh nhân: Nguyễn Văn A
Năm sinh: 1990
Số điện thoại: 0912345678

⚠️ CẢNH BÁO: Thao tác này sẽ:
• Xóa vĩnh viễn thông tin bệnh nhân
• Xóa TẤT CẢ 5 lịch hẹn liên quan
• KHÔNG THỂ KHÔI PHỤC

Bạn có chắc chắn muốn tiếp tục?

[Hủy]  [OK]
```

**Bước 6:** Quyết định
- **Hủy:** Không xóa gì, an toàn
- **OK:** Xóa vĩnh viễn, không thể khôi phục

---

## 5. QUẢN LÝ LỊCH HẸN

### 5.1. Tạo Lịch hẹn Mới

**Bước 1:** Nhấn **"📅 Lịch hẹn mới"**

**Bước 2:** Điền thông tin:

#### **Bệnh nhân** (Bắt buộc*)
- Chọn từ dropdown
- Hiện dạng: "Nguyễn Văn A (1990) - 0912345678"
- Nếu không tìm thấy → Cần thêm bệnh nhân trước

#### **Ngày hẹn** (Bắt buộc*)
- **Định dạng:** dd/mm/yyyy
- **Cách nhập:**
  - Gõ thủ công: 15/12/2025
  - Hoặc nhấn biểu tượng 📅 chọn từ lịch
- ⚠️ **LƯU Ý:** Phải gõ dd/mm/yyyy, KHÔNG phải mm/dd/yyyy

#### **Chẩn đoán** (Bắt buộc*)
- Ghi kết quả khám và chẩn đoán
- Ví dụ:
  - Sâu răng hàm 6 hàm trên bên phải
  - Viêm nướu nặng, chảy máu nướu
  - Mất răng số 1 và số 2

#### **Điều trị** (Bắt buộc*)
- Ghi phương pháp điều trị
- Ví dụ:
  - Trám răng composite
  - Nhổ răng khôn hàm dưới
  - Lấy cao răng, đánh bóng

#### **Chi phí (₫)** (Bắt buộc*)
- Chỉ gõ **số**, không gõ dấu chấm
- Ví dụ: 500000 → Hiển thị: **500.000₫**
- Phải ≥ 0 (không âm)

#### **Nhu cầu điều trị** (Không bắt buộc)
- ☐ Cần Implant
- ☐ Cần hàm giả  
- ☐ Cần chỉnh nha
- Có thể chọn 0, 1, 2 hoặc cả 3

**Bước 3:** Nhấn **"Lưu"**
- Thành công: ✅ "Đã tạo lịch hẹn thành công!"

### 5.2. Sửa Lịch hẹn

**Bước 1:** Tìm lịch hẹn trong bảng

**Bước 2:** Nhấn biểu tượng **✏️** (bút chì) ở cuối dòng

**Bước 3:** Form mở với thông tin đã điền sẵn

**Bước 4:** Sửa các trường cần thiết

**Bước 5:** Nhấn **"Lưu"**
- Thông báo: ✅ "Đã cập nhật lịch hẹn thành công!"

### 5.3. Xóa Lịch hẹn

⚠️ **CẢNH BÁO: KHÔNG THỂ HOÀN TÁC!**

**Bước 1:** Tìm lịch hẹn trong bảng

**Bước 2:** Nhấn biểu tượng **🗑️** (thùng rác, màu đỏ)

**Bước 3:** Đọc cảnh báo xác nhận
```
Xóa lịch hẹn này?

Bệnh nhân: Nguyễn Văn A
Ngày: 15/12/2025
Chẩn đoán: Sâu răng hàm 6
Điều trị: Trám răng composite
Chi phí: 500.000₫

Thao tác này không thể hoàn tác.

[Hủy]  [OK]
```

**Bước 4:** Nhấn "OK" để xóa hoặc "Hủy" để giữ lại

---

## 6. TÌM KIẾM VÀ LỌC

### 6.1. Tìm kiếm

**Vị trí:** Thanh tìm kiếm dưới các nút chính

**Cách dùng:**
1. Nhấp vào ô tìm kiếm
2. Gõ tên bệnh nhân hoặc số điện thoại
3. Chờ 0.5 giây → Kết quả tự động hiện

**Đặc điểm:**
- ✅ Tìm ngay lập tức (real-time)
- ✅ Không cần nhấn Enter
- ✅ Không phân biệt chữ hoa/thường

**Ví dụ:**
- Gõ `Nguyễn` → Hiện tất cả họ Nguyễn
- Gõ `0912` → Hiện số bắt đầu bằng 0912
- Gõ `Nguyễn Văn A` → Hiện bệnh nhân cụ thể

**Xóa tìm kiếm:**
- Nhấn nút [×] bên phải
- Hoặc xóa thủ công (Ctrl+A → Delete)

### 6.2. Lọc theo Điều trị

**Vị trí:** Dưới thanh tìm kiếm

**3 checkbox:**
- ☐ Cần Implant
- ☐ Cần hàm giả
- ☐ Cần chỉnh nha

**Cách dùng:**
1. Nhấp checkbox muốn lọc
2. Dấu ✓ xuất hiện
3. Bảng tự động cập nhật

**Chọn nhiều:**
- Có thể chọn 1, 2 hoặc cả 3
- Hiện lịch hẹn có BẤT KỲ điều kiện nào (OR)

**Xóa lọc:**
- Nhấn "Xóa bộ lọc"
- Hoặc bỏ chọn từng checkbox

### 6.3. Kết hợp Tìm kiếm + Lọc

**Ví dụ 1:**
```
Tìm: "Nguyễn"
Lọc: ☑ Cần Implant

→ Kết quả: Chỉ người họ Nguyễn VÀ cần Implant
```

**Ví dụ 2:**
```
Tìm: "09"  
Lọc: ☑ Cần hàm giả ☑ Cần chỉnh nha

→ Kết quả: Số bắt đầu 09 VÀ (cần hàm giả HOẶC chỉnh nha)
```

---

## 7. LÀM VIỆC VỚI BẢNG DỮ LIỆU

### 7.1. Các Cột trong Bảng

| Cột | Nội dung | Ví dụ |
|-----|----------|-------|
| Ngày hẹn | Ngày khám | 15/12/2025 |
| Bệnh nhân | Họ tên | Nguyễn Văn A |
| Năm sinh | Năm sinh | 1990 |
| Giới tính | Nam/Nữ/Khác | Nam |
| Số điện thoại | SĐT liên hệ | 0912345678 |
| Địa chỉ | Địa chỉ nhà | 123 Phố Huế... |
| Chẩn đoán | Kết quả khám | Sâu răng hàm 6 |
| Điều trị | Phương pháp | Trám răng |
| Cần | Nhu cầu đặc biệt | Implant, Hàm giả |
| Chi phí | Số tiền | 500.000₫ |
| Thao tác | Nút sửa/xóa | ✏️ 🗑️ |

### 7.2. Đọc Dữ liệu

**Ví dụ một dòng:**
```
15/12/2025 | Nguyễn Văn A | 1990 | Nam | 0912345678 | 
123 Phố Huế | Sâu răng | Trám răng | Hàm giả | 
500.000₫ | ✏️ 🗑️
```

**Hiểu:**
- Ngày 15/12/2025
- Bệnh nhân: Nguyễn Văn A, 36 tuổi (2026-1990)
- Nam, SĐT 0912345678
- Địa chỉ: 123 Phố Huế
- Chẩn đoán: Sâu răng
- Điều trị: Trám răng
- Cần: Hàm giả
- Chi phí: 500.000 đồng

### 7.3. Tooltip (Chú thích)

**Cột có tooltip:**
- Địa chỉ (nếu dài)
- Chẩn đoán (nếu dài)
- Điều trị (nếu dài)

**Cách xem:**
- Di chuột qua ô bị cắt ngắn
- Giữ 1 giây → Popup hiện nội dung đầy đủ

### 7.4. Các Trạng thái Bảng

**Đang tải:**
```
🔄 Đang tải lịch hẹn...
```
Chờ vài giây.

**Không có dữ liệu:**
```
Không tìm thấy lịch hẹn nào
```
Hãy thêm lịch hẹn đầu tiên.

**Không có kết quả tìm kiếm:**
```
Không có kết quả phù hợp.
Hãy thử từ khóa hoặc bộ lọc khác.
```
Thử từ khóa khác hoặc bỏ lọc.

---

## 8. XỬ LÝ LỖI THƯỜNG GẶP

### 8.1. Lỗi Kết nối

**Triệu chứng:**
- Chỉ báo: "● Ngoại tuyến" (màu đỏ)
- Thông báo: "Không thể kết nối với máy chủ..."

**Nguyên nhân:**
- Mất kết nối internet
- Server chưa khởi động
- Firewall chặn

**Giải pháp:**
1. Kiểm tra internet (thử vào google.com)
2. Liên hệ quản trị viên kiểm tra server
3. Tải lại trang (F5)

### 8.2. Lỗi Validation

**Lỗi thường gặp:**

| Thông báo | Nguyên nhân | Giải pháp |
|-----------|-------------|-----------|
| "Vui lòng nhập họ tên" | Bỏ trống | Điền họ tên |
| "Họ tên phải có ít nhất 2 ký tự" | Gõ 1 ký tự | Gõ tên đầy đủ |
| "Năm sinh không hợp lệ" | Gõ 2 chữ số | Gõ 4 chữ số (vd: 1990) |
| "Số điện thoại không hợp lệ" | Sai độ dài | Gõ 10-11 số |
| "Số đã được sử dụng" | Trùng SĐT | Kiểm tra, dùng Sửa |
| "Chi phí phải là số dương" | Gõ âm/chữ | Gõ số dương |

### 8.3. Lỗi Định dạng Ngày

**Sai:**
- ❌ 12/15/2025 (định dạng Mỹ)
- ❌ 15-12-2025 (dấu gạch ngang)
- ❌ 15/12/25 (năm 2 chữ số)

**Đúng:**
- ✅ 15/12/2025 (dd/mm/yyyy)

**Giải pháp:**
- Luôn dùng Date Picker (nhấn biểu tượng 📅)
- Hoặc gõ chính xác dd/mm/yyyy

### 8.4. Xóa Nhầm

**Thực tế:** KHÔNG THỂ KHÔI PHỤC

**Giải pháp:**
1. Chấp nhận mất dữ liệu
2. Nhập lại nếu còn nhớ
3. Liên hệ quản trị viên (có thể có backup)

**Phòng tránh:**
- Đọc kỹ xác nhận trước khi xóa
- Kiểm tra thông tin hiển thị
- Nếu không chắc → Đừng xóa

---

## 9. MẸO VÀ THỦ THUẬT

### 9.1. Phím tắt Hữu ích

| Phím | Chức năng |
|------|-----------|
| F5 | Tải lại trang |
| Ctrl+F | Tìm trong trang |
| Tab | Chuyển ô tiếp theo |
| Ctrl+A | Chọn tất cả |
| Ctrl+C | Copy |
| Ctrl+V | Paste |

### 9.2. Nhập liệu Nhanh

**Chuẩn bị trước:**
- Yêu cầu bệnh nhân viết thông tin ra giấy
- Gom hết dữ liệu một lúc
- Nhập liệu một mạch

**Dùng Template:**
- Lưu các chẩn đoán/điều trị thường gặp vào Notepad
- Copy khi cần
- Sửa chi tiết cụ thể

### 9.3. Tránh Lỗi

**Checklist trước khi Lưu:**

**Bệnh nhân:**
- [ ] Họ tên đúng chính tả
- [ ] Năm sinh 4 chữ số
- [ ] Giới tính đã chọn
- [ ] SĐT 10-11 số, không trùng
- [ ] Địa chỉ đầy đủ

**Lịch hẹn:**
- [ ] Chọn đúng bệnh nhân
- [ ] Ngày đúng dd/mm/yyyy
- [ ] Chẩn đoán rõ ràng
- [ ] Điều trị đầy đủ
- [ ] Chi phí ≥ 0
- [ ] Checkbox (nếu cần)

### 9.4. Quản lý Hiệu quả

**Hàng tuần:**
- Lọc "Cần Implant" → Gọi điện tư vấn
- Lọc "Cần hàm giả" → Sắp xếp lịch
- Follow-up bệnh nhân

**Hàng tháng:**
- Thống kê số lịch hẹn
- Tính tổng doanh thu
- Lập kế hoạch

**Backup định kỳ:**
- Copy dữ liệu sang Excel
- Lưu vào nhiều nơi
- Phòng trường hợp mất dữ liệu

---

## 10. CÂU HỎI THƯỜNG GẶP

### Q1: Hệ thống có hoạt động offline không?

**A:** KHÔNG. Cần kết nối internet để:
- Truy cập server
- Lưu/tải dữ liệu
- Đồng bộ giữa nhiều người dùng

### Q2: Có tự động lưu không?

**A:** KHÔNG. Phải nhấn "Lưu" để lưu dữ liệu.
- Nhấn "Hủy" = Mất dữ liệu
- Đóng form = Mất dữ liệu

### Q3: Dữ liệu có được backup không?

**A:** Phụ thuộc cấu hình quản trị viên.
- Hỏi quản trị viên về chính sách backup
- Khuyến nghị: Backup hàng ngày

### Q4: Có giới hạn số lượng không?

**A:** KHÔNG giới hạn cứng.
- Tùy vào dung lượng database
- Thường đủ cho phòng khám nhỏ/trung

### Q5: Có thể xuất Excel/PDF không?

**A:** Không có tính năng tự động.
- Workaround: Copy bảng → Paste vào Excel
- Hoặc Ctrl+P → Save as PDF

### Q6: Xóa bệnh nhân ảnh hưởng gì?

**A:** Xóa TOÀN BỘ:
- Thông tin bệnh nhân
- TẤT CẢ lịch hẹn
- Lịch sử điều trị
- KHÔNG THỂ KHÔI PHỤC

### Q7: Một bệnh nhân có bao nhiêu lịch hẹn?

**A:** KHÔNG GIỚI HẠN.
- Có thể 1, 10, 100 lịch hẹn
- Mỗi lần khám = 1 lịch hẹn

### Q8: Có thể gộp bệnh nhân trùng không?

**A:** Không tự động.
- Phải chuyển lịch hẹn thủ công
- Sau đó xóa bệnh nhân trùng

### Q9: Tìm kiếm phân biệt chữ hoa/thường?

**A:** KHÔNG.
- "nguyen" = "Nguyen" = "NGUYEN"

### Q10: Lọc nhiều checkbox hoạt động thế nào?

**A:** Điều kiện OR (HOẶC).
- ☑ Implant ☑ Hàm giả = Cần Implant HOẶC Hàm giả

---

## 📞 LIÊN HỆ HỖ TRỢ

### Khi nào cần Liên hệ?

- Không kết nối được > 15 phút
- Lỗi lặp lại nhiều lần
- Mất dữ liệu quan trọng
- Cần training thêm

### Thông tin Cần chuẩn bị

1. Mô tả vấn đề cụ thể
2. Thời điểm xảy ra
3. Các bước đã thử
4. Ảnh chụp màn hình lỗi
5. Trình duyệt & hệ điều hành đang dùng

### Kênh Hỗ trợ

(Liên hệ quản trị viên để biết kênh hỗ trợ cụ thể)

---

## 🎓 KẾT LUẬN

### Những điều Quan trọng Nhất

1. ✅ Kiểm tra "● Trực tuyến" trước khi làm việc
2. ✅ Nhấn "Lưu" để lưu dữ liệu
3. ✅ Đọc kỹ trước khi Xóa (không thể hoàn tác)
4. ✅ Dùng Tìm kiếm + Lọc để làm việc hiệu quả
5. ✅ Backup dữ liệu quan trọng

### Lời Khuyên

**Cho người mới:**
- Đọc kỹ hướng dẫn
- Thực hành với dữ liệu test
- Hỏi khi chưa rõ

**Cho người có kinh nghiệm:**
- Chia sẻ kinh nghiệm
- Đề xuất cải tiến
- Giúp đỡ đồng nghiệp

---

## PHỤ LỤC

### A. Bảng Phím tắt

| Phím | Chức năng |
|------|-----------|
| F5 | Tải lại trang |
| Ctrl+F | Tìm trong trang |
| Ctrl+P | In / Lưu PDF |
| Tab | Chuyển ô tiếp |
| Ctrl+A | Chọn tất cả |
| Ctrl+C/V | Copy/Paste |

### B. Thuật ngữ

- **Backend:** Hệ thống máy chủ
- **Database:** Cơ sở dữ liệu
- **Offline:** Ngoại tuyến
- **Online:** Trực tuyến
- **Tooltip:** Chú thích khi di chuột
- **Dropdown:** Menu sổ xuống
- **Validation:** Kiểm tra hợp lệ

### C. Checklist Hàng ngày

**Mỗi sáng:**
- [ ] Kiểm tra kết nối server
- [ ] Xem thông báo hệ thống

**Trong ngày:**
- [ ] Nhập dữ liệu ngay sau khám
- [ ] Kiểm tra "Đã lưu thành công"

**Cuối ngày:**
- [ ] Kiểm tra dữ liệu đã nhập
- [ ] Đóng trình duyệt

**Cuối tuần:**
- [ ] Thống kê số liệu
- [ ] Lập kế hoạch tuần sau

---

**Chúc bạn sử dụng hiệu quả!** 🦷✨

---

**Phiên bản:** 1.0.0  
**Ngày:** 13/02/2026  
**Bản quyền © 2026**
