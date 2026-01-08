import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSchedules, getStations } from '../services/api'
import StatCard from '../components/Dashboard/StatCard'
import Calendar from '../components/Calendar/Calendar'
import Modal from '../components/common/Modal'

export default function CompanyDashboard() {
    const [schedules, setSchedules] = useState([])
    const [stations, setStations] = useState([])
    const [selectedDaySchedules, setSelectedDaySchedules] = useState([])
    const [showDayModal, setShowDayModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [schedRes, stationsRes] = await Promise.all([getSchedules(), getStations()])
            setSchedules(schedRes.data || [])
            setStations(stationsRes.data || [])
        } catch (err) { console.error(err) }
    }

    const handleDayClick = (date, daySchedules) => {
        setSelectedDate(date)
        setSelectedDaySchedules(daySchedules)
        setShowDayModal(true)
    }

    const activeCount = schedules.filter(s => s.status === 'InProgress').length
    const scheduledCount = schedules.filter(s => s.status === 'Scheduled').length
    const statusNames = { Scheduled: 'Запланирован', InProgress: 'В пути', Completed: 'Завершён', Cancelled: 'Отменён' }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Отслеживание</h1>
                    <p className="text-slate-500">Мониторинг расписания и планирование маршрутов</p>
                </div>
                <Link to="/search-routes" className="btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Поиск маршрутов
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Всего рейсов" value={schedules.length.toString()} icon="train" color="blue" />
                <StatCard title="В пути" value={activeCount.toString()} icon="track" color="amber" />
                <StatCard title="Запланировано" value={scheduledCount.toString()} icon="schedule" color="green" />
                <StatCard title="Станций" value={stations.length.toString()} icon="chart" color="purple" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Calendar schedules={schedules} onDayClick={handleDayClick} />
                <div className="bg-white rounded-3xl p-6 shadow-card border border-white">
                    <h3 className="font-bold text-lg text-slate-800 mb-6">Ближайшие рейсы</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                        {schedules.slice(0, 6).map(s => (
                            <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{s.from_station?.name || 'A'} → {s.to_station?.name || 'B'}</p>
                                    <p className="text-xs text-slate-400">{new Date(s.departure_time).toLocaleString('ru-RU')}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.status === 'InProgress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{statusNames[s.status] || s.status}</span>
                            </div>
                        ))}
                        {schedules.length === 0 && <p className="text-center text-slate-400 py-8">Нет рейсов</p>}
                    </div>
                </div>
            </div>
            <Modal isOpen={showDayModal} onClose={() => setShowDayModal(false)} title={selectedDate?.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}>
                {selectedDaySchedules.length > 0 ? selectedDaySchedules.map(s => (
                    <div key={s.id} className="bg-slate-50 p-4 rounded-xl mb-2">
                        <p className="font-bold text-slate-800">{s.train?.number || 'Поезд'}</p>
                        <p className="text-sm text-slate-500">{s.from_station?.name || 'Старт'} → {s.to_station?.name || 'Финиш'}</p>
                    </div>
                )) : <p className="text-center text-slate-400 py-8">Нет рейсов</p>}
            </Modal>
        </div>
    )
}
