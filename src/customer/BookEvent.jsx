import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Users, MapPin, DollarSign, MessageSquare, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { eventsAPI } from '@/services/api'
import { useQuery } from '@tanstack/react-query'
import { formatPrice } from '@/lib/utils'

const BookEvent = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, token } = useAuth()

  const [formData, setFormData] = useState({
    eventDate: '',
    guestCount: '',
    venue: '',
    budgetMin: '',
    budgetMax: '',
    specialRequests: ''
  })

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await eventsAPI.getEventById(eventId)
      return response.data.event
    },
    enabled: !!eventId
  })

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to book events')
      navigate('/login/customer')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (event) {
      setFormData(prev => ({
        ...prev,
        guestCount: event.minCapacity || '',
        venue: typeof event.location === 'object' ? event.location.city : event.location || '',
        budgetMin: event.price > 1 ? Math.floor(event.price * 0.8) : '',
        budgetMax: event.price > 1 ? Math.ceil(event.price * 1.2) : ''
      }))
    }
  }, [event])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.eventDate || !formData.guestCount || !formData.venue) {
      toast.error('Please fill all required fields')
      return
    }

    const loadingToast = toast.loading('Submitting your booking request...')

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/event-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventType: event.category,
          eventTitle: event.title,
          eventId: event._id,
          eventDate: formData.eventDate,
          guestCount: parseInt(formData.guestCount),
          venue: formData.venue,
          budget: {
            min: parseInt(formData.budgetMin) || 10000,
            max: parseInt(formData.budgetMax) || 50000
          },
          specialRequests: formData.specialRequests || `Interested in: ${event.title}`,
          status: 'pending'
        })
      })

      const data = await response.json()
      toast.dismiss(loadingToast)

      if (data.success) {
        toast.success('🎉 Booking request submitted! Our team will contact you within 24 hours.')
        setTimeout(() => navigate('/my-requests'), 1500)
      } else {
        toast.error(data.message || 'Failed to submit booking. Please try again.')
      }
    } catch (error) {
      toast.dismiss(loadingToast)
      console.error('Booking error:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (isLoading || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <img
                  src={
                    event.eventImage?.startsWith('http')
                      ? event.eventImage
                      : event.eventImage?.startsWith('/')
                        ? event.eventImage
                        : event.eventImage
                          ? `${import.meta.env.VITE_BACKEND_URL}/${event.eventImage}`
                          : '/wedding.jpg'
                  }
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{event.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="font-medium capitalize">{event.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Price</span>
                    <span className="font-medium">{formatPrice(event.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-medium">{event.minCapacity}-{event.maxCapacity} guests</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Book This Event</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Event Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="date"
                        name="eventDate"
                        value={formData.eventDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        name="guestCount"
                        value={formData.guestCount}
                        onChange={handleChange}
                        min={event.minCapacity || 1}
                        max={event.maxCapacity}
                        required
                        placeholder={`${event.minCapacity} - ${event.maxCapacity} guests`}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue / Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="venue"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                        placeholder="Enter venue or city"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range (Optional)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="budgetMin"
                          value={formData.budgetMin}
                          onChange={handleChange}
                          placeholder="Min budget"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="budgetMax"
                          value={formData.budgetMax}
                          onChange={handleChange}
                          placeholder="Max budget"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests (Optional)
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <textarea
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Any special requirements or preferences..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      type="submit"
                      className="w-full bg-[#7c3aed] hover:bg-purple-700 text-white font-bold py-3 text-base"
                    >
                      Submit Booking Request
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Our team will review your request and contact you within 24 hours
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookEvent
