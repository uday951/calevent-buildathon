import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Star, Users, Calendar, MapPin, Heart, Package } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { formatPrice, formatDate, getImageUrl } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { comboAPI } from '@/services/api'

const ComboEvents = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  const categories = [
    { id: 'all', name: 'All Combos', count: 24 },
    { id: 'wedding', name: 'Wedding Combos', count: 8 },
    { id: 'corporate', name: 'Corporate Combos', count: 6 },
    { id: 'birthday', name: 'Birthday Combos', count: 5 },
    { id: 'anniversary', name: 'Anniversary Combos', count: 5 }
  ]

  // Fetch combo events from API
  const { data: comboData = {}, isLoading, error } = useQuery({
    queryKey: ['combo-events', selectedCategory, searchQuery, sortBy],
    queryFn: async () => {
      try {
        const params = {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
          sortBy
        }
        console.log('Fetching combos with params:', params)
        const response = await comboAPI.getAllCombos(params)
        console.log('Combo API response:', response)
        return response?.data || response || { combos: [] }
      } catch (error) {
        console.error('Error fetching combo events:', error)
        return { combos: [] }
      }
    },
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0  // Don't cache
  })

  const comboEvents = comboData.combos || []

  const filteredEvents = Array.isArray(comboEvents) ? comboEvents.filter(event => {
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    const matchesSearch = !searchQuery || 
                         event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  }) : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black to-[#333f63] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 mb-6">
              <Package className="w-5 h-5" />
              <span className="font-medium">Combo Events</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Save More with
              <span className="block">Event Combos</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-8">
              Get everything you need for your event in one package and save up to 40%
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Verified Providers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Best Prices</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Quality Assured</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search combo events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
          >
            <option value="popular">Most Popular</option>
            <option value="savings">Highest Savings</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-gray-50 text-[#333f63] border border-gray-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">({category.count})</span>
                  </button>
                ))}
              </div>

              <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg">
                <h4 className="font-semibold text-[#333f63] mb-2">Why Choose Combos?</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Save up to 40% on total cost</li>
                  <li>• One-stop solution for all needs</li>
                  <li>• Coordinated service delivery</li>
                  <li>• Single point of contact</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Combo Events Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {filteredEvents.length} combo events
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredEvents.map((combo, index) => (
                <motion.div
                  key={combo._id || combo.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <div className="relative">
                        <img
                          src={combo.images?.[0] || `/images/${combo.category}/1.jpg`}
                          alt={combo.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.target.src = `/images/${combo.category}/1.jpg`
                          }}
                        />
                        {combo.images && combo.images.length > 1 && (
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            +{combo.images.length - 1} more
                          </div>
                        )}
                      </div>
                      {combo.featured && (
                        <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          Featured
                        </div>
                      )}
                      {combo.savingsPercent && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                          Save {combo.savingsPercent}%
                        </div>
                      )}
                      <button className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {combo.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{combo.description}</p>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{combo.location?.city || combo.location?.address || 'Location'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Up to {combo.maxGuests || combo.maxCapacity || 100} guests</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{combo.duration}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">{combo.rating || combo.providerId?.rating || 4.5}</span>
                          </div>
                          <span className="text-gray-500 text-sm">({combo.reviewCount || combo.providerId?.totalReviews || 0} reviews)</span>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Includes:</h4>
                          <div className="grid grid-cols-2 gap-1">
                            {(combo.services?.filter(s => s.included) || combo.features || []).slice(0, 4).map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-1 text-sm text-gray-600">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span>{typeof item === 'string' ? item : item.name}</span>
                              </div>
                            ))}
                          </div>
                          {(combo.services?.filter(s => s.included) || combo.features || []).length > 4 && (
                            <p className="text-sm text-[#333f63]">
                              +{(combo.services?.filter(s => s.included) || combo.features || []).length - 4} more services
                            </p>
                          )}
                        </div>

                        {combo.providers && combo.providers.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-900">Providers:</h4>
                            <div className="flex -space-x-2">
                              {combo.providers.slice(0, 3).map((provider, idx) => (
                                <div key={idx} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center border-2 border-white">
                                  <span className="text-xs font-medium text-gray-600">
                                    {provider.name?.[0] || 'P'}
                                  </span>
                                </div>
                              ))}
                              {combo.providers.length > 3 && (
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center border-2 border-white">
                                  <span className="text-xs text-gray-500">+{combo.providers.length - 3}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="flex items-baseline space-x-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  {formatPrice(combo.comboPrice || combo.price)}
                                </span>
                                {combo.originalPrice && (
                                  <span className="text-lg text-gray-500 line-through">
                                    {formatPrice(combo.originalPrice)}
                                  </span>
                                )}
                              </div>
                              {combo.originalPrice && (
                                <p className="text-sm text-green-600 font-medium">
                                  You save {formatPrice(combo.originalPrice - (combo.comboPrice || combo.price))} ({combo.savingsPercent}%)
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <Link to={`/combo/${combo._id || combo.id}`} className="flex-1">
                              <Button className="w-full">
                                View Details
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="px-3">
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {filteredEvents.length > 0 && (
              <div className="text-center mt-12">
                <Button variant="outline" size="lg">
                  Load More Combos
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComboEvents