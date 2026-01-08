import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import MainLayout from './MainLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import CarrierDashboard from './pages/CarrierDashboard'
import CompanyDashboard from './pages/CompanyDashboard'
import CompanyScheduleSearch from './pages/CompanyScheduleSearch'
import Schedule from './pages/Schedule'
import Admin from './pages/Admin'

function PrivateRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth()
    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-100"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-600"></div></div>
    if (!user) return <Navigate to="/login/admin" />
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        if (user.role === 'Carrier' || user.role === 'Dispatcher') return <Navigate to="/shipping" />
        if (user.role === 'Company' || user.role === 'Viewer') return <Navigate to="/tracking" />
        return <Navigate to="/" />
    }
    return <MainLayout>{children}</MainLayout>
}

function DashboardRedirect() {
    const { user } = useAuth()
    if (!user) return <Navigate to="/login/admin" />
    if (user.role === 'Carrier' || user.role === 'Dispatcher') return <Navigate to="/shipping" />
    if (user.role === 'Company' || user.role === 'Viewer') return <Navigate to="/tracking" />
    return <Navigate to="/shipping" />
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/register/:role" element={<Register />} />
            <Route path="/login" element={<Navigate to="/login/admin" />} />
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/shipping" element={<PrivateRoute allowedRoles={['Carrier', 'Dispatcher', 'Admin']}><CarrierDashboard /></PrivateRoute>} />
            <Route path="/tracking" element={<PrivateRoute allowedRoles={['Company', 'Viewer', 'Admin']}><CompanyDashboard /></PrivateRoute>} />
            <Route path="/search-routes" element={<MainLayout><CompanyScheduleSearch /></MainLayout>} />
            <Route path="/schedule" element={<PrivateRoute allowedRoles={['Admin', 'Carrier', 'Dispatcher', 'Company', 'Viewer']}><Schedule /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute allowedRoles={['Admin']}><Admin /></PrivateRoute>} />
        </Routes>
    )
}
