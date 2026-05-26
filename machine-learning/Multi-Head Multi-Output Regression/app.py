from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import joblib
import pandas as pd
import numpy as np
import time
from scipy.optimize import minimize
from tensorflow.keras.models import load_model

# =====================================================
# LOAD MODEL
# =====================================================

model = load_model('smart_diet_ai_model.keras')
preprocessor = joblib.load('preprocessor.pkl')
target_scaler = joblib.load('target_scaler.pkl')

# =====================================================
# MEAL CATEGORY MAPPING
# =====================================================

def map_meal_category(food_name: str) -> str:
    if pd.isna(food_name):
        return 'lunch'

    name = str(food_name).lower().strip()

    breakfast_keywords = [
        'breakfast', 'bagel', 'toast', 'bread', 'bun', 'roll',
        'egg', 'omelet', 'omelette', 'scramble', 'pancake', 'waffle',
        'porridge', 'oat', 'oatmeal', 'cereal', 'granola',
        'milk', 'yogurt', 'coffee', 'tea', 'smoothie',
        'banana', 'apple', 'fruit bowl', 'jam', 'margarine', 'butter'
    ]

    snack_keywords = [
        'cake', 'cookie', 'biscuit', 'cracker', 'chips', 'popcorn',
        'dessert', 'ice cream', 'pudding', 'chocolate', 'candy',
        'sweet', 'burfi', 'ladoo', 'halwa', 'pie', 'pastry',
        'muffin', 'brownie', 'donut', 'doughnut'
    ]

    dinner_keywords = [
        'grilled chicken', 'roast chicken', 'chicken curry',
        'salmon', 'tuna steak', 'fish curry', 'beef stew',
        'stew', 'curry', 'soup', 'broth', 'ramen', 'noodle soup',
        'rice bowl', 'fried rice', 'biryani', 'pilaf',
        'tofu', 'tempeh', 'stir-fry', 'sauteed', 'roasted vegetables',
        'meatball', 'lasagna', 'pasta', 'spaghetti', 'macaroni',
        'steak', 'grill', 'roast', 'baked'
    ]

    lunch_keywords = [
        'rice', 'noodle', 'noodles', 'sandwich', 'burger', 'wrap',
        'salad', 'chicken', 'beef', 'fish', 'shrimp', 'prawn',
        'tofu', 'tempeh', 'soup', 'stew', 'curry',
        'pasta', 'fried rice', 'omelette rice', 'meal', 'mixed dish'
    ]

    ingredient_keywords = [
        'flour', 'oil', 'sugar', 'syrup', 'powder', 'seasoning',
        'extract', 'shortening', 'butter oil'
    ]

    if any(keyword in name for keyword in ingredient_keywords):
        return 'snack'
    if any(keyword in name for keyword in breakfast_keywords):
        return 'breakfast'
    if any(keyword in name for keyword in snack_keywords):
        return 'snack'
    if any(keyword in name for keyword in dinner_keywords):
        return 'dinner'
    if any(keyword in name for keyword in lunch_keywords):
        return 'lunch'

    return 'lunch'

# =====================================================
# LOAD DATASET
# =====================================================

food_df = pd.read_csv('nutrition_labeled.csv')
food_df = food_df.dropna().reset_index(drop=True)
food_df = food_df[food_df['Calories (kcal per 100g)'] < 500]
food_df = food_df[food_df['Protein (g per 100g)'] > 5].copy()

food_df['meal_category'] = (
    food_df['food_normalized'].fillna(food_df['food']).apply(map_meal_category)
)

# Debug opsional
print(food_df['meal_category'].value_counts())

# =====================================================
# FASTAPI
# =====================================================

app = FastAPI()

# =====================================================
# REQUEST SCHEMA
# =====================================================

class NutritionInput(BaseModel):
    gender: str
    activity_level: str
    goal: str
    weight_kg: float
    target_weight: float
    height_cm: float
    age: int

class MealPlanInput(BaseModel):
    calories: float
    protein: float
    fat: float
    carbs: float
    day: int
    dietary_preferences: List[str] = []
    allergies: List[str] = []

# =====================================================
# RECOMMENDATION SCORE
# =====================================================

def calculate_recommendation_score(data, target_calories, target_protein, target_fat, target_carbs):
    data = data.copy()

    calorie_score = abs(data['Calories (kcal per 100g)'] - (target_calories / 6))
    protein_score = abs(data['Protein (g per 100g)'] - (target_protein / 6))
    fat_score = abs(data['Fat (g per 100g)'] - (target_fat / 6))
    carbs_score = abs(data['Carbohydrates (g per 100g)'] - (target_carbs / 6))

    data['recommendation_score'] = calorie_score + protein_score + fat_score + carbs_score
    return data

