import { useState } from 'react'
import { createPortal } from 'react-dom'

function ConfirmDialog({ isOpen, onConfirm, onCancel, message }) {
    if (!isOpen) return null
    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full relative z-10 animate-fade-in-up">
                <p className="text-slate-800 font-medium mb-6">{message}</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 btn-secondary py-2.5">Отмена</button>
                    <button onClick={onConfirm} className="flex-1 btn-primary py-2.5">OK</button>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default function Modal({ isOpen, onClose, title, children, confirmClose = false, hasUnsavedChanges = false }) {
    const [showConfirm, setShowConfirm] = useState(false)

    if (!isOpen) return null

    const handleClose = () => {
        if (confirmClose && hasUnsavedChanges) {
            setShowConfirm(true)
        } else {
            onClose()
        }
    }

    const handleConfirmClose = () => {
        setShowConfirm(false)
        onClose()
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) handleClose()
    }

    return createPortal(
        <>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={handleBackdropClick}>
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"></div>
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative z-10 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    {title && <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>}
                    {children}
                </div>
            </div>
            <ConfirmDialog isOpen={showConfirm} onCancel={() => setShowConfirm(false)} onConfirm={handleConfirmClose} message="У вас есть несохранённые изменения. Закрыть окно?" />
        </>,
        document.body
    )
}
