import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
    const { user } = useAuth()

    const getDashboardLink = () => {
        if (!user) return '/login/admin'
        if (user.role === 'Carrier' || user.role === 'Dispatcher') return '/shipping'
        if (user.role === 'Company' || user.role === 'Viewer') return '/tracking'
        if (user.role === 'Admin') return '/shipping'
        return '/schedule'
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full z-10 relative">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                        <span className="font-bold text-xl">Д</span>
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">
                        ЖД<span className="text-primary-600">Диспетчер</span>
                    </span>
                </div>

                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-500 hidden sm:inline">Добро пожаловать, {user.login}</span>
                        <Link to={getDashboardLink()} className="font-medium bg-primary-50 text-primary-600 px-5 py-2 rounded-full hover:bg-primary-100 transition-colors">
                            В панель управления
                        </Link>
                    </div>
                ) : (
                    <Link to="/login/admin" className="font-medium text-slate-600 hover:text-primary-600 transition-colors">
                        Войти
                    </Link>
                )}
            </nav>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-20 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl pointer-events-none -z-10"></div>

                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold animate-fade-in-up">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    Система работает v2.0
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
                    Платформа <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">ЖД-Логистики</span> нового поколения
                </h1>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-8">
                    Умная диспетчеризация, отслеживание в реальном времени и автоматическое планирование для современного промышленного транспорта.
                </p>

                <Link to="/search-routes" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-semibold rounded-full shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300 mb-12">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Найти маршрут
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-4 text-left">
                    <Link to={user ? getDashboardLink() : "/login/admin"} className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            <svg className="w-7 h-7 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Администратор</h3>
                        <p className="text-slate-500 text-sm">Полный контроль системы, управление пользователями и настройки.</p>
                    </Link>

                    <Link to={user ? getDashboardLink() : "/login/carrier"} className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <svg className="w-7 h-7 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Перевозчик</h3>
                        <p className="text-slate-500 text-sm">Управляйте парком, просматривайте расписание и создавайте рейсы.</p>
                    </Link>

                    <Link to={user ? getDashboardLink() : "/login/company"} className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-amber-100 transition-all duration-300 transform hover:-translate-y-1">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <svg className="w-7 h-7 text-slate-700 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Компания</h3>
                        <p className="text-slate-500 text-sm">Отслеживайте грузы и мониторьте статус доставки в реальном времени.</p>
                    </Link>
                </div>
            </div>

            <footer className="py-6 text-center text-slate-400 text-sm">
                © 2026 ЖД Диспетчер. Все права защищены.
            </footer>
        </div>
    )
}