# =====================================================
# PORTION OPTIMIZATION
# =====================================================

def assign_portion_grams(top_foods, target_calories, target_protein, target_fat, target_carbs):
    top_foods = top_foods.copy()

    calories_arr = top_foods['Calories (kcal per 100g)'].values
    protein_arr = top_foods['Protein (g per 100g)'].values
    fat_arr = top_foods['Fat (g per 100g)'].values
    carbs_arr = top_foods['Carbohydrates (g per 100g)'].values

    def objective(portions):
        total_calories = np.sum(portions * calories_arr / 100)
        total_protein = np.sum(portions * protein_arr / 100)
        total_fat = np.sum(portions * fat_arr / 100)
        total_carbs = np.sum(portions * carbs_arr / 100)

        return (
            (total_calories - target_calories) ** 2 +
            (total_protein - target_protein) ** 2 +
            (total_fat - target_fat) ** 2 +
            (total_carbs - target_carbs) ** 2
        )

    initial_guess = np.array([100] * len(top_foods))
    bounds = [(50, 400) for _ in range(len(top_foods))]

    result = minimize(objective, initial_guess, bounds=bounds, method='L-BFGS-B')
    top_foods['recommended_grams'] = result.x

    return top_foods

# =====================================================
# FILTERING
# =====================================================

def filter_foods_by_preferences(data, dietary_preferences=None, allergies=None):
    dietary_preferences = dietary_preferences or []
    allergies = allergies or []

    filtered = data.copy()

    for pref in dietary_preferences:
        if pref in filtered.columns:
            filtered = filtered[filtered[pref] == True]

    for allergy in allergies:
        if allergy in filtered.columns:
            filtered = filtered[filtered[allergy] == False]

    return filtered

# =====================================================
# BMR & TDEE
# =====================================================

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    gender = gender.lower()

    if gender == 'male':
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    elif gender == 'female':
        return (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    else:
        raise ValueError("gender harus 'male' atau 'female'")

def calculate_tdee(bmr: float, activity_level: str) -> float:
    activity_level = activity_level.lower()

    activity_map = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }

    if activity_level not in activity_map:
        raise ValueError("activity_level harus salah satu dari: sedentary, light, moderate, active, very_active")

    return bmr * activity_map[activity_level]

# =====================================================
# ENDPOINT 1
# =====================================================

@app.post('/predict-nutrition')
def predict_nutrition(user: NutritionInput):
    try:
        bmr = calculate_bmr(
            weight_kg=user.weight_kg,
            height_cm=user.height_cm,
            age=user.age,
            gender=user.gender
        )

        tdee = calculate_tdee(
            bmr=bmr,
            activity_level=user.activity_level
        )
    except ValueError as e:
        return {"error": str(e)}

    sample_user = pd.DataFrame([{
        'gender': user.gender.lower(),
        'activity_level': user.activity_level.lower(),
        'goal': user.goal.lower(),
        'weight_kg': user.weight_kg,
        'height_cm': user.height_cm,
        'age': user.age,
        'bmr': bmr,
        'tdee': tdee
    }])

    sample_scaled = preprocessor.transform(sample_user)
    prediction_scaled = model.predict(sample_scaled, verbose=0)

    if isinstance(prediction_scaled, list):
        prediction_scaled = np.concatenate(
            [np.array(output).reshape(1, -1) for output in prediction_scaled],
            axis=1
        )
    else:
        prediction_scaled = np.array(prediction_scaled)

        if prediction_scaled.ndim == 3:
            prediction_scaled = prediction_scaled.reshape(prediction_scaled.shape[0], -1)
        elif prediction_scaled.ndim == 2 and prediction_scaled.shape == (4, 1):
            prediction_scaled = prediction_scaled.reshape(1, 4)
        elif prediction_scaled.ndim == 1:
            prediction_scaled = prediction_scaled.reshape(1, -1)

    prediction_real = target_scaler.inverse_transform(prediction_scaled)
    calories, protein, fat, carbs = prediction_real[0]

    if user.target_weight < user.weight_kg:
        goal_type = 'weight_loss'
    elif user.target_weight > user.weight_kg:
        goal_type = 'weight_gain'
    else:
        goal_type = 'maintain'

    weight_difference = abs(user.weight_kg - user.target_weight)

    if goal_type == 'weight_loss':
        weekly_rate = 0.75
    elif goal_type == 'weight_gain':
        weekly_rate = 0.4
    else:
        weekly_rate = 0

    estimated_days = (weight_difference / weekly_rate) * 7 if weekly_rate > 0 else 0

    total_calorie_change = weight_difference * 7700
    daily_calorie_change = (total_calorie_change / estimated_days) if estimated_days > 0 else 0
    daily_calorie_change = min(daily_calorie_change, 1000)

    if goal_type == 'weight_loss':
        adjusted_calories = calories - daily_calorie_change
    elif goal_type == 'weight_gain':
        adjusted_calories = calories + daily_calorie_change
    else:
        adjusted_calories = calories

    adjusted_calories = max(adjusted_calories, 1200)

    protein_ratio = 0.30
    fat_ratio = 0.25
    carbs_ratio = 0.45

    adjusted_protein = (adjusted_calories * protein_ratio) / 4
    adjusted_fat = (adjusted_calories * fat_ratio) / 9
    adjusted_carbs = (adjusted_calories * carbs_ratio) / 4

    return {
        'goal_type': goal_type,
        'estimated_days': int(round(estimated_days)),
        'input_summary': {
            'gender': user.gender.lower(),
            'activity_level': user.activity_level.lower(),
            'goal': user.goal.lower(),
            'bmr': float(round(bmr, 2)),
            'tdee': float(round(tdee, 2))
        },
        'daily_target': {
            'calories': float(round(adjusted_calories, 2)),
            'protein': float(round(adjusted_protein, 2)),
            'fat': float(round(adjusted_fat, 2)),
            'carbs': float(round(adjusted_carbs, 2))
        }
    }

