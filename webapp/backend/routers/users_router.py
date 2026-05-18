import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import User, UserProfile
from schemas import ProfileInput, ProfileResponse, OnboardingInput
from auth import get_current_user

router = APIRouter()


def calc_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    """Mifflin-St Jeor formula"""
    if gender == "male":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161


ACTIVITY_MULTIPLIERS = {
    "sedentary":   1.2,
    "light":       1.375,
    "moderate":    1.55,
    "active":      1.725,
    "very_active": 1.9,
}


@router.put("/onboarding")
def save_onboarding(
    data:    OnboardingInput,
    session: Session = Depends(get_session),
    user:    User    = Depends(get_current_user),
):
    """
    PUT /v1/user/onboarding
    Endpoint khusus popup onboarding setelah register.
    Hanya menyimpan age dan gender.
    """
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == user.id)
    ).first()

    if not profile:
        profile = UserProfile(user_id=user.id)

    profile.age        = data.age
    profile.gender     = data.gender
    profile.updated_at = datetime.utcnow()

    session.add(profile)
    session.commit()
    return {"message": "OK"}

@router.put("/profile", response_model=ProfileResponse)
def save_profile(
    data:    ProfileInput,
    session: Session = Depends(get_session),
    user:    User    = Depends(get_current_user),
):
    # Ambil profil yang sudah ada (untuk ambil age/gender dari onboarding)
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == user.id)
    ).first()

    if not profile:
        profile = UserProfile(user_id=user.id)

    # Pakai data baru kalau ada, kalau tidak pakai data existing
    effective_name   = data.name   or user.name
    effective_age    = data.age    or profile.age    or 25   
    effective_gender = data.gender or profile.gender or "male"

    # Update name kalau dikirim
    if data.name:
        user.name = data.name
        session.add(user)

    # Hitung BMR dengan data effective
    bmr            = calc_bmr(data.weight_kg, data.height_cm, effective_age, effective_gender)
    tdee           = bmr * ACTIVITY_MULTIPLIERS.get(data.activity_level, 1.2)
    calorie_target = round(tdee)

    profile.age              = effective_age
    profile.gender           = effective_gender
    profile.weight_kg        = data.weight_kg
    profile.height_cm        = data.height_cm
    profile.target_weight_kg = data.target_weight_kg
    profile.activity_level   = data.activity_level
    profile.dietary          = json.dumps(data.dietary or [])
    profile.allergies        = json.dumps(data.allergies or [])
    profile.bmr              = round(bmr, 1)
    profile.tdee             = round(tdee, 1)
    profile.calorie_target   = calorie_target
    profile.updated_at       = datetime.utcnow()

    session.add(profile)
    session.commit()
    session.refresh(profile)
    session.refresh(user)

    return ProfileResponse(
        name             = user.name,
        age              = profile.age,
        weight_kg        = profile.weight_kg,
        height_cm        = profile.height_cm,
        target_weight_kg = profile.target_weight_kg,
        gender           = profile.gender,
        activity_level   = profile.activity_level,
        dietary          = json.loads(profile.dietary  or "[]"),
        allergies        = json.loads(profile.allergies or "[]"),
        bmr              = profile.bmr,
        tdee             = profile.tdee,
        calorie_target   = profile.calorie_target,
    )


@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    session: Session = Depends(get_session),
    user:    User    = Depends(get_current_user),
):
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == user.id)
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profil belum diisi")

    return ProfileResponse(
        name             = user.name,
        age              = profile.age or 0,
        weight_kg        = profile.weight_kg or 0,
        height_cm        = profile.height_cm or 0,
        target_weight_kg = profile.target_weight_kg,
        gender           = profile.gender or "",
        activity_level   = profile.activity_level or "",
        dietary          = json.loads(profile.dietary  or "[]"),
        allergies        = json.loads(profile.allergies or "[]"),
        bmr              = profile.bmr,
        tdee             = profile.tdee,
        calorie_target   = profile.calorie_target,
    )