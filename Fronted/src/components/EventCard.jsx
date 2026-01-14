// src/components/EventCard.jsx - UPDATED VERSION
import { Link } from 'react-router-dom'

const EventCard = ({ event }) => {
  return (
    <div className="relative group overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
      {/* Event Poster Image */}
      <div className="aspect-[3/3] overflow-hidden">
        <img
          src={event.image_url || `https://picsum.photos/seed/${event.id}/600/800`}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700"
        />
      </div>
    
    </div>
  )
}

export default EventCard