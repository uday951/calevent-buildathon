import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Heart, Calendar, Users, Badge } from 'lucide-react'
import { formatPrice, getImageUrl } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const EventCard = ({ event, className = '' }) => {
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const navigate = useNavigate()

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const goToDetail = () => navigate(`/event/${event._id || event.id}`)

  const goToQuote = (e) => {
    e.stopPropagation()
    navigate(`/plan-my-event?eventType=${encodeURIComponent(event.category || '')}&ref=${event._id || event.id}`)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="overflow-hidden group cursor-pointer" onClick={goToDetail}>
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={
                event.eventImage?.startsWith('http') 
                  ? event.eventImage 
                  : event.eventImage 
                    ? `${import.meta.env.VITE_BACKEND_URL}/${event.eventImage}` 
                    : '/wedding.jpg'
              }
              alt={event.title}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => { e.target.src = '/wedding.jpg' }}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/20">
              <span className="text-sm font-bold text-gray-900 tracking-tight">
                {formatPrice(event.price)}
              </span>
            </div>
            <div className="absolute top-4 left-4 bg-primary/95 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold shadow-sm tracking-wide">
              {event.category}
            </div>
            <button
              onClick={handleFavoriteClick}
              className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>

          <CardContent className="p-5">
            <div className="space-y-4">
              <div>
                <h3 className="font-[650] text-lg leading-snug text-gray-900 line-clamp-2 group-hover:text-primary transition-colors tracking-tight">
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
                  <span className="text-sm font-medium text-gray-700">
                    {event.providerId?.businessName || event.providerId?.name || event.providerName || event.provider?.name || 'Provider'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-700">{event.rating || '4.5'}</span>
                  <span className="text-xs text-gray-500">({event.reviews?.length || event.reviewCount || '0'})</span>
                </div>
              </div>

              {event.maxCapacity && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>Up to {event.maxCapacity} guests</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-50">
                <Button
                  onClick={goToQuote}
                  className="w-full bg-[#7c3aed] hover:bg-purple-700 transition-all"
                  size="default"
                >
                  🎯 Get Quote
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
    </motion.div>
  )
}

export default EventCard