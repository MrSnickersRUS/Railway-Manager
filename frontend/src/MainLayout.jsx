import { Link } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import NavTabs from './components/common/NavTabs'

export default function MainLayout({ children }) {
    const { user, logout } = useAuth()

    const handleLogout = () => {
        logout(() => {
            window.location.href = '/'
        })
    }

    const roleNames = {
        Admin: 'Администратор',
        Carrier: 'Перевозчик',
        Dispatcher: 'Диспетчер',
        Company: 'Компания',
        Viewer: 'Наблюдатель'
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between shadow-soft">
                <div className="flex items-center gap-3">
                    <Link to="/" className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 hover:scale-105 transition-transform">
                        <span className="font-bold text-xl">Д</span>
                    </Link>
                    <span className="text-xl font-bold text-slate-800 tracking-tight hidden md:block">
                        ЖД<span className="text-primary-600">Диспетчер</span>
                    </span>
                </div>

                {user ? (
                    <>
                        <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
                            <NavTabs />
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="flex items-center gap-3 pl-5">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-800 leading-tight">{user?.login}</p>
                                    <p className="text-xs text-slate-400 font-medium">{roleNames[user?.role] || user?.role}</p>
                                </div>
                                <div className="relative group cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                                        <img src={`https://ui-avatars.com/api/?name=${user?.login}&background=random`} alt="Аватар" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="p-2 space-y-1">
                                            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg font-medium flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                                Выйти
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium px-4 py-2 rounded-xl hover:bg-slate-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        На главную
                    </Link>
                )}
            </header>
            <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
                {children}
            </main>
        </div>
    )
}
