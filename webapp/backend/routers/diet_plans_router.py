from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import User, DietPlan, UserProfile
from auth import get_current_user

router = APIRouter()




def _format_plan(plan: DietPlan, profile=None) -> dict:
    days_elapsed  = (datetime.utcnow() - plan.created_at).days
    estimated_end = (plan.created_at + timedelta(days=30)).strftime("%d %b %Y")

    return {
        "id"                  : plan.id,
        "name"                : plan.name,
        "calorie_target"      : plan.calorie_target,
        "activity_level"      : plan.activity_level,
        "weight_at_start"     : plan.weight_at_start,
        "is_active"           : plan.is_active,
        "created_at"          : plan.created_at.isoformat(),
        "ended_at"            : plan.ended_at.isoformat() if plan.ended_at else None,
        "days_elapsed"        : days_elapsed,
        "total_days"          : 30,
        "current_streak"      : plan.current_streak,
        "longest_streak"      : plan.longest_streak,
        "last_completed_date" : plan.last_completed_date.isoformat() if plan.last_completed_date else None,
        "estimated_end_date"  : estimated_end,
        # Only populated on create response — None on all other endpoints
        "target_weight_kg"    : profile.target_weight_kg if profile else None,
        "calorie_deficit"     : round(profile.tdee - profile.calorie_target)
                                if profile and profile.tdee and profile.calorie_target
                                else None,
    }


@router.get("")
def get_plans(
    current_user: User   = Depends(get_current_user),
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
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    """
    POST /v1/diet-plans/complete-day
    Mark today as completed for the active plan.
    - Increments days_elapsed via last_completed_date tracking
    - Updates current_streak and longest_streak
    - Prevents double-completion on the same day
    """
    plan = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .where(DietPlan.is_active == True)
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Tidak ada plan aktif")

    today = date.today()

    # Prevent double completion on same day
    if plan.last_completed_date == today:
        raise HTTPException(status_code=400, detail="Hari ini sudah ditandai selesai")

    yesterday = today - timedelta(days=1)

    # Update streak
    if plan.last_completed_date == yesterday:
        # Consecutive day — increment streak
        plan.current_streak += 1
    else:
        # Streak broken or first completion
        plan.current_streak = 1

    # Update longest streak
    if plan.current_streak > plan.longest_streak:
        plan.longest_streak = plan.current_streak

    plan.last_completed_date = today

    session.add(plan)
    session.commit()
    session.refresh(plan)

    return _format_plan(plan)


@router.post("")
def create_plan(
    current_user: User    = Depends(get_current_user),
    session:      Session = Depends(get_session)
):
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()

    if not profile:
        raise HTTPException(status_code=400, detail="Lengkapi profil terlebih dahulu")

    # Deactivate old plan
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
        name            = f"Plan — {bulan_tahun}",
        calorie_target  = int(profile.calorie_target) if profile.calorie_target else None,
        activity_level  = profile.activity_level,
        weight_at_start = profile.weight_kg,
    )
    session.add(new_plan)
    session.commit()
    session.refresh(new_plan)

    # Pass profile so create response includes target_weight + deficit
    return _format_plan(new_plan, profile=profile)


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