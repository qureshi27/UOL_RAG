"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { API_ENDPOINTS } from "@/lib/api-config"

interface User {
  id: string
  email: string
  role: "admin" | "user"
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: "admin" | "user") => Promise<boolean>
  logout: () => void
  signup: (email: string, password: string, name: string, role: "admin" | "user") => Promise<boolean>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (token) {
          const userData = localStorage.getItem("user_data")
          if (userData) {
            setUser(JSON.parse(userData))
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, role: "admin" | "user"): Promise<boolean> => {
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("username", email)
      formData.append("password", password)

      const response = await fetch(`http://localhost:8000${API_ENDPOINTS.login}`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const userData: User = {
          id: email, // Use email as ID since backend uses username
          email: email,
          role: role, // Use the role from the form
          name: email.split("@")[0], // Extract name from email
        }

        localStorage.setItem("auth_token", data.access_token)
        localStorage.setItem("user_data", JSON.stringify(userData))
        setUser(userData)
        return true
      }

      return false
    } catch (error) {
      console.error("Login failed:", error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string, role: "admin" | "user"): Promise<boolean> => {
    try {
      setLoading(true)

      console.log("[v0] Starting signup process for:", email, "with role:", role)
      console.log("[v0] Attempting to connect to:", `http://localhost:8000${API_ENDPOINTS.signup}`)

      // First check if backend is reachable
      try {
        const healthCheck = await fetch("http://localhost:8000/health", {
          method: "GET",
          mode: "cors",
        })
        console.log("[v0] Health check response:", healthCheck.status)
      } catch (healthError) {
        console.error("[v0] Backend health check failed:", healthError)
        throw new Error("Backend server is not running on localhost:8000. Please start your FastAPI server.")
      }

      const response = await fetch(`http://localhost:8000${API_ENDPOINTS.signup}`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
          role: role,
        }),
      })

      console.log("[v0] Signup response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Signup successful, attempting auto-login")
        // After successful signup, automatically log in
        return await login(email, password, role)
      } else {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        console.error("[v0] Signup failed with error:", errorData)
        throw new Error(errorData.detail || `Signup failed with status ${response.status}`)
      }
    } catch (error) {
      console.error("[v0] Signup failed:", error)

      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        throw new Error(
          "Cannot connect to backend server. Please ensure your FastAPI server is running on http://localhost:8000",
        )
      }

      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, signup, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
