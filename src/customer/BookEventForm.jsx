import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Calendar, Users, Clock, MapPin, CreditCard, 
  User, Mail, Phone, MessageSquare, ArrowLeft,
  CheckCircle, AlertCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { bookingsAPI, eventsAPI } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const schema = yup.object({
  eventDate: yup.string().required('Event date is required'),
  eventTime: yup.string().required('Event time is required'),
  customerName: yup.string().required('Name is required'),
  customerEmail: yup.string().email('Invalid email').required('Email is required'),
  customerPhone: yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone is required'),
  venue: yup.string().required('Venue is required'),
  specialRequests: yup.string(),
  paymentMethod: yup.string().required('Payment method is required')
})

const BookEventForm = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiBookingData, setAiBookingData] = useState(null)
  const [isAIBooking, setIsAIBooking] = useState(false)

  // Check for AI booking data or fetch regular event data
  useEffect(() => {
    const checkAIBooking = () => {
      const savedAIData = localStorage.getItem('aiBookingData')
      if (savedAIData && eventId === 'ai-request') {
        const aiData = JSON.parse(savedAIData)
        setAiBookingData(aiData)
        setIsAIBooking(true)
        setEvent({
          _id: 'ai-generated',
          title: aiData.eventTitle,
          provider: aiData.provider,
          price: aiData.cost,
          image: aiData.generatedImage
        })
        localStorage.removeItem('aiBookingData')
        setLoading(false)
        return
      }
    }

    const fetchEvent = async () => {
      try {
        if (!eventId || eventId === 'undefined') {
          toast.error('Invalid event ID')
          navigate('/AllEvent')
          return
        }
        const response = await eventsAPI.getEventById(eventId)
        if (response.success) {
          setEvent(response.data.event)
        } else {
          toast.error('Event not found')
          navigate('/AllEvent')
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Failed to load event details')
        navigate('/AllEvent')
      } finally {
        setLoading(false)
      }
    }

    if (eventId === 'ai-request') {
      checkAIBooking()
    } else if (eventId && eventId !== 'undefined') {
      fetchEvent()
    } else {
      setLoading(false)
    }
  }, [eventId, navigate])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to book an event')
      navigate('/login/customer')
    }
  }, [isAuthenticated, navigate])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      eventDate: '',
      eventTime: '10:00',
      paymentMethod: 'card',
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: user?.phone || ''
    }
  })

  const watchedValues = watch()

  // Calculate pricing
  const basePrice = event?.price || 0
  const subtotal = basePrice
  const tax = subtotal * 0.18 // 18% GST
  const total = subtotal + tax

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg" />
              </div>
              <div className="h-64 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event not found</h1>
          <Button onClick={() => navigate('/AllEvent')}>Browse Events</Button>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 1, title: 'Event Details', icon: Calendar },
    { id: 2, title: 'Contact Info', icon: User },
    { id: 3, title: 'Payment', icon: CreditCard },
    { id: 4, title: 'Confirmation', icon: CheckCircle }
  ]

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const onSubmit = async (data) => {
    if (currentStep < 3) {
      handleNextStep()
      return
    }
    
    if (currentStep === 4) {
      // Already completed, just navigate
      navigate('/bookings')
      return
    }

    setIsSubmitting(true)
    try {
      const bookingPayload = {
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        venue: data.venue,
        guests: 50, // Default guest count
        contactDetails: {
          name: data.customerName,
          email: data.customerEmail,
          phone: data.customerPhone
        },
        paymentMethod: data.paymentMethod,
        specialRequests: data.specialRequests
      }

      if (isAIBooking) {
        // AI booking specific fields
        bookingPayload.isAIGenerated = true
        bookingPayload.requestId = aiBookingData.requestId
        bookingPayload.providerId = aiBookingData.providerId
        bookingPayload.eventType = aiBookingData.eventType
        bookingPayload.amount = aiBookingData.cost
        bookingPayload.generatedImage = aiBookingData.generatedImage
        bookingPayload.eventTitle = aiBookingData.eventTitle
      } else {
        // Regular event booking
        bookingPayload.eventId = event._id
      }
      
      const token = localStorage.getItem('token')
      console.log('Creating booking with token:', token ? 'Present' : 'Missing')
      console.log('Booking payload:', bookingPayload)
      
      const response = await fetch('http://localhost:5000/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      })
      
      console.log('Booking response status:', response.status)
      
      const result = await response.json()
      
      if (result.success) {
        toast.success('Booking created successfully!')
        // Store the booking ID for confirmation
        localStorage.setItem('latestBookingId', result.data.booking.bookingId)
        setCurrentStep(4)
      } else {
        toast.error(result.message || 'Booking failed')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Booking failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="date"
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('eventDate')}
                  />
                </div>
                {errors.eventDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="time"
                    className="pl-10"
                    {...register('eventTime')}
                  />
                </div>
                {errors.eventTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.eventTime.message}</p>
                )}
              </div>
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Enter venue address"
                  className="pl-10"
                  {...register('venue')}
                />
              </div>
              {errors.venue && (
                <p className="mt-1 text-sm text-red-600">{errors.venue.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests
              </label>
              <textarea
                rows={4}
                placeholder="Any special requirements or requests..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#333f63] focus:border-transparent resize-none"
                {...register('specialRequests')}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Enter your full name"
                  className="pl-10"
                  {...register('customerName')}
                />
              </div>
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  {...register('customerEmail')}
                />
              </div>
              {errors.customerEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.customerEmail.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  className="pl-10"
                  {...register('customerPhone')}
                />
              </div>
              {errors.customerPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Important Note</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    We'll use this information to send you booking confirmations and updates. 
                    Please ensure all details are correct.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Payment Method *
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="card"
                    className="text-[#333f63] focus:ring-[#333f63]"
                    {...register('paymentMethod')}
                  />
                  <div className="ml-3 flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium">Credit/Debit Card</div>
                      <div className="text-sm text-gray-500">Pay securely with your card</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="upi"
                    className="text-[#333f63] focus:ring-[#333f63]"
                    {...register('paymentMethod')}
                  />
                  <div className="ml-3 flex items-center space-x-3">
                    <div className="w-5 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      U
                    </div>
                    <div>
                      <div className="font-medium">UPI Payment</div>
                      <div className="text-sm text-gray-500">Pay using UPI apps</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="bank"
                    className="text-[#333f63] focus:ring-[#333f63]"
                    {...register('paymentMethod')}
                  />
                  <div className="ml-3 flex items-center space-x-3">
                    <div className="w-5 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                      B
                    </div>
                    <div>
                      <div className="font-medium">Net Banking</div>
                      <div className="text-sm text-gray-500">Pay through your bank</div>
                    </div>
                  </div>
                </label>
              </div>
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Secure Payment</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Your payment information is encrypted and secure. We use industry-standard 
                    security measures to protect your data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">
                Your event booking has been successfully submitted. You'll receive a confirmation 
                email shortly with all the details.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h4 className="font-semibold mb-4">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Event:</span>
                  <span className="font-medium">{event.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{watchedValues.eventDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span className="font-medium">{watchedValues.eventTime}</span>
                </div>

                <div className="flex justify-between">
                  <span>Venue:</span>
                  <span className="font-medium">{watchedValues.venue}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-[#333f63] mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isAIBooking ? 'Complete AI Booking' : 'Book Event'}
          </h1>
          <p className="text-gray-600 mt-2">{event.title} by {event.provider}</p>
          {isAIBooking && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
              <p className="text-sm text-blue-700">
                🤖 This booking is based on your AI-generated request and provider acceptance
              </p>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-black to-[#333f63] text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-[#333f63]' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-black to-[#333f63]' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  Step {currentStep}: {steps[currentStep - 1]?.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                  {renderStepContent()}
                  
                  <div className="flex justify-between mt-8">
                    {currentStep > 1 && currentStep < 4 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(currentStep - 1)}
                      >
                        Previous
                      </Button>
                    )}
                    
                    <div className="ml-auto">
                      {currentStep < 3 ? (
                        <Button 
                          type="button"
                          onClick={handleNextStep}
                          disabled={isSubmitting}
                        >
                          Next Step
                        </Button>
                      ) : currentStep === 3 ? (
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-[#333f63] hover:bg-[#2a3555]"
                        >
                          {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => navigate('/bookings')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          View My Bookings
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Pricing Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={isAIBooking && event.image ? 
                        (event.image.startsWith('data:') ? event.image : `data:image/png;base64,${event.image}`) : 
                        event.image
                      }
                      alt={event.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.provider}</p>
                      {isAIBooking && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                          AI Generated
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Event Package</span>
                      <span>{formatPrice(basePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>GST (18%)</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>
                  </div>

                  {watchedValues.eventDate && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-4">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="font-medium">{watchedValues.eventDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span className="font-medium">{watchedValues.eventTime}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isAIBooking && aiBookingData?.providerResponse?.contactDetails && (
                    <div className="bg-green-50 rounded-lg p-3 mt-4">
                      <h5 className="font-medium text-green-900 mb-2">Provider Contact</h5>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>📞 {aiBookingData.providerResponse.contactDetails.phone}</p>
                        <p>📧 {aiBookingData.providerResponse.contactDetails.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookEventForm