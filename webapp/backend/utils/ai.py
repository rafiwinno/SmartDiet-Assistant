import httpx
from fastapi import HTTPException

AI_BASE_URL = "http://replace-with-your-url"  # Set your AI service URL here

GENDER_ENCODING = {
    "male":   1,
    "female": 0,
}

ACTIVITY_ENCODING = {
    "sedentary":   0,
    "light":       1,
    "moderate":    2,
    "active":      3,
    "very_active": 4,
}

GOAL_ENCODING = {
    "lose":     0,
    "maintain": 1,
    "gain":     2,
}


async def predict_nutrition(profile) -> dict:
    """
    Call /predict-nutrition with the user's profile.
    Returns { goal_type, estimated_days, daily_target: { calories, protein, fat, carbs } }
    """
    payload = {
        "gender_encoded":   GENDER_ENCODING.get(profile.gender          or "male",     1),
        "activity_encoded": ACTIVITY_ENCODING.get(profile.activity_level or "moderate", 2),
        "goal_encoded":     GOAL_ENCODING.get(profile.goal               or "maintain", 1),
        "weight_kg":        profile.weight_kg,
        "target_weight":    profile.target_weight_kg,
        "height_cm":        profile.height_cm,
        "age":              profile.age,
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


async def generate_meal_plan(calories: float, protein: float, fat: float, carbs: float, day: int) -> dict:
    """
    Call /generate-meal-plan with macro targets and current plan day.
    Returns { day, breakfast: [...], lunch: [...], dinner: [...] }
    """
    payload = {
        "calories": calories,
        "protein":  protein,
        "fat":      fat,
        "carbs":    carbs,
        "day":      day,
    }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.post(f"{AI_BASE_URL}/generate-meal-plan", json=payload)
            res.raise_for_status()
            return res.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {e.response.status_code}")
    except httpx.HTTPError as e:
        raise HTTPException(status_code=503, detail=f"AI service unreachable: {str(e)}")