import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { getStations, createStation, updateStation, deleteStation } from '../../services/api'

function ConfirmDeleteDialog({ isOpen, onConfirm, onCancel, stationName }) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative z-10">
                <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Удалить станцию?</h3>
                    <p className="text-slate-500 text-sm mt-1">«{stationName}» будет удалена без возможности восстановления</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 btn-secondary py-2.5">Отмена</button>
                    <button onClick={onConfirm} className="flex-1 bg-red-600 text-white font-medium py-2.5 rounded-xl hover:bg-red-700 transition-colors">Удалить</button>
                </div>
            </div>
        </div>
    )
}

export default function StationsModal({ isOpen, onClose }) {
    const [stations, setStations] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState({ name: '', code: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: '' })

    useEffect(() => { if (isOpen) { fetchStations(); setError(''); setSuccess('') } }, [isOpen])

    const fetchStations = async () => {
        try { const res = await getStations(); setStations(res.data || []) } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    const handleAdd = async () => {
        if (!form.name || !form.code) { setError('Название и код обязательны'); return }
        setError('')
        try {
            await createStation(form)
            fetchStations(); setShowAdd(false); setForm({ name: '', code: '' })
            setSuccess('Станция создана'); setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError(err.response?.status === 409 ? 'Станция с таким кодом уже существует' : 'Ошибка создания')
        }
    }

    const handleEdit = (station) => { setEditingId(station.id); setForm({ name: station.name, code: station.code || '' }); setError('') }

    const handleSave = async () => {
        if (!form.name || !form.code) { setError('Название и код обязательны'); return }
        try { await updateStation(editingId, form); fetchStations(); setEditingId(null); setForm({ name: '', code: '' }); setSuccess('Обновлено'); setTimeout(() => setSuccess(''), 3000) } catch (err) { setError('Ошибка сохранения') }
    }

    const handleDeleteClick = (station) => setDeleteConfirm({ show: true, id: station.id, name: station.name })

    const handleDeleteConfirm = async () => {
        try { await deleteStation(deleteConfirm.id); fetchStations(); setSuccess('Станция удалена'); setTimeout(() => setSuccess(''), 3000) } catch (err) { setError('Ошибка удаления') }
        setDeleteConfirm({ show: false, id: null, name: '' })
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title="Manage Stations">
                <div className="space-y-4">
                    {success && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium border border-green-100">{success}</div>}
                    {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">{error}</div>}
                    {showAdd ? (
                        <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                            <input type="text" className="input-field" placeholder="Station Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            <input type="text" className="input-field" placeholder="Station Code *" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                            <div className="flex gap-2">
                                <button onClick={() => { setShowAdd(false); setError('') }} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
                                <button onClick={handleAdd} className="flex-1 btn-primary text-sm py-2">Add</button>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => { setShowAdd(true); setError('') }} className="w-full btn-primary flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add Station
                        </button>
                    )}
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                        {loading ? <div className="text-center py-8 text-slate-500">Loading...</div> : stations.length === 0 ? <div className="text-center py-8 text-slate-500">No stations yet</div> : stations.map(station => (
                            <div key={station.id} className="bg-slate-50 rounded-xl p-4">
                                {editingId === station.id ? (
                                    <div className="space-y-2">
                                        <input type="text" className="input-field" placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                        <input type="text" className="input-field" placeholder="Code *" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                                        <div className="flex gap-2">
                                            <button onClick={() => { setEditingId(null); setError('') }} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
                                            <button onClick={handleSave} className="flex-1 btn-primary text-sm py-2">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div><p className="font-bold text-slate-800">{station.name}</p><p className="text-sm text-slate-400">{station.code}</p></div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(station)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                            <button onClick={() => handleDeleteClick(station)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
            <ConfirmDeleteDialog isOpen={deleteConfirm.show} stationName={deleteConfirm.name} onCancel={() => setDeleteConfirm({ show: false, id: null, name: '' })} onConfirm={handleDeleteConfirm} />
        </>
    )
}
