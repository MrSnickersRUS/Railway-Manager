import { useState, useEffect, useMemo } from 'react'
import Modal from '../common/Modal'
import { createSchedule, getStations } from '../../services/api'
import DatePicker from '../Calendar/DatePicker'

export default function CreateTripModal({ isOpen, onClose, trains, onSuccess }) {
    const [stations, setStations] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        train_id: '', track_number: 1, departure_date: '', departure_time: '12:00',
        arrival_date: '', arrival_time: '14:00', from_station_id: '', to_station_id: '',
        recurrence: 'none', recur_count: 0, custom_days: '', unlimited: false
    })

    const hasUnsavedChanges = useMemo(() => formData.train_id || formData.from_station_id || formData.to_station_id || formData.departure_date, [formData])

    useEffect(() => { if (isOpen) { fetchStations(); setError('') } }, [isOpen])

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
        if (formData.from_station_id && formData.to_station_id && formData.from_station_id === formData.to_station_id) {
            setError('Станции отправления и прибытия должны отличаться'); return
        }
        const dep = new Date(`${formData.departure_date}T${formData.departure_time}`)
        const arr = new Date(`${formData.arrival_date}T${formData.arrival_time}`)
        if (arr <= dep) { setError('Время прибытия должно быть позже отправления'); return }

        setLoading(true)
        try {
            let recurrence = formData.recurrence
            if (formData.recurrence === 'custom') recurrence = `custom:${formData.custom_days}`
            await createSchedule({
                train_id: parseInt(formData.train_id), track_number: parseInt(formData.track_number),
                departure_time: dep.toISOString(), arrival_time: arr.toISOString(),
                from_station_id: formData.from_station_id ? parseInt(formData.from_station_id) : null,
                to_station_id: formData.to_station_id ? parseInt(formData.to_station_id) : null,
                recurrence, recur_count: formData.unlimited ? 999 : parseInt(formData.recur_count) || 0, status: 'Scheduled'
            })
            onSuccess(); onClose()
            setFormData({ train_id: '', track_number: 1, departure_date: '', departure_time: '12:00', arrival_date: '', arrival_time: '14:00', from_station_id: '', to_station_id: '', recurrence: 'none', recur_count: 0, custom_days: '', unlimited: false })
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка создания рейса')
        } finally { setLoading(false) }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Создание рейса" confirmClose={true} hasUnsavedChanges={hasUnsavedChanges}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Поезд *</label>
                    <select className="input-field" value={formData.train_id} onChange={e => handleChange('train_id', e.target.value)} required>
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
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Дата отправления *</label><DatePicker value={formData.departure_date} onChange={val => handleChange('departure_date', val)} /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Время</label><input type="time" className="input-field" value={formData.departure_time} onChange={e => handleChange('departure_time', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Дата прибытия *</label><DatePicker value={formData.arrival_date} onChange={val => handleChange('arrival_date', val)} /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Время</label><input type="time" className="input-field" value={formData.arrival_time} onChange={e => handleChange('arrival_time', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Путь</label><input type="number" className="input-field" min="1" value={formData.track_number} onChange={e => handleChange('track_number', e.target.value)} /></div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Периодичность</label>
                        <select className="input-field" value={formData.recurrence} onChange={e => handleChange('recurrence', e.target.value)}>
                            <option value="none">Разовый</option>
                            <option value="daily">Ежедневно</option>
                            <option value="weekly">Еженедельно</option>
                            <option value="monthly">Ежемесячно</option>
                            <option value="custom">Другое</option>
                        </select>
                    </div>
                </div>
                {formData.recurrence === 'custom' && (
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Дни (через запятую)</label><input type="text" className="input-field" placeholder="1,15,28" value={formData.custom_days} onChange={e => handleChange('custom_days', e.target.value)} /></div>
                )}
                {formData.recurrence !== 'none' && (
                    <div className="flex items-center gap-4">
                        <div className="flex-1"><label className="block text-sm font-medium text-slate-700 mb-1">Кол-во повторений</label><input type="number" className="input-field" min="1" max="365" disabled={formData.unlimited} value={formData.recur_count} onChange={e => handleChange('recur_count', e.target.value)} /></div>
                        <label className="flex items-center gap-2 cursor-pointer mt-6"><input type="checkbox" checked={formData.unlimited} onChange={e => handleChange('unlimited', e.target.checked)} className="w-4 h-4 rounded border-slate-300" /><span className="text-sm text-slate-600">Бессрочно</span></label>
                    </div>
                )}
                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 btn-secondary">Отмена</button>
                    <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? 'Создание...' : 'Создать'}</button>
                </div>
            </form>
        </Modal>
    )
}
