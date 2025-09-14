import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPin, Calendar, Users, Star, Heart, Share2, 
  Clock, Phone, Mail, CheckCircle, ArrowLeft,
  ImageIcon, Play
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import EventCard from '@/components/EventCard'
import toast from 'react-hot-toast'
import { eventsAPI } from '@/services/api'

const EventDetails = () => {
  const { eventId } = useParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAllImages, setShowAllImages] = useState(false)

  // Fetch real event data
  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      console.log('Fetching event with ID:', eventId)
      if (!eventId || eventId === 'undefined') {
        throw new Error('Invalid event ID')
      }
      const response = await eventsAPI.getEventById(eventId)
      return response.data.event
    },
    enabled: !!eventId && eventId !== 'undefined'
  })

  const event = eventData

  const { data: similarEventsData = [] } = useQuery({
    queryKey: ['similar-events', event?.category],
    queryFn: async () => {
      const response = await eventsAPI.getAllEvents({ 
        category: event?.category,
        limit: 4
      })
      return response.data?.events?.filter(e => e._id !== eventId) || []
    },
    enabled: !!event
  })

  const similarEvents = similarEventsData

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (isLoading || !event || !eventId || eventId === 'undefined') {
    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <p className="text-gray-600">The event you're looking for doesn't exist.</p>
            <Link to="/AllEvent" className="mt-4 inline-block text-purple-600 hover:text-purple-700">
              Back to Events
            </Link>
          </div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="h-64 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-purple-600">Home</Link>
            <span>/</span>
            <Link to="/AllEvent" className="hover:text-purple-600">Events</Link>
            <span>/</span>
            <Link to={`/category/${event.category.toLowerCase()}`} className="hover:text-purple-600">
              {event.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{event.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/AllEvent" className="inline-flex items-center space-x-2 text-gray-600 hover:text-purple-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </Link>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <div className="aspect-video rounded-lg overflow-hidden relative group">
                <img
                  src={
                    event?.eventImage?.startsWith('http') 
                      ? event.eventImage 
                      : event?.eventImage 
                        ? `http://localhost:5000/${event.eventImage}` 
                        : '/src/public/wedding.jpg'
                  }
                  alt={event?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setShowAllImages(true)}
                    className="flex items-center space-x-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>View All Photos</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {event?.eventImage && (
                <button
                  onClick={() => setSelectedImage(0)}
                  className={`aspect-video rounded-lg overflow-hidden w-full ${
                    selectedImage === 0 ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  <img
                    src={
                      event.eventImage?.startsWith('http') 
                        ? event.eventImage 
                        : `http://localhost:5000/${event.eventImage}`
                    }
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </button>
              )}
              {/* Placeholder for additional images if needed */}
              {[1,2,3].map((index) => (
                <div
                  key={index}
                  className="aspect-video rounded-lg overflow-hidden w-full bg-gray-200 flex items-center justify-center"
                >
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{typeof event?.location === 'object' ? event.location.city : event?.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event?.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{event?.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFavorite}
                    className="flex items-center space-x-1"
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center space-x-1"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{event?.rating || '0.0'}</span>
                  <span className="text-gray-600">({event?.reviews?.length || 0} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">Up to {event?.maxCapacity} guests</span>
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {event.category}
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {event?.description}
                </p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">What's Included</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {event?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  )) || <p className="text-gray-500">No features listed</p>}
                </div>
              </CardContent>
            </Card>

            {/* Provider Info */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Event Provider</h2>
                <div className="flex items-start space-x-4">
                  <img
                    src={event.providerId?.profileImage || '/src/public/Ryan-360x290.jpg'}
                    alt={event.providerId?.name || 'Provider'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-lg">{event.providerId?.businessName || event.providerId?.name || 'Provider'}</h3>
                      {event.providerId?.isVerified && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{event.providerId?.rating || '0.0'} ({event.providerId?.totalReviews || 0} reviews)</span>
                      </div>
                      <span>Provider</span>
                      <span>{event.providerId?.totalBookings || 0} bookings completed</span>
                    </div>
                    <p className="text-gray-600 mb-4">{event.providerId?.description || 'No description available'}</p>
                    <div className="flex items-center space-x-4">
                      <Link to={`/provider/profile/${event.providerId?._id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{event.providerId?.phone || 'Not available'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{event.providerId?.email || 'Not available'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
                <div className="space-y-6">
                  {event.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start space-x-4">
                        <img
                          src={getImageUrl(review.image)}
                          alt={review.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold">{review.name}</h4>
                            <div className="flex items-center">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 mb-2">{review.comment}</p>
                          <p className="text-sm text-gray-500">{formatDate(new Date(review.date))}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button variant="outline" className="w-full">
                    View All Reviews
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-baseline space-x-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(event.price)}
                    </span>
                    {event.originalPrice && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatPrice(event.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Starting price for {event.minCapacity} guests</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{event.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{event.minCapacity}-{event.maxCapacity} guests</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{event.category}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link to={`/book-event/${event._id}`}>
                    <Button className="w-full">
                      Book Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    Request Quote
                  </Button>
                  <Button variant="ghost" className="w-full">
                    Contact Provider
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold mb-3">Available Dates</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {event.availability && Array.isArray(event.availability) ? 
                      event.availability.slice(0, 4).map((date, index) => (
                        <div
                          key={index}
                          className="p-2 text-center text-sm bg-green-50 text-green-700 rounded border border-green-200"
                        >
                          {formatDate(new Date(date))}
                        </div>
                      )) : (
                        <div className="col-span-2 text-center text-sm text-gray-500">
                          No availability data
                        </div>
                      )
                    }
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Similar Events */}
        {similarEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarEvents.map((similarEvent, index) => (
                <motion.div
                  key={similarEvent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <EventCard event={similarEvent} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDetails