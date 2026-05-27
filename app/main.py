import sys
from types import ModuleType

try:
    import google.protobuf.runtime_version as rv
    if not hasattr(rv, 'Domain'):
        class Domain:
            PUBLIC = 1
            INTERNAL = 2
        rv.Domain = Domain
except ImportError:
    try:
        import google.protobuf
        m = ModuleType("runtime_version")
        class Domain:
            PUBLIC = 1
            INTERNAL = 2
        m.Domain = Domain
        m.ValidateProtobufRuntimeVersion = lambda *args, **kwargs: None
        sys.modules["google.protobuf.runtime_version"] = m
        google.protobuf.runtime_version = m
        print("[PATCH] Protobuf/Domain patch applied successfully!")
    except:
        pass

from fastapi import FastAPI, Depends, Request
from app.routers import auth, payment, admin, coin, file_upload
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
import logging
from app.models.base_db import BaseDB
import os
# LOGGING
for handler in logging.root.handlers[:]:
    logging.root.removeHandler(handler)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API PREFIX
api_prefix = f"/api/{settings.VERSION_APP}"

# APP INIT
app = FastAPI(
    title="Coin AI System",
    docs_url=f"{api_prefix}/docs",
    redoc_url=f"{api_prefix}/redoc",
    openapi_url=f"{api_prefix}/openapi.json",
)



# tạo folder nếu chưa có
os.makedirs("app/utils/download", exist_ok=True)

app.mount(
    "/api/v1/upload-file/view",
    StaticFiles(directory="app/utils/download"),
    name="uploads"
)
# 🔥 AUTO CREATE DB TABLES
import asyncio
import time

async def clean_temp_files_loop():
    # Chờ 10 giây ban đầu để đảm bảo máy chủ đã khởi động hoàn toàn
    await asyncio.sleep(10)
    while True:
        try:
            logger.info("[BACKGROUND] Bắt đầu quét và dọn dẹp các tệp ảnh tạm...")
            upload_dir = os.path.join("app", "utils", "download")
            if os.path.exists(upload_dir):
                now = time.time()
                cleaned_count = 0
                for filename in os.listdir(upload_dir):
                    if filename == ".gitkeep":
                        continue
                    file_path = os.path.join(upload_dir, filename)
                    if os.path.isfile(file_path):
                        # Lấy thời gian sửa đổi cuối cùng (mtime)
                        file_mtime = os.path.getmtime(file_path)
                        # Dọn dẹp các tệp cũ hơn 24 giờ (86400 giây)
                        if now - file_mtime > 86400:
                            try:
                                os.remove(file_path)
                                cleaned_count += 1
                            except Exception as ex:
                                logger.error(f"[BACKGROUND] Không thể xóa tệp {filename}: {str(ex)}")
                if cleaned_count > 0:
                    logger.info(f"[BACKGROUND] Đã dọn dẹp xong! Loại bỏ {cleaned_count} tệp ảnh tạm đã cũ.")
                else:
                    logger.info("[BACKGROUND] Không có tệp ảnh tạm nào đã quá hạn cần dọn dẹp.")
        except Exception as e:
            logger.error(f"[BACKGROUND] Lỗi khi dọn dẹp ảnh tạm: {str(e)}")
        
        # Lặp lại định kỳ mỗi 12 giờ (43200 giây)
        await asyncio.sleep(43200)

@app.on_event("startup")
def startup():
    logger.info("[STARTUP] Initializing database...")
    db = BaseDB(init_db=True)
    db.close()
    logger.info("[SUCCESS] Database ready!")

    # tạo folder upload nếu chưa có
    upload_dir = os.path.join("app", "utils", "download")
    os.makedirs(upload_dir, exist_ok=True)

    # Kích hoạt tác vụ dọn dẹp chạy nền
    asyncio.create_task(clean_temp_files_loop())

# STATIC FILE (FIX LOGO 404)
app.mount(
    f"{api_prefix}/upload-file/view",
    StaticFiles(directory="app/utils/download"),
    name="uploads"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ROUTERS
app.include_router(auth.router, prefix=api_prefix)
app.include_router(payment.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)
app.include_router(coin.router, prefix=api_prefix)
app.include_router(file_upload.router, prefix=api_prefix)

# ROOT (KHÔNG 404)
@app.get("/")
def root():
    return {
        "message": "Coin AI System Running",
        "docs": f"{api_prefix}/docs"
    }


@app.get(f"{api_prefix}/")
def read_root():
    return {
        "message": "Coin AI System Running",
        "version": settings.VERSION_APP
    }

# HEALTH CHECK
@app.get("/health")
def health_check():
    return {"status": "ok"}