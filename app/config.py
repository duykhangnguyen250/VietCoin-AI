# File cấu hình chung cho ứng dụng

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:

    # ====================
    # ROOT
    # ====================
    DIR_ROOT = os.path.dirname(os.path.abspath(__file__))

    # ====================
    # SECURITY
    # ====================
    SECRET_KEY = os.getenv("SECRET_KEY", "coin_ai_secret_key")

    # CORS (cho frontend)
    ALLOW_ORIGINS = os.getenv("ALLOW_ORIGINS", "*")

    # ====================
    # APP INFO
    # ====================
    TITLE_APP = os.getenv("TITLE_APP", "Coin Recognition AI API")
    VERSION_APP = os.getenv("VERSION_APP", "v1")
    NAME_WEB = os.getenv("NAME_WEB", "COIN AI SYSTEM")

    # ====================
    # GOOGLE LOGIN
    # ====================
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # ====================
    # SEPAY PAYMENT
    # ====================
    SEPAY_API_KEY = os.getenv("SEPAY_API_KEY")
    SEPAY_ACCOUNT_NUMBER = os.getenv("SEPAY_ACCOUNT_NUMBER")
    SEPAY_BANK_BRAND = os.getenv("SEPAY_BANK_BRAND")

    # ====================
    # DATABASE MYSQL
    # ====================
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "coin_ai_system")  # 🔥 đã đổi
    DB_PORT = int(os.getenv("DB_PORT", 3306))

    # ====================
    # AI MODEL (COIN)
    # ====================
    MODEL_PATH = os.getenv("MODEL_PATH", "app/models_ai/coin_model.onnx")

    ENABLE_GEMINI=True
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


# init settings
settings = Settings()