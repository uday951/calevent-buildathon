import { useState } from 'react'
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

const CustomerBookingDashboard = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const tabs = [
    { id: 'all', label: 'All Bookings', count: 12 },
    { id: 'upcoming', label: 'Upcoming', count: 3 },
    { id: 'completed', label: 'Completed', count: 7 },
    { id: 'cancelled', label: 'Cancelled', count: 2 }
  ]

  // Fetch bookings from API
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['customer-bookings', activeTab, searchQuery, sortBy],
    queryFn: async () => {
      try {
        const params = {
          page: 1,
          limit: 50
        }
        
        if (activeTab !== 'all') {
          params.status = activeTab === 'upcoming' ? 'confirmed' : activeTab
        }
        
        const response = await bookingsAPI.getMyBookings(params)
        return response.success ? response.data.bookings : []
      } catch (error) {
        console.error('Error fetching bookings:', error)
        return []
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000
  })
  
  const bookings = bookingsData || []

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
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
    const matchesSearch = booking.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.provider.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600 mt-2">Manage and track all your event bookings</p>
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
                key={booking.id}
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
                          src={getImageUrl(booking.eventImage)}
                          alt={booking.eventTitle}
                          className="w-full h-32 lg:h-full object-cover rounded-lg"
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
                            </div>
                            <p className="text-gray-600">Booking ID: {booking.bookingId}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatPrice(booking.amount)}
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
                            <span>{formatDate(new Date(booking.eventDate))}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{booking.eventTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{booking.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{booking.guests} guests</span>
                          </div>
                        </div>

                        {/* Provider Info */}
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={booking.providerId?.profileImage || getImageUrl(booking.provider?.image)}
                            alt={booking.providerId?.name || booking.provider?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{booking.provider.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{booking.provider.phone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{booking.provider.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Special Requests */}
                        {booking.specialRequests && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h5 className="font-medium text-blue-900 mb-1">Special Requests</h5>
                            <p className="text-sm text-blue-700">{booking.specialRequests}</p>
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