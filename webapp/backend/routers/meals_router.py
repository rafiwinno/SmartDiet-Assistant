# POST   /v1/meals          — catat makanan baru
# GET    /v1/meals/history  — riwayat makanan (filter by date)
# DELETE /v1/meals/{id}     — hapus catatan makanan

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import date as date_type, datetime
from typing import Optional

from database import get_session
from models import User, MealLog
from schemas import MealLogInput, MealLogResponse, MealHistoryResponse
from auth import get_current_user

router = APIRouter()


def _format_log(log: MealLog) -> MealLogResponse:
    """Ubah model MealLog menjadi response dict"""
    return MealLogResponse(
        id         = log.id,
        food_name  = log.food_name,
        meal_type  = log.meal_type,
        quantity_g = log.quantity_g,
        calories   = log.calories,
        protein_g  = log.protein_g,
        carbs_g    = log.carbs_g,
        fat_g      = log.fat_g,
        log_date   = log.log_date,
        logged_at  = log.logged_at.isoformat()
    )


# ─────────────────────────────────────────────────────────────────────────────
# POST /v1/meals
# ─────────────────────────────────────────────────────────────────────────────
@router.post("", status_code=201)
def log_meal(
    data: MealLogInput,
    current_user: User = Depends(get_current_user),
    session: Session   = Depends(get_session)
):
    """
    Catat makanan yang dikonsumsi user.

    Request body:
    {
      "food_name":  "Nasi Putih",
      "meal_type":  "lunch",
      "quantity_g": 150,
      "calories":   195,
      "protein_g":  4,
      "carbs_g":    44,
      "fat_g":      0.3,
      "log_date":   "2026-05-09"
    }
    """
    meal = MealLog(
        user_id    = current_user.id,
        food_id    = data.food_id,
        food_name  = data.food_name,
        meal_type  = data.meal_type.value,
        quantity_g = data.quantity_g,
        calories   = data.calories,
        protein_g  = data.protein_g,
        carbs_g    = data.carbs_g,
        fat_g      = data.fat_g,
        log_date   = data.log_date,
    )

    session.add(meal)
    session.commit()
    session.refresh(meal)

    return _format_log(meal)


# ─────────────────────────────────────────────────────────────────────────────
# GET /v1/meals/history
# ─────────────────────────────────────────────────────────────────────────────
@router.get("/history")
def get_meal_history(
    date: Optional[str] = Query(
        default=None,
        description="Filter tanggal (format: 2026-05-09). Kosong = hari ini."
    ),
    current_user: User = Depends(get_current_user),
    session: Session   = Depends(get_session)
):
    """
    Ambil riwayat makanan.

    Query param ?date=2026-05-09 untuk filter tanggal tertentu.
    Tanpa parameter = ambil hari ini.

    Response:
    {
      "date": "2026-05-09",
      "logs": [...],
      "summary": {
        "total_calories": 1430,
        "total_protein":  87,
        "total_carbs":    162,
        "total_fat":      38
      }
    }
    """
    # Kalau tidak ada parameter date, pakai hari ini
    filter_date = date or str(date_type.today())

    # Ambil semua log user pada tanggal tersebut
    logs = session.exec(
        select(MealLog)
        .where(MealLog.user_id == current_user.id)
        .where(MealLog.log_date == filter_date)
        .order_by(MealLog.logged_at)
    ).all()

    # Hitung total nutrisi
    summary = {
        "total_calories": round(sum(l.calories  for l in logs), 1),
        "total_protein":  round(sum(l.protein_g for l in logs), 1),
        "total_carbs":    round(sum(l.carbs_g   for l in logs), 1),
        "total_fat":      round(sum(l.fat_g     for l in logs), 1),
    }

    return {
        "date"   : filter_date,
        "logs"   : [_format_log(l) for l in logs],
        "summary": summary
    }


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /v1/meals/{meal_id}
# ─────────────────────────────────────────────────────────────────────────────
@router.delete("/{meal_id}", status_code=204)
def delete_meal(
    meal_id: str,
    current_user: User = Depends(get_current_user),
    session: Session   = Depends(get_session)
):
    """
    Hapus catatan makanan berdasarkan ID.
    User hanya bisa hapus catatan miliknya sendiri (403 kalau bukan).
    """
    meal = session.get(MealLog, meal_id)

    if not meal:
        raise HTTPException(status_code=404, detail="Catatan makanan tidak ditemukan")

    # Pastikan catatan ini milik user yang login
    if meal.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Tidak diizinkan menghapus catatan milik user lain"
        )

    session.delete(meal)
    session.commit()

    # 204 No Content — tidak ada body response
    return None