# =====================================================
# MEAL PLAN HELPERS
# =====================================================

def classify_food_flags(food_name: str) -> dict:
    name = str(food_name).lower().strip()

    ingredient_keywords = [
        'flour', 'oil', 'sugar', 'syrup', 'powder', 'seasoning',
        'extract', 'shortening', 'butter oil', 'starch'
    ]

    dessert_keywords = [
        'cake', 'cookie', 'biscuit', 'cracker', 'chips', 'popcorn',
        'dessert', 'ice cream', 'pudding', 'chocolate', 'candy',
        'sweet', 'burfi', 'ladoo', 'halwa', 'pie', 'pastry',
        'muffin', 'brownie', 'donut', 'doughnut'
    ]

    breakfast_friendly_snack_keywords = [
        'bagel', 'toast', 'bread', 'bun', 'roll',
        'granola', 'cereal', 'oat bar', 'fruit bar'
    ]

    is_ingredient = any(keyword in name for keyword in ingredient_keywords)
    is_dessert = any(keyword in name for keyword in dessert_keywords)
    is_breakfast_friendly_snack = any(keyword in name for keyword in breakfast_friendly_snack_keywords)

    return {
        'is_ingredient': is_ingredient,
        'is_dessert': is_dessert,
        'is_breakfast_friendly_snack': is_breakfast_friendly_snack
    }

def apply_food_penalty(data: pd.DataFrame) -> pd.DataFrame:
    data = data.copy()

    flags = data['food'].apply(classify_food_flags)
    flags_df = pd.DataFrame(flags.tolist())

    data = pd.concat([data.reset_index(drop=True), flags_df.reset_index(drop=True)], axis=1)

    data['penalty_score'] = 0.0
    data.loc[data['is_dessert'] == True, 'penalty_score'] += 35.0
    data.loc[data['meal_category'] == 'snack', 'penalty_score'] += 15.0
    data.loc[data['food'].astype(str).str.lower().str.split().str.len() <= 1, 'penalty_score'] += 15.0

    breakfast_bonus_keywords = [
        'egg', 'omelette', 'oat', 'oatmeal', 'bread', 'toast',
        'bagel', 'milk', 'yogurt', 'banana', 'apple', 'tea', 'coffee'
    ]

    data['bonus_score'] = data.apply(
        lambda row: -10.0
        if row['meal_category'] == 'breakfast'
        and any(keyword in str(row['food']).lower() for keyword in breakfast_bonus_keywords)
        else 0.0,
        axis=1
    )

    data['final_score'] = data['recommendation_score'] + data['penalty_score'] + data['bonus_score']
    return data

def weighted_pick(data: pd.DataFrame, n: int) -> pd.DataFrame:
    data = data.copy()

    if data.empty:
        return data

    data['sampling_weight'] = 1 / (data['final_score'] + 1e-6)
    data['sampling_weight'] = data['sampling_weight'] / data['sampling_weight'].sum()

    n = min(n, len(data))

    return data.sample(
        n=n,
        replace=False,
        weights='sampling_weight',
        random_state=int(time.time() * 1000) % 1_000_000
    ).copy()

