# auth.py
# Semua logika keamanan:
# - Hash & verifikasi password (bcrypt)
# - Buat & decode JWT token
# - Middleware get_current_user (dipakai oleh semua endpoint yang butuh login)

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from dotenv import load_dotenv
import os

from database import get_session
from models import User

load_dotenv()

SECRET_KEY        = os.getenv("JWT_SECRET_KEY", "fallback-secret-key")
ALGORITHM         = "HS256"
TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security    = HTTPBearer()


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_token(user_id: int) -> str:
    expire  = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    
    # MIDDLEWARE AUTENTIKASI 
    # Cara kerja:
    # 1. Ambil token dari header: Authorization: Bearer {token}
    # 2. Decode token → dapat user_id
    # 3. Ambil data user dari Supabase
    # 4. Return user → endpoint bisa langsung pakai
    # Kalau token tidak valid / expired → otomatis 401 Unauthorized
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah expired. Silakan login ulang.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token   = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")

        if not user_id_str:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = session.get(User, int(user_id_str))
    if not user:
        raise credentials_exception

    return user