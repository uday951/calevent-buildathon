import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Calendar, Star, Phone, Mail, MapPin as LocationIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import EventCard from '@/components/EventCard'
import { providersAPI } from '@/services/api'
import EnhancedTeddyBot from '../components/EnhancedTeddyBot'

// Available event images from public folder
const eventImages = [
  'ambience.jpg',
  'birthday background.jpg', 
  'birthday.jpg',
  'concert event.jpg',
  'conference.jpg',
  'corporate.jpg',
  'corporateevent.jpg',
  'dj.jpg',
  'djevent.jpg',
  'gameing.jpg',
  'Indian Wedding Mandap Decor.jpg',
  'lighting.jpg',
  'wedd33.jpg',
  'wedding.jpg',
  'wedding22.jpg',
  'WhatsApp Image 2025-01-03 at 13.04.37_93b22328.jpg',
  'WhatsApp Image 2025-01-03 at 13.04.41_94798184.jpg',
  'WhatsApp Image 2025-01-03 at 13.04.44_b67a33fc.jpg',
  'WhatsApp Image 2025-01-03 at 13.04.45_43b52d23.jpg',
  'WhatsApp Image 2025-01-03 at 13.04.48_b38c82a5.jpg',
  'WhatsApp Image 2025-01-03 at 13.04.51_c51d1db7.jpg'
]

