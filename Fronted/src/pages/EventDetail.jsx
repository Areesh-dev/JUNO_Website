// src/pages/EventDetail.jsx
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react'
import { getEventById } from '../services/api'

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', id],
    queryFn: () => getEventById(id),
    enabled: !!id,
  })

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md h-96 animate-pulse" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Event not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-neutral-600 hover:text-primary-purple mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Events
      </button>

      {/* Event Image */}
      <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
        <img
          src={event.image_url || `https://picsum.photos/seed/${event.id}/1200/600`}
          alt={event.title}
          className="w-full h-64 md:h-96 object-cover"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            {event.title}
          </h1>
          
          <div className="prose max-w-none mb-8">
            <p className="text-lg text-neutral-600 whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Event Details */}
          <div className="bg-neutral-50 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Event Details</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <Calendar className="h-5 w-5 text-primary-purple mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Date & Time</p>
                  <p className="text-neutral-600">{formatDate(event.event_date)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-primary-purple mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-neutral-600">{event.city || 'Online Event'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="h-5 w-5 text-primary-purple mr-3 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Event Type</p>
                  <p className="text-neutral-600">
                    {event.is_past ? 'Past Event' : 'Upcoming Event'} • Community Gathering
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Registration */}
        <div className="md:col-span-1">
          <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-6 sticky top-24">
            <h3 className="text-xl font-bold mb-4">Join This Event</h3>
            <p className="text-neutral-600 mb-6">
              Ready to be part of this amazing community event? Register now to secure your spot!
            </p>
            
            <Link
              to={{
                pathname: '/contact',
                search: `?event=${event.id}&eventName=${encodeURIComponent(event.title)}`
              }}
              className="btn-primary w-full text-center mb-4"
            >
              Register Now
            </Link>
            
            <p className="text-sm text-neutral-500 text-center">
              Registration is free and open to all community members.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetail