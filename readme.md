## Tải Mô Hình AI
Do file mô hình nặng (>200MB), GitHub không cho phép lưu trữ trực tiếp. Vui lòng tải file `coin_model.onnx` tại link dưới đây và đặt vào thư mục `app/models_ai/` trước khi chạy ứng dụng:
- **Link Google Drive:** [Tải tại đây](https://drive.google.com/file/d/1fiZqv5lp8iUbQ9DtW63IXqLVXAE4PWlJ/view?usp=sharing)

## Cài đặt và Sử dụng
1. Clone repository này về máy.
2. Tải model và đặt vào `app/models_ai/`.
3. Cài đặt các thư viện: `uv sync`.
```bash
#Active venv
.venv\Scripts\activate
```
4. Chạy Backend: `uv run python run_api.py`.
5. Chạy Frontend: `cd frontend && npm run dev`.
- **AI/ML:** Keras/TensorFlow (Mô hình CNN), Gemini Vision API (Cross-validation).
---
© 2026 VietCoin AI Team - Bảo tồn di sản văn hóa Việt Nam.