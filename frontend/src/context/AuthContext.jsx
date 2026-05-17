import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access')
    if (token) {
      api.get('/auth/me/')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password })
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    setUser(res.data.user)
    return res.data
  }

  const register = async (data) => {
    const res = await api.post('/auth/register/', data)
    localStorage.setItem('access', res.data.access)
    localStorage.setItem('refresh', res.data.refresh)
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
