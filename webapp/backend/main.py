# main.py
# Entry point aplikasi FastAPI SmartDiet

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import create_db_and_tables
from routers.auth_router  import router as auth_router
from routers.users_router import router as users_router
from routers.meals_router import router as meals_router
from routers.foods_router import router as foods_router

load_dotenv()

# ─── Inisialisasi FastAPI ─────────────────────────────────────────────────────
app = FastAPI(
    title       = "SmartDiet Assistant API",
    description = "Backend API untuk SmartDiet Assistant — CC26-PSU214\n\nBuka /docs untuk dokumentasi interaktif.",
    version     = "1.0.0"
)


# ─── CORS Middleware ──────────────────────────────────────────────────────────
# Tanpa ini, browser akan blokir request dari frontend ke backend
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins     = allowed_origins,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)


# ─── Startup: buat tabel di Supabase ─────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    print("🚀 SmartDiet API starting...")
    print("📦 Connecting to Supabase...")
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


# ─── Daftarkan semua router ───────────────────────────────────────────────────
#
# URL pattern:
# /v1/auth/...    → autentikasi (register, login)
# /v1/user/...    → profil user (GET, PUT /user/profile)
# /v1/meals/...   → catatan makanan (POST, GET history, DELETE)
# /v1/foods/...   → database nutrisi makanan

app.include_router(auth_router,  prefix="/v1/auth",  tags=["🔐 Auth"])
app.include_router(users_router, prefix="/v1/user",  tags=["👤 User Profile"])
app.include_router(meals_router, prefix="/v1/meals", tags=["🍽️ Meal Logs"])
app.include_router(foods_router, prefix="/v1/foods", tags=["🥦 Foods"])