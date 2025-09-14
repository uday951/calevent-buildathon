import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Calendar, Users, Heart, Share2, Check, ArrowLeft, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useQuery } from '@tanstack/react-query'
import { comboAPI } from '@/services/api'
import toast from 'react-hot-toast'

const ComboDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Fetch combo details from API - must be before any conditional returns
  const { data: comboData, isLoading, error } = useQuery({
    queryKey: ['combo-details', id],
    queryFn: async () => {
      const response = await comboAPI.getComboById(id)
      return response?.data?.combo || response?.combo || null
    },
    enabled: !!id
  })

  const [selectedDate, setSelectedDate] = useState('')
  const [guestCount, setGuestCount] = useState(100)
  const [selectedAddOns, setSelectedAddOns] = useState([])
  const [customRequirements, setCustomRequirements] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const combo = comboData

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#333f63] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading combo details...</p>
        </div>
      </div>
    )
  }

  if (error || !combo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Combo Not Found</h2>
          <p className="text-gray-600 mb-4">The combo package you're looking for doesn't exist.</p>
          <Link to="/combo">
            <Button>Back to Combos</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleBookNow = async () => {
    if (!selectedDate) {
      toast.error('Please select an event date')
      return
    }

    setIsBooking(true)
    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Navigate to booking form with combo data
      navigate(`/book-event/${id}`, {
        state: {
          combo,
          selectedDate,
          guestCount,
          selectedAddOns,
          customRequirements,
          isCombo: true
        }
      })
    } catch (error) {
      toast.error('Booking failed. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  const handleRequestQuote = () => {
    const message = `Hi, I'm interested in the ${combo.title} combo package.\n\nDetails:\n- Date: ${selectedDate || 'Not selected'}\n- Guests: ${guestCount}\n- Additional Services: ${selectedAddOns.length > 0 ? selectedAddOns.join(', ') : 'None'}\n- Special Requirements: ${customRequirements || 'None'}\n\nPlease provide a detailed quote.`
    
    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#333f63]">Home</Link>
            <span>/</span>
            <Link to="/combo" className="hover:text-[#333f63]">Combo Events</Link>
            <span>/</span>
            <span className="text-gray-900">{combo.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <Link to="/combo">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Combos
                  </Button>
                </Link>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{combo.title}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{combo.rating}</span>
                  <span>({combo.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{combo.location?.city || combo.location?.address || 'Location'}</span>
                </div>
              </div>
              <p className="text-gray-600">{combo.description}</p>
            </div>

            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={combo.images?.[currentImageIndex] || `/images/${combo.category}/1.jpg`}
                    alt={combo.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = `/images/${combo.category}/1.jpg`
                    }}
                  />
                  
                  {/* Navigation Arrows */}
                  {combo.images && combo.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? combo.images.length - 1 : prev - 1
                        )}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === combo.images.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                      >
                        →
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {combo.images && combo.images.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {combo.images.length}
                    </div>
                  )}
                  
                  {/* Dot Indicators */}
                  {combo.images && combo.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {combo.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Gallery */}
                {combo.images && combo.images.length > 1 && (
                  <div className="p-4 bg-gray-50">
                    <div className="flex space-x-2 overflow-x-auto">
                      {combo.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex ? 'border-[#333f63]' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${combo.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = `/images/${combo.category}/1.jpg`
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services Included */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">What's Included</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {combo.services.filter(service => service.included).map((service, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Add More Services */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Customize Your Package</h3>
                <p className="text-gray-600 mb-6">Add these optional services to make your event even more special</p>
                <div className="space-y-4">
                  {combo.services.filter(service => !service.included).map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          className="mt-1 w-4 h-4 text-[#333f63] border-gray-300 rounded focus:ring-[#333f63]"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{service.price?.toLocaleString() || '15,000'}</p>
                        <p className="text-xs text-gray-500">Additional</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Custom Requirements */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">Special Requirements</h4>
                  <textarea
                    placeholder="Tell us about any specific requirements or customizations you need..."
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">Our team will review your requirements and provide a customized quote</p>
                </div>
              </CardContent>
            </Card>

            {/* Providers */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Our Partner Providers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {combo.providers.map((provider) => (
                    <div key={provider.id} className="text-center p-4 border rounded-lg">
                      <img
                        src={provider.image}
                        alt={provider.name}
                        className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                      />
                      <h4 className="font-medium text-gray-900">{provider.name}</h4>
                      <p className="text-sm text-gray-600">{provider.service}</p>
                      <div className="flex items-center justify-center space-x-1 mt-2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{provider.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
                <div className="space-y-4">
                  {combo.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start space-x-3">
                        <img
                          src={review.image}
                          alt={review.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{review.name}</h4>
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: review.rating }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">{review.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{combo.comboPrice.toLocaleString()}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        ₹{combo.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                      Save ₹{combo.savings.toLocaleString()} ({combo.savingsPercent}% off)
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Event Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Guests
                      </label>
                      <input
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(e.target.value)}
                        min={combo.minGuests}
                        max={combo.maxGuests}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Min: {combo.minGuests}, Max: {combo.maxGuests} guests
                      </p>
                      {!selectedDate && (
                        <p className="text-xs text-red-500 mt-1">
                          Please select a date to proceed with booking
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={!selectedDate || isBooking}
                      onClick={handleBookNow}
                    >
                      {isBooking ? 'Processing...' : 'Book Now'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleRequestQuote}
                    >
                      Request Quote
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>+91 9876543210</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>support@calevent.com</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComboDetails