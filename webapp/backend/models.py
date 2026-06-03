from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date


class User(SQLModel, table=True):
    __tablename__ = "users"

    id:            Optional[int] = Field(default=None, primary_key=True)
    name:          str
    email:         str = Field(unique=True, index=True)
    password_hash: str
    created_at:    datetime = Field(default_factory=datetime.utcnow)

    profile:      Optional["UserProfile"]        = Relationship(back_populates="user")
    meal_logs:    List["MealLog"]                = Relationship(back_populates="user")
    diet_plans:   List["DietPlan"]               = Relationship(back_populates="user")
    rec_sessions: List["RecommendationSession"]  = Relationship(back_populates="user")


class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"

    id:      Optional[int] = Field(default=None, primary_key=True)
    user_id: int           = Field(foreign_key="users.id", unique=True)

    weight_kg:        Optional[float] = None
    height_cm:        Optional[float] = None
    activity_level:   Optional[str]   = None
    target_weight_kg: Optional[float] = None

    age:    Optional[float] = None
    gender: Optional[str]   = None

    dietary:   Optional[str] = None   
    allergies: Optional[str] = None   

    bmr:  Optional[float] = None
    tdee: Optional[float] = None

    goal:           Optional[str]   = None
    calorie_target: Optional[float] = None
    protein_target: Optional[float] = None
    fat_target:     Optional[float] = None
    carbs_target:   Optional[float] = None
    estimated_days: Optional[int]   = None

    updated_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="profile")

class DietPlan(SQLModel, table=True):
    __tablename__ = "diet_plans"

    id:              Optional[int]      = Field(default=None, primary_key=True)
    user_id:         int                = Field(foreign_key="users.id")
    name:            str
    calorie_target:  Optional[int]      = None
    protein_target:  Optional[float]    = None
    fat_target:      Optional[float]    = None
    carbs_target:    Optional[float]    = None
    estimated_days:  Optional[int]      = None
    activity_level:  Optional[str]      = None
    weight_at_start: Optional[float]    = None
    is_active:       bool               = True
    created_at:      datetime           = Field(default_factory=datetime.utcnow)
    ended_at:        Optional[datetime] = None
    current_streak:       int            = Field(default=0)
    longest_streak:       int            = Field(default=0)
    days_completed:       int            = Field(default=0)
    last_completed_date:  Optional[date] = Field(default=None)

    user:      Optional[User]  = Relationship(back_populates="diet_plans")
    meal_logs: List["MealLog"] = Relationship(back_populates="plan")


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

    plan_id: Optional[int] = Field(default=None, foreign_key="diet_plans.id")

    food_name:  str
    meal_type:  str
    quantity_g: float
    calories:   float
    protein_g:  float = 0
    carbs_g:    float = 0
    fat_g:      float = 0
    log_date:   str
    logged_at:  datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User]     = Relationship(back_populates="meal_logs")
    food: Optional[Food]     = Relationship(back_populates="meal_logs")
    plan: Optional[DietPlan] = Relationship(back_populates="meal_logs")


class RecommendationSession(SQLModel, table=True):
    __tablename__ = "recommendation_sessions"

    id:               Optional[int]   = Field(default=None, primary_key=True)
    user_id:          int             = Field(foreign_key="users.id")
    chosen_option_id: Optional[int]   = Field(default=None)
    total_carbs:      Optional[float] = None
    created_at:       datetime        = Field(default_factory=datetime.utcnow)

    user:    Optional[User]               = Relationship(back_populates="rec_sessions")
    options: List["RecommendationOption"] = Relationship(back_populates="session")


class RecommendationOption(SQLModel, table=True):
    __tablename__ = "recommendation_options"

    id:             Optional[int]   = Field(default=None, primary_key=True)
    session_id:     int             = Field(foreign_key="recommendation_sessions.id")
    option_number:  int
    total_calories: Optional[float] = None
    total_protein:  Optional[float] = None
    total_fat:      Optional[float] = None

    session: Optional[RecommendationSession] = Relationship(back_populates="options")
    items:   List["RecommendationItem"]       = Relationship(back_populates="option")


class RecommendationItem(SQLModel, table=True):
    __tablename__ = "recommendation_items"

    id:         Optional[int]   = Field(default=None, primary_key=True)
    option_id:  int             = Field(foreign_key="recommendation_options.id")
    food_id:    Optional[int]   = Field(default=None)
    meal_type:  str
    quantity_g: Optional[float] = None
    calories:   Optional[float] = None

    option: Optional[RecommendationOption] = Relationship(back_populates="items")