import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, Star, Eye, MessageSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { providersAPI } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const ProviderAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d')

  const { data: analyticsData } = useQuery({
    queryKey: ['provider-analytics', timeRange],
    queryFn: async () => {
      try {
        const response = await providersAPI.getDashboardStats()
        return response.success ? response.data : {
          overview: {
            totalRevenue: 0,
            totalBookings: 0,
            averageRating: 0,
            profileViews: 0,
            revenueChange: 0,
            bookingsChange: 0,
            ratingChange: 0,
            viewsChange: 0
          },
          monthlyData: [],
          topEvents: [],
          recentReviews: []
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
        return {
          overview: {
            totalRevenue: 0,
            totalBookings: 0,
            averageRating: 0,
            profileViews: 0,
            revenueChange: 0,
            bookingsChange: 0,
            ratingChange: 0,
            viewsChange: 0
          },
          monthlyData: [],
          topEvents: [],
          recentReviews: []
        }
      }
    }
  })

  const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
            <div className="flex items-center mt-2">
              {changeType === 'positive' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last period</span>
            </div>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your business performance and insights</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={formatPrice(analyticsData?.overview?.totalRevenue || 0)}
            change={analyticsData?.overview?.revenueChange || 0}
            changeType="positive"
            icon={DollarSign}
            color="from-black to-[#333f63]"
          />
          <StatCard
            title="Total Bookings"
            value={analyticsData?.overview?.totalBookings || 0}
            change={analyticsData?.overview?.bookingsChange || 0}
            changeType="positive"
            icon={Calendar}
            color="from-black to-[#333f63]"
          />
          <StatCard
            title="Average Rating"
            value={analyticsData?.overview?.averageRating || 0}
            change={analyticsData?.overview?.ratingChange || 0}
            changeType="positive"
            icon={Star}
            color="from-black to-[#333f63]"
          />
          <StatCard
            title="Profile Views"
            value={analyticsData?.overview?.profileViews || 0}
            change={analyticsData?.overview?.viewsChange || 0}
            changeType="positive"
            icon={Eye}
            color="from-black to-[#333f63]"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData?.monthlyData || []).map((data, index) => (
                  <div key={`revenue-${index}`} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{data.month}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-black to-[#333f63] h-2 rounded-full"
                          style={{ width: `${(data.revenue / 320000) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                        {formatPrice(data.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bookings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData?.monthlyData || []).map((data, index) => (
                  <div key={`booking-${index}`} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">{data.month}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-black to-[#333f63] h-2 rounded-full"
                          style={{ width: `${(data.bookings / 22) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                        {data.bookings} bookings
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Performing Events */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData?.topEvents || []).map((event, index) => (
                  <div key={`event-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900">{event.name}</h4>
                      <p className="text-sm text-gray-600">{event.bookings} bookings</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatPrice(event.revenue)}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analyticsData?.recentReviews || []).map((review, index) => (
                  <div key={`review-${index}`} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{review.customer}</h4>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={`star-${i}`} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{review.comment}</p>
                    <p className="text-xs text-gray-500">{review.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  )
}

export default ProviderAnalytics