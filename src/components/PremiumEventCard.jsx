import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Star, Heart, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const TAG_STYLES = {
  premium:    'bg-amber-500 text-white',
  bestseller: 'bg-emerald-500 text-white',
  trending:   'bg-rose-500 text-white',
  top_rated:  'bg-indigo-600 text-white',
  popular:    'bg-sky-500 text-white',
  budget:     'bg-teal-500 text-white',
  new:        'bg-violet-500 text-white',
}

const TAG_LABELS = {
  premium: '⭐ Premium', bestseller: '🔥 Bestseller', trending: '📈 Trending',
  top_rated: '🏅 Top Rated', popular: '💎 Popular', budget: '💰 Budget', new: '✨ New',
}

const PremiumEventCard = ({ event, className = '' }) => {
  const navigate = useNavigate()
  const [imgIndex, setImgIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [imgError, setImgError] = useState(false)

  // Build image list: main image + additional images array
  const allImages = [
    event.eventImage,
    ...(event.images || []),
  ].filter(Boolean).slice(0, 4)

  const getImgSrc = (src) => {
    if (!src) return '/wedding.jpg'
    if (src.startsWith('http')) return src
    if (src.startsWith('/')) return src
    return `${import.meta.env.VITE_BACKEND_URL}/${src}`
  }

  const prev = (e) => { e.stopPropagation(); setImgIndex(i => (i - 1 + allImages.length) % allImages.length) }
  const next = (e) => { e.stopPropagation(); setImgIndex(i => (i + 1) % allImages.length) }

  const goDetail = () => navigate(`/event/${event._id || event.id}`)
  const goBook = (e) => {
    e.stopPropagation()
    navigate(`/book-event/${event._id || event.id}`)
  }

  return (
    <motion.div
      className={`group cursor-pointer ${className}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      onClick={goDetail}
    >
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100">

        {/* ── Image Carousel ── */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={imgError ? '/wedding.jpg' : getImgSrc(allImages[imgIndex])}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />

          {/* carousel arrows – only when multiple images */}
          {allImages.length > 1 && (
            <>
              <button onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                <ChevronLeft className="w-4 h-4 text-gray-800" />
              </button>
              <button onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                <ChevronRight className="w-4 h-4 text-gray-800" />
              </button>

              {/* dot indicators */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1">
                {allImages.map((_, i) => (
                  <span key={i} className={`block w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white w-4' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}

          {/* Tag badge */}
          {event.tag && (
            <div className={`absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full shadow-md ${TAG_STYLES[event.tag] || 'bg-gray-600 text-white'}`}>
              {TAG_LABELS[event.tag] || event.tag}
            </div>
          )}

          {/* Price badge */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
            <span className="text-sm font-bold text-gray-900">{formatPrice(event.price)}</span>
            {event.priceMax && <span className="text-xs text-gray-500 ml-1">– {formatPrice(event.priceMax)}</span>}
          </div>

          {/* Like button */}
          <button
            onClick={(e) => { e.stopPropagation(); setLiked(l => !l) }}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow hover:bg-white transition-colors"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
          </button>

          {/* Subcategory chip */}
          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize">
            {event.subcategory?.replace('_', ' ')}
          </div>
        </div>

        {/* ── Card Body ── */}
        <div className="p-4 space-y-3">

          <div>
            <h3 className="font-bold text-[15px] text-gray-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {event.title}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>{typeof event.location === 'object' ? event.location.city : event.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-gray-700">{event.rating || '4.5'}</span>
              <span className="text-gray-400">({event.bookingCount || 0} booked)</span>
            </div>
          </div>

          {/* Book Now CTA */}
          <button
            onClick={goBook}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            <Zap className="w-4 h-4" />
            Book Now
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default PremiumEventCard
