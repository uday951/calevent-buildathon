import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Users, MapPin, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

const Categories = () => {
  const categories = [
    {
      id: 'wedding',
      name: 'Weddings',
      description: 'Make your special day unforgettable with our premium wedding services',
      image: '/images/weddings/1.jpg',
      eventCount: 150,
      avgPrice: '₹2,50,000',
      features: ['Venue Decoration', 'Photography', 'Catering', 'Entertainment'],
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'corporate',
      name: 'Corporate Events',
      description: 'Professional corporate events and business gatherings',
      image: '/images/corporate/1.jpg',
      eventCount: 89,
      avgPrice: '₹1,50,000',
      features: ['Conference Halls', 'AV Equipment', 'Catering', 'Networking'],
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'birthday',
      name: 'Birthday Parties',
      description: 'Celebrate birthdays with joy and memorable experiences',
      image: '/images/Birthdays/1.jpg',
      eventCount: 120,
      avgPrice: '₹75,000',
      features: ['Theme Decoration', 'Entertainment', 'Cake & Catering', 'Photography'],
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'parties',
      name: 'Parties & Celebrations',
      description: 'Fun-filled parties and special celebrations for all occasions',
      image: '/images/parties/1.jpg',
      eventCount: 95,
      avgPrice: '₹1,00,000',
      features: ['DJ & Music', 'Lighting', 'Catering', 'Decoration'],
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'anniversary',
      name: 'Anniversaries',
      description: 'Romantic anniversary celebrations and milestone events',
      image: '/images/weddings/2.jpg',
      eventCount: 45,
      avgPrice: '₹1,25,000',
      features: ['Romantic Setup', 'Fine Dining', 'Photography', 'Entertainment'],
      color: 'from-red-500 to-pink-500'
    },
    {
      id: 'conference',
      name: 'Conferences',
      description: 'Professional conferences and business seminars',
      image: '/images/corporate/2.jpg',
      eventCount: 67,
      avgPrice: '₹2,00,000',
      features: ['Large Venues', 'AV Technology', 'Catering', 'Registration'],
      color: 'from-gray-500 to-slate-500'
    }
  ]

  const stats = [
    { label: 'Total Events', value: '500+', icon: Calendar },
    { label: 'Happy Customers', value: '2,000+', icon: Users },
    { label: 'Cities Covered', value: '25+', icon: MapPin },
    { label: 'Average Rating', value: '4.8', icon: Star }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black to-[#333f63] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Event Categories
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
              Discover the perfect event category for your special occasion. From intimate gatherings to grand celebrations, we have everything you need.
            </p>
            <div className="flex items-center justify-center space-x-8 text-sm">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <div className="font-bold text-lg">{stat.value}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Event Category</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Each category is carefully curated with the best service providers and venues to ensure your event is perfect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `/images/${category.id}/default.jpg`
                    }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-20 group-hover:opacity-30 transition-opacity`} />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-900">
                    {category.eventCount} Events
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-sm">{category.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Starting from</span>
                      <span className="font-bold text-[#333f63] text-lg">{category.avgPrice}</span>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm">Popular Services:</h4>
                      <div className="flex flex-wrap gap-1">
                        {category.features.map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Link to={`/category/${category.id}`} className="flex-1">
                        <Button className="w-full group">
                          Explore {category.name}
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Can't Find What You're Looking For?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Our team can help you plan custom events tailored to your specific needs. 
              Get in touch with us for personalized event planning services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/AllEvent">
                <Button variant="outline" size="lg">
                  Browse All Events
                </Button>
              </Link>
              <Link to="/providers">
                <Button size="lg">
                  Find Service Providers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories