import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token        = localStorage.getItem("token");
      const isLoginReq   = error.config?.url?.includes("/auth/login");
      if (token && !isLoginReq) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export async function register(name, email, password) {
  const res = await api.post("/auth/register", { name, email, password });
  return res.data;
}

export async function login(email, password) {
  const res = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", res.data.access_token);
  localStorage.setItem("user", JSON.stringify({
    id:   res.data.user_id,
    name: res.data.user_name,
  }));
  return res.data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isLoggedIn()    { return !!localStorage.getItem("token"); }
export function getCurrentUser() {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export async function saveOnboardingData({ age, gender }) {
  const res = await api.put("/user/onboarding", {
    age:    parseInt(age),
    gender: gender,
  });
  return res.data;
}

export async function saveProfile(profileData) {
  const payload = {
    weight_kg:        parseFloat(profileData.weight),
    height_cm:        parseFloat(profileData.height),
    target_weight_kg: parseFloat(profileData.targetWeight),
    activity_level:   profileData.activityLevel,
    goal:             profileData.goal,
    dietary:          profileData.dietary   || [],
    allergies:        profileData.allergies || [],
  };
  const res = await api.put("/user/profile", payload);
  return res.data;
}

export async function getProfile() {
  const res = await api.get("/user/profile");
  return res.data;
}

// ─── DIET PLANS ───────────────────────────────────────────────────────────────

/* Ambil semua plan milik user (untuk History card list) */
export async function getPlans() {
  const res = await api.get("/diet-plans");
  return res.data;
}

export async function getActivePlan() {
  const res = await api.get("/diet-plans/active");
  return res.data;
}

/** Ambil detail satu plan berdasarkan ID (untuk HistoryDetail) */
export async function getPlanDetail(planId) {
  const res = await api.get(`/diet-plans/${planId}`);
  return res.data;
}

export async function createPlan() {
  const res = await api.post("/diet-plans");
  return res.data;
}

// ─── MEALS ────────────────────────────────────────────────────────────────────

export async function logMeal(mealData) {
  const res = await api.post("/meals", mealData);
  return res.data;
}

export async function getMealHistory(date = null) {
  const params = date ? { date } : {};
  const res    = await api.get("/meals/history", { params });
  return res.data;
}

export async function deleteMeal(mealId) {
  await api.delete(`/meals/${mealId}`);
}