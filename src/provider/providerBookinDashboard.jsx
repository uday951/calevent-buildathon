import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Clock, MapPin, Users, Phone, Mail, 
  CheckCircle, XCircle, AlertCircle, Eye, MessageSquare,
  Filter, Search, Download, MoreHorizontal
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'

const ProviderBookingDashboard = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const tabs = [
    { id: 'all', label: 'All Bookings', count: 45 },
    { id: 'pending', label: 'Pending', count: 8 },
    { id: 'confirmed', label: 'Confirmed', count: 12 },
    { id: 'completed', label: 'Completed', count: 23 },
    { id: 'cancelled', label: 'Cancelled', count: 2 }
  ]

  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['provider-bookings', activeTab, searchQuery, sortBy],
    queryFn: async () => {
      try {
        const response = await providersAPI.getDashboardStats()
        return response.success ? response.data : { bookings: [], stats: {} }
      } catch (error) {
        console.error('Error fetching bookings:', error)
        return { bookings: [], stats: {} }
      }
    }
  })

  const bookings = bookingsData?.bookings || []
  const bookingStats = bookingsData?.stats || {}

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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600'
      case 'advance_paid':
        return 'text-blue-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredBookings = bookings.filter(booking => {
    const matchesTab = activeTab === 'all' || booking.status === activeTab
    const matchesSearch = booking.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         booking.bookingId.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await providersAPI.updateBookingStatus(bookingId, { status: newStatus })
      toast.success(`Booking ${newStatus} successfully`)
      queryClient.invalidateQueries(['provider-bookings'])
    } catch (error) {
      toast.error(`Failed to ${newStatus} booking`)
    }
  }

  const handleContactCustomer = (phone, email, name) => {
    const message = `Hello ${name}, regarding your event booking...`
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`)
  }

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const response = await providersAPI.generateInvoice(bookingId)
      const url = window.URL.createObjectURL(new Blob([response]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${bookingId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('Invoice downloaded successfully')
    } catch (error) {
      toast.error('Failed to download invoice')
    }
  }

  const handleViewDetails = (bookingId) => {
    navigate(`/provider/bookings/${bookingId}`)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-12 bg-gray-200 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-2">Track and manage all your event bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {tabs.slice(1).map((tab, index) => {
            const count = bookingStats[tab.id] || 0
            return (
              <motion.div
                key={tab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 capitalize">{tab.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        tab.id === 'pending' ? 'bg-yellow-100' :
                        tab.id === 'confirmed' ? 'bg-green-100' :
                        tab.id === 'completed' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {getStatusIcon(tab.id)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
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
              <p className="text-gray-600">
                {activeTab === 'all' 
                  ? "You don't have any bookings yet." 
                  : `No ${activeTab} bookings found.`}
              </p>
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
                            <div className={`text-sm ${getPaymentStatusColor(booking.paymentStatus)}`}>
                              {booking.paymentStatus === 'advance_paid' 
                                ? `Advance: ${formatPrice(booking.advanceAmount)}`
                                : booking.paymentStatus === 'paid' 
                                ? 'Fully Paid'
                                : 'Payment Pending'
                              }
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

                        {/* Customer Info */}
                        <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {booking.customerName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{booking.customerName}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{booking.customerPhone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{booking.customerEmail}</span>
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
                              <span className="font-medium text-green-900">Customer Review:</span>
                              <div className="flex items-center">
                                {[...Array(booking.rating)].map((_, i) => (
                                  <span key={i} className="text-yellow-400">★</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-green-700">{booking.review}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center space-x-1"
                            onClick={() => handleViewDetails(booking._id || booking.id)}
                          >
                            <Eye className="w-4 h-4" />
                            <span>View Details</span>
                          </Button>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center space-x-1"
                            onClick={() => handleContactCustomer(booking.customerPhone, booking.customerEmail, booking.customerName)}
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Contact Customer</span>
                          </Button>
                          
                          {booking.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusUpdate(booking._id || booking.id, 'confirmed')}
                                className="flex items-center space-x-1"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Accept</span>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleStatusUpdate(booking._id || booking.id, 'cancelled')}
                                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                                <span>Decline</span>
                              </Button>
                            </>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center space-x-1"
                            onClick={() => handleDownloadInvoice(booking._id || booking.id)}
                          >
                            <Download className="w-4 h-4" />
                            <span>Invoice</span>
                          </Button>
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
            <Button variant="outline" size="lg">
              Load More Bookings
            </Button>
          </div>
        )}
    </div>
  )
}

export default ProviderBookingDashboard