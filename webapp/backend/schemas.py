from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum


class ActivityLevel(str, Enum):
    sedentary   = "sedentary"
    light       = "light"
    moderate    = "moderate"
    active      = "active"
    very_active = "very_active"

class Gender(str, Enum):
    male   = "male"
    female = "female"

class Goal(str, Enum):
    lose     = "lose"
    maintain = "maintain"
    gain     = "gain"


    breakfast = "breakfast"
    lunch     = "lunch"
    dinner    = "dinner"
    snack     = "snack"


# ─── AUTH ─────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name:     str
    email:    EmailStr
    password: str

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user_id:      int
    user_name:    str


# ─── PROFILE ──────────────────────────────────────────────────────────────────

class ProfileInput(BaseModel):
    name:             Optional[str]          = None
    age:              Optional[int]          = None
    gender:           Optional[Gender]       = None
    weight_kg:        float
    height_cm:        float
    target_weight_kg: float
    activity_level:   ActivityLevel
    goal:             Optional[Goal]       = None
    dietary:          Optional[List[str]] = []
    allergies:        Optional[List[str]] = []

class ProfileResponse(BaseModel):
    name:             str
    age:              int
    weight_kg:        float
    height_cm:        float
    target_weight_kg: Optional[float]
    gender:           str
    activity_level:   str
    dietary:          List[str]
    allergies:        List[str]
    bmr:              Optional[float]
    tdee:             Optional[float]
    calorie_target:   Optional[int]


# ─── MEALS ────────────────────────────────────────────────────────────────────

class MealLogInput(BaseModel):
    food_id:    Optional[int] = None
    food_name:  str
    # meal_type:  MealType
    quantity_g: float
    calories:   float
    protein_g:  float = 0
    carbs_g:    float = 0
    fat_g:      float = 0
    log_date:   str

class MealLogResponse(BaseModel):
    id:         int
    food_name:  str
    meal_type:  str
    quantity_g: float
    calories:   float
    protein_g:  float
    carbs_g:    float
    fat_g:      float
    log_date:   str
    logged_at:  str

class MealHistoryResponse(BaseModel):
    date:    str
    logs:    List[MealLogResponse]
    summary: dict


# ─── FOODS ────────────────────────────────────────────────────────────────────

class FoodResponse(BaseModel):
    id:                int
    name:              str
    category:          str
    calories_per_100g: float
    protein_g:         float
    carbs_g:           float
    fat_g:             float

# ─── ONBOARDING ────────────────────────────────────────────────────────────────────

class OnboardingInput(BaseModel):
    age:    int
    gender: Gender