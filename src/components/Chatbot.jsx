import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User, ExternalLink, Heart, Share2, Calendar, MapPin, Star, Users, Image, Upload } from 'lucide-react'
import { chatbotAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import './Chatbot.css'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your CALEVENT AI assistant. I can help you explore events, book services, and navigate our platform. What would you like to do? ✨",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        "🔍 Show Weddings",
        "🏢 Corporate Events", 
        "🎂 Birthday Parties",
        "📊 View Analytics",
        "👤 My Profile"
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()
  const { user } = useAuth()

  const quickReplies = [
    "🔍 Show Weddings",
    "🏢 Corporate Events",
    "🎂 Birthday Parties", 
    "📊 View Analytics",
    "👤 My Profile",
    "📞 Contact Support"
  ]

  // Handle navigation from chatbot
  const handleNavigation = (navigationData) => {
    if (navigationData?.page) {
      switch (navigationData.page) {
        case 'home':
          navigate('/')
          break
        case 'events':
          navigate(navigationData.category ? `/events?category=${navigationData.category}` : '/events')
          break
        case 'providers':
          navigate('/providers')
          break
        case 'profile':
          navigate(user?.role === 'provider' ? '/provider/profile' : '/customer/profile')
          break
        case 'bookings':
          navigate(user?.role === 'provider' ? '/provider/bookings' : '/customer/bookings')
          break
        case 'messages':
          navigate(user?.role === 'provider' ? '/provider/messages' : '/customer/messages')
          break
        case 'analytics':
          navigate('/provider/analytics')
          break
        case 'book':
          navigate(`/book/${navigationData.eventId}`)
          break
        default:
          navigate('/')
      }
      setIsOpen(false)
    }
  }

  // Handle chatbot actions
  const handleAction = async (action, data) => {
    try {
      switch (action) {
        case 'navigate':
          handleNavigation(data)
          break
        case 'book':
          navigate(`/book-event/${data.eventId}`)
          setIsOpen(false)
          break
        case 'favorite':
          // Handle favorite action
          console.log('Add to favorites:', data)
          break
        case 'share':
          // Handle share action
          if (navigator.share) {
            navigator.share({
              title: data.title,
              text: data.description,
              url: window.location.origin + `/events/${data.eventId}`
            })
          }
          break
        default:
          console.log('Action:', action, data)
      }
    } catch (error) {
      console.error('Action error:', error?.message || 'Unknown error')
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedImage) return

    const formData = new FormData()
    formData.append('image', selectedImage)

    const newMessage = {
      id: Date.now(),
      text: 'Analyzing decoration image...',
      sender: 'user',
      timestamp: new Date(),
      image: imagePreview
    }

    setMessages(prev => [...prev, newMessage])
    setSelectedImage(null)
    setImagePreview('')
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/analyze-image', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.data.response,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: data.data.suggestions || [],
          data: data.data.data
        }
        
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Image upload error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I couldn\'t analyze that image. Please try again with a clearer photo.',
        sender: 'bot',
        timestamp: new Date(),
        suggestions: quickReplies
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const response = await chatbotAPI.sendMessage({ message, context: { user } })
      
      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: response.data.response,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: response.data.suggestions || [],
          data: response.data.data,
          actions: response.data.actions || [],
          navigation: response.data.navigation
        }
        
        setMessages(prev => [...prev, botMessage])
        
        // Handle automatic navigation if specified
        if (response.data.navigation && response.data.actions?.includes('navigate')) {
          setTimeout(() => {
            handleNavigation(response.data.navigation)
          }, 1500)
        }
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      console.error('Chatbot error:', error?.message || error)
      const errorMessage = {
        id: Date.now() + 1,
        text: '🚨 Sorry, I\'m having trouble connecting. Please try again or contact support.',
        sender: 'bot',
        timestamp: new Date(),
        suggestions: quickReplies
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Render event cards in chat
  const renderEventCards = (events) => {
    if (!events || events.length === 0) return null

    return (
      <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
        {events.map((event) => (
          <div key={event.id || event._id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src={`/images/${event.category}/1.jpg`}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.innerHTML = '<div class="text-gray-400 text-xs">📷</div>'
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-gray-900 truncate">{event.title}</h4>
                <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="font-semibold text-[#333f63]">₹{event.price?.toLocaleString()}</span>
                    {event.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {typeof event.location === 'string' ? event.location : event.location.city || event.location.address || 'Location'}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleAction('book', { eventId: event.id, title: event.title })}
                      className="px-2 py-1 bg-gradient-to-r from-black to-[#333f63] text-white text-xs rounded hover:shadow-md transition-all"
                    >
                      Book
                    </button>
                    <button
                      onClick={() => handleAction('favorite', { eventId: event.id })}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render provider cards
  const renderProviderCards = (providers) => {
    if (!providers || providers.length === 0) return null

    return (
      <div className="mt-3 space-y-2">
        {providers.slice(0, 3).map((provider) => (
          <div 
            key={provider.id || provider._id} 
            className="bg-gray-50 border border-gray-200 rounded-lg p-2 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => {
              navigate(`/provider/profile/${provider.id}`)
              setIsOpen(false)
            }}
          >
            <div className="flex items-center space-x-2">
              <img 
                src={provider.image || '/images/default-provider.jpg'}
                alt={provider.name}
                className="w-10 h-10 object-cover rounded-full"
              />
              <div className="flex-1">
                <h5 className="font-medium text-sm text-gray-900">{provider.name}</h5>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    {provider.rating || 0}
                  </div>
                  <span>•</span>
                  <span>{provider.reviews || 0} reviews</span>
                  {provider.location && (
                    <>
                      <span>•</span>
                      <span>{provider.location}</span>
                    </>
                  )}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render booking cards
  const renderBookingCards = (bookings) => {
    if (!bookings || bookings.length === 0) return null

    return (
      <div className="mt-3 space-y-2">
        {bookings.map((booking) => (
          <div key={booking.id || booking._id} className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-medium text-sm text-gray-900">{booking.eventId?.title || 'Event'}</h5>
                <p className="text-xs text-gray-600">{booking.eventId?.category}</p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render decoration design with generated image
  const renderDecorationDesign = (data) => {
    const { generatedImage, providers } = data

    return (
      <div className="mt-3 space-y-3">
        {/* Generated Image */}
        {generatedImage && generatedImage.success && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-purple-700">AI-Generated Mockup</span>
            </div>
            <img 
              src={`data:image/png;base64,${generatedImage.imageData}`}
              alt="AI Generated Decoration"
              className="w-full h-32 object-cover rounded-lg border border-purple-200"
            />
            <p className="text-xs text-purple-600 mt-2">✨ Created based on your description</p>
          </div>
        )}

        {/* Provider Cards */}
        {providers && providers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">Matching Decorators</span>
            </div>
            {renderProviderCards(providers)}
          </div>
        )}
      </div>
    )
  }

  const handleQuickReply = (reply) => {
    handleSendMessage(reply)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-black to-[#333f63] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
          isOpen ? 'hidden' : 'block'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-[32rem] h-[42rem] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-black to-[#333f63] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">CALEVENT Assistant</h3>
                  <p className="text-xs opacity-90">Online now</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-black to-[#333f63] text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="w-3 h-3" />
                      ) : (
                        <Bot className="w-3 h-3" />
                      )}
                    </div>
                    <div className={`px-3 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-black to-[#333f63] text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                    }`}>
                      {message.image && (
                        <img 
                          src={message.image} 
                          alt="Uploaded decoration" 
                          className="w-32 h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      
                      {/* Render data based on type */}
                      {message.data && (
                        <div className="mt-2">
                          {message.data.type === 'decoration_design' && renderDecorationDesign(message.data)}
                          {message.data.type === 'event_showcase' && renderEventCards(message.data.events)}
                          {message.data.type === 'search_results' && renderEventCards(message.data.events)}
                          {message.data.type === 'pricing_showcase' && renderEventCards(message.data.events)}
                          {message.data.type === 'booking_list' && renderBookingCards(message.data.bookings)}
                          {message.data.providers && message.data.type !== 'event_showcase' && renderProviderCards(message.data.providers)}
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.actions.includes('navigate') && message.navigation && (
                            <button
                              onClick={() => handleNavigation(message.navigation)}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Go
                            </button>
                          )}
                        </div>
                      )}
                      
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-gray-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end space-x-2 max-w-xs">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Dynamic Quick Replies */}
            {messages.length > 0 && messages[messages.length - 1].suggestions && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].suggestions.slice(0, 6).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(suggestion)}
                      className="px-3 py-1 text-xs bg-gray-50 text-[#333f63] rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              {selectedImage && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg flex items-center space-x-2">
                  <img src={imagePreview} alt="Selected" className="w-12 h-12 object-cover rounded" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedImage.name}</p>
                    <p className="text-xs text-gray-500">Ready to analyze decoration</p>
                  </div>
                  <Button size="sm" onClick={handleImageUpload} disabled={isTyping}>
                    <Upload className="w-3 h-3 mr-1" />
                    Analyze
                  </Button>
                  <button 
                    onClick={() => { setSelectedImage(null); setImagePreview('') }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label 
                  htmlFor="image-upload"
                  className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                  title="Upload decoration image"
                >
                  <Image className="w-4 h-4" />
                </label>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message or upload decoration image..."
                  className="flex-1 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Chatbot