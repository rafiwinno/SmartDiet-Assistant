from fastapi import FastAPI
from pydantic import BaseModel

import joblib
import pandas as pd
import numpy as np

from scipy.optimize import minimize

from tensorflow.keras.models import load_model

# =====================================================
# LOAD MODEL
# =====================================================

model = load_model(
    'multi_output_regression_model.keras'
)

feature_scaler = joblib.load(
    'feature_scaler.pkl'
)

target_scaler = joblib.load(
    'target_scaler.pkl'
)

# =====================================================
# LOAD FOOD DATASET
# =====================================================

food_df = pd.read_csv(
    'nutrition_labeled.csv'
)

# =====================================================
# CLEAN DATASET
# =====================================================

food_df = food_df.dropna()

food_df = food_df.reset_index(
    drop=True
)

food_df = food_df[

    food_df[
        'Calories (kcal per 100g)'
    ] < 500
]

food_df = food_df[

    food_df[
        'Protein (g per 100g)'
    ] > 5
]

# =====================================================
# FASTAPI APP
# =====================================================

app = FastAPI()

# =====================================================
# REQUEST SCHEMA
# =====================================================

class UserInput(BaseModel):

    gender_encoded: int

    activity_encoded: int

    goal_encoded: int

    weight_kg: float

    target_weight: float

    height_cm: float

    age: int

# =====================================================
# RECOMMENDATION SCORE
# =====================================================

def calculate_recommendation_score(

    data,

    target_calories,

    target_protein,

    target_fat,

    target_carbs
):

    data = data.copy()

    calorie_score = abs(

        data['Calories (kcal per 100g)']
        - (target_calories / 6)
    )

    protein_score = abs(

        data['Protein (g per 100g)']
        - (target_protein / 6)
    )

    fat_score = abs(

        data['Fat (g per 100g)']
        - (target_fat / 6)
    )

    carbs_score = abs(

        data['Carbohydrates (g per 100g)']
        - (target_carbs / 6)
    )

    data['recommendation_score'] = (

        calorie_score
        + protein_score
        + fat_score
        + carbs_score
    )

    return data

# =====================================================
# PORTION OPTIMIZATION
# =====================================================

def assign_portion_grams(

    top_foods,

    target_calories,

    target_protein,

    target_fat,

    target_carbs
):

    top_foods = top_foods.copy()

    calories_arr = (

        top_foods[
            'Calories (kcal per 100g)'
        ].values
    )

    protein_arr = (

        top_foods[
            'Protein (g per 100g)'
        ].values
    )

    fat_arr = (

        top_foods[
            'Fat (g per 100g)'
        ].values
    )

    carbs_arr = (

        top_foods[
            'Carbohydrates (g per 100g)'
        ].values
    )

    def objective(portions):

        total_calories = np.sum(

            portions
            * calories_arr
            / 100
        )

        total_protein = np.sum(

            portions
            * protein_arr
            / 100
        )

        total_fat = np.sum(

            portions
            * fat_arr
            / 100
        )

        total_carbs = np.sum(

            portions
            * carbs_arr
            / 100
        )

        error = (

            (total_calories - target_calories) ** 2

            +

            (total_protein - target_protein) ** 2

            +

            (total_fat - target_fat) ** 2

            +

            (total_carbs - target_carbs) ** 2
        )

        return error

    initial_guess = np.array(

        [100] * len(top_foods)
    )

    bounds = [

        (50, 400)

        for _ in range(
            len(top_foods)
        )
    ]

    result = minimize(

        objective,

        initial_guess,

        bounds=bounds,

        method='L-BFGS-B'
    )

    optimized_portions = result.x

    top_foods['recommended_grams'] = (

        optimized_portions
    )

    return top_foods

# =====================================================
# API ENDPOINT
# =====================================================

@app.post('/predict-meal-plan')

