import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function NavTabs() {
    const { isAdmin, isCarrier, isCompany } = useAuth()

    const linkClass = ({ isActive }) =>
        `px-5 py-2 rounded-full font-medium text-sm transition-all duration-200 ${isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
        }`

    return (
        <div className="flex items-center gap-2 bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
            {(isCarrier() || isAdmin()) && (
                <NavLink to="/shipping" className={linkClass}>Перевозки</NavLink>
            )}
            {(isCompany() || isAdmin()) && (
                <>
                    <NavLink to="/tracking" className={linkClass}>Отслеживание</NavLink>
                    <NavLink to="/search-routes" className={linkClass}>Поиск маршрутов</NavLink>
                </>
            )}
            <NavLink to="/schedule" className={linkClass}>Расписание</NavLink>
            {isAdmin() && (
                <NavLink to="/admin" className={linkClass}>Админ</NavLink>
            )}
        </div>
    )
}
