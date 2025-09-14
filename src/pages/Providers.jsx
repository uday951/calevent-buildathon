import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, MapPin, Users, Verified, Heart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Link } from 'react-router-dom'
import { providersAPI } from '@/services/api'
import { getImageUrl } from '@/lib/utils'

const Providers = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'wedding', name: 'Wedding Planners' },
    { id: 'corporate', name: 'Corporate Events' },
    { id: 'birthday', name: 'Birthday Parties' },
    { id: 'photography', name: 'Photography' },
    { id: 'catering', name: 'Catering' },
    { id: 'decoration', name: 'Decoration' }
  ]

  const locations = [
    { id: 'all', name: 'All Locations' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'delhi', name: 'Delhi' },
    { id: 'bangalore', name: 'Bangalore' },
    { id: 'hyderabad', name: 'Hyderabad' },
    { id: 'pune', name: 'Pune' }
  ]

  // Fetch providers from API
  const { data: providers = [], isLoading, error } = useQuery({
    queryKey: ['providers', selectedCategory, selectedLocation, searchQuery],
    queryFn: async () => {
      try {
        const params = {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          location: selectedLocation !== 'all' ? selectedLocation : undefined,
          search: searchQuery || undefined
        }
        const response = await providersAPI.getAllProviders(params)
        console.log('Providers API response:', response)
        console.log('Response data type:', typeof response.data)
        console.log('Response data:', response.data)
        
        // Handle different response structures
        let data = []
        if (Array.isArray(response.data)) {
          data = response.data
        } else if (response.data && Array.isArray(response.data.providers)) {
          data = response.data.providers
        } else if (response.data && typeof response.data === 'object') {
          data = [response.data] // Single provider object
        }
        
        console.log('Processed providers data:', data)
        return data
      } catch (error) {
        console.error('Error fetching providers:', error)
        return []
      }
    }
  })

  const filteredProviders = Array.isArray(providers) ? providers.filter(provider => {
    // Search filter
    const matchesSearch = !searchQuery || 
      (provider.name || provider.businessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (provider.categories || []).some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || 
      (provider.categories || []).some(cat => cat.toLowerCase().includes(selectedCategory.toLowerCase()))
    
    // Location filter
    const matchesLocation = selectedLocation === 'all' || 
      (provider.location?.city || '').toLowerCase().includes(selectedLocation.toLowerCase())
    
    return matchesSearch && matchesCategory && matchesLocation
  }) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black to-[#333f63] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find the Perfect
              <span className="block">Event Providers</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Connect with verified professionals for all your event needs
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
            >
              {locations.map(location => (
                <option key={location.id} value={location.id}>{location.name}</option>
              ))}
            </select>
            <Button className="w-full">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredProviders.length} providers
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Providers Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider._id || provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <img
                    src={getImageUrl(provider.profileImage) || '/images/default-provider.jpg'}
                    alt={provider.businessName || provider.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = '/images/default-provider.jpg'
                    }}
                  />
                  {provider.isVerified && (
                    <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center space-x-1">
                      <Verified className="w-3 h-3" />
                      <span>Verified</span>
                    </div>
                  )}
                  <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {provider.businessName || provider.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {provider.categories?.[0] || 'Event Provider'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{provider.rating || 4.5}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.location?.city || 'Location'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{provider.totalReviews || 0} reviews</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {(provider.categories || []).slice(0, 2).map((category, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                          {category}
                        </span>
                      ))}
                      {(provider.categories || []).length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{provider.categories.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {provider.experience || '2+'} years
                      </p>
                    </div>
                    <Link to={`/provider/profile/${provider._id || provider.id}`}>
                      <Button size="sm">View Profile</Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredProviders.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}

        {/* Load More */}
        {!isLoading && filteredProviders.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Providers
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Providers