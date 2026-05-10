# GET /v1/user/profile  — ambil profil
# PUT /v1/user/profile  — simpan profil + hitung BMR/TDEE

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
import json

from database import get_session
from models import User, UserProfile
from schemas import ProfileInput
from auth import get_current_user

router = APIRouter()

# ─── Multiplier TDEE per activity_level ──────────────────────────────────────
ACTIVITY_MULTIPLIERS = {
    "sedentary":   1.2,      # Tidak aktif
    "light":       1.375,    # Ringan 1-3x/minggu
    "moderate":    1.55,     # Sedang 3-5x/minggu
    "active":      1.725,    # Aktif 6-7x/minggu
    "very_active": 1.9,      # Sangat aktif
}


def _hitung_bmr(weight: float, height: float, age: int, gender: str) -> float:
    """
    Rumus Harris-Benedict:
    - Pria:   88.362 + (13.397 × BB) + (4.799 × TB) − (5.677 × Usia)
    - Wanita: 447.593 + (9.247 × BB) + (3.098 × TB) − (4.330 × Usia)
    """
    if gender == "male":
        return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)


def _hitung_calorie_target(tdee: float, goal: str) -> int:
    """
    Target kalori berdasarkan goal:
    - lose     → TDEE - 500  (defisit, minimum 1200 kcal)
    - gain     → TDEE + 300  (surplus)
    - maintain → TDEE
    """
    if goal == "lose":
        return max(1200, int(tdee - 500))
    if goal == "gain":
        return int(tdee + 300)
    return int(tdee)


def _format_profile(profile: UserProfile) -> dict:
    """Ubah model database menjadi dict response yang dikirim ke frontend"""
    return {
        "name"          : profile.name,
        "age"           : profile.age,
        "weight_kg"     : profile.weight_kg,
        "height_cm"     : profile.height_cm,
        "gender"        : profile.gender,
        "activity_level": profile.activity_level,
        "goal"          : profile.goal,
        "dietary"       : json.loads(profile.dietary   or "[]"),
        "allergies"     : json.loads(profile.allergies or "[]"),
        "bmr"           : round(profile.bmr,  1) if profile.bmr  else None,
        "tdee"          : round(profile.tdee, 1) if profile.tdee else None,
        "calorie_target": profile.calorie_target,
    }


@router.put("/profile")
def update_profile(
    data: ProfileInput,
    current_user: User = Depends(get_current_user),  # ← middleware autentikasi
    session: Session   = Depends(get_session)
):
    """
    PUT /v1/user/profile
    Dipanggil saat user klik 'Simpan profil' di Profile.jsx.

    Yang dilakukan backend:
    1. Hitung BMR (Harris-Benedict)
    2. Hitung TDEE (BMR × multiplier aktivitas)
    3. Hitung calorie_target berdasarkan goal
    4. Simpan ke Supabase
    5. Return hasil kalkulasi ke frontend
    """
    # 1. Hitung BMR
    bmr = _hitung_bmr(
        data.weight_kg,
        data.height_cm,
        data.age,
        data.gender.value
    )

    # 2. Hitung TDEE
    multiplier = ACTIVITY_MULTIPLIERS.get(data.activity_level.value, 1.2)
    tdee       = bmr * multiplier

    # 3. Hitung target kalori
    calorie_target = _hitung_calorie_target(tdee, data.goal.value)

    # 4. Simpan ke Supabase
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()

    dietary_str   = json.dumps(data.dietary   or [])
    allergies_str = json.dumps(data.allergies or [])

    if profile:
        # Update profil yang sudah ada
        profile.name           = data.name
        profile.age            = data.age
        profile.weight_kg      = data.weight_kg
        profile.height_cm      = data.height_cm
        profile.gender         = data.gender.value
        profile.activity_level = data.activity_level.value
        profile.goal           = data.goal.value
        profile.dietary        = dietary_str
        profile.allergies      = allergies_str
        profile.bmr            = bmr
        profile.tdee           = tdee
        profile.calorie_target = calorie_target
        profile.updated_at     = datetime.utcnow()
    else:
        # Buat profil baru
        profile = UserProfile(
            user_id        = current_user.id,
            name           = data.name,
            age            = data.age,
            weight_kg      = data.weight_kg,
            height_cm      = data.height_cm,
            gender         = data.gender.value,
            activity_level = data.activity_level.value,
            goal           = data.goal.value,
            dietary        = dietary_str,
            allergies      = allergies_str,
            bmr            = bmr,
            tdee           = tdee,
            calorie_target = calorie_target,
        )
        session.add(profile)

    session.commit()
    session.refresh(profile)

    return _format_profile(profile)


@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    session: Session   = Depends(get_session)
):
    """
    GET /v1/user/profile
    Ambil profil user yang sedang login.
    Dipanggil oleh Dashboard saat pertama kali load.
    """
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profil belum diisi. Silakan lengkapi data diri terlebih dahulu."
        )

    return _format_profile(profile)