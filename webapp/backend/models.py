from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime


class User(SQLModel, table=True):
    __tablename__ = "users"

    id:            Optional[int] = Field(default=None, primary_key=True)
    name:          str
    email:         str = Field(unique=True, index=True)
    password_hash: str
    created_at:    datetime = Field(default_factory=datetime.utcnow)

    profile:   Optional["UserProfile"] = Relationship(back_populates="user")
    meal_logs: List["MealLog"]         = Relationship(back_populates="user")


class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"

    id:      Optional[int] = Field(default=None, primary_key=True)
    user_id: int           = Field(foreign_key="users.id", unique=True)

    weight_kg:        Optional[float] = None
    height_cm:        Optional[float] = None
    activity_level:   Optional[str]   = None
    target_weight_kg: Optional[float] = None
    age:              Optional[int]   = None
    gender:           Optional[str]   = None
    goal:             Optional[str]   = None

    # Stored as JSON strings e.g. '["Halal","Vegan"]'
    dietary:   Optional[str] = None
    allergies: Optional[str] = None

    bmr:            Optional[float] = None
    tdee:           Optional[float] = None
    calorie_target: Optional[int]   = None

    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="profile")


class Food(SQLModel, table=True):
    __tablename__ = "foods"

    id:                Optional[int] = Field(default=None, primary_key=True)
    name:              str
    category:          str
    calories_per_100g: float
    protein_g:         float
    carbs_g:           float
    fat_g:             float

    meal_logs: List["MealLog"] = Relationship(back_populates="food")


class MealLog(SQLModel, table=True):
    __tablename__ = "meal_logs"

    id:      Optional[int] = Field(default=None, primary_key=True)
    user_id: int           = Field(foreign_key="users.id", index=True)
    food_id: Optional[int] = Field(default=None, foreign_key="foods.id")

    food_name:  str
    meal_type:  str
    quantity_g: float
    calories:   float
    protein_g:  float = 0
    carbs_g:    float = 0
    fat_g:      float = 0

    log_date:  str
    logged_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="meal_logs")
    food: Optional[Food] = Relationship(back_populates="meal_logs")