def pick_meal_candidates(scored_foods: pd.DataFrame, meal_time: str, sample_n: int = 2, top_n: int = 40) -> pd.DataFrame:
    candidates = scored_foods.copy()
    candidates = candidates[candidates['is_ingredient'] == False].copy()

    if meal_time == 'breakfast':
        main_candidates = candidates[candidates['meal_category'] == 'breakfast'].copy()
        snack_candidates = candidates[
            (candidates['meal_category'] == 'snack') &
            (candidates['is_breakfast_friendly_snack'] == True)
        ].copy()

        main_candidates = main_candidates.sort_values(by='final_score').head(min(top_n, len(main_candidates)))
        snack_candidates = snack_candidates.sort_values(by='final_score').head(min(top_n, len(snack_candidates)))

        picked_main = weighted_pick(main_candidates, 1)
        picked_snack = weighted_pick(snack_candidates, 1)

        picked = pd.concat([picked_main, picked_snack], ignore_index=True)

        if picked.empty:
            fallback = candidates[candidates['meal_category'] == 'breakfast'].copy()
            fallback = fallback.sort_values(by='final_score').head(min(sample_n, len(fallback)))
            picked = fallback

    elif meal_time == 'lunch':
        candidates = candidates[
            (candidates['meal_category'] == 'lunch') &
            (candidates['is_dessert'] == False)
        ].copy()

        candidates = candidates.sort_values(by='final_score').head(min(top_n, len(candidates)))
        picked = weighted_pick(candidates, sample_n)

    elif meal_time == 'dinner':
        candidates = candidates[
            (candidates['meal_category'] == 'dinner') &
            (candidates['is_dessert'] == False)
        ].copy()

        candidates = candidates.sort_values(by='final_score').head(min(top_n, len(candidates)))
        picked = weighted_pick(candidates, sample_n)

    else:
        picked = pd.DataFrame()

    if picked.empty:
        fallback = scored_foods[
            (scored_foods['is_ingredient'] == False) &
            (scored_foods['is_dessert'] == False)
        ].copy()

        fallback = fallback.sort_values(by='final_score').head(min(sample_n, len(fallback)))
        picked = fallback

    picked['meal_time'] = meal_time
    return picked

def format_meal_items(data: pd.DataFrame) -> list:
    items = []

    for _, row in data.iterrows():
        items.append({
            'food': row['food'],
            'meal_time': row['meal_time'],
            'meal_category': row['meal_category'],
            'recommended_grams': int(round(row['recommended_grams'])),
            'estimated_calories': float(round((row['recommended_grams'] * row['Calories (kcal per 100g)']) / 100, 2)),
            'protein_per_100g': float(row['Protein (g per 100g)']),
            'fat_per_100g': float(row['Fat (g per 100g)']),
            'carbs_per_100g': float(row['Carbohydrates (g per 100g)']),
            'final_score': float(round(row['final_score'], 2))
        })

    return items

# =====================================================
# ENDPOINT 2
# =====================================================

@app.post('/generate-meal-plan')
def generate_meal_plan(data: MealPlanInput):
    filtered_foods = filter_foods_by_preferences(
        food_df,
        dietary_preferences=data.dietary_preferences,
        allergies=data.allergies
    )

    if filtered_foods.empty:
        return {
            'breakfast': [],
            'lunch': [],
            'dinner': [],
            'message': 'Tidak ada makanan yang cocok dengan pantangan dan alergi yang dipilih.'
        }

    scored_foods = calculate_recommendation_score(
        filtered_foods,
        data.calories,
        data.protein,
        data.fat,
        data.carbs
    )

    scored_foods = apply_food_penalty(scored_foods)

    breakfast_foods = pick_meal_candidates(scored_foods, 'breakfast', sample_n=2, top_n=40)
    lunch_foods = pick_meal_candidates(scored_foods, 'lunch', sample_n=2, top_n=40)
    dinner_foods = pick_meal_candidates(scored_foods, 'dinner', sample_n=2, top_n=40)

    breakfast_foods = assign_portion_grams(
        breakfast_foods,
        data.calories * 0.25,
        data.protein * 0.25,
        data.fat * 0.25,
        data.carbs * 0.25
    )

    lunch_foods = assign_portion_grams(
        lunch_foods,
        data.calories * 0.35,
        data.protein * 0.35,
        data.fat * 0.35,
        data.carbs * 0.35
    )

    dinner_foods = assign_portion_grams(
        dinner_foods,
        data.calories * 0.40,
        data.protein * 0.40,
        data.fat * 0.40,
        data.carbs * 0.40
    )

    return {
        'breakfast': format_meal_items(breakfast_foods),
        'lunch': format_meal_items(lunch_foods),
        'dinner': format_meal_items(dinner_foods)
    }