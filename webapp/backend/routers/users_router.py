import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import User, UserProfile
from schemas import ProfileInput, ProfileResponse, OnboardingInput
from auth import get_current_user
from utils.ai import predict_nutrition

router = APIRouter()


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

    # Update nama kalau dikirim (dari popup edit profil)
    if data.name:
        user.name = data.name
        session.add(user)

    profile.age        = data.age
    profile.gender     = data.gender
    profile.updated_at = datetime.utcnow()

    session.add(profile)
    session.commit()
    return {"message": "OK"}


@router.put("/profile", response_model=ProfileResponse)
async def save_profile(
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
    effective_age      = data.age    or profile.age    or 25
    effective_gender   = data.gender or profile.gender or "male"
    effective_goal     = data.goal   or profile.goal   or "maintain"

    # Update name kalau dikirim
    if data.name:
        user.name = data.name
        session.add(user)

    # Temporarily write fields so predict_nutrition can read them off profile object
    profile.age            = effective_age
    profile.gender         = effective_gender
    profile.goal           = effective_goal
    profile.weight_kg      = data.weight_kg
    profile.height_cm      = data.height_cm
    profile.target_weight_kg = data.target_weight_kg
    profile.activity_level = data.activity_level

    # Call AI model for nutrition prediction
    try:
        ai = await predict_nutrition(profile)
        daily = ai["daily_target"]
        calorie_target = round(daily["calories"])
        protein_target = round(daily["protein"], 1)
        fat_target     = round(daily["fat"],     1)
        carbs_target   = round(daily["carbs"],   1)
        estimated_days = ai.get("estimated_days")
    except HTTPException:
        # Fallback to Mifflin-St Jeor if AI service is down
        ACTIVITY_MULTIPLIERS = {
            "sedentary":   1.2,
            "light":       1.375,
            "moderate":    1.55,
            "active":      1.725,
            "very_active": 1.9,
        }
        if effective_gender == "male":
            bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * effective_age + 5
        else:
            bmr = 10 * data.weight_kg + 6.25 * data.height_cm - 5 * effective_age - 161
        tdee           = bmr * ACTIVITY_MULTIPLIERS.get(data.activity_level, 1.2)
        calorie_target = round(tdee)
        protein_target = round(calorie_target * 0.30 / 4, 1)
        fat_target     = round(calorie_target * 0.25 / 9, 1)
        carbs_target   = round(calorie_target * 0.45 / 4, 1)
        estimated_days = None
        profile.bmr  = round(bmr, 1)
        profile.tdee = round(tdee, 1)

    profile.dietary        = json.dumps(data.dietary   or [])
    profile.allergies      = json.dumps(data.allergies or [])
    profile.calorie_target = calorie_target
    profile.protein_target = protein_target
    profile.fat_target     = fat_target
    profile.carbs_target   = carbs_target
    profile.estimated_days = estimated_days
    profile.updated_at     = datetime.utcnow()

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
        dietary          = json.loads(profile.dietary   or "[]"),
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
        dietary          = json.loads(profile.dietary   or "[]"),
        allergies        = json.loads(profile.allergies or "[]"),
        bmr              = profile.bmr,
        tdee             = profile.tdee,
        calorie_target   = profile.calorie_target,
    )