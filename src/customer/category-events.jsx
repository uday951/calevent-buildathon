import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List, SlidersHorizontal, MapPin, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import EventCard from '@/components/EventCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const CategoryEvents = () => {
  const { type } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [location, setLocation] = useState('')

  const categoryInfo = {
    wedding: {
      title: 'Wedding Events',
      description: 'Make your special day unforgettable with our premium wedding services',
      icon: '💒',
      color: 'from-pink-500 to-rose-500'
    },
    corporate: {
      title: 'Corporate Events',
      description: 'Professional event management for your business needs',
      icon: '🏢',
      color: 'from-blue-500 to-indigo-500'
    },
    birthday: {
      title: 'Birthday Celebrations',
      description: 'Create magical birthday memories with our party planning services',
      icon: '🎂',
      color: 'from-purple-500 to-violet-500'
    },
    anniversary: {
      title: 'Anniversary Events',
      description: 'Celebrate your milestones with elegant anniversary events',
      icon: '💕',
      color: 'from-red-500 to-pink-500'
    },
    conference: {
      title: 'Conferences',
      description: 'Professional conference and seminar management',
      icon: '🎤',
      color: 'from-green-500 to-emerald-500'
    },
    party: {
      title: 'Parties',
      description: 'Fun and memorable party planning for all occasions',
      icon: '🎉',
      color: 'from-yellow-500 to-orange-500'
    }
  }

  const currentCategory = categoryInfo[type] || categoryInfo.wedding

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
  ]

  // Real API call for events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['category-events', type, searchQuery, sortBy, location],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: type,
        limit: '50',
        ...(searchQuery && { search: searchQuery }),
        ...(location && { location }),
        sort: sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? '-price' : sortBy === 'rating' ? '-rating' : '-createdAt'
      })
      
      const response = await fetch(`http://localhost:5000/api/events?${params}`)
      if (!response.ok) return []
      const data = await response.json()
      const allEvents = data.success ? data.data.events : []
      
      return allEvents.filter(event => {
        const matchesPrice = event.price >= priceRange[0] && event.price <= priceRange[1]
        return matchesPrice
      })
    }
  })

  const filteredAndSortedEvents = events.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return parseFloat(b.rating) - parseFloat(a.rating)
      case 'popular':
        return b.reviewCount - a.reviewCount
      default:
        return new Date(b.date) - new Date(a.date)
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-lg mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Hero */}
      <div className={`bg-gradient-to-r ${currentCategory.color} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">{currentCategory.icon}</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {currentCategory.title}
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              {currentCategory.description}
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                <span>Professional Service</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                <span>Verified Providers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                <span>Best Prices</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white shadow-sm border-b sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder={`Search ${currentCategory.title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-sm p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="flex-1"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500000])}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Enter city or area"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Date Range</h3>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="date"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedEvents.length} {currentCategory.title.toLowerCase()}
          </p>
        </div>

        {filteredAndSortedEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{currentCategory.icon}</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {currentCategory.title.toLowerCase()} found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse other categories
            </p>
            <Button onClick={() => {
              setSearchQuery('')
              setLocation('')
              setPriceRange([0, 500000])
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <motion.div
            layout
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
            }`}
          >
            {filteredAndSortedEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <EventCard
                  event={event}
                  className={viewMode === 'list' ? 'flex' : ''}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More */}
        {filteredAndSortedEvents.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More {currentCategory.title}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryEvents