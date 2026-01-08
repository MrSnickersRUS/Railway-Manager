import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { register } from '../services/api'
import Modal from '../components/common/Modal'

export default function Register() {
    const { role } = useParams()
    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const navigate = useNavigate()

    const config = role === 'carrier'
        ? { title: 'Регистрация перевозчика', color: 'blue' }
        : { title: 'Регистрация компании', color: 'amber' }

    const styles = {
        blue: 'bg-blue-600',
        amber: 'bg-amber-600'
    }

    const bgTheme = styles[config.color] || 'bg-primary-600'

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Пароли не совпадают")
            return
        }
        if (password.length < 6) {
            setError("Пароль должен быть минимум 6 символов")
            return
        }
        setLoading(true)
        setError('')

        const backendRole = role === 'carrier' ? 'Carrier' : 'Company'

        try {
            await register(login, password, backendRole)
            setShowSuccess(true)
        } catch (err) {
            console.error(err)
            if (err.response?.status === 409) {
                setError('Пользователь с таким именем уже существует')
            } else if (err.response?.status === 400) {
                setError('Неверные данные. Проверьте логин и пароль (мин. 6 символов)')
            } else {
                setError('Ошибка регистрации. Попробуйте позже.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative">
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                На главную
            </Link>

            <div className="bg-white rounded-3xl shadow-card p-10 w-full max-w-md border border-white">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-800">{config.title}</h1>
                    <p className="text-slate-500 mt-2">Создайте новый аккаунт</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Логин</label>
                        <input type="text" value={login} onChange={(e) => setLogin(e.target.value)}
                            className="input-field" placeholder="Выберите логин" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Пароль (мин. 6 символов)</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                            className="input-field" placeholder="Придумайте пароль" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Подтверждение пароля</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field" placeholder="Повторите пароль" required />
                    </div>

                    <button type="submit" disabled={loading}
                        className={`w-full py-3.5 text-lg font-medium text-white rounded-full hover:opacity-90 transition-all shadow-lg active:scale-[0.98] ${bgTheme}`}>
                        {loading ? 'Создание...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link to={`/login/${role}`} className="text-sm font-medium text-slate-400 hover:text-slate-600 hover:underline">
                        Уже есть аккаунт? Войти
                    </Link>
                </div>
            </div>

            <Modal isOpen={showSuccess} onClose={() => navigate(`/login/${role}`)} title="Регистрация успешна!">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-slate-600 mb-6">Аккаунт успешно создан! Теперь вы можете войти в систему.</p>
                    <button
                        onClick={() => navigate(`/login/${role}`)}
                        className={`w-full py-3 text-white font-medium rounded-full ${bgTheme}`}
                    >
                        Перейти к входу
                    </button>
                </div>
            </Modal>
        </div>
    )
}
