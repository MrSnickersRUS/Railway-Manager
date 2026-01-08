import { useState } from 'react'
import Modal from '../common/Modal'
import { createTrain } from '../../services/api'

export default function CreateTrainModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        number: '',
        type: 'freight',
        wagon_count: 0,
        max_speed: 0,
        description: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createTrain({
                ...formData,
                wagon_count: parseInt(formData.wagon_count),
                max_speed: parseInt(formData.max_speed)
            })
            onSuccess()
            onClose()
            setFormData({ number: '', type: 'freight', wagon_count: 0, max_speed: 0, description: '' })
        } catch (err) {
            console.error(err)
            alert('Failed to create train')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Train">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Train Number</label>
                    <input
                        type="text"
                        required
                        className="input-field"
                        placeholder="e.g. TR-2026"
                        value={formData.number}
                        onChange={e => setFormData({ ...formData, number: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Type</label>
                    <select
                        className="input-field"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                    >
                        <option value="freight">Freight</option>
                        <option value="passenger">Passenger</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Wagons</label>
                        <input
                            type="number"
                            className="input-field"
                            value={formData.wagon_count}
                            onChange={e => setFormData({ ...formData, wagon_count: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Max Speed (km/h)</label>
                        <input
                            type="number"
                            className="input-field"
                            value={formData.max_speed}
                            onChange={e => setFormData({ ...formData, max_speed: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 ml-1">Description</label>
                    <textarea
                        className="input-field min-h-[100px]"
                        placeholder="Additional info..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 btn-secondary text-center">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="flex-1 btn-primary text-center">
                        {loading ? 'Creating...' : 'Create Train'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
