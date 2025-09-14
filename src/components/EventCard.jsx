import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Heart, Calendar, Users, Badge } from 'lucide-react'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const EventCard = ({ event, className = '' }) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Link to={`/event/${event._id || event.id}`} onClick={() => console.log('Event ID:', event._id || event.id, 'Event:', event)}>
        <Card className="overflow-hidden group cursor-pointer">
          <div className="relative aspect-video overflow-hidden">
            <img
              src={
                event.eventImage?.startsWith('http') 
                  ? event.eventImage 
                  : event.eventImage 
                    ? `http://localhost:5000/${event.eventImage}` 
                    : '/src/public/wedding.jpg'
              }
              alt={event.title}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.src = '/src/public/wedding.jpg'
              }}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Price badge */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(event.price)}
              </span>
            </div>

            {/* Category badge */}
            <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
              {event.category}
            </div>

            {/* Favorite button */}
            <button
              onClick={handleFavoriteClick}
              className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
          </div>

          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {event.description}
                </p>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">
                    {typeof event.location === 'object' ? event.location.city : event.location}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {(event.providerId?.name || event.providerName || event.provider?.name || 'Provider').charAt(0)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-gray-700">
                      {event.providerId?.businessName || event.providerId?.name || event.providerName || event.provider?.name || 'Provider'}
                    </span>
                    {(event.providerId?.isVerified || event.provider?.verified) && (
                      <Badge className="w-3 h-3 text-blue-500" />
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {event.rating || '4.5'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({event.reviews?.length || event.reviewCount || '0'})
                  </span>
                </div>
              </div>

              {event.maxCapacity && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>Up to {event.maxCapacity} guests</span>
                </div>
              )}
              
              <div className="pt-3 border-t border-gray-100">
                <Link 
                  to={`/book-event/${event._id || event.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="block"
                >
                  <Button className="w-full" size="sm">
                    Book Now
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}

export default EventCard