import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Users, Star, MapPin } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import EventCard from '@/components/EventCard'

const categoryImages = {
  weddings: ['weddings/429baf18cbb66c62afa1fcb44918dd6e.jpg', 'weddings/images-2.jpg', 'wedding.jpg'],
  birthday: ['Birthdays/WhatsApp Image 2025-09-11 at 3.02.20 PM (1).jpeg', 'Birthdays/WhatsApp Image 2025-09-11 at 3.02.21 PM.jpeg'],
  corporate: ['corporate/1df693c9-6be4-43be-a0a7-683ed62d091e.jpg', 'corporate.jpg'],
  parties: ['parties/Covid-party.jpg', 'parties/images-3.jpg']
}

const getRandomImageForCategory = (category) => {
  const images = categoryImages[category] || categoryImages.parties
  return images[Math.floor(Math.random() * images.length)]
}

const CategoryPage = () => {
  const { category } = useParams()

  const categoryData = {
    wedding: {
      title: 'Wedding Events',
      description: 'Create your dream wedding with our premium wedding planning services',
      icon: '💒',
      color: 'from-black to-[#333f63]',
      subcategories: [
        { name: 'Traditional Weddings', count: 0, image: '/src/public/people-8552338_1280.jpg' },
        { name: 'Destination Weddings', count: 0, image: '/src/public/Ryan-360x290.jpg' },
        { name: 'Beach Weddings', count: 0, image: '/src/public/pexels-gabby-k-5876695.jpg' },
        { name: 'Garden Weddings', count: 0, image: '/src/public/Oyvind-with-bkgrd-785x1030.jpg' }
      ]
    },
    corporate: {
      title: 'Corporate Events',
      description: 'Professional event management for your business needs',
      icon: '🏢',
      color: 'from-black to-[#333f63]',
      subcategories: [
        { name: 'Conferences', count: 0, image: '/src/public/people-8552338_1280.jpg' },
        { name: 'Product Launches', count: 0, image: '/src/public/Ryan-360x290.jpg' },
        { name: 'Team Building', count: 0, image: '/src/public/pexels-gabby-k-5876695.jpg' },
        { name: 'Annual Meetings', count: 0, image: '/src/public/Oyvind-with-bkgrd-785x1030.jpg' }
      ]
    },
    birthday: {
      title: 'Birthday Celebrations',
      description: 'Make birthdays memorable with our creative party planning',
      icon: '🎂',
      color: 'from-black to-[#333f63]',
      subcategories: [
        { name: 'Kids Birthday', count: 0, image: '/src/public/people-8552338_1280.jpg' },
        { name: 'Adult Birthday', count: 0, image: '/src/public/Ryan-360x290.jpg' },
        { name: 'Milestone Birthday', count: 0, image: '/src/public/pexels-gabby-k-5876695.jpg' },
        { name: 'Surprise Parties', count: 0, image: '/src/public/Oyvind-with-bkgrd-785x1030.jpg' }
      ]
    },
    anniversary: {
      title: 'Anniversary Celebrations',
      description: 'Celebrate love and milestones with elegant anniversary events',
      icon: '💕',
      color: 'from-black to-[#333f63]',
      subcategories: [
        { name: 'Wedding Anniversary', count: 42, image: '/src/public/people-8552338_1280.jpg' },
        { name: 'Company Anniversary', count: 18, image: '/src/public/Ryan-360x290.jpg' },
        { name: 'Milestone Anniversary', count: 25, image: '/src/public/pexels-gabby-k-5876695.jpg' },
        { name: 'Silver & Golden', count: 15, image: '/src/public/Oyvind-with-bkgrd-785x1030.jpg' }
      ]
    },
    conferences: {
      title: 'Conference Events',
      description: 'Professional conference planning and management services',
      icon: '🎤',
      color: 'from-black to-[#333f63]',
      subcategories: [
        { name: 'Business Conference', count: 32, image: '/src/public/people-8552338_1280.jpg' },
        { name: 'Tech Conference', count: 28, image: '/src/public/Ryan-360x290.jpg' },
        { name: 'Medical Conference', count: 15, image: '/src/public/pexels-gabby-k-5876695.jpg' },
        { name: 'Educational Summit', count: 22, image: '/src/public/Oyvind-with-bkgrd-785x1030.jpg' }
      ]
    },
    parties: {
      title: 'Party Events',
      description: 'Fun and exciting party planning for all occasions',
      icon: '🎉',
      color: 'from-black to-[#333f63]',
      subcategories: [
        { name: 'Theme Parties', count: 45, image: '/src/public/people-8552338_1280.jpg' },
        { name: 'Pool Parties', count: 28, image: '/src/public/Ryan-360x290.jpg' },
        { name: 'Cocktail Parties', count: 35, image: '/src/public/pexels-gabby-k-5876695.jpg' },
        { name: 'Dance Parties', count: 38, image: '/src/public/Oyvind-with-bkgrd-785x1030.jpg' }
      ]
    },
    weddings: {
      title: 'Wedding Events',
      description: 'Create your dream wedding with our premium wedding planning services',
      icon: '💒',
      color: 'from-black to-[#333f63]',
      subcategories: [
        { name: 'Traditional Weddings', count: 45, image: '/src/public/people-8552338_1280.jpg' },
        { name: 'Destination Weddings', count: 23, image: '/src/public/Ryan-360x290.jpg' },
        { name: 'Beach Weddings', count: 18, image: '/src/public/pexels-gabby-k-5876695.jpg' },
        { name: 'Garden Weddings', count: 32, image: '/src/public/Oyvind-with-bkgrd-785x1030.jpg' }
      ]
    }
  }

  const currentCategory = categoryData[category] || categoryData[Object.keys(categoryData)[0]]

  // Real API calls for featured events
  const { data: featuredEvents = [] } = useQuery({
    queryKey: ['featured-events', category],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/events?category=${category}&limit=6&sort=rating`)
      if (!response.ok) return []
      const data = await response.json()
      return data.success ? data.data.events : []
    }
  })

  // Real API calls for top providers
  const { data: topProviders = [] } = useQuery({
    queryKey: ['top-providers', category],
    queryFn: async () => {
      const response = await fetch(`http://localhost:5000/api/provider?category=${category}&limit=4&verified=true`)
      if (!response.ok) return []
      const data = await response.json()
      return data.success ? data.data.providers : []
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className={`bg-gradient-to-r ${currentCategory.color} text-white py-20`}>
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="text-8xl mb-6">{currentCategory.icon}</div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {currentCategory.title}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              {currentCategory.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={`/AllEvent?category=${category}`}>
                <Button size="lg" variant="secondary" className="flex items-center space-x-2">
                  <span>Browse All Events</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/providers">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                  Get Custom Quote
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Subcategories */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Explore {currentCategory.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our specialized {category} event categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentCategory.subcategories.map((subcategory, index) => (
              <motion.div
                key={subcategory.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <Link to={`/AllEvent?category=${category}&subcategory=${subcategory.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={subcategory.image}
                        alt={subcategory.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6 text-center">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {subcategory.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {featuredEvents.length} events available
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Events */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured {currentCategory.title}
              </h2>
              <p className="text-gray-600">
                Handpicked premium events from top-rated providers
              </p>
            </div>
            <Link to={`/AllEvent?category=${category}`}>
              <Button variant="outline" className="flex items-center space-x-2">
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <EventCard event={event} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Providers */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Top {currentCategory.title} Providers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Work with the best professionals in {category} event planning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {topProviders.map((provider, index) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <Link to={`/providers`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={provider.profileImage || `/${getRandomImageForCategory(category)}`}
                        alt={provider.businessName || provider.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {provider.businessName || provider.name}
                        </h3>
                        {provider.isVerified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 mb-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{provider.rating || 0}</span>
                        <span className="text-gray-500 text-sm">({provider.totalReviews || 0})</span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1 mb-1">
                          <Users className="w-3 h-3" />
                          <span>{provider.totalBookings || 0} events completed</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        {provider.categories?.slice(0, 2).map((category, idx) => (
                          <div key={idx} className="flex items-center space-x-1 text-xs text-gray-500">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span>{category}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white rounded-2xl p-8 lg:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose CALEVENT for {currentCategory.title}?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make {category} event planning effortless with our comprehensive platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#333f63]" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Expert Providers</h3>
              <p className="text-gray-600">
                Work with verified and experienced {category} event professionals
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600">
                All providers are vetted and rated by real customers
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Local Expertise</h3>
              <p className="text-gray-600">
                Find the best {category} event services in your city
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CategoryPage