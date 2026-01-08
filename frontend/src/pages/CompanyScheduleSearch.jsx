import { useState, useEffect, useMemo } from 'react'
import { getSchedules, getStations } from '../services/api'
import DatePicker from '../components/Calendar/DatePicker'

export default function CompanyScheduleSearch() {
    const [allSchedules, setAllSchedules] = useState([])
    const [stations, setStations] = useState([])
    const [legs, setLegs] = useState([{ from: '', to: '', date: '', transfer_time: 0 }])
    const [searchResults, setSearchResults] = useState([])
    const [maxTransfers, setMaxTransfers] = useState(2)
    const [nearbyDays, setNearbyDays] = useState(3)
    const [allowMultiDay, setAllowMultiDay] = useState(true)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [schedRes, stationsRes] = await Promise.all([getSchedules(), getStations()])
            setAllSchedules(schedRes.data || [])
            setStations(stationsRes.data || [])
        } catch (err) { console.error(err) }
    }

    const schedules = useMemo(() => {
        const now = new Date()
        return allSchedules.filter(s => new Date(s.arrival_time) >= now)
    }, [allSchedules])

    const addLeg = () => {
        const lastLeg = legs[legs.length - 1]
        setLegs([...legs, { from: lastLeg.to, to: '', date: '', transfer_time: 30 }])
    }

    const removeLeg = (index) => {
        if (legs.length > 1) setLegs(legs.filter((_, i) => i !== index))
    }

    const updateLeg = (index, field, value) => {
        const updated = [...legs]
        updated[index][field] = value
        if (field === 'to' && index < legs.length - 1) updated[index + 1].from = value
        setLegs(updated)
    }

    const getFilteredToStations = (fromId) => stations.filter(s => s.id != fromId)
    const getStationName = (id) => stations.find(s => s.id == id)?.name || 'Неизвестно'

    const getComputedStatus = (schedule) => {
        const now = new Date()
        const departure = new Date(schedule.departure_time)
        const arrival = new Date(schedule.arrival_time)
        if (schedule.status === 'Cancelled') return 'Cancelled'
        if (now >= arrival) return 'Completed'
        if (now >= departure && now < arrival) return 'InProgress'
        return 'Scheduled'
    }

    const findDirectSchedules = (fromId, toId, date) => {
        return schedules.filter(s => {
            const matchFrom = !fromId || parseInt(s.from_station_id) === parseInt(fromId)
            const matchTo = !toId || parseInt(s.to_station_id) === parseInt(toId)
            const matchDate = !date || new Date(s.departure_time).toDateString() === new Date(date).toDateString()
            return matchFrom && matchTo && matchDate
        })
    }

    const findNearbySchedules = (fromId, toId, date, daysRange) => {
        if (!date) return []
        const targetDate = new Date(date)
        const now = new Date()
        return schedules.filter(s => {
            const matchFrom = !fromId || parseInt(s.from_station_id) === parseInt(fromId)
            const matchTo = !toId || parseInt(s.to_station_id) === parseInt(toId)
            const schedDate = new Date(s.departure_time)
            if (schedDate < now) return false // Skip past
            const diffDays = Math.abs((schedDate - targetDate) / (1000 * 60 * 60 * 24))
            return matchFrom && matchTo && diffDays <= daysRange && diffDays > 0
        }).sort((a, b) => Math.abs(new Date(a.departure_time) - targetDate) - Math.abs(new Date(b.departure_time) - targetDate))
    }

    const findTransferRoutes = (fromId, toId, startDate, maxHops) => {
        if (!fromId || !toId) return []
        const fromIdInt = parseInt(fromId)
        const toIdInt = parseInt(toId)
        const routes = []
        const startDateObj = startDate ? new Date(startDate) : null
        const now = new Date()

        const queue = [{ path: [], currentStation: fromIdInt, lastArrival: startDateObj, visited: new Set([fromIdInt]) }]

        while (queue.length > 0 && routes.length < 10) {
            const { path, currentStation, lastArrival, visited } = queue.shift()
            if (path.length >= maxHops) continue

            const departures = schedules.filter(s => {
                const sFromId = parseInt(s.from_station_id)
                const sToId = parseInt(s.to_station_id)
                if (sFromId !== currentStation) return false
                if (visited.has(sToId)) return false

                const depTime = new Date(s.departure_time)
                if (depTime < now) return false // Skip past schedules

                if (path.length === 0 && startDateObj) {
                    if (allowMultiDay) {
                        const diffDays = (depTime - startDateObj) / (1000 * 60 * 60 * 24)
                        if (diffDays < 0 || diffDays > nearbyDays) return false
                    } else {
                        if (depTime.toDateString() !== startDateObj.toDateString()) return false
                    }
                }

                if (path.length > 0 && lastArrival) {
                    if (depTime < lastArrival) return false
                    const waitDays = (depTime - lastArrival) / (1000 * 60 * 60 * 24)
                    if (waitDays > nearbyDays) return false
                }

                return true
            })

            for (const sched of departures) {
                const sToId = parseInt(sched.to_station_id)
                const newPath = [...path, sched]
                const newArrival = new Date(sched.arrival_time)

                if (sToId === toIdInt) {
                    routes.push(newPath)
                } else if (newPath.length < maxHops) {
                    const newVisited = new Set(visited)
                    newVisited.add(sToId)
                    queue.push({ path: newPath, currentStation: sToId, lastArrival: newArrival, visited: newVisited })
                }
            }
        }
        return routes
    }

    const handleSearch = () => {
        const results = legs.map((leg, i) => {
            const fromStation = stations.find(s => s.id == leg.from)
            const toStation = stations.find(s => s.id == leg.to)
            let directSchedules = findDirectSchedules(leg.from, leg.to, leg.date)
            let transferRoutes = []

            if (directSchedules.length === 0 && leg.from && leg.to) {
                transferRoutes = findTransferRoutes(leg.from, leg.to, leg.date, maxTransfers)
                transferRoutes = transferRoutes.filter(route => route.length > 1)
            }

            let nearbySchedules = []
            if (directSchedules.length === 0 && transferRoutes.length === 0 && leg.date) {
                nearbySchedules = findNearbySchedules(leg.from, leg.to, leg.date, nearbyDays)
            }

            return {
                leg: i + 1,
                from: fromStation?.name || '-',
                to: toStation?.name || '-',
                date: leg.date,
                directSchedules,
                transferRoutes,
                nearbySchedules,
                hasResults: directSchedules.length > 0 || transferRoutes.length > 0
            }
        })
        setSearchResults(results)
    }

    const statusNames = { Scheduled: 'Запланирован', InProgress: 'В пути', Completed: 'Завершён', Cancelled: 'Отменён' }
    const statusColors = { Scheduled: 'bg-amber-100 text-amber-600', InProgress: 'bg-blue-100 text-blue-600', Completed: 'bg-slate-100 text-slate-500', Cancelled: 'bg-red-100 text-red-600' }

    const formatTime = (date) => new Date(date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    const formatDate = (date) => new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })

    const ScheduleCard = ({ schedule }) => {
        const computedStatus = getComputedStatus(schedule)
        const departure = new Date(schedule.departure_time)
        const arrival = new Date(schedule.arrival_time)
        const now = new Date()
        let progress = 0
        if (computedStatus === 'Completed') progress = 100
        else if (computedStatus === 'InProgress') {
            progress = Math.min(100, Math.max(0, ((now - departure) / (arrival - departure)) * 100))
        }

        return (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[computedStatus]}`}>
                        {statusNames[computedStatus]}
                    </span>
                    <span className="text-xs text-slate-400">Путь {schedule.track_number}</span>
                </div>
                <div className="font-bold text-slate-800">{schedule.train?.number || `Поезд #${schedule.train_id}`}</div>
                <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-xs text-slate-400">Откуда</p>
                        <p className="font-bold text-slate-800 text-sm">{schedule.from_station?.name || getStationName(schedule.from_station_id)}</p>
                    </div>
                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="flex-1 text-right">
                        <p className="text-xs text-slate-400">Куда</p>
                        <p className="font-bold text-slate-800 text-sm">{schedule.to_station?.name || getStationName(schedule.to_station_id)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-center">
                        <p className="text-xs text-slate-400">{formatDate(departure)}</p>
                        <p className="font-bold text-slate-800">{formatTime(departure)}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${computedStatus === 'Completed' ? 'bg-green-500' : computedStatus === 'InProgress' ? 'bg-blue-500' : 'bg-slate-300'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-slate-400">{formatDate(arrival)}</p>
                        <p className="font-bold text-slate-800">{formatTime(arrival)}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex gap-8 min-h-[calc(100vh-120px)]">
            <div className="w-1/3 bg-white rounded-3xl p-6 shadow-card border border-white h-fit sticky top-24">
                <h2 className="text-xl font-bold text-slate-800 mb-6">Поиск маршрутов</h2>
                <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Макс. пересадок</span>
                        <select className="input-field w-20 text-sm py-1" value={maxTransfers} onChange={e => setMaxTransfers(parseInt(e.target.value))}>
                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Диапазон поиска (дни)</span>
                        <select className="input-field w-20 text-sm py-1" value={nearbyDays} onChange={e => setNearbyDays(parseInt(e.target.value))}>
                            <option value="1">±1</option><option value="3">±3</option><option value="7">±7</option><option value="14">±14</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={allowMultiDay} onChange={e => setAllowMultiDay(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-primary-600" />
                        <span className="text-sm text-slate-600">Пересадки на разные дни</span>
                    </label>
                </div>
                <div className="space-y-4">
                    {legs.map((leg, index) => (
                        <div key={index} className="bg-slate-50 rounded-xl p-4 relative">
                            {index > 0 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">+{leg.transfer_time} мин</div>}
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</span>
                                <span className="font-medium text-slate-700 text-sm">Участок {index + 1}</span>
                                {legs.length > 1 && <button onClick={() => removeLeg(index)} className="ml-auto text-red-400 hover:text-red-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
                            </div>
                            <div className="space-y-3">
                                <div><label className="text-xs text-slate-500 mb-1 block">Откуда</label><select className="input-field text-sm" value={leg.from} onChange={e => updateLeg(index, 'from', e.target.value)} disabled={index > 0}><option value="">Выберите</option>{stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                <div><label className="text-xs text-slate-500 mb-1 block">Куда</label><select className="input-field text-sm" value={leg.to} onChange={e => updateLeg(index, 'to', e.target.value)}><option value="">Выберите</option>{getFilteredToStations(leg.from).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                                <div><label className="text-xs text-slate-500 mb-1 block">Дата</label><DatePicker value={leg.date} onChange={val => updateLeg(index, 'date', val)} minDate={index > 0 && legs[index - 1].date ? legs[index - 1].date : null} /></div>
                                {index > 0 && <div><label className="text-xs text-slate-500 mb-1 block">Пересадка (мин)</label><input type="number" className="input-field text-sm" min="0" value={leg.transfer_time} onChange={e => updateLeg(index, 'transfer_time', e.target.value)} /></div>}
                            </div>
                        </div>
                    ))}
                    <button onClick={addLeg} className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Добавить пересадку
                    </button>
                    <button onClick={handleSearch} className="w-full btn-primary">Найти маршруты</button>
                </div>
            </div>
            <div className="flex-1 space-y-4">
                <h2 className="text-xl font-bold text-slate-800">Результаты поиска</h2>
                {searchResults.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center text-slate-400 shadow-card border border-white">
                        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <p className="text-lg font-medium">Настройте поиск и нажмите «Найти маршруты»</p>
                    </div>
                ) : searchResults.map((result, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-card border border-white overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <div className="flex items-center gap-4">
                                <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">{result.leg}</span>
                                <div className="text-left">
                                    <p className="font-bold text-slate-800">{result.from} → {result.to}</p>
                                    <p className="text-sm text-slate-500">{result.date || 'Любая дата'} · {result.directSchedules.length > 0 && <span className="text-green-600">{result.directSchedules.length} прямых</span>}{result.transferRoutes.length > 0 && <span className="text-amber-600 ml-1">{result.transferRoutes.length} с пересадками</span>}{!result.hasResults && <span className="text-red-500">Нет результатов</span>}</p>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 pb-4 pt-4 space-y-4">
                            {result.directSchedules.length > 0 && (
                                <div>
                                    <p className="text-sm font-bold text-green-700 mb-3">✓ Прямые маршруты</p>
                                    <div className="space-y-3">
                                        {result.directSchedules.map(s => <ScheduleCard key={s.id} schedule={s} />)}
                                    </div>
                                </div>
                            )}
                            {result.transferRoutes.length > 0 && (
                                <div>
                                    <p className="text-sm font-bold text-amber-700 mb-3">↔ Маршруты с пересадками</p>
                                    {result.transferRoutes.map((route, ri) => (
                                        <div key={ri} className="bg-amber-50 rounded-xl p-4 mb-3 space-y-3">
                                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">{route.length} участок(ов)</span>
                                            {route.map((seg, si) => (
                                                <div key={si} className="bg-white rounded-xl p-3 border border-amber-100">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="w-5 h-5 bg-amber-200 rounded-full flex items-center justify-center text-xs font-bold text-amber-800">{si + 1}</span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[getComputedStatus(seg)]}`}>{statusNames[getComputedStatus(seg)]}</span>
                                                    </div>
                                                    <div className="font-bold text-slate-800 text-sm mb-1">{seg.train?.number || 'Поезд'}</div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <span>{getStationName(seg.from_station_id)}</span>
                                                        <span className="text-amber-500">→</span>
                                                        <span>{getStationName(seg.to_station_id)}</span>
                                                    </div>
                                                    <div className="text-xs text-slate-400 mt-1">{formatDate(new Date(seg.departure_time))} {formatTime(new Date(seg.departure_time))} - {formatTime(new Date(seg.arrival_time))}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!result.hasResults && (
                                <div className="bg-red-50 rounded-xl p-4">
                                    <p className="text-red-600 font-medium mb-2">Маршруты на эту дату не найдены</p>
                                    {result.nearbySchedules.length > 0 && (
                                        <>
                                            <p className="text-sm text-slate-600 mb-3">Ближайшие альтернативы:</p>
                                            <div className="space-y-2">
                                                {result.nearbySchedules.slice(0, 3).map(s => <ScheduleCard key={s.id} schedule={s} />)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
