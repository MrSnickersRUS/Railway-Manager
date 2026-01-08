import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) loadUser()
        else setLoading(false)
    }, [])

    const loadUser = async () => {
        try {
            const response = await getMe()
            setUser(response.data)
        } catch (error) {
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }

    const login = (token, userData) => {
        localStorage.setItem('token', token)
        setUser(userData)
        return userData
    }

    const logout = useCallback((callback) => {
        localStorage.removeItem('token')
        setUser(null)
        if (callback) callback()
    }, [])

    const isAdmin = () => user?.role === 'Admin'
    const isCarrier = () => user?.role === 'Carrier' || user?.role === 'Dispatcher'
    const isCompany = () => user?.role === 'Company' || user?.role === 'Viewer'
    const isDispatcher = () => user?.role === 'Dispatcher' || user?.role === 'Admin'

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isCarrier, isCompany, isDispatcher }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
