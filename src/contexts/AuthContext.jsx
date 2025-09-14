import { createContext, useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setLoading(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const response = await authAPI.verifyToken()
      if (response.success) {
        setUser(response.data.user)
      } else {
        throw new Error('Token verification failed')
      }
    } catch (error) {
      console.error('Token verification error:', error)
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials, userType) => {
    try {
      setLoading(true)
      let response
      
      if (userType === 'customer') {
        response = await authAPI.loginCustomer(credentials)
      } else if (userType === 'provider') {
        response = await authAPI.loginProvider(credentials)
      } else {
        throw new Error('Invalid user type')
      }

      if (response.success) {
        const { token: newToken, [userType]: userData } = response.data
        
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser({ ...userData, role: userType })
        
        toast.success(response.message || 'Login successful!')
        return { success: true, user: { ...userData, role: userType } }
      } else {
        toast.error(response.message || 'Login failed')
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      const message = error.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData, userType) => {
    try {
      setLoading(true)
      let response
      
      if (userType === 'customer') {
        response = await authAPI.registerCustomer(userData)
      } else if (userType === 'provider') {
        response = await authAPI.registerProvider(userData)
      } else {
        throw new Error('Invalid user type')
      }

      if (response.success) {
        const { token: newToken, [userType]: newUserData } = response.data
        
        localStorage.setItem('token', newToken)
        setToken(newToken)
        setUser({ ...newUserData, role: userType })
        
        toast.success(response.message || 'Registration successful!')
        return { success: true, user: { ...newUserData, role: userType } }
      } else {
        toast.error(response.message || 'Registration failed')
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error('Registration error:', error)
      const message = error.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isCustomer: user?.role === 'customer',
    isProvider: user?.role === 'provider'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}