# GET /v1/foods        — cari makanan (untuk halaman NutritionDetail)
# GET /v1/foods/{id}   — detail satu makanan

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, col
from typing import Optional

from database import get_session
from models import Food, User
from schemas import FoodResponse
from auth import get_current_user

router = APIRouter()


@router.get("")
def search_foods(
    name: Optional[str] = Query(
        default=None,
        description="Kata kunci nama makanan"
    ),
    category: Optional[str] = Query(
        default=None,
        description="Filter kategori: grains, protein, vegetable, fruit, dairy, dll"
    ),
    limit: int = Query(default=20, le=100),
    current_user: User = Depends(get_current_user),
    session: Session   = Depends(get_session)
):
    """
    GET /v1/foods?q=nasi&category=grains&limit=20

    Cari makanan dari database nutrisi.
    Dipakai di halaman NutritionDetail untuk search makanan.
    """
    query = select(Food)

    # Filter by nama
    if name:
        query = query.where(col(Food.name).ilike(f"%{name}%"))

    # Filter by kategori
    if category:
        query = query.where(Food.category == category)

    query = query.limit(limit)
    foods = session.exec(query).all()

    return {
        "data": [
            FoodResponse(
                id                = f.id,
                name              = f.name,
                category          = f.category,
                calories_per_100g = f.calories_per_100g,
                protein_g         = f.protein_g,
                carbs_g           = f.carbs_g,
                fat_g             = f.fat_g,
                fiber_g           = f.fiber_g,
                serving_size_g    = f.serving_size_g,
            )
            for f in foods
        ],
        "total": len(foods)
    }


@router.get("/{food_id}")
def get_food_detail(
    food_id: str,
    current_user: User = Depends(get_current_user),
    session: Session   = Depends(get_session)
):
    """
    GET /v1/foods/{food_id}

    Ambil detail nutrisi lengkap satu makanan.
    Dipakai di halaman NutritionDetail saat user klik salah satu makanan.
    """
    from fastapi import HTTPException

    food = session.get(Food, food_id)
    if not food:
        raise HTTPException(status_code=404, detail="Makanan tidak ditemukan")

    return FoodResponse(
        id                = food.id,
        name              = food.name,
        category          = food.category,
        calories_per_100g = food.calories_per_100g,
        protein_g         = food.protein_g,
        carbs_g           = food.carbs_g,
        fat_g             = food.fat_g,
        fiber_g           = food.fiber_g,
        serving_size_g    = food.serving_size_g,
    )