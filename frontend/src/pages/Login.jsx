import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin, getMe } from '../services/api'

export default function Login() {
    const { role } = useParams()
    const [loginValue, setLoginValue] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login: authLogin, user } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) redirectBasedOnRole(user.role)
    }, [user])

    const getAllowedRoles = () => {
        switch (role) {
            case 'admin': return ['Admin']
            case 'carrier': return ['Carrier', 'Dispatcher']
            case 'company': return ['Company', 'Viewer']
            default: return ['Admin', 'Carrier', 'Dispatcher', 'Company', 'Viewer']
        }
    }

    const redirectBasedOnRole = (userRole) => {
        if (userRole === 'Carrier' || userRole === 'Dispatcher') navigate('/shipping')
        else if (userRole === 'Company' || userRole === 'Viewer') navigate('/tracking')
        else navigate('/shipping')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await apiLogin(loginValue, password)
            const token = res.data.token
            localStorage.setItem('token', token)
            const userRes = await getMe()
            const userData = userRes.data

            const allowedRoles = getAllowedRoles()
            if (!allowedRoles.includes(userData.role)) {
                localStorage.removeItem('token')
                setError('Пользователь не найден')
                return
            }

            authLogin(token, userData)
            redirectBasedOnRole(userData.role)
        } catch (err) {
            console.error(err)
            localStorage.removeItem('token')
            if (err.message === 'Network Error') setError('Сервер недоступен.')
            else if (err.response?.status === 401) setError('Неверный логин или пароль')
            else setError('Ошибка входа.')
        } finally {
            setLoading(false)
        }
    }

    const getRoleTitle = () => {
        switch (role) {
            case 'admin': return { title: 'Вход для администратора', color: 'primary', link: null }
            case 'carrier': return { title: 'Вход для перевозчика', color: 'blue', link: '/register/carrier' }
            case 'company': return { title: 'Вход для компании', color: 'amber', link: '/register/company' }
            default: return { title: 'Добро пожаловать', color: 'primary', link: null }
        }
    }
    const config = getRoleTitle()
    const styles = {
        primary: { bg: 'bg-primary-600', text: 'text-primary-600', soft: 'bg-primary-100' },
        blue: { bg: 'bg-blue-600', text: 'text-blue-600', soft: 'bg-blue-100' },
        amber: { bg: 'bg-amber-600', text: 'text-amber-600', soft: 'bg-amber-100' }
    }
    const currentStyle = styles[config.color] || styles.primary

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
            <div className={`absolute top-0 right-0 w-64 h-64 ${currentStyle.soft} rounded-bl-full -mr-20 -mt-20 opacity-40 blur-3xl pointer-events-none`}></div>
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                На главную
            </Link>
            <div className="bg-white rounded-3xl shadow-card p-10 w-full max-w-md border border-white relative overflow-hidden">
                <div className="text-center mb-8">
                    <div className={`w-16 h-16 ${currentStyle.bg} rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-4`}>
                        <span className="font-bold text-2xl">Д</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">{config.title}</h1>
                    <p className="text-slate-500 mt-2">Введите ваши данные</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Логин</label>
                        <input type="text" value={loginValue} onChange={(e) => setLoginValue(e.target.value)} className="input-field" placeholder="Введите логин" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Пароль</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required />
                    </div>
                    <button type="submit" disabled={loading} className={`w-full py-3.5 text-lg font-medium text-white rounded-full hover:opacity-90 transition-all shadow-lg ${currentStyle.bg}`}>
                        {loading ? 'Загрузка...' : 'Войти'}
                    </button>
                </form>
                {config.link && (
                    <div className="text-center mt-8 pt-6 border-t border-slate-100">
                        <p className="text-sm text-slate-400 mb-3">Нет аккаунта?</p>
                        <Link to={config.link} className={`font-semibold ${currentStyle.text} hover:underline`}>Зарегистрироваться</Link>
                    </div>
                )}
            </div>
        </div>
    )
}
