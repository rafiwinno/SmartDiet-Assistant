import httpx
from fastapi import HTTPException

AI_BASE_URL = "http://32.236.19.32:8001"

# Mapping goal dari format sistem ke format AI
GOAL_MAPPING = {
    "lose":     "weight_loss",
    "gain":     "weight_gain",
    "maintain": "maintain",
}

DIETARY_MAPPING = {
    "Vegetarian":    "is_vegetarian",
    "Vegan":         "is_vegan",
    "Halal":         "is_halal",
    "Bebas gluten":  "is_gluten_free",
    "Bebas laktosa": "is_lactose_free",
    "Bebas kacang":  "is_nut_free",
}

ALLERGY_MAPPING = {
    "Kacang tanah": "allergen_peanut",
    "Susu":         "allergen_milk",
    "Telur":        "allergen_egg",
    "Ikan":         "allergen_fish",
    "Udang":        "allergen_shellfish",
    "Kedelai":      "allergen_soy",
    "Gandum":       "allergen_wheat",
}


def encode_dietary(dietary: list) -> list:
    return [DIETARY_MAPPING[d] for d in dietary if d in DIETARY_MAPPING]


def encode_allergies(allergies: list) -> list:
    return [ALLERGY_MAPPING[a] for a in allergies if a in ALLERGY_MAPPING]


async def predict_nutrition(profile) -> dict:
    """
    Call /predict-nutrition with the user's profile.
    Returns { goal_type, estimated_days, daily_target: { calories, protein, fat, carbs } }
    """
    # Konversi Enum ke string kalau perlu
    gender         = profile.gender.value         if hasattr(profile.gender,         "value") else (profile.gender         or "male")
    activity_level = profile.activity_level.value if hasattr(profile.activity_level, "value") else (profile.activity_level or "moderate")
    goal_raw       = profile.goal.value           if hasattr(profile.goal,           "value") else (profile.goal           or "maintain")

    payload = {
        "gender":         gender,
        "activity_level": activity_level,
        "goal":           GOAL_MAPPING.get(goal_raw, "maintain"),
        "weight_kg":      float(profile.weight_kg        or 70),
        "target_weight":  float(profile.target_weight_kg or 70),
        "height_cm":      float(profile.height_cm        or 170),
        "age":            int(float(profile.age           or 25)),
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.post(f"{AI_BASE_URL}/predict-nutrition", json=payload)
            res.raise_for_status()
            return res.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e.response.status_code}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"AI service unreachable: {str(e)}")


async def generate_meal_plan(
    calories:            float,
    protein:             float,
    fat:                 float,
    carbs:               float,
    day:                 int,
    dietary_preferences: list = [],
    allergies:           list = [],
) -> dict:
    """
    Call /generate-meal-plan with macro targets and current plan day.
    Returns { day, breakfast: [...], lunch: [...], dinner: [...] }

    Each meal item:
    - food: str
    - recommended_grams: float
    - estimated_calories: float
    - protein_per_100g: float
    - fat_per_100g: float
    - carbs_per_100g: float
    """
    payload = {
        "calories":            calories,
        "protein":             protein,
        "fat":                 fat,
        "carbs":               carbs,
        "day":                 day,
        "dietary_preferences": encode_dietary(dietary_preferences),
        "allergies":           encode_allergies(allergies),
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(f"{AI_BASE_URL}/generate-meal-plan", json=payload)
            res.raise_for_status()
            return res.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e.response.status_code}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"AI service unreachable: {str(e)}")