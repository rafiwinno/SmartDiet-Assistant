from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import asyncio
import json

from database import get_session
from models import (
    User, DietPlan, UserProfile, MealLog,
    RecommendationSession, RecommendationOption, RecommendationItem
)
from auth import get_current_user
from utils.ai import predict_nutrition, generate_meal_plan


router = APIRouter()


def _format_plan(plan: DietPlan, profile=None) -> dict:
    days_elapsed  = plan.days_completed
    total_days    = plan.estimated_days or 30
    estimated_end = (plan.created_at + timedelta(days=total_days)).strftime("%d %b %Y")

    return {
        "id"                  : plan.id,
        "name"                : plan.name,
        "calorie_target"      : plan.calorie_target,
        "protein_target"      : plan.protein_target,
        "fat_target"          : plan.fat_target,
        "carbs_target"        : plan.carbs_target,
        "estimated_days"      : total_days,
        "activity_level"      : plan.activity_level,
        "weight_at_start"     : plan.weight_at_start,
        "is_active"           : plan.is_active,
        "created_at"          : plan.created_at.isoformat(),
        "ended_at"            : plan.ended_at.isoformat() if plan.ended_at else None,
        "days_elapsed"        : days_elapsed,
        "current_streak"      : plan.current_streak,
        "longest_streak"      : plan.longest_streak,
        "last_completed_date" : plan.last_completed_date.isoformat() if plan.last_completed_date else None,
        "estimated_end_date"  : estimated_end,
        "target_weight_kg"    : profile.target_weight_kg if profile else None,
        "calorie_deficit"     : round(profile.tdee - profile.calorie_target)
                                if profile and profile.tdee and profile.calorie_target
                                else None,
    }


def _calc_macros(item: dict) -> dict:
    """Hitung aktual makro untuk porsi yang direkomendasikan"""
    g = item.get("recommended_grams", 100)
    return {
        "protein_g": round(item.get("protein_per_100g", 0) * g / 100, 1),
        "fat_g"    : round(item.get("fat_per_100g",     0) * g / 100, 1),
        "carbs_g"  : round(item.get("carbs_per_100g",   0) * g / 100, 1),
    }


def _total_calories(meals: list) -> float:
    return round(sum(i.get("estimated_calories", 0) for i in meals), 1)


@router.get("")
def get_plans(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    plans = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .order_by(DietPlan.created_at.desc())
    ).all()
    return [_format_plan(p) for p in plans]


