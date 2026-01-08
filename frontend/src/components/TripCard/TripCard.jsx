import { useState, useEffect } from 'react'

export default function TripCard({ schedule }) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    const departure = new Date(schedule.departure_time)
    const arrival = new Date(schedule.arrival_time)

    const getComputedStatus = () => {
        if (schedule.status === 'Cancelled') return 'Cancelled'
        if (now >= arrival) return 'Completed'
        if (now >= departure && now < arrival) return 'InProgress'
        return 'Scheduled'
    }

    const computedStatus = getComputedStatus()

    let progress = 0
    if (computedStatus === 'Completed') progress = 100
    else if (computedStatus === 'InProgress') {
        const total = arrival - departure
        const elapsed = now - departure
        progress = Math.min(100, Math.max(0, (elapsed / total) * 100))
    }

    const formatTime = (date) => new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const formatDate = (date) => new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

    const statusColors = {
        Scheduled: 'bg-amber-100 text-amber-600',
        InProgress: 'bg-blue-100 text-blue-600',
        Completed: 'bg-slate-100 text-slate-600',
        Cancelled: 'bg-red-100 text-red-600'
    }

    const statusNames = {
        Scheduled: 'Запланирован',
        InProgress: 'В пути',
        Completed: 'Завершён',
        Cancelled: 'Отменён'
    }

    const ownerName = schedule.created_by?.login || null

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[computedStatus]}`}>
                    {statusNames[computedStatus] || computedStatus}
                </span>
                <span className="text-xs font-medium text-slate-400">Путь {schedule.track_number}</span>
            </div>

            <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-lg">
                    {schedule.train?.number || `Поезд #${schedule.train_id}`}
                </h4>
                {ownerName && (
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                        👤 {ownerName}
                    </span>
                )}
            </div>

            <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                <div className="flex-1">
                    <p className="text-xs text-slate-400">Откуда</p>
                    <p className="font-bold text-slate-800 text-sm">{schedule.from_station?.name || 'Станция A'}</p>
                </div>
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div className="flex-1 text-right">
                    <p className="text-xs text-slate-400">Куда</p>
                    <p className="font-bold text-slate-800 text-sm">{schedule.to_station?.name || 'Станция B'}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-center">
                    <p className="text-xs text-slate-400">{formatDate(departure)}</p>
                    <p className="font-bold text-slate-800">{formatTime(departure)}</p>
                    <p className="text-xs text-slate-400">Отправление</p>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-1000 ${computedStatus === 'Completed' ? 'bg-green-500' : computedStatus === 'InProgress' ? 'bg-blue-500' : 'bg-slate-300'}`}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] text-slate-400">{Math.round(progress)}%</span>
                </div>
                <div className="text-center">
                    <p className="text-xs text-slate-400">{formatDate(arrival)}</p>
                    <p className="font-bold text-slate-800">{formatTime(arrival)}</p>
                    <p className="text-xs text-slate-400">Прибытие</p>
                </div>
            </div>
        </div>
    )
}
