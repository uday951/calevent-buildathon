import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, Users, DollarSign, Star, TrendingUp, 
  Eye, MessageSquare, Bell, Plus, BarChart3,
  Clock, MapPin, Phone
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { providersAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatDate } from '@/lib/utils'

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('7d')

  // Fetch dashboard stats from API
  const { data: stats } = useQuery({
    queryKey: ['provider-stats', timeRange],
    queryFn: async () => {
      try {
        const response = await providersAPI.getDashboardStats()
        return response.success ? response.data.overview : {
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          profileViews: 0,
          pendingBookings: 0,
          completedEvents: 0,
          upcomingEvents: 0,
          totalReviews: 0
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
        return {
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          profileViews: 0,
          pendingBookings: 0,
          completedEvents: 0,
          upcomingEvents: 0,
          totalReviews: 0
        }
      }
    }
  })

  const { data: recentBookings = [] } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      try {
        const response = await providersAPI.getDashboardStats()
        return response.success ? response.data.recentBookings || [] : []
      } catch (error) {
        console.error('Error fetching recent bookings:', error)
        return []
      }
    }
  })

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      try {
        const response = await providersAPI.getDashboardStats()
        return response.success ? response.data.upcomingEvents || [] : []
      } catch (error) {
        console.error('Error fetching upcoming events:', error)
        return []
      }
    }
  })

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats?.totalBookings || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Calendar,
      color: 'from-black to-[#333f63]'
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats?.totalRevenue || 0),
      change: '+18%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-black to-[#333f63]'
    },
    {
      title: 'Average Rating',
      value: stats?.averageRating || 0,
      change: '+0.2',
      changeType: 'positive',
      icon: Star,
      color: 'from-black to-[#333f63]'
    },
    {
      title: 'Profile Views',
      value: stats?.profileViews || 0,
      change: '+25%',
      changeType: 'positive',
      icon: Eye,
      color: 'from-black to-[#333f63]'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your events.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Link to="/provider/post-event">
              <Button className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Post New Event</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className={`text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">vs last period</span>
                      </div>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Link to="/provider/track">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{booking.eventTitle}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{booking.customerName}</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(new Date(booking.date))}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{booking.guests} guests</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">{formatPrice(booking.amount)}</div>
                        <div className="text-sm text-gray-500">{booking.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Upcoming Events */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link to="/provider/post-event">
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Post New Event
                    </Button>
                  </Link>
                  <Link to="/provider/events">
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      My Events
                    </Button>
                  </Link>
                  <Link to="/provider/track">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Bookings
                    </Button>
                  </Link>
                  <Link to="/provider/profile">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                  <Link to="/provider/analytics">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border-l-4 border-[#333f63] pl-4">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <div className="space-y-1 mt-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(new Date(event.date))} at {event.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{event.guests} guests</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-4 h-4" />
                          <span>{event.customer} - {event.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Recent Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">New booking request from Priya Sharma</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">Payment received for Wedding Event</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900">New review posted by Rahul Gupta</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  )
}

export default Dashboard