@router.get("/active")
def get_active_plan(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    plan = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .where(DietPlan.is_active == True)
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Tidak ada plan aktif")

    return _format_plan(plan)


@router.post("/complete-day", status_code=200)
def complete_day(
    data:         dict  = {},
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    plan = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .where(DietPlan.is_active == True)
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Tidak ada plan aktif")

    client_date = data.get("client_date") if isinstance(data, dict) else None
    today       = date.fromisoformat(client_date) if client_date else date.today()

    if plan.last_completed_date == today:
        raise HTTPException(status_code=400, detail="Hari ini sudah ditandai selesai")

    yesterday = today - timedelta(days=1)

    if plan.last_completed_date == yesterday:
        plan.current_streak += 1
    else:
        plan.current_streak = 1

    if plan.current_streak > plan.longest_streak:
        plan.longest_streak = plan.current_streak

    plan.days_completed      += 1
    plan.last_completed_date  = today

    session.add(plan)
    session.commit()
    session.refresh(plan)

    return _format_plan(plan)


@router.post("")
async def create_plan(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()

    if not profile:
        raise HTTPException(status_code=400, detail="Lengkapi profil terlebih dahulu")

    ai = await predict_nutrition(profile)

    old_plan = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .where(DietPlan.is_active == True)
    ).first()

    if old_plan:
        old_plan.is_active = False
        old_plan.ended_at  = datetime.utcnow()

    bulan_tahun = datetime.utcnow().strftime("%b %Y")

    new_plan = DietPlan(
        user_id         = current_user.id,
        name            = f"Program Diet {bulan_tahun}",
        calorie_target  = round(ai["daily_target"]["calories"]),
        protein_target  = round(ai["daily_target"]["protein"], 1),
        fat_target      = round(ai["daily_target"]["fat"],     1),
        carbs_target    = round(ai["daily_target"]["carbs"],   1),
        estimated_days  = ai["estimated_days"],
        activity_level  = profile.activity_level,
        weight_at_start = profile.weight_kg,
    )

    profile.calorie_target = new_plan.calorie_target
    profile.protein_target = new_plan.protein_target
    profile.fat_target     = new_plan.fat_target
    profile.carbs_target   = new_plan.carbs_target
    profile.estimated_days = new_plan.estimated_days
    session.add(profile)

    session.add(new_plan)
    session.commit()
    session.refresh(new_plan)

    return _format_plan(new_plan, profile=profile)


@router.post("/meal")
async def get_meal_recommendation(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()

    if not profile:
        raise HTTPException(status_code=400, detail="Lengkapi profil terlebih dahulu")
    if not profile.calorie_target:
        raise HTTPException(status_code=400, detail="Buat plan terlebih dahulu")

    plan = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .where(DietPlan.is_active == True)
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Tidak ada plan aktif")

    # PERUBAHAN: kirim dietary dan allergies ke AI
    dietary   = json.loads(profile.dietary   or "[]")
    allergies = json.loads(profile.allergies or "[]")

    return await generate_meal_plan(
        calories            = profile.calorie_target or 0,
        protein             = profile.protein_target or 0,
        fat                 = profile.fat_target     or 0,
        carbs               = profile.carbs_target   or 0,
        day                 = plan.days_completed + 1,
        dietary_preferences = dietary,
        allergies           = allergies,
    )


# ─── BARU: endpoint untuk 3 opsi rekomendasi ──────────────────────────────────

@router.post("/meal-options")
async def get_meal_options(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    """
    POST /v1/diet-plans/meal-options

    Panggil AI 3x secara paralel → dapatkan 3 set menu berbeda.
    Simpan ke recommendation_sessions/options/items.
    Return session_id + 3 opsi untuk ditampilkan di popup frontend.

    Dipanggil:
    1. Setelah user buat plan baru (dari Planner.jsx)
    2. Setelah user klik "Selesai Hari Ini" (dari Dashboard.jsx)
    """
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()

    if not profile or not profile.calorie_target:
        raise HTTPException(status_code=400, detail="Buat plan dan lengkapi profil terlebih dahulu")

    plan = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .where(DietPlan.is_active == True)
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Tidak ada plan aktif")

    day      = plan.days_completed + 1
    dietary      = json.loads(profile.dietary   or "[]")
    allergies    = json.loads(profile.allergies or "[]")

    # Panggil AI 3x secara paralel untuk dapat 3 opsi berbeda
    results = await asyncio.gather(
        generate_meal_plan(profile.calorie_target, profile.protein_target or 0,
                           profile.fat_target or 0, profile.carbs_target or 0,
                           day, dietary, allergies),
        generate_meal_plan(profile.calorie_target, profile.protein_target or 0,
                           profile.fat_target or 0, profile.carbs_target or 0,
                           day, dietary, allergies),
        generate_meal_plan(profile.calorie_target, profile.protein_target or 0,
                           profile.fat_target or 0, profile.carbs_target or 0,
                           day, dietary, allergies),
    )

    # Simpan ke recommendation_sessions
    rec_session = RecommendationSession(
        user_id    = current_user.id,
        total_carbs = profile.carbs_target,
    )
    session.add(rec_session)
    session.flush()  # dapat ID tanpa commit

    # Simpan setiap opsi ke recommendation_options + recommendation_items
    for i, option_data in enumerate(results):
        breakfast = option_data.get("breakfast", [])
        lunch     = option_data.get("lunch",     [])
        dinner    = option_data.get("dinner",    [])
        all_meals = breakfast + lunch + dinner

        total_cal     = _total_calories(all_meals)
        total_protein = round(sum(_calc_macros(m)["protein_g"] for m in all_meals), 1)
        total_fat     = round(sum(_calc_macros(m)["fat_g"]     for m in all_meals), 1)

        rec_option = RecommendationOption(
            session_id     = rec_session.id,
            option_number  = i + 1,
            total_calories = total_cal,
            total_protein  = total_protein,
            total_fat      = total_fat,
        )
        session.add(rec_option)
        session.flush()

        # Simpan item makanan
        for meal_type, items in [("breakfast", breakfast), ("lunch", lunch), ("dinner", dinner)]:
            for item in items:
                rec_item = RecommendationItem(
                    option_id  = rec_option.id,
                    food_id    = 1,  # placeholder — food tidak ada di tabel foods lokal
                    meal_type  = meal_type,
                    quantity_g = item.get("recommended_grams", 0),
                    calories   = item.get("estimated_calories", 0),
                )
                session.add(rec_item)

    session.commit()

    # Format response untuk frontend
    return {
        "session_id": rec_session.id,
        "options": [
            {
                "option_number": i + 1,
                "breakfast": results[i].get("breakfast", []),
                "lunch":     results[i].get("lunch",     []),
                "dinner":    results[i].get("dinner",    []),
                "total_calories": _total_calories(
                    results[i].get("breakfast", []) +
                    results[i].get("lunch",     []) +
                    results[i].get("dinner",    [])
                ),
            }
            for i in range(3)
        ]
    }


@router.post("/choose-meal")
def choose_meal(
    data:         dict,
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    """
    POST /v1/diet-plans/choose-meal
    Body: { session_id, option_number }

    Setelah user pilih 1 dari 3 opsi:
    1. Update chosen_option_id di recommendation_sessions
    2. Simpan semua makanan dari opsi yang dipilih ke meal_logs (untuk besok)
    """
    session_id    = data.get("session_id")
    option_number = data.get("option_number")

    # Validasi session
    rec_session = session.get(RecommendationSession, session_id)
    if not rec_session or rec_session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Sesi rekomendasi tidak ditemukan")

    # Ambil opsi yang dipilih
    rec_option = session.exec(
        select(RecommendationOption)
        .where(RecommendationOption.session_id   == session_id)
        .where(RecommendationOption.option_number == option_number)
    ).first()

    if not rec_option:
        raise HTTPException(status_code=404, detail="Opsi tidak ditemukan")

    # Update chosen_option_id
    rec_session.chosen_option_id = rec_option.id
    session.add(rec_session)

    # Use client_date to avoid UTC/local timezone mismatch
    for_today    = data.get("for_today", False)
    client_today = data.get("client_date")
    if client_today:
        base_date = date.fromisoformat(client_today)
    else:
        base_date = date.today()

    log_date = base_date.isoformat() if for_today else (base_date + timedelta(days=1)).isoformat()

    items = session.exec(
        select(RecommendationItem)
        .where(RecommendationItem.option_id == rec_option.id)
    ).all()

    # Hapus meal_logs lama untuk tanggal ini agar tidak menumpuk
    old_logs = session.exec(
        select(MealLog)
        .where(MealLog.user_id  == current_user.id)
        .where(MealLog.log_date == log_date)
    ).all()
    for log in old_logs:
        session.delete(log)
    session.flush()

    # Ambil active plan untuk plan_id
    active_plan = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id  == current_user.id)
        .where(DietPlan.is_active == True)
    ).first()

    # Ambil data option dari request body (berisi food name & makro)
    options_data     = data.get("option_data", {})
    breakfast        = options_data.get("breakfast", [])
    lunch            = options_data.get("lunch",     [])
    dinner           = options_data.get("dinner",    [])
    grouped_response = { "breakfast": [], "lunch": [], "dinner": [] }

    for meal_type, meal_items in [("breakfast", breakfast), ("lunch", lunch), ("dinner", dinner)]:
        for item in meal_items:
            macros = _calc_macros(item)
            log = MealLog(
                user_id    = current_user.id,
                plan_id    = active_plan.id if active_plan else None,
                food_name  = item.get("food", "Unknown"),
                meal_type  = meal_type,
                quantity_g = item.get("recommended_grams", 0),
                calories   = item.get("estimated_calories", 0),
                protein_g  = macros["protein_g"],
                fat_g      = macros["fat_g"],
                carbs_g    = macros["carbs_g"],
                log_date   = log_date,
            )
            session.add(log)
            grouped_response[meal_type].append({
                "food_name":  item.get("food", "Unknown"),
                "meal_type":  meal_type,
                "quantity_g": item.get("recommended_grams", 0),
                "calories":   item.get("estimated_calories", 0),
                "protein_g":  macros["protein_g"],
                "fat_g":      macros["fat_g"],
                "carbs_g":    macros["carbs_g"],
                "log_date":   log_date,
            })

    session.commit()

    return {
        "message":  "Pilihan berhasil disimpan",
        "log_date": log_date,
        "meals":    grouped_response,
    }


@router.get("/{plan_id}")
def get_plan_detail(
    plan_id:      int,
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    plan = session.get(DietPlan, plan_id)

    if not plan:
        raise HTTPException(status_code=404, detail="Plan tidak ditemukan")
    if plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    return _format_plan(plan)


@router.get("/{plan_id}/stats")
def get_plan_stats(
    plan_id:      int,
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    plan = session.get(DietPlan, plan_id)

    if not plan:
        raise HTTPException(status_code=404, detail="Plan tidak ditemukan")
    if plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    logs = session.exec(
        select(MealLog)
        .where(MealLog.plan_id == plan_id)
        .order_by(MealLog.log_date)
    ).all()

    # Group by log_date, sum nutrients
    grouped = {}
    for log in logs:
        d = log.log_date
        if d not in grouped:
            grouped[d] = { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
        grouped[d]["calories"] += log.calories   or 0
        grouped[d]["protein"]  += log.protein_g  or 0
        grouped[d]["carbs"]    += log.carbs_g    or 0
        grouped[d]["fat"]      += log.fat_g      or 0

    result = []
    for date_str, totals in grouped.items():
        try:
            from datetime import datetime as dt
            label = dt.strptime(date_str, "%Y-%m-%d").strftime("%d %b")
        except Exception:
            label = date_str
        result.append({
            "label":    label,
            "calories": round(totals["calories"]),
            "protein":  round(totals["protein"],  1),
            "carbs":    round(totals["carbs"],     1),
            "fat":      round(totals["fat"],       1),
        })

    return result