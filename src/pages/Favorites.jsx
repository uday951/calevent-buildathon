import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Star, MapPin, Users, Calendar, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const Favorites = () => {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      type: 'event',
      title: 'Premium Wedding Package',
      provider: 'Elite Events',
      price: 250000,
      location: 'Mumbai, Maharashtra',
      rating: 4.9,
      reviewCount: 156,
      image: '/src/public/people-8552338_1280.jpg',
      maxGuests: 500,
      addedDate: '2024-02-10'
    },
    {
      id: 2,
      type: 'provider',
      name: 'Dream Makers',
      speciality: 'Corporate Events',
      rating: 4.8,
      reviewCount: 120,
      eventsCompleted: 150,
      image: '/src/public/Ryan-360x290.jpg',
      location: 'Delhi, India',
      addedDate: '2024-02-08'
    },
    {
      id: 3,
      type: 'event',
      title: 'Birthday Celebration Package',
      provider: 'Party Perfect',
      price: 75000,
      location: 'Bangalore, Karnataka',
      rating: 4.7,
      reviewCount: 89,
      image: '/src/public/pexels-gabby-k-5876695.jpg',
      maxGuests: 100,
      addedDate: '2024-02-05'
    }
  ])

  const [activeTab, setActiveTab] = useState('all')

  const handleRemoveFavorite = (id) => {
    setFavorites(prev => prev.filter(item => item.id !== id))
    toast.success('Removed from favorites')
  }

  const filteredFavorites = favorites.filter(item => {
    if (activeTab === 'all') return true
    return item.type === activeTab
  })

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const EventCard = ({ item }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={() => handleRemoveFavorite(item.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        </button>
      </div>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-600">by {item.provider}</p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{item.rating}</span>
              <span>({item.reviewCount})</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>Up to {item.maxGuests}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {formatPrice(item.price)}
              </p>
              <p className="text-xs text-gray-500">
                Added on {new Date(item.addedDate).toLocaleDateString()}
              </p>
            </div>
            <Link to={`/event/${item.id}`}>
              <Button size="sm">View Details</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProviderCard = ({ item }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={() => handleRemoveFavorite(item.id)}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
        </button>
      </div>
      <CardContent className="p-6">
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-600">{item.speciality}</p>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{item.rating}</span>
              <span>({item.reviewCount})</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{item.eventsCompleted} events</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t">
            <p className="text-xs text-gray-500">
              Added on {new Date(item.addedDate).toLocaleDateString()}
            </p>
            <Link to={`/provider/profile/${item.id}`}>
              <Button size="sm">View Profile</Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">Keep track of your favorite events and providers</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({favorites.length})
          </button>
          <button
            onClick={() => setActiveTab('event')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'event'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Events ({favorites.filter(item => item.type === 'event').length})
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'provider'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Providers ({favorites.filter(item => item.type === 'provider').length})
          </button>
        </div>

        {/* Content */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {item.type === 'event' ? (
                  <EventCard item={item} />
                ) : (
                  <ProviderCard item={item} />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring events and providers to add them to your favorites
            </p>
            <Link to="/AllEvent">
              <Button>Browse Events</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites