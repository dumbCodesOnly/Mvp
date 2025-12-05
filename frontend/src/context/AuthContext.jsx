import { createContext, useState, useEffect, useContext } from 'react'
import api from '../api/config'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    const { access_token, user } = response.data
    localStorage.setItem('token', access_token)
    setToken(access_token)
    setUser(user)
    return user
  }

  const register = async (email, password, referralCode = '') => {
    const response = await api.post('/api/auth/register', {
      email,
      password,
      referral_code: referralCode
    })
    const { access_token, user } = response.data
    localStorage.setItem('token', access_token)
    setToken(access_token)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
