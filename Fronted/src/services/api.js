// src/services/api.js 
import axios from 'axios'

const getBaseURL = () => {
  // Check if we're in development
  if (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') {
    return 'http://localhost:10000/api'
  }
  
  // Production - use Render backend
  return 'https://juno-website-backend.onrender.com/api'
}

const API_BASE_URL = getBaseURL()
console.log('🔗 API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000  // 30 second timeout
})

// ✅ Test connection
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
    console.log('✅ Events loaded:', response.data?.length || 0)
    return response.data || []
  } catch (error) {
    console.error('❌ Error fetching events:', error.message)
    return []
  }
}

export const getEventById = async (id) => {
  try {
    const response = await api.get(`/events/${id}`)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching event:', error.message)
    return null
  }
}

// ✅ 2. EVENT TIME FOR COUNTDOWN
export const getEventTime = async () => {
  try {
    const res = await api.get('/next-event-time')
    return res.data
  } catch (error) {
    console.error('❌ Error fetching event time:', error.message)
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
    console.error('❌ Registration error:', error.response?.data || error.message)
    throw error
  }
}

// ✅ 4. ADMIN APIs
export const getRegistrations = async () => {
  try {
    const response = await api.get('/admin/registrations')
    return response.data
  } catch (error) {
    console.error('❌ Error fetching registrations:', error.message)
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
    console.error('❌ Excel export error:', error.message)
    throw error
  }
}

export default api
