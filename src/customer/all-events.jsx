import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Grid, List, SlidersHorizontal } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { eventsAPI } from '@/services/api'
import EventCard from '@/components/EventCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const AllEvents = () => {
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 100000])
  const [location, setLocation] = useState('')

  // Handle URL parameters for category filtering and search
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const searchParam = searchParams.get('search')
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  }, [searchParams])

  const categories = [
    { id: 'all', name: 'All Events', count: 450 },
    { id: 'wedding', name: 'Weddings', count: 150 },
    { id: 'corporate', name: 'Corporate', count: 80 },
    { id: 'birthday', name: 'Birthday', count: 120 },
    { id: 'anniversary', name: 'Anniversary', count: 60 },
    { id: 'conference', name: 'Conferences', count: 40 },
    { id: 'party', name: 'Parties', count: 90 }
  ]

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'views', label: 'Most Popular' }
  ]

  // Fetch events from API
  const { data: eventsData, isLoading, error } = useQuery({
    queryKey: ['events', selectedCategory, searchQuery, sortBy, location, priceRange],
    queryFn: async () => {
      const params = {
        page: 1,
        limit: 50,
        sortBy,
        sortOrder: 'desc'
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (location) {
        params.location = location
      }
      
      if (priceRange[0] > 0) {
        params.minPrice = priceRange[0]
      }
      
      if (priceRange[1] < 100000) {
        params.maxPrice = priceRange[1]
      }
      
      try {
        const response = await eventsAPI.getAllEvents(params)
        return response.success ? response.data.events : []
      } catch (error) {
        console.error('Error fetching events:', error)
        return []
      }
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  })
  
  const events = eventsData || []

  const filteredAndSortedEvents = events

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-video bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Events</h1>
              <p className="text-gray-600 mt-1">
                Discover amazing events happening around you
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search events..."
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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors border ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-black to-[#333f63] text-white border-[#333f63]'
                          : 'hover:bg-gray-50 border-transparent'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-sm text-gray-500">({category.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4">Price Range</h3>
                <div className="space-y-4">
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
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-4">Location</h3>
                <Input
                  placeholder="Enter city or area"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Sort By */}
              <div>
                <h3 className="font-semibold text-lg mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-600">
                  Showing {filteredAndSortedEvents.length} events
                  {selectedCategory !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-gradient-to-r from-black to-[#333f63] text-white text-xs rounded-full">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {filteredAndSortedEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
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
                    key={event._id || event.id}
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

            {/* Load More Button */}
            {filteredAndSortedEvents.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Events
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllEvents