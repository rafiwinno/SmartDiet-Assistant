# Data Dummy 

from database import create_db_and_tables, engine
from models import Food
from sqlmodel import Session, select

# ─── Data Nutrisi Sample (per 100g) ──────────────────────────────────────────
SAMPLE_FOODS = [
    # GRAINS / KARBOHIDRAT
    {"name": "Nasi Putih",         "category": "grains",     "calories_per_100g": 130,  "protein_g": 2.7,  "carbs_g": 28.6, "fat_g": 0.3},
    {"name": "Nasi Merah",         "category": "grains",     "calories_per_100g": 123,  "protein_g": 2.6,  "carbs_g": 25.8, "fat_g": 0.9},
    {"name": "Oatmeal",            "category": "grains",     "calories_per_100g": 389,  "protein_g": 17.0, "carbs_g": 66.0, "fat_g": 7.0},
    {"name": "Roti Gandum",        "category": "grains",     "calories_per_100g": 247,  "protein_g": 9.0,  "carbs_g": 43.0, "fat_g": 3.4},
    {"name": "Kentang Rebus",      "category": "grains",     "calories_per_100g": 77,   "protein_g": 2.0,  "carbs_g": 17.0, "fat_g": 0.1},
    {"name": "Mie Telur",          "category": "grains",     "calories_per_100g": 138,  "protein_g": 4.5,  "carbs_g": 25.0, "fat_g": 2.1},

    # PROTEIN
    {"name": "Ayam Bakar",         "category": "protein",    "calories_per_100g": 165,  "protein_g": 31.0, "carbs_g": 0.0,  "fat_g": 3.6},
    {"name": "Ayam Goreng",        "category": "protein",    "calories_per_100g": 246,  "protein_g": 26.0, "carbs_g": 8.0,  "fat_g": 12.0},
    {"name": "Ikan Salmon",        "category": "protein",    "calories_per_100g": 208,  "protein_g": 20.0, "carbs_g": 0.0,  "fat_g": 13.0},
    {"name": "Ikan Tuna Kaleng",   "category": "protein",    "calories_per_100g": 116,  "protein_g": 26.0, "carbs_g": 0.0,  "fat_g": 1.0},
    {"name": "Telur Rebus",        "category": "protein",    "calories_per_100g": 155,  "protein_g": 13.0, "carbs_g": 1.1,  "fat_g": 11.0},
    {"name": "Tahu Goreng",        "category": "protein",    "calories_per_100g": 271,  "protein_g": 17.0, "carbs_g": 11.0, "fat_g": 18.0},
    {"name": "Tempe Goreng",       "category": "protein",    "calories_per_100g": 195,  "protein_g": 19.0, "carbs_g": 9.0,  "fat_g": 11.0},
    {"name": "Daging Sapi Panggang","category": "protein",   "calories_per_100g": 250,  "protein_g": 26.0, "carbs_g": 0.0,  "fat_g": 15.0},

    # SAYURAN
    {"name": "Bayam",              "category": "vegetable",  "calories_per_100g": 23,   "protein_g": 2.9,  "carbs_g": 3.6,  "fat_g": 0.4},
    {"name": "Brokoli",            "category": "vegetable",  "calories_per_100g": 34,   "protein_g": 2.8,  "carbs_g": 7.0,  "fat_g": 0.4},
    {"name": "Kangkung Tumis",     "category": "vegetable",  "calories_per_100g": 40,   "protein_g": 3.0,  "carbs_g": 6.0,  "fat_g": 0.5},
    {"name": "Wortel",             "category": "vegetable",  "calories_per_100g": 41,   "protein_g": 0.9,  "carbs_g": 10.0, "fat_g": 0.2},
    {"name": "Tomat",              "category": "vegetable",  "calories_per_100g": 18,   "protein_g": 0.9,  "carbs_g": 3.9,  "fat_g": 0.2},

    # BUAH
    {"name": "Pisang",             "category": "fruit",      "calories_per_100g": 89,   "protein_g": 1.1,  "carbs_g": 23.0, "fat_g": 0.3},
    {"name": "Apel",               "category": "fruit",      "calories_per_100g": 52,   "protein_g": 0.3,  "carbs_g": 14.0, "fat_g": 0.2},
    {"name": "Jeruk",              "category": "fruit",      "calories_per_100g": 47,   "protein_g": 0.9,  "carbs_g": 12.0, "fat_g": 0.1},
    {"name": "Mangga",             "category": "fruit",      "calories_per_100g": 60,   "protein_g": 0.8,  "carbs_g": 15.0, "fat_g": 0.4},
    {"name": "Semangka",           "category": "fruit",      "calories_per_100g": 30,   "protein_g": 0.6,  "carbs_g": 7.6,  "fat_g": 0.2},

    # DAIRY / SUSU
    {"name": "Yogurt Plain",       "category": "dairy",      "calories_per_100g": 59,   "protein_g": 10.0, "carbs_g": 3.6,  "fat_g": 0.4},
    {"name": "Susu Sapi",          "category": "dairy",      "calories_per_100g": 61,   "protein_g": 3.2,  "carbs_g": 4.8,  "fat_g": 3.3},
    {"name": "Keju Cheddar",       "category": "dairy",      "calories_per_100g": 403,  "protein_g": 25.0, "carbs_g": 1.3,  "fat_g": 33.0},

    # SNACK / LAINNYA
    {"name": "Kacang Almond",      "category": "snack",      "calories_per_100g": 579,  "protein_g": 21.0, "carbs_g": 22.0, "fat_g": 50.0},
    {"name": "Pisang Goreng",      "category": "snack",      "calories_per_100g": 219,  "protein_g": 1.2,  "carbs_g": 32.0, "fat_g": 10.0},
]


def seed():
    """Isi tabel foods dengan data sample"""
    create_db_and_tables()

    with Session(engine) as session:
        # Cek apakah sudah ada data
        existing = session.exec(select(Food)).first()
        if existing:
            print(f"⚠️  Data foods sudah ada. Skipping seed.")
            return

        # Insert semua data
        for item in SAMPLE_FOODS:
            food = Food(**item)
            session.add(food)

        session.commit()
        print(f"✅ {len(SAMPLE_FOODS)} makanan berhasil ditambahkan ke Supabase!")
        print("   Tim Data Scientist bisa tambah data lebih banyak dari dataset Kaggle.")


if __name__ == "__main__":
    seed()