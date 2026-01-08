import { useState, useEffect } from 'react'
import { getStats, getSchedules } from '../services/api'
import StatCard from '../components/Dashboard/StatCard'
import Calendar from '../components/Calendar/Calendar'
import Modal from '../components/common/Modal'

export default function CarrierDashboard() {
    const [stats, setStats] = useState({})
    const [schedules, setSchedules] = useState([])
    const [selectedDaySchedules, setSelectedDaySchedules] = useState([])
    const [showDayModal, setShowDayModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [statsRes, schedRes] = await Promise.all([getStats(), getSchedules()])
            setStats(statsRes.data || {})
            setSchedules(schedRes.data || [])
        } catch (err) { console.error(err) }
    }

    const handleDayClick = (date, daySchedules) => {
        setSelectedDate(date)
        setSelectedDaySchedules(daySchedules)
        setShowDayModal(true)
    }

    const statusNames = { Scheduled: 'Запланирован', InProgress: 'В пути', Completed: 'Завершён', Cancelled: 'Отменён' }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Панель перевозчика</h1>
                <p className="text-slate-500">Обзор вашего парка и операций</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Всего поездов" value={stats.total_trains?.toString() || '0'} icon="train" color="blue" />
                <StatCard title="Активных рейсов" value={stats.active_schedules?.toString() || '0'} icon="schedule" color="green" />
                <StatCard title="Занято путей" value={stats.tracks_in_use?.toString() || '0'} icon="track" color="amber" />
                <StatCard title="Станций" value={stats.total_stations?.toString() || '0'} icon="chart" color="purple" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Calendar schedules={schedules} onDayClick={handleDayClick} />
                <div className="bg-white rounded-3xl p-6 shadow-card border border-white">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Последняя активность</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {schedules.slice(0, 6).map(s => (
                            <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{s.train?.number || 'Поезд'}</p>
                                    <p className="text-xs text-slate-400">{new Date(s.departure_time).toLocaleString('ru-RU')}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'InProgress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{statusNames[s.status] || s.status}</span>
                            </div>
                        ))}
                        {schedules.length === 0 && <p className="text-center text-slate-400 py-8">Нет активности</p>}
                    </div>
                </div>
            </div>
            <Modal isOpen={showDayModal} onClose={() => setShowDayModal(false)} title={selectedDate?.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
                {selectedDaySchedules.length > 0 ? selectedDaySchedules.map(s => (
                    <div key={s.id} className="bg-slate-50 p-4 rounded-xl mb-2">
                        <p className="font-bold text-slate-800">{s.train?.number || 'Поезд'}</p>
                        <p className="text-sm text-slate-500">{s.from_station?.name || 'Старт'} → {s.to_station?.name || 'Финиш'}</p>
                        <p className="text-xs text-slate-400">{new Date(s.departure_time).toLocaleTimeString()} - {new Date(s.arrival_time).toLocaleTimeString()}</p>
                    </div>
                )) : <p className="text-center text-slate-400 py-8">Нет рейсов в этот день</p>}
            </Modal>
        </div>
    )
}
