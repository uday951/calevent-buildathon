import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Calendar, Star, Phone, Mail, MapPin as LocationIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { providersAPI } from '@/services/api'
import EnhancedTeddyBot from '../components/EnhancedTeddyBot'
import { 
  PremiumEventsGrid, 
  TrendingEventsCarousel, 
  BudgetEventsGrid, 
  FeatureCard, 
  TestimonialsCarousel 
} from '@/components/HomepageSections'

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [topProviders, setTopProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [eventSuggestions, setEventSuggestions] = useState([])
  const [anime, setAnime] = useState(null)
  const categoriesRef = useRef(null)
  const categoryCardsRef = useRef([])
  const navigate = useNavigate()

  // Load anime.js dynamically
  useEffect(() => {
    import('animejs').then((module) => {
      const animeFunc = module.default
      if (typeof animeFunc === 'function') {
        setAnime(() => animeFunc)
      }
    }).catch(err => console.error('Failed to load anime.js:', err))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/AllEvent?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/AllEvent')
    }
  }

  const heroImages = [
    '/people-8552338_1280.jpg',
    '/6201540413437887895.jpg',
    '/6201540413437887900.jpg'
  ]

  const categories = [
    { name: 'Wedding', icon: '💒' },
    { name: 'Corporate', icon: '🏢' },
    { name: 'Birthday', icon: '🎂' },
    { name: 'Anniversary', icon: '💕' },
    { name: 'Party', icon: '🎉' },
    { name: 'Conference', icon: '🎤' }
  ]

  const popularSearches = [
    'Wedding Photography',
    'Birthday Party Decoration',
    'Corporate Event Planning',
    'Anniversary Celebration',
    'Wedding Venue',
    'DJ Services',
    'Event Catering'
  ]

  // Fetch top providers
  useEffect(() => {
    const fetchTopProviders = async () => {
      try {
        const response = await providersAPI.getAllProviders({ limit: 4 })
        if (response.success) {
          setTopProviders(response.data.providers)
        }
      } catch (error) {
        console.error('Failed to fetch top providers:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTopProviders()
  }, [])

  // Anime.js Categories Animation
  useEffect(() => {
    if (!anime) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: '.category-card',
              translateY: [50, 0],
              opacity: [0, 1],
              scale: [0.8, 1],
              rotate: [5, 0],
              duration: 800,
              delay: anime.stagger(100),
              easing: 'easeOutElastic(1, .8)'
            })

            anime({
              targets: '.categories-title',
              translateY: [30, 0],
              opacity: [0, 1],
              duration: 600,
              easing: 'easeOutQuad'
            })

            anime({
              targets: '.categories-subtitle',
              translateY: [20, 0],
              opacity: [0, 1],
              duration: 600,
              delay: 200,
              easing: 'easeOutQuad'
            })

            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (categoriesRef.current) {
      observer.observe(categoriesRef.current)
    }

    return () => observer.disconnect()
  }, [anime])

  // Category hover animations
  const handleCategoryHover = (index, isHovering) => {
    if (!anime) return
    const card = categoryCardsRef.current[index]
    if (!card) return

    if (isHovering) {
      anime({
        targets: card,
        translateY: -10,
        scale: 1.05,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        duration: 300,
        easing: 'easeOutQuad'
      })
      
      anime({
        targets: card.querySelector('.category-icon'),
        scale: 1.2,
        rotate: 10,
        duration: 300,
        easing: 'easeOutBack(1.7)'
      })
    } else {
      anime({
        targets: card,
        translateY: 0,
        scale: 1,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        duration: 300,
        easing: 'easeOutQuad'
      })
      
      anime({
        targets: card.querySelector('.category-icon'),
        scale: 1,
        rotate: 0,
        duration: 300,
        easing: 'easeOutBack(1.7)'
      })
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Handle search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 1) {
        try {
          const filteredSuggestions = popularSearches.filter(search => 
            search.toLowerCase().includes(searchQuery.toLowerCase())
          )
          
          const categoryMatches = categories.filter(cat => 
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(cat => cat.name)
          
          const { eventsAPI } = await import('@/services/api')
          const response = await eventsAPI.getAllEvents({
            search: searchQuery,
            limit: 5
          })
          
          const eventTitles = response.success ? 
            response.data.events.map(event => event.title) : []
          
          const allSuggestions = [
            ...filteredSuggestions,
            ...categoryMatches,
            ...eventTitles
          ]
          
          const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 6)
          setSuggestions(uniqueSuggestions)
          setEventSuggestions(eventTitles)
          setShowSuggestions(true)
        } catch (error) {
          console.error('Error fetching suggestions:', error)
          const filteredSuggestions = popularSearches.filter(search => 
            search.toLowerCase().includes(searchQuery.toLowerCase())
          )
          setSuggestions(filteredSuggestions)
          setShowSuggestions(filteredSuggestions.length > 0)
        }
      } else {
        setSuggestions([])
        setEventSuggestions([])
        setShowSuggestions(false)
      }
    }
    
    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    navigate(`/AllEvent?search=${encodeURIComponent(suggestion)}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Hero ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
          </div>
        ))}

        <div className="relative z-10 text-center text-white max-w-5xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight leading-[1.1]"
          >
            Create Unforgettable
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Moments
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto"
          >
            India's most trusted AI-powered event booking platform
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto mb-10"
          >
            <div className="flex flex-col md:flex-row gap-3 bg-white/10 backdrop-blur-2xl p-3 rounded-2xl shadow-2xl border border-white/20">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                <Input
                  placeholder="Search events, venues, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  onFocus={() => searchQuery.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="pl-14 bg-white h-16 text-lg rounded-xl text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-purple-500"
                />
                
                {showSuggestions && (
                  <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                    <div className="py-2">
                      {suggestions.map((suggestion, index) => {
                        const isEvent = eventSuggestions.includes(suggestion)
                        return (
                          <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group"
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`p-2 rounded-xl ${isEvent ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-500'}`}>
                                {isEvent ? <Calendar className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                              </div>
                              <span className="text-base font-medium text-gray-900">{suggestion}</span>
                            </div>
                            {isEvent && (
                              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                Event
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              <Button size="lg" className="h-16 px-10 text-lg rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/plan-my-event">
              <button className="flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl transition-all group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
                <span>Plan My Event</span>
              </button>
            </Link>
            <Link to="/AllEvent">
              <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg border border-white/30 transition-all">
                <span>Browse Events</span>
                <span>→</span>
              </button>
            </Link>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section ref={categoriesRef} className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="categories-title text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 opacity-0">
              Popular Event Categories
            </h2>
            <p className="categories-subtitle text-xl text-slate-600 max-w-2xl mx-auto opacity-0">
              Discover amazing events across different categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={category.name}
                ref={(el) => (categoryCardsRef.current[index] = el)}
                className="category-card opacity-0"
                onMouseEnter={() => handleCategoryHover(index, true)}
                onMouseLeave={() => handleCategoryHover(index, false)}
              >
                <Link to={`/category/${category.name.toLowerCase()}`}>
                  <div className="bg-white p-8 rounded-2xl text-center shadow-lg border border-gray-100 hover:border-purple-200 transition-all cursor-pointer group">
                    <div className="category-icon text-6xl mb-4">{category.icon}</div>
                    <h3 className="font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors">{category.name}</h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Events */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                ✨ Premium Events
              </h2>
              <p className="text-lg text-slate-600">
                Handpicked luxury experiences for your special moments
              </p>
            </div>
            <Link to="/AllEvent?tag=premium">
              <Button variant="outline" className="hidden md:flex">
                View All →
              </Button>
            </Link>
          </div>
          <PremiumEventsGrid />
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                🔥 Trending Now
              </h2>
              <p className="text-lg text-slate-600">
                Most booked events this week
              </p>
            </div>
            <Link to="/AllEvent?sort=popular">
              <Button variant="outline" className="hidden md:flex">
                Explore More →
              </Button>
            </Link>
          </div>
          <TrendingEventsCarousel />
        </div>
      </section>

      {/* Budget Friendly */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-2">
                💰 Budget Friendly
              </h2>
              <p className="text-lg text-slate-600">
                Amazing events that won't break the bank
              </p>
            </div>
            <Link to="/AllEvent?tag=budget">
              <Button variant="outline" className="hidden md:flex">
                See All Deals →
              </Button>
            </Link>
          </div>
          <BudgetEventsGrid />
        </div>
      </section>

      {/* Top Providers */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              🏆 Top Rated Providers
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Verified professionals with proven track records
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : topProviders.length > 0 ? (
              topProviders.map((provider, index) => (
                <motion.div
                  key={provider._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
                >
                  <Link to={`/provider/profile/${provider._id}`}>
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={provider.profileImage || '/Ryan-360x290.jpg'}
                        alt={provider.businessName || provider.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {provider.businessName || provider.name}
                        </h3>
                        {provider.isVerified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{provider.rating || '4.5'}</span>
                        </div>
                        <div>{provider.totalBookings || 0} bookings</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : null}
          </div>

          <div className="text-center mt-12">
            <Link to="/providers">
              <Button size="lg" variant="outline">
                View All Providers →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose CALEVENT */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose CALEVENT?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              India's most trusted AI-powered event booking platform
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon="🤖"
              title="AI-Powered Matching"
              description="Our intelligent system finds the perfect providers for your event requirements"
            />
            <FeatureCard 
              icon="✅"
              title="Verified Providers"
              description="All providers are thoroughly vetted and verified by our admin team"
            />
            <FeatureCard 
              icon="💳"
              title="Secure Payments"
              description="Safe and encrypted payment processing with Razorpay integration"
            />
            <FeatureCard 
              icon="🎯"
              title="End-to-End Support"
              description="From planning to execution, we're with you every step of the way"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              💬 What Our Customers Say
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Real stories from real celebrations
            </p>
          </div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Plan Your Dream Event?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Let our AI assistant help you find the perfect match in minutes
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/plan-my-event">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold px-10 text-lg">
                    🎯 Start Planning Now
                  </Button>
                </Link>
                <Link to="/AllEvent">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold px-10 text-lg">
                    Browse Events
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold mb-4">CALEVENT</div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for creating unforgettable events and celebrations.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/AllEvent" className="hover:text-white transition-colors">Browse Events</Link></li>
                <li><Link to="/providers" className="hover:text-white transition-colors">Find Providers</Link></li>
                <li><Link to="/plan-my-event" className="hover:text-white transition-colors">Plan Event</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 9876543210</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>hello@calevent.com</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CALEVENT. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <EnhancedTeddyBot />
    </div>
  )
}

export default Homepage
