// ============================================================================
// SAMPLE FRONTEND COMPONENTS FOR ADMIN EVENTS
// Copy these to your React components and customize as needed
// ============================================================================

// ----------------------------------------------------------------------------
// 1. FEATURED PREMIUM EVENTS SECTION
// ----------------------------------------------------------------------------

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export function FeaturedPremiumSection() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/events?tag=premium&limit=6')
      .then(res => {
        setEvents(res.data.data.events);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching premium events:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <section className="py-16 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            ✨ Premium Services
          </h2>
          <p className="text-gray-600 text-lg">
            Handpicked luxury packages for your special occasions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <PremiumEventCard key={event._id} event={event} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/events?tag=premium" 
            className="inline-block bg-yellow-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-yellow-600 transition"
          >
            View All Premium Services →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// 2. PREMIUM EVENT CARD COMPONENT
// ----------------------------------------------------------------------------

function PremiumEventCard({ event }) {
  return (
    <Link to={`/events/${event._id}`}>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <img 
            src={`/${event.eventImage}`} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          
          {/* Premium Badge */}
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
              ⭐ PREMIUM
            </span>
          </div>

          {/* Rating Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
              {event.rating} ⭐
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
            {event.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3">
            {event.providerName}
          </p>

          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-gray-500 text-xs">Starting from</span>
              <div className="text-2xl font-bold text-green-600">
                ₹{event.price.toLocaleString()}
              </div>
            </div>
            <div className="text-right">
              <span className="text-gray-500 text-xs">Location</span>
              <div className="text-sm font-semibold text-gray-700">
                📍 {event.location.city}
              </div>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition">
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
}

// ----------------------------------------------------------------------------
// 3. CATEGORY-WISE SECTIONS
// ----------------------------------------------------------------------------

export function WeddingPackagesSection() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/events?category=wedding&limit=8')
      .then(res => setEvents(res.data.data.events));
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              💍 Wedding Packages
            </h2>
            <p className="text-gray-600">
              Make your special day unforgettable
            </p>
          </div>
          <Link 
            to="/events?category=wedding" 
            className="text-blue-600 font-semibold hover:text-blue-700"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map(event => (
            <CompactEventCard key={event._id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function CorporateEventsSection() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/events?category=corporate&limit=8')
      .then(res => setEvents(res.data.data.events));
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🏢 Corporate Events
            </h2>
            <p className="text-gray-600">
              Professional solutions for your business needs
            </p>
          </div>
          <Link 
            to="/events?category=corporate" 
            className="text-blue-600 font-semibold hover:text-blue-700"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map(event => (
            <CompactEventCard key={event._id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function BirthdayPartiesSection() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/events?category=birthday&limit=8')
      .then(res => setEvents(res.data.data.events));
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              🎂 Birthday Parties
            </h2>
            <p className="text-gray-600">
              Celebrate in style with our party packages
            </p>
          </div>
          <Link 
            to="/events?category=birthday" 
            className="text-blue-600 font-semibold hover:text-blue-700"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map(event => (
            <CompactEventCard key={event._id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// 4. COMPACT EVENT CARD (For Grid Layouts)
// ----------------------------------------------------------------------------

function CompactEventCard({ event }) {
  const getBadgeColor = (tag) => {
    const colors = {
      premium: 'bg-yellow-500',
      bestseller: 'bg-blue-500',
      popular: 'bg-green-500',
      top_rated: 'bg-purple-500',
      trending: 'bg-red-500',
      budget: 'bg-gray-500'
    };
    return colors[tag] || 'bg-gray-500';
  };

  const getBadgeLabel = (tag) => {
    const labels = {
      premium: 'Premium',
      bestseller: 'Best Seller',
      popular: 'Popular',
      top_rated: 'Top Rated',
      trending: 'Trending',
      budget: 'Budget'
    };
    return labels[tag] || tag;
  };

  return (
    <Link to={`/events/${event._id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={`/${event.eventImage}`} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          
          {/* Badge */}
          <span className={`absolute top-2 right-2 ${getBadgeColor(event.tag)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
            {getBadgeLabel(event.tag)}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2">
            {event.title}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-green-600">
              ₹{event.price.toLocaleString()}
            </span>
            <span className="text-yellow-500 text-sm">
              {event.rating} ⭐
            </span>
          </div>

          <p className="text-gray-500 text-xs mb-3">
            📍 {event.location.city}
          </p>

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}

// ----------------------------------------------------------------------------
// 5. TRENDING EVENTS SECTION
// ----------------------------------------------------------------------------

export function TrendingEventsSection() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/events?tag=trending&limit=6')
      .then(res => setEvents(res.data.data.events));
  }, []);

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            🔥 Trending Now
          </h2>
          <p className="text-gray-600 text-lg">
            Most popular events this month
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <CompactEventCard key={event._id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// 6. BESTSELLER EVENTS SECTION
// ----------------------------------------------------------------------------

export function BestsellerEventsSection() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get('/api/events?tag=bestseller&limit=8')
      .then(res => setEvents(res.data.data.events));
  }, []);

  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            🏆 Best Sellers
          </h2>
          <p className="text-gray-600 text-lg">
            Most booked events by our customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map(event => (
            <CompactEventCard key={event._id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------------
// 7. COMPLETE HOMEPAGE LAYOUT
// ----------------------------------------------------------------------------

export function EnhancedHomepage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section (Your existing hero) */}
      {/* ... */}

      {/* Featured Premium Services */}
      <FeaturedPremiumSection />

      {/* Trending Now */}
      <TrendingEventsSection />

      {/* Wedding Packages */}
      <WeddingPackagesSection />

      {/* Corporate Events */}
      <CorporateEventsSection />

      {/* Birthday Parties */}
      <BirthdayPartiesSection />

      {/* Best Sellers */}
      <BestsellerEventsSection />

      {/* Your existing sections */}
      {/* ... */}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 8. USAGE EXAMPLE
// ----------------------------------------------------------------------------

/*
// In your Homepage.jsx or App.jsx:

import { 
  FeaturedPremiumSection,
  TrendingEventsSection,
  WeddingPackagesSection,
  CorporateEventsSection,
  BirthdayPartiesSection,
  BestsellerEventsSection
} from './components/AdminEventSections';

function Homepage() {
  return (
    <div>
      <HeroSection />
      <FeaturedPremiumSection />
      <TrendingEventsSection />
      <WeddingPackagesSection />
      <CorporateEventsSection />
      <BirthdayPartiesSection />
      <BestsellerEventsSection />
      <Footer />
    </div>
  );
}
*/

// ----------------------------------------------------------------------------
// 9. API INTEGRATION HELPER
// ----------------------------------------------------------------------------

export const eventAPI = {
  // Get all events
  getAll: (params = {}) => 
    axios.get('/api/events', { params }),

  // Get by category
  getByCategory: (category, limit = 12) => 
    axios.get(`/api/events?category=${category}&limit=${limit}`),

  // Get by tag
  getByTag: (tag, limit = 12) => 
    axios.get(`/api/events?tag=${tag}&limit=${limit}`),

  // Get single event
  getById: (id) => 
    axios.get(`/api/events/${id}`),

  // Search events
  search: (query) => 
    axios.get(`/api/events?search=${query}`),

  // Filter by price
  filterByPrice: (minPrice, maxPrice) => 
    axios.get(`/api/events?minPrice=${minPrice}&maxPrice=${maxPrice}`),

  // Filter by location
  filterByLocation: (city) => 
    axios.get(`/api/events?location=${city}`)
};

// Usage:
// const { data } = await eventAPI.getByCategory('wedding');
// const { data } = await eventAPI.getByTag('premium');
