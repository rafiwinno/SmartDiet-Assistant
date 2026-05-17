# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import create_db_and_tables
from routers.auth_router       import router as auth_router
from routers.users_router      import router as users_router
from routers.meals_router      import router as meals_router
from routers.foods_router      import router as foods_router
from routers.diet_plans_router import router as diet_plans_router

load_dotenv()

app = FastAPI(
    title       = "SmartDiet Assistant API",
    description = "Backend API untuk SmartDiet Assistant — CC26-PSU214\n\nBuka /docs untuk dokumentasi interaktif.",
    version     = "1.0.0"
)

# ─── CORS Middleware ──────────────────────────────────────────────────────────
allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins     = [o.strip() for o in allowed_origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins     = allowed_origins,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ─── Startup ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    print("🚀 SmartDiet API starting...")
    print("📦 Connecting to database...")
    create_db_and_tables()
    print("✅ Database tables ready")
    print("📖 Docs available at: http://localhost:8000/docs")

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "status"  : "running",
        "message" : "SmartDiet API is running 🥗",
        "docs"    : "http://localhost:8000/docs",
        "project" : "CC26-PSU214"
    }

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router,       prefix="/v1/auth",       tags=["🔐 Auth"])
app.include_router(users_router,      prefix="/v1/user",       tags=["👤 User Profile"])
app.include_router(meals_router,      prefix="/v1/meals",      tags=["🍽️ Meal Logs"])
app.include_router(foods_router,      prefix="/v1/foods",      tags=["🥦 Foods"])
app.include_router(diet_plans_router, prefix="/v1/diet-plans", tags=["📋 Diet Plans"])