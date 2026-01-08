import { useState, useEffect, useMemo } from 'react'
import { getSchedules, getTrains } from '../services/api'
import { useAuth } from '../context/AuthContext'
import TripCard from '../components/TripCard/TripCard'
import CreateTripModal from '../components/Modals/CreateTripModal'
import EditScheduleModal from '../components/Modals/EditScheduleModal'
import TrainsListModal from '../components/Modals/TrainsListModal'
import StationsModal from '../components/Modals/StationsModal'

export default function Schedule() {
    const [schedules, setSchedules] = useState([])
    const [loading, setLoading] = useState(true)
    const [showTripModal, setShowTripModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedSchedule, setSelectedSchedule] = useState(null)
    const [showTrainsList, setShowTrainsList] = useState(false)
    const [showStations, setShowStations] = useState(false)
    const [hideCompleted, setHideCompleted] = useState(true)
    const { user, isAdmin, isCarrier, isDispatcher } = useAuth()
    const canManage = isAdmin() || isCarrier() || isDispatcher()
    const [trains, setTrains] = useState([])

    useEffect(() => { fetchSchedules(); fetchTrains() }, [])

    const fetchSchedules = async () => {
        try { const res = await getSchedules(); setSchedules(res.data || []) } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    const fetchTrains = async () => {
        try { const res = await getTrains(); setTrains(res.data || []) } catch (err) { console.error(err) }
    }

    const canEditSchedule = (schedule) => {
        if (isAdmin()) return true
        return schedule.created_by_id && schedule.created_by_id === user?.id
    }

    const handleEditClick = (schedule) => {
        setSelectedSchedule(schedule)
        setShowEditModal(true)
    }

    const getComputedStatus = (schedule) => {
        const now = new Date()
        const departure = new Date(schedule.departure_time)
        const arrival = new Date(schedule.arrival_time)
        if (schedule.status === 'Cancelled') return 'Cancelled'
        if (now >= arrival) return 'Completed'
        if (now >= departure && now < arrival) return 'InProgress'
        return 'Scheduled'
    }

    const groupedSchedules = useMemo(() => {
        const now = new Date()
        const inProgress = []
        const scheduled = []
        const completed = []

        schedules.forEach(s => {
            const status = getComputedStatus(s)
            if (status === 'InProgress') inProgress.push({ ...s, computedStatus: status })
            else if (status === 'Scheduled') scheduled.push({ ...s, computedStatus: status })
            else completed.push({ ...s, computedStatus: status })
        })

        const sortByDeparture = (a, b) => new Date(a.departure_time) - new Date(b.departure_time)
        inProgress.sort(sortByDeparture)
        scheduled.sort(sortByDeparture)
        completed.sort((a, b) => new Date(b.arrival_time) - new Date(a.arrival_time)) // Most recent first

        return { inProgress, scheduled, completed }
    }, [schedules])

    const statusLabels = { InProgress: 'В пути', Scheduled: 'Запланированы', Completed: 'Завершены' }
    const statusColors = { InProgress: 'bg-blue-100 text-blue-700', Scheduled: 'bg-amber-100 text-amber-700', Completed: 'bg-slate-100 text-slate-500' }

    const renderSection = (title, items, statusKey) => {
        if (items.length === 0) return null
        if (statusKey === 'Completed' && hideCompleted) return null

        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusColors[statusKey]}`}>
                        {title} ({items.length})
                    </span>
                    {statusKey === 'Completed' && (
                        <button onClick={() => setHideCompleted(true)} className="text-xs text-slate-400 hover:text-slate-600">
                            Скрыть
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(schedule => (
                        <div key={schedule.id} className="card-new hover:shadow-lg transition-shadow duration-300 relative group">
                            <TripCard schedule={schedule} />
                            {canEditSchedule(schedule) && (
                                <button onClick={() => handleEditClick(schedule)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white rounded-lg shadow-md hover:bg-slate-50">
                                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Расписание</h1>
                    <p className="text-slate-500">Управление рейсами поездов</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    {hideCompleted && groupedSchedules.completed.length > 0 && (
                        <button onClick={() => setHideCompleted(false)} className="text-sm text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg">
                            Показать завершённые ({groupedSchedules.completed.length})
                        </button>
                    )}
                    {canManage && (
                        <>
                            <button onClick={() => setShowStations(true)} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                Станции
                            </button>
                            <button onClick={() => setShowTrainsList(true)} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                Поезда
                            </button>
                            <button onClick={() => setShowTripModal(true)} className="btn-primary flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Новый рейс
                            </button>
                        </>
                    )}
                </div>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="bg-white h-40 rounded-3xl animate-pulse"></div>)}
                </div>
            ) : (
                <div className="space-y-8">
                    {renderSection('В пути', groupedSchedules.inProgress, 'InProgress')}
                    {renderSection('Запланированы', groupedSchedules.scheduled, 'Scheduled')}
                    {renderSection('Завершены', groupedSchedules.completed, 'Completed')}
                    {schedules.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                            <h3 className="text-lg font-bold text-slate-800">Рейсов нет</h3>
                            <p className="text-slate-500">Создайте новый рейс для начала работы</p>
                        </div>
                    )}
                </div>
            )}
            <CreateTripModal isOpen={showTripModal} onClose={() => setShowTripModal(false)} trains={trains} onSuccess={fetchSchedules} />
            <EditScheduleModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} schedule={selectedSchedule} trains={trains} onSuccess={fetchSchedules} />
            <TrainsListModal isOpen={showTrainsList} onClose={() => setShowTrainsList(false)} trains={trains} onTrainUpdated={fetchTrains} />
            <StationsModal isOpen={showStations} onClose={() => setShowStations(false)} />
        </div>
    )
}
