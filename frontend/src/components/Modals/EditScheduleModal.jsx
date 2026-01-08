import { useState, useEffect, useMemo } from 'react'
import Modal from '../common/Modal'
import { updateSchedule, deleteSchedule, getStations } from '../../services/api'
import DatePicker from '../Calendar/DatePicker'

function ConfirmDeleteDialog({ isOpen, onConfirm, onCancel }) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative z-10">
                <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Удалить рейс?</h3>
                    <p className="text-slate-500 text-sm mt-1">Это действие нельзя отменить</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 btn-secondary py-2.5">Отмена</button>
                    <button onClick={onConfirm} className="flex-1 bg-red-600 text-white font-medium py-2.5 rounded-xl hover:bg-red-700 transition-colors">Удалить</button>
                </div>
            </div>
        </div>
    )
}

export default function EditScheduleModal({ isOpen, onClose, schedule, trains, onSuccess }) {
    const [stations, setStations] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showDelete, setShowDelete] = useState(false)
    const [formData, setFormData] = useState({
        train_id: '', track_number: 1, departure_date: '', departure_time: '12:00',
        arrival_date: '', arrival_time: '14:00', from_station_id: '', to_station_id: '', status: 'Scheduled'
    })

    const hasUnsavedChanges = useMemo(() => {
        if (!schedule) return false
        return formData.train_id != schedule.train_id || formData.status !== schedule.status
    }, [formData, schedule])

    useEffect(() => {
        if (isOpen && schedule) {
            fetchStations()
            const depDate = new Date(schedule.departure_time)
            const arrDate = new Date(schedule.arrival_time)
            setFormData({
                train_id: schedule.train_id,
                track_number: schedule.track_number,
                departure_date: depDate.toISOString().split('T')[0],
                departure_time: depDate.toTimeString().slice(0, 5),
                arrival_date: arrDate.toISOString().split('T')[0],
                arrival_time: arrDate.toTimeString().slice(0, 5),
                from_station_id: schedule.from_station_id || '',
                to_station_id: schedule.to_station_id || '',
                status: schedule.status
            })
            setError('')
        }
    }, [isOpen, schedule])

    const fetchStations = async () => {
        try { const res = await getStations(); setStations(res.data || []) } catch (err) { console.error(err) }
    }

    const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

    const getFilteredToStations = () => stations.filter(s => s.id != formData.from_station_id)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (!formData.train_id) { setError('Выберите поезд'); return }
        if (!formData.departure_date || !formData.arrival_date) { setError('Укажите даты'); return }

        const dep = new Date(`${formData.departure_date}T${formData.departure_time}`)
        const arr = new Date(`${formData.arrival_date}T${formData.arrival_time}`)
        if (arr <= dep) { setError('Время прибытия должно быть позже отправления'); return }

        setLoading(true)
        try {
            await updateSchedule(schedule.id, {
                train_id: parseInt(formData.train_id),
                track_number: parseInt(formData.track_number),
                departure_time: dep.toISOString(),
                arrival_time: arr.toISOString(),
                from_station_id: formData.from_station_id ? parseInt(formData.from_station_id) : null,
                to_station_id: formData.to_station_id ? parseInt(formData.to_station_id) : null,
                status: formData.status
            })
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка сохранения')
        } finally { setLoading(false) }
    }

    const handleDelete = async () => {
        try {
            await deleteSchedule(schedule.id)
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка удаления')
        }
        setShowDelete(false)
    }

    const statusNames = { Scheduled: 'Запланирован', InProgress: 'В пути', Completed: 'Завершён', Cancelled: 'Отменён' }

    if (!schedule) return null

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Редактирование рейса" confirmClose={true} hasUnsavedChanges={hasUnsavedChanges}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Поезд</label>
                        <select className="input-field" value={formData.train_id} onChange={e => handleChange('train_id', e.target.value)}>
                            <option value="">Выберите...</option>
                            {trains.map(t => <option key={t.id} value={t.id}>{t.number} ({t.type})</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Откуда</label>
                            <select className="input-field" value={formData.from_station_id} onChange={e => handleChange('from_station_id', e.target.value)}>
                                <option value="">--</option>
                                {stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Куда</label>
                            <select className="input-field" value={formData.to_station_id} onChange={e => handleChange('to_station_id', e.target.value)}>
                                <option value="">--</option>
                                {getFilteredToStations().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Дата отправления</label><DatePicker value={formData.departure_date} onChange={val => handleChange('departure_date', val)} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Время</label><input type="time" className="input-field" value={formData.departure_time} onChange={e => handleChange('departure_time', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Дата прибытия</label><DatePicker value={formData.arrival_date} onChange={val => handleChange('arrival_date', val)} /></div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Время</label><input type="time" className="input-field" value={formData.arrival_time} onChange={e => handleChange('arrival_time', e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Путь</label><input type="number" className="input-field" min="1" value={formData.track_number} onChange={e => handleChange('track_number', e.target.value)} /></div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Статус</label>
                            <select className="input-field" value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                                {Object.entries(statusNames).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setShowDelete(true)} className="bg-red-50 text-red-600 hover:bg-red-100 font-medium px-4 py-2.5 rounded-xl transition-colors">Удалить</button>
                        <div className="flex-1"></div>
                        <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
                        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Сохранение...' : 'Сохранить'}</button>
                    </div>
                </form>
            </Modal>
            <ConfirmDeleteDialog isOpen={showDelete} onCancel={() => setShowDelete(false)} onConfirm={handleDelete} />
        </>
    )
}
