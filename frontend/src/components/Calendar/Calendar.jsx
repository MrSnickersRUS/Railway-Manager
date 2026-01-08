import { useState, useMemo } from 'react'

export default function Calendar({ schedules = [], onDayClick, showPast = false }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const now = new Date()
    const todayDateStr = now.toDateString()

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

    const filteredSchedules = useMemo(() => {
        if (showPast) return schedules
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return schedules.filter(s => new Date(s.arrival_time) >= todayStart)
    }, [schedules, showPast])

    const schedulesMap = useMemo(() => {
        const map = {}
        filteredSchedules.forEach(s => {
            const date = new Date(s.departure_time).toDateString()
            if (!map[date]) map[date] = []
            map[date].push(s)
        })
        return map
    }, [filteredSchedules])

    const getDayStatus = (day) => {
        const date = new Date(year, month, day).toDateString()
        const count = schedulesMap[date]?.length || 0
        if (count === 0) return 'free'
        if (count >= 5) return 'busy'
        return 'partial'
    }

    const isPastDay = (day) => {
        const dayDate = new Date(year, month, day)
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        return dayDate < todayStart
    }

    const getStatusColor = (status, isPast) => {
        if (isPast) return 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
        switch (status) {
            case 'busy': return 'bg-red-100 text-red-700 border-red-200'
            case 'partial': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'free': return 'bg-green-50 text-slate-600 border-green-100 hover:bg-green-100'
            default: return 'bg-slate-50 text-slate-400'
        }
    }

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-12"></div>)
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const status = getDayStatus(day)
        const isToday = todayDateStr === new Date(year, month, day).toDateString()
        const isPast = isPastDay(day)
        const count = schedulesMap[new Date(year, month, day).toDateString()]?.length || 0

        days.push(
            <button
                key={day}
                onClick={() => !isPast && onDayClick?.(new Date(year, month, day), schedulesMap[new Date(year, month, day).toDateString()] || [])}
                disabled={isPast && !showPast}
                className={`h-12 rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 
                    ${getStatusColor(status, isPast && !showPast)}
                    ${isToday ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                    ${!isPast || showPast ? 'hover:scale-105 active:scale-95' : ''}
                `}
            >
                <span className="text-sm font-bold">{day}</span>
                {count > 0 && !isPast && (
                    <span className="text-[10px] font-medium opacity-70">{count} рейс{count > 1 ? (count < 5 ? 'а' : 'ов') : ''}</span>
                )}
            </button>
        )
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-card border border-white">
            <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className="text-lg font-bold text-slate-800">
                    {monthNames[month]} {year}
                </h3>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">{days}</div>

            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200"></div>
                    <span className="text-xs text-slate-500">Свободно</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-200"></div>
                    <span className="text-xs text-slate-500">Частично</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></div>
                    <span className="text-xs text-slate-500">Занято</span>
                </div>
            </div>
        </div>
    )
}
