# POST /v1/auth/register
# POST /v1/auth/login

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import User
from schemas import UserRegister, UserLogin, TokenResponse
from auth import hash_password, verify_password, create_token

router = APIRouter()


@router.post("/register", status_code=201)
def register(data: UserRegister, session: Session = Depends(get_session)):
    """
    Daftar akun baru.
    Validasi: email tidak boleh sudah terdaftar.
    Password dienkripsi dengan bcrypt sebelum disimpan ke Supabase.
    """
    # Cek email sudah dipakai atau belum
    existing = session.exec(
        select(User).where(User.email == data.email)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email sudah terdaftar. Gunakan email lain atau langsung login."
        )

    # Simpan user baru
    new_user = User(
        name          = data.name,
        email         = data.email,
        password_hash = hash_password(data.password)
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {
        "id"    : new_user.id,
        "name"  : new_user.name,
        "email" : new_user.email
    }


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, session: Session = Depends(get_session)):
    """
    Login dan dapatkan JWT token.
    Token ini dikirim ke frontend dan disimpan di localStorage.
    """
    user = session.exec(
        select(User).where(User.email == data.email)
    ).first()

    # Pesan error sengaja dibuat sama untuk keduanya (mencegah user tahu apakah email terdaftar)
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Email atau password salah."
        )

    token = create_token(user.id)

    return TokenResponse(
        access_token = token,
        user_id      = user.id,
        user_name    = user.name
    )