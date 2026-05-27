# Hướng dẫn Build và Chạy ứng dụng Android WebView

Dự án này là một ứng dụng Android (Java) đóng gói website thành app.

## 1. Mở Project trong Android Studio
1. Khởi động **Android Studio**.
2. Chọn **File > Open**.
3. Tìm đến thư mục `android_webview` trong thư mục project của bạn.
4. Chờ Android Studio sync Gradle (có thể mất vài phút lần đầu).

## 2. Cấu hình IP Website
Trong file `app/src/main/java/com/viethistory/webview/MainActivity.java`, dòng:
```java
private final String WEB_URL = "http://192.168.1.10:3000";
```
Hãy đảm bảo `192.168.1.10` là địa chỉ IP máy tính đang chạy server web và điện thoại/emulator phải cùng mạng LAN.

## 3. Chạy trên Emulator (AVD)
1. Chọn một thiết bị Virtual Device (Android 8.0 trở lên).
2. Nhấn nút **Run (Tam giác xanh)**.

## 4. Build APK
### Build APK Debug (Để test nhanh)
1. Vào menu **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. Sau khi xong, nhấn vào thông báo **"locate"** ở góc dưới bên phải.
3. Đường dẫn file: `app/build/outputs/apk/debug/app-debug.apk`.

### Build APK Release (Để cài đặt chính thức)
1. Vào menu **Build > Generate Signed Bundle / APK...**.
2. Chọn **APK** > Next.
3. Tạo mới một Key store path (nếu chưa có).
4. Điền các thông tin mật khẩu, tên, v.v.
5. Chọn **release** build type.
6. Sau khi xong, file APK sẽ nằm ở: `app/release/app-release.apk`.

## Các tính năng đã tích hợp:
- **Full screen WebView**: Tự động scale trang web.
- **JavaScript & DOM Storage**: Hỗ trợ đầy đủ các framework web hiện đại.
- **Loading Indicator**: Thanh progress bar ở trên cùng khi tải trang.
- **Xử lý nút Back**: Nhấn back trên điện thoại sẽ quay lại trang trước đó của web thay vì thoát app ngay lập tức.
- **Cleartext Traffic**: Cho phép load URL `http` (không bảo mật) cần thiết cho môi trường dev.
