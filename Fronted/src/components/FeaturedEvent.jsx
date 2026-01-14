// src/components/FeaturedEvent.jsx
import { Calendar, MapPin, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

const FeaturedEvent = ({ event }) => {
  if (!event) return null

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="bg-gradient-to-r from-primary-purple to-primary-light rounded-2xl overflow-hidden shadow-xl">
      <div className="md:flex">
        {/* Image Section */}
        <div className="md:w-1/2">
          <img
            src={event.image_url || `https://picsum.photos/seed/${event.id}/800/600`}
            alt={event.title}
            className="w-full h-64 md:h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="md:w-1/2 p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">{event.title}</h2>
          
          <p className="text-primary-100 mb-6 line-clamp-3">
            {event.description}
          </p>

          {/* Details */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-accent-yellow" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-accent-yellow" />
              <span>{event.city || 'Online Event'}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-3 text-accent-yellow" />
              <span>Community Event</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={`/events/${event.id}`}
              className="btn-accent text-center"
            >
              View Event Details
            </Link>
            <Link
              to={{
                pathname: '/contact',
                search: `?event=${event.id}&eventName=${encodeURIComponent(event.title)}`
              }}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-purple px-6 py-3 rounded-lg font-semibold text-center transition-colors duration-200"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedEvent