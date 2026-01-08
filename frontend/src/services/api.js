import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
        }
        return Promise.reject(error)
    }
)

export const login = (login, password) => api.post('/login', { login, password })
export const register = (login, password, role) => api.post('/register', { login, password, role })
export const getMe = () => api.get('/me')

export const getStats = () => api.get('/stats')

export const getTrains = () => api.get('/trains')
export const getTrain = (id) => api.get(`/trains/${id}`)
export const createTrain = (data) => api.post('/trains', data)
export const updateTrain = (id, data) => api.put(`/trains/${id}`, data)
export const deleteTrain = (id) => api.delete(`/trains/${id}`)

export const getSchedules = () => api.get('/schedules')
export const getSchedule = (id) => api.get(`/schedules/${id}`)
export const createSchedule = (data) => api.post('/schedules', data)
export const updateSchedule = (id, data) => api.put(`/schedules/${id}`, data)
export const deleteSchedule = (id) => api.delete(`/schedules/${id}`)

export const getStations = () => api.get('/stations')
export const getStation = (id) => api.get(`/stations/${id}`)
export const createStation = (data) => api.post('/stations', data)
export const updateStation = (id, data) => api.put(`/stations/${id}`, data)
export const deleteStation = (id) => api.delete(`/stations/${id}`)

export const getStationDistances = () => api.get('/station-distances')
export const createStationDistance = (data) => api.post('/station-distances', data)
export const updateStationDistance = (id, data) => api.put(`/station-distances/${id}`, data)
export const deleteStationDistance = (id) => api.delete(`/station-distances/${id}`)

export const getUsers = () => api.get('/users')
export const getUser = (id) => api.get(`/users/${id}`)
export const updateUser = (id, data) => api.put(`/users/${id}`, data)
export const deleteUser = (id) => api.delete(`/users/${id}`)

export const getAuditLogs = () => api.get('/audit')

export default api
