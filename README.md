# SmartDiet Assistant

SmartDiet Assistant adalah aplikasi berbasis kecerdasan buatan yang membantu pengguna merencanakan pola makan sehat secara personal. Sistem ini mengintegrasikan analisis data nutrisi, machine learning, recommendation engine, dan aplikasi web untuk menghasilkan target nutrisi serta rekomendasi makanan yang sesuai dengan kebutuhan pengguna.

---

## Fitur Utama

### Analisis Data Nutrisi

* Pengolahan dan pembersihan dataset
* Exploratory Data Analysis (EDA)
* Feature engineering

### Sistem Rekomendasi Diet Berbasis AI

* Prediksi kebutuhan nutrisi personal
* MLP Multi-Head Multi-Output Regression
* Nutritional target prediction
* Recommendation engine
* Nutritional scoring
* Automated meal planner

### Dashboard Visualisasi

* Penyajian data nutrisi
* Monitoring pola makan
* Visualisasi hasil analisis

### Aplikasi Web

* Autentikasi pengguna
* Manajemen data pengguna
* Meal planner
* Riwayat konsumsi makanan

---

## Struktur Project

```text
SmartDiet-Assistant/
│
├── data-science/
│   ├── Notebook EDA
│   ├── Feature Engineering
│   ├── Dataset Exploration
│   └── Dashboard Python
│
├── machine-learning/
│   ├── AI_Engineer.ipynb
│   ├── nutrition_final.csv
│   ├── training_data_for_ai_engineer.csv
│   │
│   └── Multi-Head Multi-Output Regression/
│       ├── app.py
│       ├── Model Artifacts (.keras)
│       ├── Preprocessing Artifacts (.pkl)
│       ├── TensorBoard Logs
│       └── Documentation
│
├── webapp/
│   ├── backend/
│   │   ├── routers
│   │   ├── models
│   │   ├── schemas
│   │   └── AI integration
│   │
│   └── frontend/
│       ├── pages
│       ├── components
│       └── API services
│
└── README.md
```

---

## Teknologi yang Digunakan

### Backend

* Python
* FastAPI
* SQLModel
* PostgreSQL
* Supabase
* JWT Authentication
* Bcrypt Password Hashing
* Uvicorn ASGI Server
* HTTPX

### Frontend

* React (JavaScript)
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts

### Machine Learning & Data Processing

* TensorFlow / Keras
* Scikit-learn
* TensorBoard
* Pandas
* NumPy
* Matplotlib

---

## Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone <repository-url>
cd SmartDiet-Assistant
```

---

### 2. Menjalankan Backend

```bash
cd webapp/backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend berjalan pada:

```text
http://127.0.0.1:8000
```

---

### 3. Menjalankan Frontend

```bash
cd webapp/frontend
npm install
npm run dev
```

Frontend berjalan pada:

```text
http://localhost:5173
```

---

### 4. Menjalankan Model Machine Learning (Opsional, Jika Ingin Menggunakan Model Yang Sudah Di Deploy Tidak Perlu Setup Manual di Local)

Masuk ke direktori:

```bash
cd machine-learning/Multi-Head Multi-Output Regression
```

Komponen deployment terdiri dari:

* Model MLP Multi-Head Multi-Output Regression (.keras)
* Preprocessor (preprocessor.pkl)
* Target Scaler (target_scaler.pkl)
* Inference Script (app.py)

Komponen tersebut digunakan untuk proses prediksi kebutuhan nutrisi dan penyusunan rekomendasi makanan.

---

## Dataset

Dataset yang digunakan terdiri dari:

### Dataset Profil Pengguna

Digunakan untuk melatih model prediksi kebutuhan nutrisi berdasarkan karakteristik pengguna.

### Dataset Nutrisi Makanan

Digunakan untuk proses nutritional scoring, recommendation engine, dan penyusunan meal planner.

Lokasi dataset:

```text
machine-learning/
```

Dataset training dan dataset nutrisi untuk keperluan menjalankan model tersimpan pada folder machine-learning/.

---

## Alur Sistem

```text
User Input
      │
      ▼
Feature Engineering
(BMI, BMR, TDEE,
TDEE/BMR Ratio)
      │
      ▼
MLP Multi-Head
Multi-Output Regression
      │
      ▼
Prediksi Target Nutrisi
(Kalori, Protein,
Lemak, Karbohidrat)
      │
      ▼
Recommendation Engine
      │
      ▼
Meal Planner
      │
      ▼
Dashboard & Web App
```

### Tahapan Sistem

1. Pengguna memasukkan profil dan aktivitas fisik.
2. Sistem melakukan feature engineering (BMI, BMR, TDEE, dan TDEE/BMR Ratio).
3. Model MLP Multi-Head Multi-Output Regression memprediksi kebutuhan nutrisi pengguna.
4. Recommendation engine melakukan nutritional scoring dan pencocokan makanan.
5. Sistem menyusun meal planner berdasarkan target nutrisi.
6. Hasil ditampilkan melalui dashboard dan aplikasi web.

---

## Model Machine Learning

Model yang digunakan adalah:

**Multi-Layer Perceptron (MLP)** dengan arsitektur **Multi-Head Multi-Output Regression** berbasis **TensorFlow Functional API**.

Model memanfaatkan shared hidden layers untuk memprediksi secara simultan:

* Target kalori
* Target protein
* Target lemak
* Target karbohidrat

Model dilatih menggunakan custom training loop berbasis **tf.GradientTape** dengan **Early Stopping**, **Learning Rate Scheduling**, dan **TensorBoard Monitoring** untuk meningkatkan kontrol proses pelatihan serta monitoring performa model.

---

## Monitoring Training

Training model dimonitor menggunakan TensorBoard untuk:

* Visualisasi training loss
* Visualisasi validation loss
* Monitoring performa model
* Analisis proses pelatihan

TensorBoard logs tersedia pada:

```text
machine-learning/Multi-Head Multi-Output Regression/tensorboard_logs.zip
```

---

# The Team Behind SmartDiet Assistant

SmartDiet Assistant was developed as a collaborative capstone project focused on personalized nutrition prediction, intelligent food recommendation, and AI-powered meal planning.

### Team Members

* **Muhammad Rafi Winno Pratama** — CDCC296D6Y1790
* **Nabila Farah Hanani** — CDCC296D6X2732
* **Billy Ramadhani** — CFCC296D6Y1112
* **Noval Aditya Candra Pratama** — CFCC296D6Y1964
* **Aril Ponco Nugroho** — CACC296D6Y2484
* **Adi Bayu Saputra** — CACC296D6Y2558

Together, we built SmartDiet Assistant to help users achieve healthier lifestyles through personalized nutrition insights, intelligent food recommendations, and AI-powered meal planning.
