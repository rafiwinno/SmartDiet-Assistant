# Format data yang diterima & dikirim API
# Pydantic otomatis validasi — jika field salah-> error 422

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum


# ─── ENUM ────────────────────────────────────────────────────────────────────

class ActivityLevel(str, Enum):
    sedentary   = "sedentary"    
    light       = "light"        
    moderate    = "moderate"     
    active      = "active"       
    very_active = "very_active"  

class Goal(str, Enum):
    lose     = "lose"      
    maintain = "maintain"  
    gain     = "gain"      

class Gender(str, Enum):
    male   = "male"
    female = "female"

class MealType(str, Enum):
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
    name:           str
    age:            int
    weight_kg:      float
    height_cm:      float
    gender:         Gender
    activity_level: ActivityLevel
    goal:           Goal
    dietary:        Optional[List[str]] = []
    allergies:      Optional[List[str]] = []


class ProfileResponse(BaseModel):
    # Data profil yang dikirim balik ke frontend, termasuk hasil kalkulasi
    name:           str
    age:            int
    weight_kg:      float
    height_cm:      float
    gender:         str
    activity_level: str
    goal:           str
    dietary:        List[str]
    allergies:      List[str]
    bmr:            Optional[float]
    tdee:           Optional[float]
    calorie_target: Optional[int]


# ─── MEALS ─────────────────────────────────────────────────────────

class MealLogInput(BaseModel):
    food_id:    Optional[int] = None  
    food_name:  str
    meal_type:  MealType
    quantity_g: float
    calories:   float
    protein_g:  float = 0
    carbs_g:    float = 0
    fat_g:      float = 0
    log_date:   str   # format: "2026-05-09"


class MealLogResponse(BaseModel):
    # Format data meal log yang dikembalikan ke frontend
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
    
    # Response GET /meal/history
    # Berisi daftar log + ringkasan total nutrisi per hari
    
    date:    str
    logs:    List[MealLogResponse]
    summary: dict   # { total_calories, total_protein, total_carbs, total_fat }


# ─── FOODS ────────────────────────────────────────────────────────────────────

class FoodResponse(BaseModel):
    # Format data makanan dari database
    id:               int
    name:             str
    category:         str
    calories_per_100g: float
    protein_g:        float
    carbs_g:          float
    fat_g:            float