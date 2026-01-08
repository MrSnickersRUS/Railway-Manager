import { useState, useEffect } from 'react'
import { getStats, getSchedules } from '../services/api'
import StatCard from '../components/Dashboard/StatCard'
import TripCard from '../components/TripCard/TripCard'

export default function Home() {
    const [stats, setStats] = useState(null)
    const [schedules, setSchedules] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [statsRes, schedulesRes] = await Promise.all([
                getStats(),
                getSchedules()
            ])
            setStats(statsRes.data)
            setSchedules(schedulesRes.data)
        } catch (error) {
            console.error('Ошибка загрузки:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    const activeSchedules = schedules.filter(s => s.status === 'InProgress' || s.status === 'Scheduled')

    return (
        <div className="space-y-6">
            {/* Заголовок */}
            <div>
                <h1 className="text-2xl font-bold text-white">Панель управления</h1>
                <p className="text-slate-400">Диспетчерский узел промышленного ЖД-транспорта</p>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Всего поездов"
                    value={stats?.total_trains || 0}
                    icon="train"
                    color="blue"
                />
                <StatCard
                    title="Активные рейсы"
                    value={stats?.active_schedules || 0}
                    icon="schedule"
                    color="green"
                />
                <StatCard
                    title="Занято путей"
                    value={stats?.tracks_in_use || 0}
                    icon="track"
                    color="amber"
                />
                <StatCard
                    title="Загрузка"
                    value={`${Math.round(stats?.occupancy_percent || 0)}%`}
                    icon="chart"
                    color="purple"
                />
            </div>

            {/* Активные рейсы */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Текущие рейсы</h2>
                {activeSchedules.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeSchedules.slice(0, 6).map(schedule => (
                            <TripCard key={schedule.id} schedule={schedule} />
                        ))}
                    </div>
                ) : (
                    <div className="card p-8 text-center">
                        <p className="text-slate-400">Нет активных рейсов</p>
                    </div>
                )}
            </div>
        </div>
    )
}
