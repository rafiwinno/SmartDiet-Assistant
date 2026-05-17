
# Endpoint untuk manajemen diet plan user

# GET  /v1/diet-plans         — semua plan milik user
# GET  /v1/diet-plans/active  — plan yang sedang aktif
# POST /v1/diet-plans         — buat plan baru (deactivate plan lama otomatis)

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime

from database import get_session
from models import User, DietPlan, UserProfile
from auth import get_current_user

router = APIRouter()

# Label goal untuk nama plan otomatis
GOAL_LABEL = {
    "lose"    : "Turun BB",
    "maintain": "Maintain",
    "gain"    : "Naik BB",
}


def _format_plan(plan: DietPlan) -> dict:
    """Ubah model DietPlan menjadi dict response"""
    # Hitung hari berjalan sejak plan dibuat
    days_elapsed = (datetime.utcnow() - plan.created_at).days

    return {
        "id"             : plan.id,
        "name"           : plan.name,
        "calorie_target" : plan.calorie_target,
        "goal"           : plan.goal,
        "activity_level" : plan.activity_level,
        "weight_at_start": plan.weight_at_start,
        "is_active"      : plan.is_active,
        "created_at"     : plan.created_at.isoformat(),
        "ended_at"       : plan.ended_at.isoformat() if plan.ended_at else None,
        # ─── Untuk fitur "X/30 hari" ─────────────────────────────────────────
        # days_elapsed dihitung otomatis dari created_at
        # total_days defaultnya 30 — AI Engineer dapat mengganti ini nanti dengan:
        # 1. Tambah kolom total_days ke tabel diet_plans di database
        # 2. Tambah field total_days ke model DietPlan di models.py
        # 3. Isi total_days saat buat plan dari kalkulasi AI
        # 4. Kembalikan total_days di response ini
        "days_elapsed"   : days_elapsed,
        "total_days"     : 30,  # ← ganti ini saat AI sudah terintegrasi
    }


@router.get("")
def get_plans(
    current_user: User   = Depends(get_current_user),
    session: Session     = Depends(get_session)
):
    """
    GET /v1/diet-plans
    Ambil semua plan milik user, diurutkan dari terbaru.
    Dipakai oleh halaman History untuk menampilkan card plan.
    """
    plans = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .order_by(DietPlan.created_at.desc())
    ).all()

    return [_format_plan(p) for p in plans]


@router.get("/active")
def get_active_plan(
    current_user: User = Depends(get_current_user),
    session: Session   = Depends(get_session)
):
    """
    GET /v1/diet-plans/active
    Ambil plan yang sedang aktif.
    Dipakai oleh Dashboard untuk cek apakah perlu tampilkan empty state.
    Return 404 kalau tidak ada plan aktif.
    """
    plan = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .where(DietPlan.is_active == True)
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Tidak ada plan aktif")

    return _format_plan(plan)


@router.post("", status_code=201)
def create_plan(
    current_user: User = Depends(get_current_user),
    session: Session   = Depends(get_session)
):
    """
    POST /v1/diet-plans
    Buat plan baru dari data profil yang sudah tersimpan.

    Yang terjadi:
    1. Ambil profil user (calorie_target, goal, activity_level, weight_kg)
    2. Nonaktifkan plan lama jika ada (is_active=False, ended_at=sekarang)
    3. Buat plan baru dengan data dari profil
    4. Return plan baru
    """
    # 1. Ambil profil user
    profile = session.exec(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    ).first()

    if not profile:
        raise HTTPException(
            status_code=400,
            detail="Lengkapi profil terlebih dahulu sebelum membuat plan"
        )

    if not profile.goal or not profile.activity_level:
        raise HTTPException(
            status_code=400,
            detail="Isi tujuan dan tingkat aktivitas di profil terlebih dahulu"
        )

    # 2. Nonaktifkan plan lama
    old_plan = session.exec(
        select(DietPlan)
        .where(DietPlan.user_id == current_user.id)
        .where(DietPlan.is_active == True)
    ).first()

    if old_plan:
        old_plan.is_active = False
        old_plan.ended_at  = datetime.utcnow()

    # 3. Buat plan baru
    goal_label = GOAL_LABEL.get(profile.goal, "Plan")
    bulan_tahun = datetime.utcnow().strftime("%b %Y")
    plan_name   = f"{goal_label} — {bulan_tahun}"

    new_plan = DietPlan(
        user_id         = current_user.id,
        name            = plan_name,
        calorie_target  = int(profile.calorie_target) if profile.calorie_target else None,
        goal            = profile.goal,
        activity_level  = profile.activity_level,
        weight_at_start = profile.weight_kg,
    )
    session.add(new_plan)
    session.commit()
    session.refresh(new_plan)

    return _format_plan(new_plan)


@router.get("/{plan_id}")
def get_plan_detail(
    plan_id: int,
    current_user: User = Depends(get_current_user),
    session: Session   = Depends(get_session)
):
    """
    GET /v1/diet-plans/{plan_id}
    Detail satu plan berdasarkan ID.
    Dipakai oleh halaman HistoryDetail.
    """
    plan = session.get(DietPlan, plan_id)

    if not plan:
        raise HTTPException(status_code=404, detail="Plan tidak ditemukan")

    if plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    return _format_plan(plan)