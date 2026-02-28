import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, MapPin, Users, Star, 
  Filter, Search, Eye, MessageSquare, 
  Download, RefreshCw, CheckCircle, XCircle,
  AlertCircle, Phone, Mail
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { bookingsAPI } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const CustomerBookingDashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [bookingData, setBookingData] = useState(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    eventDate: '',
    eventTime: '',
    location: '',
    guests: '',
    specialRequests: ''
  })
  const [aiRequests, setAiRequests] = useState([])

  useEffect(() => {
    // Check if coming from AI request
    const savedBookingData = localStorage.getItem('bookingData')
    if (savedBookingData) {
      setBookingData(JSON.parse(savedBookingData))
      setShowBookingForm(true)
      localStorage.removeItem('bookingData')
    }
  }, [])

  // Load accepted AI requests
  useEffect(() => {
    if (isAuthenticated) {
      loadAIRequests()
    }
  }, [isAuthenticated])

  const loadAIRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/ai/customer-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        // Filter only accepted requests that can be booked
        const acceptedRequests = data.data.filter(req => 
          req.status === 'accepted' && req.providerResponse?.canBook
        )
        setAiRequests(acceptedRequests)
      }
    } catch (error) {
      console.error('Load AI requests error:', error)
    }
  }

  const handleBookAIRequest = (request) => {
    const bookingData = {
      requestId: request._id,
      providerId: request.providerId._id,
      eventType: request.eventType,
      eventTitle: `${request.eventType} Event`,
      generatedImage: request.generatedImage,
      cost: request.providerResponse?.estimatedCost || 0,
      provider: request.providerId?.businessName || 'Provider',
      providerResponse: request.providerResponse
    }
    
    localStorage.setItem('aiBookingData', JSON.stringify(bookingData))
    window.location.href = '/book-event/ai-request'
  }

  // Fetch bookings from API
  const { data: bookingsData, isLoading, refetch } = useQuery({
    queryKey: ['customer-bookings', activeTab, searchQuery, sortBy],
    queryFn: async () => {
      try {
        const params = new URLSearchParams({
          page: 1,
          limit: 50
        })
        
        if (activeTab !== 'all') {
          params.append('status', activeTab)
        }
        
        const token = localStorage.getItem('token')
        console.log('Fetching bookings with token:', token ? 'Present' : 'Missing')
        
        const response = await fetch(`http://localhost:5000/api/bookings/customer?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        const result = await response.json()
        console.log('Bookings API response:', result)
        
        if (!result.success) {
          console.error('Bookings API error:', result.message)
          toast.error(result.message || 'Failed to fetch bookings')
        }
        
        return result.success ? result.data.bookings : []
      } catch (error) {
        console.error('Error fetching bookings:', error)
        toast.error('Failed to fetch bookings')
        return []
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 1000, // Refresh every 5 seconds for testing
    refetchInterval: 10 * 1000 // Auto-refresh every 10 seconds
  })
  
  const bookings = bookingsData || []

  // Check if returning from successful booking
  useEffect(() => {
    const latestBookingId = localStorage.getItem('latestBookingId')
    if (latestBookingId) {
      toast.success(`Booking ${latestBookingId} created successfully!`)
      localStorage.removeItem('latestBookingId')
      // Force refresh of bookings immediately and after delay
      refetch()
      setTimeout(() => refetch(), 2000)
      setTimeout(() => refetch(), 5000)
    }
  }, [refetch])

  const tabs = [
    { id: 'all', label: 'All Bookings', count: bookings?.length || 0 },
    { id: 'confirmed', label: 'Upcoming', count: bookings?.filter(b => b.status === 'confirmed').length || 0 },
    { id: 'completed', label: 'Completed', count: bookings?.filter(b => b.status === 'completed').length || 0 },
    { id: 'cancelled', label: 'Cancelled', count: bookings?.filter(b => b.status === 'cancelled').length || 0 }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <AlertCircle className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesTab = activeTab === 'all' || booking.status === activeTab
    const matchesSearch = booking.eventTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.providerId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.providerId?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Create booking with AI request data
      const bookingPayload = {
        ...bookingForm,
        requestId: bookingData.requestId,
        providerId: bookingData.providerId,
        eventType: bookingData.eventType,
        amount: bookingData.cost,
        generatedImage: bookingData.generatedImage,
        providerResponse: bookingData.providerResponse
      }
      
      // Simulate booking creation
      console.log('Creating booking:', bookingPayload)
      
      alert(`🎉 Booking confirmed!\n\nBooking ID: BK${Math.random().toString(36).substr(2, 9).toUpperCase()}\n\nYou will be contacted by the provider within 24 hours.`)
      
      setShowBookingForm(false)
      setBookingData(null)
      
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-12 bg-gray-200 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show booking form if coming from AI request
  if (showBookingForm && bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Booking</h1>
            
            {/* AI Request Summary */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-medium text-blue-900 mb-2">AI Generated Request</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-700"><strong>Event Type:</strong> {bookingData.eventType}</p>
                  <p className="text-sm text-blue-700"><strong>Final Price:</strong> ₹{bookingData.cost?.toLocaleString()}</p>
                </div>
                <div>
                  {bookingData.generatedImage && (
                    <img 
                      src={bookingData.generatedImage.startsWith('data:') ? bookingData.generatedImage : `data:image/png;base64,${bookingData.generatedImage}`}
                      alt="Your design concept"
                      className="w-24 h-16 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.eventDate}
                    onChange={(e) => setBookingForm({...bookingForm, eventDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Time *</label>
                  <input
                    type="time"
                    required
                    value={bookingForm.eventTime}
                    onChange={(e) => setBookingForm({...bookingForm, eventTime: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Location *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full address"
                  value={bookingForm.location}
                  onChange={(e) => setBookingForm({...bookingForm, location: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests *</label>
                <input
                  type="number"
                  required
                  placeholder="Expected number of guests"
                  value={bookingForm.guests}
                  onChange={(e) => setBookingForm({...bookingForm, guests: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                <textarea
                  placeholder="Any special requirements or notes..."
                  value={bookingForm.specialRequests}
                  onChange={(e) => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Provider Contact Info */}
              {bookingData.providerResponse?.contactDetails && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Provider Contact Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>📞 {bookingData.providerResponse.contactDetails.phone}</p>
                    <p>📧 {bookingData.providerResponse.contactDetails.email}</p>
                    <p>📍 {bookingData.providerResponse.contactDetails.address}</p>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  className="flex-1"
                  style={{ backgroundColor: '#333f63' }}
                >
                  Confirm Booking - ₹{bookingData.cost?.toLocaleString()}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBookingForm(false)
                    setBookingData(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
              <p className="text-gray-600 mt-2">Manage and track all your event bookings</p>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="event-date">Event Date</option>
            <option value="amount">Amount</option>
          </select>
        </div>

        {/* AI Requests Ready for Booking */}
        {aiRequests.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">🤖 AI Requests Ready for Booking</h3>
                  <p className="text-sm text-blue-700">Your AI requests have been accepted! Complete your booking now.</p>
                </div>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {aiRequests.length} Ready
                </span>
              </div>
              
              <div className="grid gap-4">
                {aiRequests.map((request) => (
                  <div key={request._id} className="bg-white border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {request.generatedImage && (
                          <img 
                            src={request.generatedImage.startsWith('data:') ? request.generatedImage : `data:image/png;base64,${request.generatedImage}`}
                            alt="AI Generated Design"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{request.eventType} Event</h4>
                          <p className="text-sm text-gray-600">{request.providerId?.businessName}</p>
                          <p className="text-sm font-medium text-green-600">
                            ₹{request.providerResponse?.estimatedCost?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleBookAIRequest(request)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        📅 Complete Booking
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'all' 
                  ? "You haven't made any bookings yet." 
                  : `No ${activeTab} bookings found.`}
              </p>
              <Link to="/AllEvent">
                <Button>Browse Events</Button>
              </Link>
            </div>
          ) : (
            filteredBookings.map((booking, index) => (
              <motion.div
                key={booking._id || booking.id || booking.bookingId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Event Image */}
                      <div className="lg:w-48 flex-shrink-0">
                        <img
                          src={booking.eventImage || '/wedding.jpg'}
                          alt={booking.eventTitle}
                          className="w-full h-32 lg:h-full object-cover rounded-lg"
                          onError={(e) => { e.target.src = '/wedding.jpg' }}
                        />
                      </div>

                      {/* Booking Details */}
                      <div className="flex-1 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">
                                {booking.eventTitle}
                              </h3>
                              <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                {getStatusIcon(booking.status)}
                                <span className="capitalize">{booking.status}</span>
                              </span>
                              {booking.isAIGenerated && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                  🤖 AI Generated
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">Booking ID: {booking.bookingId}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              ₹{booking.totalAmount?.toLocaleString()}
                            </div>
                            <div className={`text-sm ${
                              booking.paymentStatus === 'paid' 
                                ? 'text-green-600' 
                                : 'text-yellow-600'
                            }`}>
                              Payment {booking.paymentStatus}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(booking.eventDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{booking.eventTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{booking.venue || 'Venue TBD'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{booking.guests} guests</span>
                          </div>
                        </div>

                        {/* Provider Info */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-[#333f63] flex items-center justify-center text-white font-medium">
                            {(booking.providerId?.businessName || booking.providerId?.name || 'P').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{booking.providerId?.businessName || booking.providerId?.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{booking.providerId?.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{booking.providerId?.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* AI Generated Image */}
                        {booking.isAIGenerated && booking.generatedImage && (
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <h5 className="font-medium text-purple-900 mb-2">AI Generated Design</h5>
                            <img 
                              src={booking.generatedImage.startsWith('data:') ? booking.generatedImage : `data:image/png;base64,${booking.generatedImage}`}
                              alt="AI Generated Design"
                              className="w-32 h-20 object-cover rounded"
                            />
                          </div>
                        )}
                        
                        {/* Special Requests */}
                        {booking.specialRequests && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-1">Special Requests</h5>
                            <p className="text-sm text-blue-700">{booking.specialRequests}</p>
                          </div>
                        )}
                        
                        {/* Provider Notes */}
                        {booking.providerNotes && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <h5 className="font-medium text-green-900 mb-1">Provider Notes</h5>
                            <p className="text-sm text-green-700">{booking.providerNotes}</p>
                          </div>
                        )}

                        {/* Review Section */}
                        {booking.status === 'completed' && booking.rating && (
                          <div className="p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-green-900">Your Review:</span>
                              <div className="flex items-center">
                                {[...Array(booking.rating)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-green-700">{booking.review}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          <Link to={`/event/${booking.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>View Event</span>
                            </Button>
                          </Link>
                          
                          {booking.status === 'confirmed' && (
                            <Button variant="outline" size="sm" className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>Contact Provider</span>
                            </Button>
                          )}
                          
                          {booking.status === 'completed' && !booking.rating && (
                            <Button size="sm" className="flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span>Write Review</span>
                            </Button>
                          )}
                          
                          <Button variant="outline" size="sm" className="flex items-center space-x-1">
                            <Download className="w-4 h-4" />
                            <span>Download Invoice</span>
                          </Button>
                          
                          {booking.status === 'pending' && (
                            <Button variant="outline" size="sm" className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                              <XCircle className="w-4 h-4" />
                              <span>Cancel Booking</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredBookings.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="flex items-center space-x-2 mx-auto">
              <RefreshCw className="w-4 h-4" />
              <span>Load More Bookings</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerBookingDashboard