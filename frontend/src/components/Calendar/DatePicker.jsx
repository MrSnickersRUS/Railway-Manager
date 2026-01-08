import { useState, useRef, useEffect } from 'react'

export default function DatePicker({ value, onChange, placeholder = 'Выберите дату', minDate = null }) {
    const [isOpen, setIsOpen] = useState(false)
    const [currentDate, setCurrentDate] = useState(new Date())
    const containerRef = useRef(null)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const effectiveMinDate = minDate ? new Date(minDate) : todayStart

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

    const selectDate = (day) => {
        const dayDate = new Date(year, month, day)
        const minDateStart = new Date(effectiveMinDate.getFullYear(), effectiveMinDate.getMonth(), effectiveMinDate.getDate())
        if (dayDate < minDateStart) return
        const selected = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        onChange(selected)
        setIsOpen(false)
    }

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return ''
        const d = new Date(dateStr)
        return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
    }

    const isDisabledDay = (day) => {
        const dayDate = new Date(year, month, day)
        const minDateStart = new Date(effectiveMinDate.getFullYear(), effectiveMinDate.getMonth(), effectiveMinDate.getDate())
        return dayDate < minDateStart
    }

    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-8"></div>)
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const isSelected = value === dateStr
        const isToday = now.toDateString() === new Date(year, month, day).toDateString()
        const isDisabled = isDisabledDay(day)

        days.push(
            <button
                key={day}
                type="button"
                onClick={() => selectDate(day)}
                disabled={isDisabled}
                className={`h-8 w-8 rounded-lg text-sm font-medium transition-all
                    ${isDisabled ? 'text-slate-300 cursor-not-allowed' : ''}
                    ${isSelected && !isDisabled ? 'bg-primary-600 text-white' : ''}
                    ${!isSelected && !isDisabled ? 'hover:bg-slate-100 text-slate-700' : ''}
                    ${isToday && !isSelected ? 'ring-2 ring-primary-300' : ''}
                `}
            >
                {day}
            </button>
        )
    }

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="input-field w-full text-left flex items-center justify-between"
            >
                <span className={value ? 'text-slate-800' : 'text-slate-400'}>
                    {value ? formatDisplayDate(value) : placeholder}
                </span>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 min-w-[280px]">
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={prevMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-sm font-bold text-slate-800">
                            {monthNames[month]} {year}
                        </span>
                        <button type="button" onClick={nextMonth} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {dayNames.map(d => (
                            <div key={d} className="text-center text-xs font-medium text-slate-400 h-8 flex items-center justify-center">{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days}
                    </div>
                </div>
            )}
        </div>
    )
}
