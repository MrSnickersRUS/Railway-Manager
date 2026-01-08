import { useState, useEffect } from 'react'
import { getUsers, getAuditLogs, updateUser } from '../services/api'

export default function Admin() {
    const [users, setUsers] = useState([])
    const [auditLogs, setAuditLogs] = useState([])
    const [activeTab, setActiveTab] = useState('users')

    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        try {
            if (activeTab === 'users') {
                const res = await getUsers()
                setUsers(res.data)
            } else {
                const res = await getAuditLogs()
                setAuditLogs(res.data)
            }
        } catch (err) {
            console.error(err)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUser(userId, { role: newRole })
            fetchData()
        } catch (err) {
            alert('Ошибка обновления роли')
        }
    }

    const roleNames = {
        Admin: 'Администратор',
        Carrier: 'Перевозчик',
        Company: 'Компания',
        Dispatcher: 'Диспетчер',
        Viewer: 'Наблюдатель'
    }

    const actionNames = {
        CREATE: 'Создание',
        UPDATE: 'Изменение',
        DELETE: 'Удаление'
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-800">Администрирование</h1>

                <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Пользователи
                    </button>
                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'audit' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Журнал аудита
                    </button>
                </div>
            </div>

            <div className="card-new">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-100">
                                {activeTab === 'users' ? (
                                    <>
                                        <th className="pb-4 px-4 text-sm font-medium text-slate-400">Пользователь</th>
                                        <th className="pb-4 px-4 text-sm font-medium text-slate-400">Роль</th>
                                        <th className="pb-4 px-4 text-sm font-medium text-slate-400">Дата регистрации</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="pb-4 px-4 text-sm font-medium text-slate-400">Действие</th>
                                        <th className="pb-4 px-4 text-sm font-medium text-slate-400">Пользователь</th>
                                        <th className="pb-4 px-4 text-sm font-medium text-slate-400">Объект</th>
                                        <th className="pb-4 px-4 text-sm font-medium text-slate-400">Время</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {activeTab === 'users' ? (
                                users.map(user => (
                                    <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-4 font-medium text-slate-800">{user.login}</td>
                                        <td className="py-4 px-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="bg-slate-100 border-none rounded-lg text-xs py-1 px-3 font-medium text-slate-600 focus:ring-2 focus:ring-primary-500/20"
                                            >
                                                <option value="Admin">Администратор</option>
                                                <option value="Carrier">Перевозчик</option>
                                                <option value="Company">Компания</option>
                                                <option value="Dispatcher">Диспетчер</option>
                                                <option value="Viewer">Наблюдатель</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-4 text-slate-400">
                                            {new Date(user.created_at).toLocaleDateString('ru-RU')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                auditLogs.map(log => (
                                    <tr key={log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-bold
                        ${log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                                                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                                {actionNames[log.action] || log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600">{log.user?.login}</td>
                                        <td className="py-4 px-4 font-medium text-slate-800">{log.entity} #{log.entity_id}</td>
                                        <td className="py-4 px-4 text-slate-400">
                                            {new Date(log.timestamp).toLocaleString('ru-RU')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
