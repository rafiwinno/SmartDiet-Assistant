# SmartDiet Assistant

SmartDiet Assistant adalah aplikasi berbasis kecerdasan buatan yang membantu pengguna dalam merencanakan pola makan sehat secara personal. Sistem ini mengintegrasikan analisis data nutrisi, machine learning, dan aplikasi web untuk menghasilkan rekomendasi diet yang sesuai dengan kebutuhan pengguna.

---

## Fitur Utama

* Analisis data nutrisi makanan

  * Pengolahan dan pembersihan dataset
  * Exploratory Data Analysis (EDA)

* Sistem rekomendasi diet berbasis AI

  * Prediksi kebutuhan nutrisi
  * Model multi-output regression

* Dashboard visualisasi

  * Penyajian data nutrisi
  * Monitoring pola makan

* Aplikasi web

  * Autentikasi pengguna
  * Manajemen data user
  * Meal planner dan riwayat konsumsi

---

## Struktur Project

```
SmartDiet-Assistant/
│
├── data-science/
│   ├── Notebook EDA dan feature engineering
│   ├── Dataset nutrisi
│   └── Dashboard berbasis Python
│
├── machine-learning/
│   ├── Training model
│   ├── Multi-output regression
│   └── File model (.keras, .pkl)
│
├── webapp/
│   ├── backend/
│   │   ├── routers
│   │   ├── models dan schemas
│   │   └── integrasi AI
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

* FastAPI
* Python
* SQLite atau database lain

### Frontend

* React (Vite)
* JavaScript
* CSS

### Machine Learning

* TensorFlow / Keras
* Scikit-learn
* Pandas
* NumPy

---

## Cara Menjalankan Project

### 1. Clone Repository

```bash
git clone <repo-url>
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

```
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

```
http://localhost:5173
```

---

### 4. Menjalankan Model Machine Learning (Opsional)

Masuk ke direktori:

```bash
cd machine-learning
```

Gunakan file:

* `app.py` untuk inference
* file `.keras` sebagai model
* file `.pkl` untuk preprocessing

---

## Dataset

Dataset yang digunakan meliputi data nutrisi makanan yang telah melalui proses pembersihan dan preprocessing.

Lokasi dataset:

```
data-science/
```

---

## Alur Sistem

1. Pengguna memasukkan data seperti profil dan aktivitas
2. Backend memproses input
3. Model machine learning menghitung kebutuhan nutrisi
4. Sistem menghasilkan rekomendasi diet
5. Hasil ditampilkan pada dashboard





* menambahkan API documentation section
* atau membuat arsitektur sistem (diagram) agar lebih kuat untuk presentasi
