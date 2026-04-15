import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, MapPin, Heart, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { eventsAPI } from '@/services/api'
import PremiumEventCard from '@/components/PremiumEventCard'

// Premium Events Grid Component
export const PremiumEventsGrid = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPremiumEvents = async () => {
      try {
        const response = await eventsAPI.getAllEvents({ tag: 'premium', limit: 6 })
        if (response.success) {
          setEvents(response.data.events)
        }
      } catch (error) {
        console.error('Failed to fetch premium events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPremiumEvents()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, index) => (
        <motion.div
          key={event._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PremiumEventCard event={event} />
        </motion.div>
      ))}
    </div>
  )
}

// Trending Events Carousel Component
export const TrendingEventsCarousel = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingEvents = async () => {
      try {
        const response = await eventsAPI.getAllEvents({ sort: 'bookingCount', limit: 8 })
        if (response.success) {
          setEvents(response.data.events)
        }
      } catch (error) {
        console.error('Failed to fetch trending events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrendingEvents()
  }, [])

  if (loading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="min-w-[320px] bg-gray-200 rounded-2xl h-96 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
      {events.map((event, index) => (
        <motion.div
          key={event._id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="min-w-[320px]"
        >
          <PremiumEventCard event={event} />
        </motion.div>
      ))}
    </div>
  )
}

// Budget Events Grid Component
export const BudgetEventsGrid = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBudgetEvents = async () => {
      try {
        const response = await eventsAPI.getAllEvents({ tag: 'budget', limit: 6 })
        if (response.success) {
          setEvents(response.data.events)
        }
      } catch (error) {
        console.error('Failed to fetch budget events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBudgetEvents()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-2xl h-96 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event, index) => (
        <motion.div
          key={event._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <PremiumEventCard event={event} />
        </motion.div>
      ))}
    </div>
  )
}

// Feature Card Component
export const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center group"
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </motion.div>
  )
}

// Testimonials Carousel Component
export const TestimonialsCarousel = () => {
  const testimonials = [
    {
      name: "Priya Sharma",
      event: "Wedding",
      rating: 5,
      image: "/Ryan-360x290.jpg",
      text: "CALEVENT made our wedding planning so easy! The AI matched us with the perfect vendors and everything was seamless."
    },
    {
      name: "Rajesh Kumar",
      event: "Corporate Event",
      rating: 5,
      image: "/Oyvind-with-bkgrd-785x1030.jpg",
      text: "Organized our annual conference through CALEVENT. Professional service, great vendors, and excellent support throughout."
    },
    {
      name: "Anita Desai",
      event: "Birthday Party",
      rating: 5,
      image: "/Ryan-360x290.jpg",
      text: "My daughter's birthday party was a huge success! The decoration and catering were exactly what we wanted. Highly recommend!"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
        >
          <div className="flex items-center mb-4">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-16 h-16 rounded-full object-cover mr-4"
            />
            <div>
              <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
              <p className="text-sm text-slate-600">{testimonial.event}</p>
            </div>
          </div>
          <div className="flex mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-slate-700 leading-relaxed italic">"{testimonial.text}"</p>
        </motion.div>
      ))}
    </div>
  )
}
