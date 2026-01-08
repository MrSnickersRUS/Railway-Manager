import { useState, useEffect } from 'react'
import Modal from '../common/Modal'
import { updateTrain, deleteTrain, createTrain } from '../../services/api'

export default function TrainsListModal({ isOpen, onClose, trains, onTrainUpdated }) {
    const [editingTrain, setEditingTrain] = useState(null)
    const [showAdd, setShowAdd] = useState(false)
    const [editForm, setEditForm] = useState({})
    const [addForm, setAddForm] = useState({ number: '', type: 'freight', wagon_count: 0, max_speed: 0, description: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        if (isOpen) {
            setError('')
            setSuccess('')
        }
    }, [isOpen])

    const handleEdit = (train) => {
        setEditingTrain(train.id)
        setEditForm({
            number: train.number,
            type: train.type,
            wagon_count: train.wagon_count || 0,
            max_speed: train.max_speed || 0,
            description: train.description || ''
        })
        setError('')
    }

    const handleSave = async () => {
        setLoading(true)
        setError('')
        try {
            await updateTrain(editingTrain, {
                ...editForm,
                wagon_count: parseInt(editForm.wagon_count),
                max_speed: parseInt(editForm.max_speed)
            })
            setEditingTrain(null)
            onTrainUpdated()
            setSuccess('Поезд обновлён')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError('Ошибка сохранения')
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!addForm.number) {
            setError('Номер поезда обязателен')
            return
        }
        setLoading(true)
        setError('')
        try {
            await createTrain({
                ...addForm,
                wagon_count: parseInt(addForm.wagon_count),
                max_speed: parseInt(addForm.max_speed)
            })
            setShowAdd(false)
            setAddForm({ number: '', type: 'freight', wagon_count: 0, max_speed: 0, description: '' })
            onTrainUpdated()
            setSuccess('Поезд добавлен')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError('Ошибка создания поезда')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Удалить поезд?')) return
        try {
            await deleteTrain(id)
            onTrainUpdated()
            setSuccess('Поезд удалён')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError('Ошибка удаления')
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Manage Trains">
            <div className="space-y-4">
                {/* Messages */}
                {success && (
                    <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-medium border border-green-100">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                {/* Add New Train */}
                {showAdd ? (
                    <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Train Number *"
                            value={addForm.number}
                            onChange={e => setAddForm({ ...addForm, number: e.target.value })}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                className="input-field"
                                value={addForm.type}
                                onChange={e => setAddForm({ ...addForm, type: e.target.value })}
                            >
                                <option value="freight">Freight</option>
                                <option value="passenger">Passenger</option>
                            </select>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Wagons"
                                value={addForm.wagon_count}
                                onChange={e => setAddForm({ ...addForm, wagon_count: e.target.value })}
                            />
                        </div>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="Max Speed (km/h)"
                            value={addForm.max_speed}
                            onChange={e => setAddForm({ ...addForm, max_speed: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setShowAdd(false)} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
                            <button onClick={handleAdd} disabled={loading} className="flex-1 btn-primary text-sm py-2">
                                {loading ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowAdd(true)}
                        className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Train
                    </button>
                )}

                {/* Trains List */}
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                    {trains.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No trains yet. Add one!</p>
                    ) : trains.map(train => (
                        <div key={train.id} className="bg-slate-50 rounded-xl p-4">
                            {editingTrain === train.id ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Number"
                                        value={editForm.number}
                                        onChange={e => setEditForm({ ...editForm, number: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            className="input-field"
                                            value={editForm.type}
                                            onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                                        >
                                            <option value="freight">Freight</option>
                                            <option value="passenger">Passenger</option>
                                        </select>
                                        <input
                                            type="number"
                                            className="input-field"
                                            placeholder="Wagons"
                                            value={editForm.wagon_count}
                                            onChange={e => setEditForm({ ...editForm, wagon_count: e.target.value })}
                                        />
                                    </div>
                                    <input
                                        type="number"
                                        className="input-field"
                                        placeholder="Max Speed"
                                        value={editForm.max_speed}
                                        onChange={e => setEditForm({ ...editForm, max_speed: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingTrain(null)}
                                            className="flex-1 btn-secondary text-sm py-2"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex-1 btn-primary text-sm py-2"
                                        >
                                            {loading ? 'Saving...' : 'Save'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-800">{train.number}</p>
                                        <p className="text-sm text-slate-500">
                                            {train.type} · {train.wagon_count || 0} wagons · {train.max_speed || 0} km/h
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(train)}
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(train.id)}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    )
}
