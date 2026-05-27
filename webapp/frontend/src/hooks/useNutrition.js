import { useState, useEffect, useCallback } from 'react'
import {
  getProfile, saveProfile,
  getMealHistory, logMeal, deleteMeal,
  isLoggedIn
} from '../services/api'
import { calcMacroTargets } from '../constants/nutrition'

export function useNutrition() {
  const [profile,      setProfile]      = useState(null)
  const [macroTargets, setMacroTargets] = useState(null)
  // const [todayLogs,    setTodayLogs]    = useState([])
  const [todaySummary, setTodaySummary] = useState(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

  // Ambil profil & log hari ini saat pertama kali mount
  useEffect(() => {
    if (isLoggedIn()) {
      fetchProfile()
      fetchTodayLogs()
    }
  }, [])

  // ─── Profil ──────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile()
      setProfile(data)
      if (data.calorie_target && data.goal) {
        setMacroTargets(calcMacroTargets(data.calorie_target, data.goal))
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Gagal mengambil data profil')
      }
    }
  }, [])

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await saveProfile(profileData)
      setProfile(result)
      if (result.calorie_target && result.goal) {
        setMacroTargets(calcMacroTargets(result.calorie_target, result.goal))
      }
      return result
    } catch (err) {
      const msg = err.response?.data?.detail || 'Gagal menyimpan profil'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Meal Logs ───────────────────────────────────────────────
  const fetchTodayLogs = useCallback(async () => {
    try {
      const data = await getMealHistory()
      setTodayLogs(data.logs)
      setTodaySummary(data.summary)
    } catch {
      setTodayLogs([])
    }
  }, [])

  const addMealLog = useCallback(async (mealData) => {
    setLoading(true)
    try {
      await logMeal(mealData)
      await fetchTodayLogs()   // refresh log setelah tambah
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal mencatat makanan')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchTodayLogs])

  const removeMealLog = useCallback(async (mealId) => {
    try {
      await deleteMeal(mealId)
      await fetchTodayLogs()   // refresh log setelah hapus
    } catch (err) {
      setError('Gagal menghapus catatan makanan')
    }
  }, [fetchTodayLogs])

  return {
    profile,
    macroTargets,
    todayLogs,
    todaySummary,
    loading,
    error,
    refetchProfile: fetchProfile,
    updateProfile,
    addMealLog,
    removeMealLog,
    refetchLogs:    fetchTodayLogs,
  }
}