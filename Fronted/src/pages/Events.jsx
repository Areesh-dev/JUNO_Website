
import { useState, useEffect } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter } from 'lucide-react'
import { getEvents } from '../services/api'
import Loader from '../components/Loader'



const Events = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  })

  if (isLoading) {
    return <Loader />
  }

  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // ✅ FIXED: CORRECT FILTER AND SEARCH LOGIC
  const filteredEvents = events.filter(event => {
  if (!event) return false;

  // Flexible check: agar field missing hai tou use 'upcoming' tasawwur karein
  const isPastEvent = event.is_past === true || event.is_past === 1;

  if (filter === 'upcoming') return !isPastEvent;
  if (filter === 'past') return isPastEvent;
  return true; // 'all' ke liye sab dikhao
}).filter(event => {
  // Search logic
  const searchLower = searchTerm.toLowerCase().trim();
  return (event.title || '').toLowerCase().includes(searchLower) || 
         (event.description || '').toLowerCase().includes(searchLower);
});
  // ✅ FIXED: Create unique slides
  const slides = filteredEvents.map((event, index) => ({
    src: event.image_url || `https://picsum.photos/seed/${event.id}_${index}/1200/800`,
    alt: event.title || `Event ${index}`,
  }))

  // Reset lightbox index when filtered events change
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [filter, searchTerm])

  const handleImageClick = (index) => {
    if (index >= 0 && index < filteredEvents.length) {
      setCurrentImageIndex(index)
      setLightboxOpen(true)
    }
  }

  // Clear filters function
  const clearFilters = () => {
    setSearchTerm('')
    setFilter('all')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-[#520893] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-[#FEC732] mb-6">All Events</h1>
          <p className="text-lg max-w-2xl mx-auto">
            Browse through all our community events, Past and Upcoming.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-purple"
              />
            </div>

            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'past', label: 'Past' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-6 py-2 rounded-full transition-colors ${filter === option.value
                      ? 'bg-primary-purple text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        {!isLoading && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-gray-600">
              <span className="font-semibold text-primary-purple">{filteredEvents.length}</span> of{' '}
              <span className="font-semibold">{events.length}</span> events
              {searchTerm && (
                <span className="ml-2">
                  for "<span className="font-semibold">{searchTerm}</span>"
                </span>
              )}
              {filter !== 'all' && (
                <span className="ml-2">
                  (showing <span className="font-semibold">{filter}</span>)
                </span>
              )}
            </div>

            {(searchTerm || filter !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-primary-purple font-semibold hover:text-primary-dark flex items-center gap-2"
              >
                <span>Clear filters</span>
                <span>×</span>
              </button>
            )}
          </div>
        )}

        {/* Events Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div
                key={`loading-${i}`}
                className="aspect-square bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="h-20 w-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              No events found
            </h3>
            <p className="text-gray-500 mb-8">
              {searchTerm
                ? `No events found for "${searchTerm}"`
                : `No ${filter !== 'all' ? filter : ''} events found`}
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-primary-purple text-white rounded-full hover:bg-primary-dark transition-colors"
            >
              Show All Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredEvents.map((event, index) => (
              <div
                key={`${event.id}-${index}-${event.is_past}`} // ✅ FIXED: Unique key
                className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group"
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={event.image_url || `https://picsum.photos/seed/${event.id}_${index}/600/600`}
                  alt={event.title || `Event ${index}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <div className="text-white">
                    <h3 className="font-bold text-sm truncate font-[poppins]">
                      {event.title || 'Untitled Event'}
                    </h3>
                  </div>
                </div>

                {/* Badge */}
                <div
                  className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${event.is_past === 1 || event.is_past === true
                      ? 'bg-gray-800 text-white'
                      : 'bg-accent-yellow text-gray-900'
                    }`}
                >
                  {event.is_past === 1 || event.is_past === true ? 'PAST' : 'UPCOMING'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          slides={slides}
          index={currentImageIndex}
          on={{ view: ({ index: currentIndex }) => setCurrentImageIndex(currentIndex) }}
        />
      </div>
    </div>
  )
}

export default Events
