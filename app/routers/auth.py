import httpx
from fastapi import APIRouter, HTTPException, Form, Depends, Query, Request
from datetime import datetime, timedelta
from jose import jwt
from app.config import settings
from app.models.base_db import UserDB
from app.security.security import get_current_user
from pydantic import BaseModel
from typing import Optional
import bcrypt

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


# ================= MODEL =================
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    picture_url: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


# ================= PASSWORD =================
def verify_password(plain_password: str, hashed_password: str):
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def get_password_hash(password: str):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


# ================= TOKEN =================
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# ================= REGISTER =================
@router.post("/register")
def register(username: str = Form(...), password: str = Form(...), email: str = Form(...)):
    db = UserDB()

    if db.get_by_username(username):
        db.close()
        raise HTTPException(400, "Username đã tồn tại")

    if db.get_by_email(email):
        db.close()
        raise HTTPException(400, "Email đã tồn tại")

    db.add(username, get_password_hash(password), email)
    db.close()

    return {"message": "Đăng ký thành công"}


# ================= LOGIN =================
@router.post("/login")
def login(request: Request, username: str = Form(...), password: str = Form(...)):
    db = UserDB()
    user = db.get_by_username(username)

    if not user or not verify_password(password, user["password"]):
        db.close()
        raise HTTPException(401, "Sai tài khoản hoặc mật khẩu")

    # 🔥 log login
    db.log_login(
        user["id"],
        request.client.host,
        request.headers.get("user-agent", "")
    )

    token = create_access_token({
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "is_admin": bool(user["is_admin"]),
    })

    db.close()

    return {
        "access_token": token,
        "user": {
            **user,
            "is_admin": bool(user["is_admin"]),
        }
    }

@router.get("/history")
def get_my_token_history(user: dict = Depends(get_current_user)):
    db = UserDB()

    history = db.get_token_history(user["id"])

    db.close()

    return {
        "history": history
    }
# ================= GOOGLE LOGIN =================
@router.get("/google/login")
async def google_login():
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    query = "&".join([f"{k}={v}" for k, v in params.items()])
    return {"auth_url": f"https://accounts.google.com/o/oauth2/v2/auth?{query}"}


@router.get("/google/callback")
async def google_callback(request: Request, code: str = Query(...)):
    async with httpx.AsyncClient() as client:

        # 1. lấy token
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            }
        )

        access_token = token_res.json().get("access_token")

        # 2. lấy user info
        user_res = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        google_user = user_res.json()

    email = google_user["email"]
    name = google_user.get("name", email)
    picture = google_user.get("picture", "")

    # 🔥 FIX DB
    db = UserDB()
    user = db.update_or_create_google_user(email, name, picture)

    # 🔥 log login Google
    db.log_login(
        user["id"],
        request.client.host,
        request.headers.get("user-agent", "")
    )

    db.close()

    token = create_access_token({
        "id": user["id"],
        "email": user["email"],
        "username": user["username"],
        "is_admin": bool(user["is_admin"]),
    })

    from fastapi.responses import RedirectResponse
    return RedirectResponse(f"{settings.FRONTEND_URL}/?token={token}")


# ================= TOKEN HISTORY =================
@router.get("/tokens/history")
def get_tokens_history(user=Depends(get_current_user)):
    db = UserDB()
    data = db.get_token_history(user["id"])
    db.close()
    return {"history": data}


# ================= PROFILE =================
@router.put("/profile")
def update_profile(data: ProfileUpdate, user=Depends(get_current_user)):
    db = UserDB()
    db_user = db.get_by_email(user["email"])

    if not db_user:
        db.close()
        raise HTTPException(404, "User not found")

    if data.full_name is not None:
        db.update_user_info(db_user["id"], full_name=data.full_name)

    if data.picture_url is not None:
        db.update_user_info(db_user["id"], picture_url=data.picture_url)

    if data.new_password:
        if db_user["password"] and not verify_password(data.current_password, db_user["password"]):
            db.close()
            raise HTTPException(400, "Sai mật khẩu")

        db.update_user_password(db_user["id"], get_password_hash(data.new_password))

    db.close()
    return {"message": "Updated"}


# ================= CHECK =================
@router.get("/check")
def check(user=Depends(get_current_user)):
    db = UserDB()
    db_user = db.get_by_email(user["email"])
    db.close()

    return {
        "user": {
            **user,
            "token_balance": db_user["token_balance"]
        }
    }