// src/services/api.js - CORRECT VERSION
import axios from 'axios'

// ✅ CORRECT URL - Port 3002
const API_BASE_URL = 'http://localhost:3002/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

console.log('🔗 API Base URL:', API_BASE_URL)

// Test connection
api.get('/health')
  .then(response => {
    console.log('✅ Backend connected:', response.data)
  })
  .catch(error => {
    console.error('❌ Backend connection failed:', error.message)
  })

// ✅ 1. EVENTS API
export const getEvents = async () => {
  try {
    const response = await api.get('/events')
    console.log('✅ Events loaded:', response.data.length)
    return response.data
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

// ✅ 2. EVENT TIME FOR COUNTDOWN
export const getEventTime = async () => {
  try {
    const res = await api.get('/next-event-time')
    return res.data
  } catch (error) {
    console.error('Error fetching event time:', error)
    return null
  }
}

// ✅ 3. REGISTRATION API
export const submitRegistration = async (data) => {
  console.log('📤 Sending registration:', data)
  
  try {
    const response = await api.post('/register', data)
    console.log('✅ Registration successful:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Registration error:', {
      status: error.response?.status,
      data: error.response?.data
    })
    throw error
  }
}

// ✅ 4. ADMIN APIs
export const getRegistrations = async () => {
  try {
    const response = await api.get('/admin/registrations')
    return response.data
  } catch (error) {
    console.error('Error fetching registrations:', error)
    throw error
  }
}

export const exportToExcel = async () => {
  try {
    const response = await api.get('/admin/export-excel', {
      responseType: 'blob'
    })
    return response.data
  } catch (error) {
    console.error('Excel export error:', error)
    throw error
  }
}

export default api