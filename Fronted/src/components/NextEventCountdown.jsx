// src/components/NextEventCountdown.jsx - CORRECT VERSION
import { useEffect, useState } from 'react'
import '../pages/Pages.css'

const API_URL = 'https://juno-website-backend.onrender.com/api/next-event-time' // ✅ Port 3002

export default function NextEventCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [eventData, setEventData] = useState(null)
  const [timerExpired, setTimerExpired] = useState(false)

  useEffect(() => {
    let interval

    const fetchEventTime = async () => {
      try {
        console.log('🔄 Fetching from:', API_URL)
        const res = await fetch(API_URL)

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }

        const data = await res.json()
        console.log('✅ Countdown data received:', data)
        setEventData(data)

        // Handle both response formats
        const eventTimeString = data.nextEventTime || data.eventStartTime
        console.log('⏰ Event time string:', eventTimeString)

        if (!eventTimeString) {
          throw new Error('No event time found in response')
        }

        const eventTime = new Date(eventTimeString || data.eventStartTime).getTime()

        const updateTimer = () => {
          
          const diff = eventTime - Date.now()
          

          if (diff <= 0) {
            clearInterval(interval)
            setTimerExpired(true)
            return
          }

          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
          })
        }

        updateTimer()
        interval = setInterval(updateTimer, 1000)
        setLoading(false)
        setError(null)
      } catch (err) {
        console.error('❌ Countdown failed:', err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchEventTime()
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <section className='mein-heading font-[Poppins]'>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-white">
        Time Left Until Event
      </h2>
      <p className="text-center text-white">Loading countdown...</p>
    </section>
  )

  if (error) return (
    <section className='mein-heading font-[Poppins]'>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-white">
        Countdown
      </h2>
      <p className="text-center text-white">Error: {error}</p>
      <p className="text-center text-white text-sm">Server URL: {API_URL}</p>
    </section>
  )

  const Block = ({ value, label }) => (
    <div className="bg-white rounded-xl px-8 py-6 text-center shadow-md">
      <div className="text-5xl font-extrabold text-yellow-400">
        {String(value).padStart(2, '0')}
      </div>
      <div className="mt-2 font-semibold text-sm text-gray-600 uppercase tracking-wider">
        {label}
      </div>
    </div>
  )

  return (
    <section className='mein-heading font-[Poppins]'>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-white">
        Time Left Until Event
      </h2>

      <div className="flex justify-center gap-6 flex-wrap">
        <Block value={timeLeft.days} label="Days" />
        <Block value={timeLeft.hours} label="Hours" />
        <Block value={timeLeft.minutes} label="Minutes" />
      </div>
    </section>
  )
}