const getRandomImage = () => eventImages[Math.floor(Math.random() * eventImages.length)]

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
      // animejs uses CommonJS export, Vite wraps it in .default
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
    { name: 'Weddings', icon: '💒' },
    { name: 'Corporate', icon: '🏢' },
    { name: 'Birthday', icon: '🎂' },
    { name: 'Anniversary', icon: '💕' },
    { name: 'Conferences', icon: '🎤' },
    { name: 'Parties', icon: '🎉' }
  ]

  const popularSearches = [
    'Wedding Photography',
    'Birthday Party Decoration',
    'Corporate Event Planning',
    'Anniversary Celebration',
    'Conference Venue',
    'Party Catering',
    'Wedding Venue',
    'DJ Services',
    'Event Management'
  ]

  // Fetch top providers from API
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
            // Animate category cards with staggered effect
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

            // Animate section title
            anime({
              targets: '.categories-title',
              translateY: [30, 0],
              opacity: [0, 1],
              duration: 600,
              easing: 'easeOutQuad'
            })

            // Animate section subtitle
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
      
      // Animate icon
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
      
      // Reset icon
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

  // Handle search suggestions with real events
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length > 1) {
        try {
          // Get popular search matches
          const filteredSuggestions = popularSearches.filter(search => 
            search.toLowerCase().includes(searchQuery.toLowerCase())
          )
          
          // Get category matches
          const categoryMatches = categories.filter(cat => 
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(cat => cat.name)
          
          // Fetch real events that match the search
          const { eventsAPI } = await import('@/services/api')
          const response = await eventsAPI.getAllEvents({
            search: searchQuery,
            limit: 5
          })
          
          const eventTitles = response.success ? 
            response.data.events.map(event => event.title) : []
          
          // Combine all suggestions
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
          // Fallback to static suggestions
          const filteredSuggestions = popularSearches.filter(search => 
            search.toLowerCase().includes(searchQuery.toLowerCase())
          )
          const categoryMatches = categories.filter(cat => 
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(cat => cat.name)
          
          const allSuggestions = [...new Set([...filteredSuggestions, ...categoryMatches])].slice(0, 5)
          setSuggestions(allSuggestions)
          setShowSuggestions(allSuggestions.length > 0)
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

  const handleSearchFocus = () => {
    if (searchQuery.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleSearchBlur = () => {
    // Use onMouseDown instead of onClick for suggestions to naturally prevent premature blurring
    setShowSuggestions(false)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Images */}
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
            <div className="absolute inset-0 bg-black/60" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-[1.1]"
          >
            Create Unforgettable
            <span className="block bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
              Moments
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            Tell us your dream event — we handle everything from planning to execution
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-3xl mx-auto mb-10 w-full px-4"
          >
            <div className="flex flex-col md:flex-row gap-3 bg-white/20 backdrop-blur-2xl p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 relative z-20">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-5 text-gray-400 w-6 h-6 z-10 pointer-events-none" />
                <Input
                  placeholder="Search events, venues, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="pl-14 bg-white/95 backdrop-blur-xl border border-white/50 h-16 text-lg rounded-xl text-gray-900 placeholder-gray-500 shadow-inner w-full focus:ring-4 focus:ring-white/20 transition-all duration-300"
                />
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute top-[calc(100%+0.5rem)] left-0 right-0 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto transform origin-top transition-all duration-200">
                    <div className="py-2">
                      {suggestions.length > 0 ? (
                        suggestions.map((suggestion, index) => {
                          const isEvent = eventSuggestions.includes(suggestion)
                          return (
                            <button
                              key={index}
                              onMouseDown={(e) => {
                                e.preventDefault() // Prevents input from losing focus immediately
                                handleSuggestionClick(suggestion)
                              }}
                              className="w-full text-left px-5 py-4 hover:bg-gray-50/80 transition-colors flex items-center justify-between group border-b border-gray-50 last:border-b-0"
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-xl transition-colors ${isEvent ? 'bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600' : 'bg-gray-50 group-hover:bg-gray-200 text-gray-500'}`}>
                                  {isEvent ? <Calendar className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                                </div>
                                <span className={`text-base font-medium transition-colors ${isEvent ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {suggestion}
                                </span>
                              </div>
                              {isEvent && (
                                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50">
                                  Event
                                </span>
                              )}
                            </button>
                          )
                        })
                      ) : searchQuery.length > 1 ? (
                        <div className="px-5 py-8 text-center text-gray-500">
                          <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                          <p className="text-[15px]">No results found for <span className="font-medium text-gray-900">"{searchQuery}"</span></p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>
              <Button size="lg" className="h-16 px-10 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </motion.div>

          {/* Plan My Event CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/plan-my-event">
              <button className="flex items-center space-x-3 bg-[#7c3aed] hover:bg-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 group">
                <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
                <span>Plan My Event</span>
              </button>
            </Link>
            <Link to="/my-requests">
              <button className="flex items-center space-x-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-semibold text-base border border-white/30 transition-all duration-300">
                <span>📋</span>
                <span>Track My Requests</span>
              </button>
            </Link>
          </motion.div>


        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section with Anime.js */}
      <section ref={categoriesRef} className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <h2 className="categories-title text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 opacity-0">
              Popular Event Categories
            </h2>
            <p className="categories-subtitle text-xl text-slate-600 max-w-2xl mx-auto opacity-0">
              Discover amazing events across different categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <div
                key={category.name}
                ref={(el) => (categoryCardsRef.current[index] = el)}
                className="category-card opacity-0 cursor-pointer"
                onMouseEnter={() => handleCategoryHover(index, true)}
                onMouseLeave={() => handleCategoryHover(index, false)}
              >
                <Link to={`/category/${category.name.toLowerCase()}`}>
                  <div className="bg-gradient-to-br from-white via-slate-50 to-blue-50 p-7 rounded-2xl text-slate-800 text-center shadow-lg border border-slate-200 relative overflow-hidden group">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    
                    <div className="category-icon text-5xl mb-4 relative z-10">{category.icon}</div>
                    <h3 className="font-semibold text-lg mb-1 relative z-10">{category.name}</h3>
                    
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Providers Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Our Verified Provider Network
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              CALEVENT works with top-rated professionals — we assign the best match for your event
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              // Loading skeleton
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
                          <span>{provider.rating || '0.0'}</span>
                        </div>
                        <div>{provider.totalBookings || 0} bookings</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">No providers available at the moment.</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link to="/plan-my-event">
              <Button size="lg" className="bg-[#7c3aed] hover:bg-purple-700 text-white font-bold px-10">
                🎯 Plan My Event
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-gray-900 via-primary/95 to-purple-900 rounded-[2.5rem] shadow-2xl p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  Need Help Planning Your Event?
                </h2>
                <p className="text-xl mb-8 text-gray-200">
                  Get in touch with our team and let's make your vision come to life
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5" />
                    <span>+91 9876543210</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5" />
                    <span>hello@calevent.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <LocationIcon className="w-5 h-5" />
                    <span>Mumbai, India</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl">
                <h3 className="text-2xl font-semibold mb-6">Send us a message</h3>
                <form className="space-y-4">
                  <Input placeholder="Your Name" className="bg-white/20 border-white/30 text-white placeholder:text-white/70" />
                  <Input placeholder="Your Email" type="email" className="bg-white/20 border-white/30 text-white placeholder:text-white/70" />
                  <textarea
                    placeholder="Your Message"
                    rows={4}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/70 resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <Button variant="secondary" className="w-full">
                    Send Message
                  </Button>
                </form>
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
              <div className="text-2xl font-bold text-white mb-4">
                CALEVENT
              </div>
              <p className="text-gray-400 mb-4">
                Your trusted partner for creating unforgettable events and celebrations.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gradient-to-r from-black to-[#333f63] rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-black to-[#333f63] rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-black to-[#333f63] rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-sm">i</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/AllEvent" className="hover:text-white transition-colors">Browse Events</Link></li>
                <li><Link to="/providers" className="hover:text-white transition-colors">Find Providers</Link></li>
                <li><Link to="/combo" className="hover:text-white transition-colors">Combo Events</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">
                Subscribe to get updates on new events and offers.
              </p>
              <div className="flex">
                <Input placeholder="Your email" className="rounded-r-none" />
                <Button className="rounded-l-none">Subscribe</Button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CALEVENT. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Enhanced Teddy Chatbot */}
      <EnhancedTeddyBot />
    </div>
  )
}

export default Homepage