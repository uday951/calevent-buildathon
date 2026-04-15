// ============================================================================
// PRICING DISPLAY UTILITY & COMPONENTS
// ============================================================================

// ----------------------------------------------------------------------------
// 1. PRICING UTILITY FUNCTION
// ----------------------------------------------------------------------------

export const formatEventPrice = (price, priceMax = null) => {
  // If price is 1 or 0, show "Price will be discussed"
  if (price <= 1) {
    return {
      display: "Price will be discussed",
      isContactPrice: true,
      showButton: true
    };
  }

  // If price range exists
  if (priceMax && priceMax > price) {
    return {
      display: `₹${price.toLocaleString('en-IN')} - ₹${priceMax.toLocaleString('en-IN')}`,
      isContactPrice: false,
      showButton: false
    };
  }

  // Single price
  return {
    display: `₹${price.toLocaleString('en-IN')}`,
    isContactPrice: false,
    showButton: false
  };
};

// ----------------------------------------------------------------------------
// 2. PRICE DISPLAY COMPONENT
// ----------------------------------------------------------------------------

export function PriceDisplay({ price, priceMax, className = "" }) {
  const priceInfo = formatEventPrice(price, priceMax);

  if (priceInfo.isContactPrice) {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-sm text-gray-500 mb-1">Pricing</span>
        <span className="text-lg font-bold text-blue-600">
          💬 Price will be discussed
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-sm text-gray-500 mb-1">Starting from</span>
      <span className="text-2xl font-bold text-green-600">
        {priceInfo.display}
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 3. EVENT CARD WITH CONTACT PRICING
// ----------------------------------------------------------------------------

import { Link } from 'react-router-dom';

export function EventCard({ event }) {
  const priceInfo = formatEventPrice(event.price, event.priceMax);

  const getBadgeColor = (tag) => {
    const colors = {
      premium: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
      bestseller: 'bg-gradient-to-r from-blue-500 to-blue-700',
      popular: 'bg-gradient-to-r from-green-500 to-green-700',
      top_rated: 'bg-gradient-to-r from-purple-500 to-purple-700',
      trending: 'bg-gradient-to-r from-red-500 to-red-700',
      budget: 'bg-gradient-to-r from-gray-500 to-gray-700'
    };
    return colors[tag] || 'bg-gray-500';
  };

  return (
    <Link to={`/events/${event._id}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden">
          <img 
            src={event.eventImage} 
            alt={event.title}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          />
          
          {/* Tag Badge */}
          <div className="absolute top-4 right-4">
            <span className={`${getBadgeColor(event.tag)} text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg uppercase`}>
              {event.tag.replace('_', ' ')}
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
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition">
            {event.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3">
            {event.providerName}
          </p>

          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {event.description}
          </p>

          {/* Pricing Section */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            {priceInfo.isContactPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold text-lg">
                  💬 Price will be discussed
                </span>
              </div>
            ) : (
              <div>
                <span className="text-gray-500 text-xs">Starting from</span>
                <div className="text-2xl font-bold text-green-600">
                  {priceInfo.display}
                </div>
              </div>
            )}
            
            <div className="text-right">
              <span className="text-gray-500 text-xs">Location</span>
              <div className="text-sm font-semibold text-gray-700">
                📍 {event.location.city}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {priceInfo.isContactPrice ? (
            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-md">
              Get Quote
            </button>
          ) : (
            <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition shadow-md">
              Book Now
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

// ----------------------------------------------------------------------------
// 4. EVENT DETAILS PAGE PRICING
// ----------------------------------------------------------------------------

export function EventDetailsPricing({ event }) {
  const priceInfo = formatEventPrice(event.price, event.priceMax);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      <h3 className="text-2xl font-bold mb-4">Pricing & Booking</h3>
      
      {priceInfo.isContactPrice ? (
        <div className="mb-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-3">💬</div>
            <h4 className="text-xl font-bold text-blue-900 mb-2">
              Price will be discussed
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              Get a customized quote based on your requirements
            </p>
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Request Quote
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
            <span className="text-sm text-gray-600">Starting from</span>
            <div className="text-4xl font-bold text-green-600 mb-4">
              {priceInfo.display}
            </div>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
              Book Now
            </button>
          </div>
        </div>
      )}

      {/* Event Details */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Capacity</span>
          <span className="font-semibold">{event.minCapacity} - {event.maxCapacity} guests</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Duration</span>
          <span className="font-semibold">{event.duration}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="text-gray-600">Location</span>
          <span className="font-semibold">{event.location.city}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-gray-600">Rating</span>
          <span className="font-semibold">{event.rating} ⭐</span>
        </div>
      </div>

      {/* Contact Info */}
      {priceInfo.isContactPrice && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3">Need Help?</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>📞</span>
              <span>Call: +91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📧</span>
              <span>Email: info@calevent.com</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💬</span>
              <span>WhatsApp: +91 98765 43210</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 5. USAGE EXAMPLES
// ----------------------------------------------------------------------------

/*
// In your EventCard component:
import { EventCard } from './components/EventPricingComponents';

function EventsGrid({ events }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map(event => (
        <EventCard key={event._id} event={event} />
      ))}
    </div>
  );
}

// In your Event Details page:
import { EventDetailsPricing } from './components/EventPricingComponents';

function EventDetailsPage({ event }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {/* Event details, images, description */}
      </div>
      <div>
        <EventDetailsPricing event={event} />
      </div>
    </div>
  );
}

// Using the utility function directly:
import { formatEventPrice } from './utils/pricing';

const priceInfo = formatEventPrice(event.price, event.priceMax);
console.log(priceInfo.display); // "Price will be discussed" or "₹50,000"
console.log(priceInfo.isContactPrice); // true or false
*/

// ----------------------------------------------------------------------------
// 6. FILTER COMPONENT (OPTIONAL)
// ----------------------------------------------------------------------------

export function PriceFilter({ onFilterChange }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Price Range</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="price" 
            value="all"
            onChange={(e) => onFilterChange(e.target.value)}
            defaultChecked
          />
          <span>All Prices</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="price" 
            value="contact"
            onChange={(e) => onFilterChange(e.target.value)}
          />
          <span>Price will be discussed</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name="price" 
            value="fixed"
            onChange={(e) => onFilterChange(e.target.value)}
          />
          <span>Fixed Pricing</span>
        </label>
      </div>
    </div>
  );
}
