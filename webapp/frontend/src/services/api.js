// src/services/api.js
// Semua fungsi komunikasi frontend ↔ backend FastAPI
// Dipakai oleh: pages (Profile, Dashboard, History, NutritionDetail)

import axios from "axios";

// ─── 1. Setup Axios instance ──────────────────────────────────────────────────
const api = axios.create({
  baseURL: "http://localhost:8000/v1",
  headers: { "Content-Type": "application/json" },
});

// ─── 2. Request interceptor ───────────────────────────────────────────────────
// Otomatis tambah token JWT di setiap request
// Tidak perlu tulis "Authorization: Bearer ..." secara manual
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── 3. Response interceptor ─────────────────────────────────────────────────
// Kalau token expired (401) → hapus token & reload halaman (redirect ke login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem("token");
      const isLoginRequest = error.config?.url?.includes("/auth/login");

      // Only force-logout if token exists and this isn't a login attempt
      if (token && !isLoginRequest) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      }
    }
    return Promise.reject(error);
  },
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function register(name, email, password) {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
}

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  // Simpan token & info user ke localStorage
  localStorage.setItem("token", res.data.access_token);
  localStorage.setItem(
    "user",
    JSON.stringify({ id: res.data.user_id, name: res.data.user_name }),
  );
  return res.data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

//Simpan profil user → backend hitung BMR/TDEE → return hasil kalkulasi
export async function saveProfile(profileData) {
  const payload = {
    name: profileData.name,
    age: parseInt(profileData.age),
    weight_kg: parseFloat(profileData.weight),
    height_cm: parseFloat(profileData.height),
    target_weight_kg: parseFloat(profileData.targetWeight), // new
    gender: profileData.gender,
    activity_level: profileData.activityLevel,
    goal: profileData.goal,
    dietary: profileData.dietary || [],
    allergies: profileData.allergies || [],
  };
  const res = await api.put("/user/profile", payload);
  return res.data;
}

export async function getProfile() {
  const res = await api.get("/user/profile");
  return res.data;
}

// ─── MEALS ────────────────────────────────────────────────────────────────────

/**
 * Catat makanan yang dimakan
 * @param {Object} mealData — // { food_name, meal_type, quantity_g, calories, protein_g, carbs_g, fat_g, log_date }
 */
export async function logMeal(mealData) {
  const res = await api.post("/meals", mealData);
  return res.data;
}

/**
 * Ambil riwayat makanan berdasarkan tanggal
 * @param {string} date — format "2026-05-09"
 */
export async function getMealHistory(date = null) {
  const params = date ? { date } : {};
  const res = await api.get("/meals/history", { params });
  return res.data; // { date, logs: [...], summary: { total_calories, ... } }
}

/**
 * Hapus catatan makanan
 * @param {string} mealId — ID catatan yang mau dihapus
 */
export async function deleteMeal(mealId) {
  await api.delete(`/meals/${mealId}`);
}

// ─── FOODS ────────────────────────────────────────────────────────────────────

/**
 * Cari makanan dari database nutrisi
 * @param {string} query
 * @param {string} category
 */
export async function searchFoods(query = "", category = "") {
  const params = {};
  if (query) params.q = query;
  if (category) params.category = category;
  const res = await api.get("/foods", { params });
  return res.data; // { data: [...], total: N }
}

/**
 * Ambil detail satu makanan berdasarkan ID
 */
export async function getFoodDetail(foodId) {
  const res = await api.get(`/foods/${foodId}`);
  return res.data;
}
