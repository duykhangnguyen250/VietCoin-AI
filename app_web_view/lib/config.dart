// ============================================================
// ⚙️ FILE CẤU HÌNH FLUTTER APP - VIETCOIN AI
// ============================================================

class AppConfig {
  // ── BASE URLs ──────────────────────────────────────────────
  /// URL backend FastAPI (Sử dụng 10.0.2.2 để kết nối từ Emulator tới máy tính)
  static const String apiBaseUrl = 'http://10.0.2.2:2643/api/v1';

  /// URL frontend web
  static const String webBaseUrl = 'http://10.0.2.2:5173';

  // ── OAUTH DEEP LINK ────────────────────────────────────────
  /// Scheme cho Deep Link callback sau Google OAuth
  static const String callbackScheme = 'vietcoinai';

  // ── APP INFO ───────────────────────────────────────────────
  static const String appName = 'VietCoin AI';
  static const String appVersion = '1.0.0';

  // ── COMPUTED ───────────────────────────────────────────────
  /// URL endpoint đăng nhập Google dành cho Flutter
  static String get googleLoginFlutterUrl =>
      '$apiBaseUrl/auth/google/login/flutter?callback_scheme=$callbackScheme';
}