def predict_meal_plan(user: UserInput):

    # =================================================
    # INPUT DATAFRAME
    # =================================================

    sample_user = pd.DataFrame([{

        'gender_encoded': user.gender_encoded,

        'activity_encoded': user.activity_encoded,

        'goal_encoded': user.goal_encoded,

        'weight_kg': user.weight_kg,

        'height_cm': user.height_cm,

        'age': user.age
    }])

    # =================================================
    # FEATURE SCALING
    # =================================================

    sample_scaled = feature_scaler.transform(
        sample_user
    )

    # =================================================
    # MODEL PREDICTION
    # =================================================

    prediction_scaled = model.predict(

        sample_scaled,

        verbose=0
    )

    # =================================================
    # INVERSE TRANSFORM
    # =================================================

    prediction_real = (

        target_scaler
        .inverse_transform(
            prediction_scaled
        )
    )

    calories, protein, fat, carbs = (

        prediction_real[0]
    )

    # =================================================
    # GOAL TYPE
    # =================================================

    if user.target_weight < user.weight_kg:

        goal_type = 'weight_loss'

    elif user.target_weight > user.weight_kg:

        goal_type = 'weight_gain'

    else:

        goal_type = 'maintain'

    # =================================================
    # ESTIMATED DAYS
    # =================================================

    weight_difference = abs(

        user.weight_kg
        - user.target_weight
    )

    if goal_type == 'weight_loss':

        weekly_rate = 0.75

    elif goal_type == 'weight_gain':

        weekly_rate = 0.4

    else:

        weekly_rate = 0

    if weekly_rate > 0:

        estimated_days = (

            (weight_difference / weekly_rate)
            * 7
        )

    else:

        estimated_days = 0

    # =================================================
    # CALORIE ADJUSTMENT
    # =================================================

    total_calorie_change = (

        weight_difference
        * 7700
    )

    if estimated_days > 0:

        daily_calorie_change = (

            total_calorie_change
            / estimated_days
        )

    else:

        daily_calorie_change = 0

    daily_calorie_change = min(

        daily_calorie_change,

        1000
    )

    if goal_type == 'weight_loss':

        adjusted_calories = (

            calories
            - daily_calorie_change
        )

    elif goal_type == 'weight_gain':

        adjusted_calories = (

            calories
            + daily_calorie_change
        )

    else:

        adjusted_calories = calories

    adjusted_calories = max(

        adjusted_calories,

        1200
    )

    # =================================================
    # MACRO DISTRIBUTION
    # =================================================

    protein_ratio = 0.30

    fat_ratio = 0.25

    carbs_ratio = 0.45

    adjusted_protein = (

        adjusted_calories
        * protein_ratio
        / 4
    )

    adjusted_fat = (

        adjusted_calories
        * fat_ratio
        / 9
    )

    adjusted_carbs = (

        adjusted_calories
        * carbs_ratio
        / 4
    )

    # =================================================
    # FOOD SCORING
    # =================================================

    scored_foods = (

        calculate_recommendation_score(

            food_df,

            adjusted_calories,

            adjusted_protein,

            adjusted_fat,

            adjusted_carbs
        )
    )

    # =================================================
    # MULTI DAY MEAL PLAN
    # =================================================

    meal_labels = [

        'breakfast',

        'lunch',

        'dinner'
    ]

    multi_day_meal_plan = []

    total_days = int(
        round(estimated_days)
    )

    for day in range(total_days):

        randomized_foods = (

            scored_foods

            .sort_values(
                by='recommendation_score'
            )

            .head(50)

            .sample(
                n=6,
                replace=False
            )

            .copy()
        )

        optimized_foods = (

            assign_portion_grams(

                randomized_foods,

                adjusted_calories,

                adjusted_protein,

                adjusted_fat,

                adjusted_carbs
            )
        )

        optimized_foods['meal_time'] = [

            meal_labels[
                i % len(meal_labels)
            ]

            for i in range(
                len(optimized_foods)
            )
        ]

        daily_plan = {

            'day': day + 1,

            'breakfast': [],

            'lunch': [],

            'dinner': []
        }

        for _, row in optimized_foods.iterrows():

            daily_plan[
                row['meal_time']
            ].append({

                'food': row['food'],

                'recommended_grams': int(
                    round(
                        row['recommended_grams']
                    )
                ),

                'estimated_calories': float(

                    round(

                        (
                            row['recommended_grams']
                            *
                            row['Calories (kcal per 100g)']
                        )
                        / 100,

                        2
                    )
                ),

                'protein_per_100g': float(
                    row['Protein (g per 100g)']
                ),

                'fat_per_100g': float(
                    row['Fat (g per 100g)']
                ),

                'carbs_per_100g': float(
                    row['Carbohydrates (g per 100g)']
                )
            })

        multi_day_meal_plan.append(
            daily_plan
        )

    # =================================================
    # RESPONSE
    # =================================================

    return {

        'goal_type': goal_type,

        'estimated_days': int(
            round(estimated_days)
        ),

        'daily_target': {

            'calories': float(
                round(adjusted_calories, 2)
            ),

            'protein': float(
                round(adjusted_protein, 2)
            ),

            'fat': float(
                round(adjusted_fat, 2)
            ),

            'carbs': float(
                round(adjusted_carbs, 2)
            )
        },

        'multi_day_meal_plan': (

            multi_day_meal_plan
        )
    }