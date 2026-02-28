import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { chatbotAPI } from '@/services/api';
import { MessageCircle } from 'lucide-react';

const EnhancedTeddyBot = () => {
  const [showTeddy, setShowTeddy] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey there! 👋 I'm EVO, your friendly event planning assistant. I'm here to help make your event dreams come true! Whether you're planning a magical wedding, an impressive corporate gathering, or a fun birthday bash, I've got you covered. What kind of celebration are we planning today?",
      sender: 'bot',
      timestamp: new Date(),
      suggestions: [
        "Plan a wedding 💒",
        "Corporate event 🏢", 
        "Birthday party 🎂",
        "Browse events 🔍",
        "Get pricing info 💰"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickReplies = [
    "Plan a wedding 💒",
    "Corporate event 🏢",
    "Birthday party 🎂", 
    "Browse events 🔍",
    "Get pricing info 💰",
    "Need help 🙋‍♀️"
  ];



  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle navigation from chatbot
  const handleNavigation = (navigationData) => {
    if (navigationData?.page) {
      switch (navigationData.page) {
        case 'home':
          navigate('/');
          break;
        case 'events':
          navigate(navigationData.category ? `/events?category=${navigationData.category}` : '/AllEvent');
          break;
        case 'providers':
          navigate('/providers');
          break;
        case 'profile':
          navigate(user?.role === 'provider' ? '/provider/profile' : '/customer/profile');
          break;
        case 'bookings':
          navigate(user?.role === 'provider' ? '/provider/bookings' : '/customer/bookings');
          break;
        case 'messages':
          navigate(user?.role === 'provider' ? '/provider/messages' : '/customer/messages');
          break;
        case 'analytics':
          navigate('/provider/analytics');
          break;
        case 'book':
          navigate(`/book/${navigationData.eventId}`);
          break;
        default:
          navigate('/');
      }
      setShowChat(false);
    }
  };

  // Handle chatbot actions
  const handleAction = async (action, data) => {
    try {
      switch (action) {
        case 'navigate':
          handleNavigation(data);
          break;
        case 'book':
          navigate(`/book-event/${data.eventId}`);
          setShowChat(false);
          break;
        case 'favorite':
          console.log('Add to favorites:', data);
          break;
        case 'share':
          if (navigator.share) {
            navigator.share({
              title: data.title,
              text: data.description,
              url: window.location.origin + `/events/${data.eventId}`
            });
          }
          break;
        default:
          console.log('Action:', action, data);
      }
    } catch (error) {
      console.error('Action error:', error?.message || 'Unknown error');
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append('image', selectedImage);

    const newMessage = {
      id: Date.now(),
      text: 'Analyzing decoration image...',
      sender: 'user',
      timestamp: new Date(),
      image: imagePreview
    };

    setMessages(prev => [...prev, newMessage]);
    setSelectedImage(null);
    setImagePreview('');
    setIsTyping(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot/analyze-image`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.data.response,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: data.data.suggestions || [],
          data: data.data.data
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Hmm, I\'m having trouble seeing the details in that image. 😔 Could you try uploading a clearer photo? I\'d love to help you analyze your decoration ideas!',
        sender: 'bot',
        timestamp: new Date(),
        suggestions: quickReplies
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const getQuickResponse = (message) => {
    const msg = message.toLowerCase().trim();
    
    const quickResponses = {
      'hi': 'Hey there! 👋 Ready to plan something amazing?',
      'hello': 'Hello! 😊 I\'m here to help with your event planning!',
      'hey': 'Hey! 🎉 What kind of celebration are we planning today?',
      'bye': 'Goodbye! 👋 Come back anytime for event planning help!',
      'goodbye': 'See you later! 🌟 Happy event planning!',
      'thanks': 'You\'re welcome! 😊 Always happy to help!',
      'thank you': 'My pleasure! 🎉 Let me know if you need anything else!',
      'ok': 'Great! 👍 What would you like to do next?',
      'okay': 'Perfect! ✨ How can I assist you further?',
      'yes': 'Awesome! 🎊 Let\'s make it happen!',
      'no': 'No worries! 😊 What else can I help you with?',
      'help': 'I\'m here to help! 🤝 Ask me about events, venues, or planning tips!'
    };
    
    return quickResponses[msg] || null;
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Check for quick responses first
    const quickResponse = getQuickResponse(message);
    
    if (quickResponse) {
      // Show typing for 2 seconds for quick responses
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: quickResponse,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: quickReplies
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 2000);
      return;
    }

    try {
      const response = await chatbotAPI.sendMessage({ 
        message, 
        context: { user },
        conversationHistory: messages 
      });
      
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
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Handle automatic navigation if specified
        if (response.data.navigation && response.data.actions?.includes('navigate')) {
          setTimeout(() => {
            handleNavigation(response.data.navigation);
          }, 1500);
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Chatbot error:', error?.message || error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Oops! I seem to be having a little hiccup connecting right now. 😅 Could you try asking me again? I promise I\'ll do my best to help you plan something amazing!',
        sender: 'bot',
        timestamp: new Date(),
        suggestions: quickReplies
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTeddyClick = () => {
    setShowChat(true);
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleConnectProvider = async (provider, messageData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot/send-image-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // If using auth
        },
        body: JSON.stringify({
          providerId: provider.id,
          generatedImage: messageData.generatedImage?.imageData,
          imagePrompt: messageData.imagePrompt,
          eventDetails: {
            eventType: messageData.eventType,
            location: messageData.location
          },
          customerMessage: `Hi! I'm interested in your ${messageData.eventType} decoration services. I've generated this design concept and would like to know if you can create something similar. Please let me know your availability and pricing.`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const successMessage = {
          id: Date.now(),
          text: `✅ **Request sent to ${provider.name}!**\n\nYour design concept and message have been sent to the provider. They will respond within 24 hours with availability and pricing.\n\n📱 You can track the status in your dashboard.`,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: ['View My Requests', 'Contact More Providers', 'Browse Events']
        };
        setMessages(prev => [...prev, successMessage]);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Connect provider error:', error);
      const errorMessage = {
        id: Date.now(),
        text: 'Oh no! Something went wrong while sending your request. 😢 Don\'t worry though - you can try again or reach out to the provider directly. I\'m here to help you find another way!',
        sender: 'bot',
        timestamp: new Date(),
        suggestions: ['Try Again', 'Contact Support', 'Browse Providers']
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <>
      {/* Static Teddy Bot */}
      {showTeddy && !showChat && (
        <motion.div 
          className="fixed bottom-5 right-5 z-50 cursor-pointer"
          onClick={handleTeddyClick}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-14 h-14 bg-gradient-to-r from-black to-[#333f63] text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow duration-300">
            <MessageCircle className="w-6 h-6" />
          </div>
        </motion.div>
      )}

      {/* Enhanced Chat Interface */}
      {showChat && (
        <motion.div 
          className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl border z-50 flex flex-col"
          initial={{ scale: 0, opacity: 0, y: 100 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="p-4 text-white rounded-t-2xl" style={{ background: `linear-gradient(to right, #333f63, #2a3555)` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl"><MessageCircle className="w-6 h-6" /></div>
                <div>
                  <h3 className="font-bold">EVO Assistant</h3>
                  <p className="text-xs opacity-90">Event Organizer AI</p>
                </div>
              </div>
              <motion.button
                onClick={() => setShowChat(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                ×
              </motion.button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow-md'
                }`}>
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded decoration" 
                      className="w-32 h-32 object-cover rounded-lg mb-2"
                    />
                  )}
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  
                  {/* Display generated image */}
                  {message.data?.generatedImage && (
                    <div className="mt-2">
                      <img 
                        src={`data:image/png;base64,${message.data.generatedImage.imageData}`}
                        alt="Generated design" 
                        className="w-full rounded-lg mb-2"
                      />
                    </div>
                  )}
                  
                  {/* Display providers */}
                  {message.data?.providers && message.data.providers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-600">Available Providers:</p>
                      {message.data.providers.slice(0, 3).map((provider, idx) => (
                        <div key={idx} className="bg-gray-50 p-2 rounded-lg text-xs">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{provider.name}</p>
                              <p className="text-gray-500">{provider.location}</p>
                              <div className="flex items-center mt-1">
                                <span className="text-yellow-500">⭐</span>
                                <span className="ml-1">{provider.rating}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleConnectProvider(provider, message.data)}
                              className="text-white px-2 py-1 rounded text-xs transition-colors"
                              style={{ backgroundColor: '#333f63' }}
                            >
                              Connect
                            </button>
                          </div>
                        </div>
                      ))}
                      {message.data.providers.length > 3 && (
                        <p className="text-xs text-gray-500">+{message.data.providers.length - 3} more providers available</p>
                      )}
                    </div>
                  )}
                  
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <motion.div 
                className="flex justify-start mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="bg-white px-4 py-2 rounded-2xl shadow-md">
                  <div className="flex space-x-1">
                    <motion.div 
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-2 h-2 bg-gray-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length > 0 && messages[messages.length - 1].suggestions && (
            <div className="px-4 py-2 bg-gray-100">
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(suggestion)}
                    className="px-3 py-1 rounded-full text-xs text-white" style={{ backgroundColor: '#333f63' }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          {selectedImage && (
            <div className="px-4 py-2 bg-gray-100 border-t">
              <div className="flex items-center space-x-2 bg-white p-2 rounded-lg">
                <img src={imagePreview} alt="Selected" className="w-12 h-12 object-cover rounded" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedImage.name}</p>
                  <p className="text-xs text-gray-500">Ready to analyze</p>
                </div>
                <button
                  onClick={handleImageUpload}
                  className="px-3 py-1 text-white rounded text-xs" style={{ backgroundColor: '#333f63' }}
                >
                  Analyze
                </button>
                <button 
                  onClick={() => { setSelectedImage(null); setImagePreview('') }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="teddy-image-upload"
              />
              <label 
                htmlFor="teddy-image-upload"
                className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title="Upload decoration image"
              >
                📷
              </label>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me about events..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 text-sm"
                style={{ '--tw-ring-color': '#333f63' }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isTyping}
                className="w-10 h-10 text-white rounded-full flex items-center justify-center disabled:opacity-50"
                style={{ backgroundColor: '#333f63' }}
              >
                →
              </button>
            </div>
          </div>
        </motion.div>
      )}


    </>
  );
};

export default EnhancedTeddyBot;