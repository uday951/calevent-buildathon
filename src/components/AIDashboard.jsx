import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Image, 
  FileText, 
  MessageSquare, 
  Camera, 
  Wand2,
  Download,
  Copy,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const AIDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('assistant');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [requests, setRequests] = useState([]);
  const [providers, setProviders] = useState([]);
  const [showProviders, setShowProviders] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [customerMessage, setCustomerMessage] = useState('');

  // AI Assistant State
  const [assistantForm, setAssistantForm] = useState({
    eventType: 'wedding',
    theme: '',
    budget: '',
    guestCount: '',
    location: ''
  });

  // Content Generation State
  const [contentForm, setContentForm] = useState({
    type: 'invitation',
    eventDetails: {
      eventType: 'wedding',
      theme: '',
      date: '',
      venue: '',
      hostName: ''
    },
    style: 'elegant'
  });

  // Image Generation State
  const [imageForm, setImageForm] = useState({
    type: 'decoration',
    prompt: '',
    eventDetails: {
      eventType: 'wedding',
      theme: ''
    }
  });

  // Review Summary State
  const [reviewForm, setReviewForm] = useState({
    providerId: '',
    detailed: false
  });

  // Image Analysis State
  const [analysisForm, setAnalysisForm] = useState({
    analysisType: 'decoration',
    eventType: 'wedding',
    detailed: false,
    imageFile: null
  });

  const tabs = [
    { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'content', label: 'Generate Content', icon: FileText },
    { id: 'images', label: 'Generate Images', icon: Image },
    { id: 'reviews', label: 'Review Summary', icon: MessageSquare },
    { id: 'vision', label: 'Image Analysis', icon: Camera },
    { id: 'requests', label: 'My Requests', icon: MessageSquare }
  ];

  // Load user requests
  useEffect(() => {
    if (activeTab === 'requests') {
      loadRequests();
    }
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/customer-requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Load requests error:', error);
    }
  };

  // AI Assistant Handler
  const handleAssistantSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assistantForm)
      });
      
      const data = await response.json();
      setResults({ ...results, assistant: data });
    } catch (error) {
      console.error('Assistant error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Content Generation Handler
  const handleContentGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentForm)
      });
      
      const data = await response.json();
      setResults({ ...results, content: data });
    } catch (error) {
      console.error('Content generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Image Generation Handler
  const handleImageGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageForm)
      });
      
      const data = await response.json();
      setResults({ ...results, image: data });
      setShowProviders(false);
    } catch (error) {
      console.error('Image generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Find Providers Handler
  const handleFindProviders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/find-providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: imageForm.eventDetails.eventType,
          theme: imageForm.eventDetails.theme,
          generatedImage: results.image?.data?.image
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setProviders(data.data.providers || []);
        setShowProviders(true);
      }
    } catch (error) {
      console.error('Find providers error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send Request to Provider
  const handleSendRequest = async (providerId) => {
    const provider = providers.find(p => p._id === providerId);
    setSelectedProvider(provider);
    setCustomerMessage(`Hi ${provider?.businessName || provider?.name},\n\nI'm interested in your services for my ${imageForm.eventDetails.eventType} event. I've generated an AI image that shows exactly what I'm looking for. Could you please provide a quote and let me know if you can help make this vision a reality?\n\nLooking forward to hearing from you!`);
    setShowMessageModal(true);
  };

  const sendRequestToProvider = async () => {
    if (!customerMessage.trim()) return;
    
    const providerId = selectedProvider?._id || selectedProvider?.id;
    if (!providerId) {
      alert('Provider ID not found. Please try again.');
      return;
    }
    
    console.log('Sending request to provider:', providerId);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/send-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          providerId: providerId,
          imagePrompt: results.image?.data?.prompt || imageForm.prompt || 'AI generated event image',
          generatedImage: results.image?.data?.image,
          eventDetails: {
            eventType: imageForm.eventDetails?.eventType || 'wedding',
            theme: imageForm.eventDetails?.theme || ''
          },
          customerMessage: customerMessage
        })
      });
      
      const data = await response.json();
      if (data.success) {
        alert('Request sent successfully!');
        setShowMessageModal(false);
        setCustomerMessage('');
        setSelectedProvider(null);
        loadRequests(); // Refresh requests to show the new one
      } else {
        alert('Failed to send request: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Send request error:', error);
      alert('Error sending request: ' + error.message);
    }
  };

  // Handle booking accepted request
  const handleBookAcceptedRequest = (request) => {
    // Prepare booking data for the booking form
    const bookingData = {
      requestId: request._id,
      providerId: request.providerId._id,
      eventType: request.eventType,
      eventTitle: `${request.eventType} Event`,
      generatedImage: request.generatedImage,
      cost: request.providerResponse?.estimatedCost || 0,
      provider: request.providerId?.businessName || 'Provider',
      providerResponse: request.providerResponse
    };
    
    // Store in localStorage for the booking form
    localStorage.setItem('aiBookingData', JSON.stringify(bookingData));
    
    // Navigate to booking form
    navigate('/book-event/ai-request');
  };

  // Review Summary Handler
  const handleReviewSummary = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/reviews/${reviewForm.providerId}?detailed=${reviewForm.detailed}`);
      const data = await response.json();
      setResults({ ...results, reviews: data });
    } catch (error) {
      console.error('Review summary error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Image Analysis Handler
  const handleImageAnalysis = async (e) => {
    e.preventDefault();
    if (!analysisForm.imageFile) {
      alert('Please select an image first');
      return;
    }
    
    setLoading(true);
    const formData = new FormData();
    formData.append('image', analysisForm.imageFile);
    formData.append('analysisType', analysisForm.analysisType);
    formData.append('eventType', analysisForm.eventType);
    formData.append('detailed', analysisForm.detailed);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/ai/analyze-image`, {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      setResults({ ...results, vision: data });
    } catch (error) {
      console.error('Image analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-black to-[#333f63] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight">
              Meet <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">EVO</span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-200 font-light mb-4">
              Your AI Event Organizer
            </p>
          </motion.div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Tabs */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your AI Tool</h2>
            <p className="text-gray-600">Select from our powerful AI-driven features</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 p-6 bg-white rounded-2xl shadow-lg border">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex flex-col items-center space-y-3 px-6 py-4 rounded-xl transition-all duration-300 min-w-[120px] ${
                    activeTab === tab.id
                      ? 'bg-[#333f63] text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className={`p-3 rounded-full transition-all ${
                    activeTab === tab.id 
                      ? 'bg-white/20' 
                      : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <span className="text-sm font-medium text-center leading-tight">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-2xl shadow-lg border p-8">
            {/* AI Assistant Form */}
            {activeTab === 'assistant' && (
              <form onSubmit={handleAssistantSubmit} className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Event Planning Assistant</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Event Type</label>
                  <select
                    value={assistantForm.eventType}
                    onChange={(e) => setAssistantForm({...assistantForm, eventType: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#333f63] focus:outline-none"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate</option>
                    <option value="birthday">Birthday</option>
                    <option value="anniversary">Anniversary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Theme</label>
                  <input
                    type="text"
                    placeholder="e.g., Royal, Modern, Rustic"
                    value={assistantForm.theme}
                    onChange={(e) => setAssistantForm({...assistantForm, theme: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Budget (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g., 100000"
                    value={assistantForm.budget}
                    onChange={(e) => setAssistantForm({...assistantForm, budget: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Guest Count</label>
                  <input
                    type="number"
                    placeholder="e.g., 150"
                    value={assistantForm.guestCount}
                    onChange={(e) => setAssistantForm({...assistantForm, guestCount: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Location</label>
                  <input
                    type="text"
                    placeholder="e.g., Mumbai, Delhi"
                    value={assistantForm.location}
                    onChange={(e) => setAssistantForm({...assistantForm, location: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-[#333f63] hover:bg-[#2a3555]">
                  {loading ? 'Generating Suggestions...' : 'Get AI Suggestions'}
                </Button>
              </form>
            )}

            {/* Content Generation Form */}
            {activeTab === 'content' && (
              <form onSubmit={handleContentGenerate} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Content Creator</h3>
                  <p className="text-gray-600">Generate professional event content in seconds</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What type of content do you need? ✨
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'invitation', label: '💌 Invitation Text', desc: 'Elegant invitation wording' },
                      { value: 'brochure', label: '📋 Event Brochure', desc: 'Detailed event information' },
                      { value: 'announcement', label: '📢 Announcement', desc: 'Public event announcement' },
                      { value: 'description', label: '📝 Event Description', desc: 'Comprehensive overview' }
                    ].map((option) => (
                      <div 
                        key={option.value}
                        onClick={() => setContentForm({...contentForm, type: option.value})}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          contentForm.type === option.value 
                            ? 'border-[#333f63] bg-blue-50 shadow-lg' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium text-sm mb-1 text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type 🎉</label>
                    <select
                      value={contentForm.eventDetails.eventType}
                      onChange={(e) => setContentForm({
                        ...contentForm,
                        eventDetails: {...contentForm.eventDetails, eventType: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#333f63] focus:outline-none"
                    >
                      <option value="wedding">💒 Wedding</option>
                      <option value="corporate">🏢 Corporate Event</option>
                      <option value="birthday">🎂 Birthday Party</option>
                      <option value="anniversary">💕 Anniversary</option>
                      <option value="conference">🎤 Conference</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme/Style 🎨</label>
                    <input
                      type="text"
                      placeholder="e.g., Royal, Modern, Rustic, Elegant"
                      value={contentForm.eventDetails.theme}
                      onChange={(e) => setContentForm({
                        ...contentForm,
                        eventDetails: {...contentForm.eventDetails, theme: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Date 📅</label>
                    <input
                      type="date"
                      value={contentForm.eventDetails.date}
                      onChange={(e) => setContentForm({
                        ...contentForm,
                        eventDetails: {...contentForm.eventDetails, date: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#333f63] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Venue Location 📍</label>
                    <input
                      type="text"
                      placeholder="e.g., Grand Palace Hotel, Mumbai"
                      value={contentForm.eventDetails.venue}
                      onChange={(e) => setContentForm({
                        ...contentForm,
                        eventDetails: {...contentForm.eventDetails, venue: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Host Name 👤</label>
                  <input
                    type="text"
                    placeholder="e.g., Mr. & Mrs. Sharma"
                    value={contentForm.eventDetails.hostName}
                    onChange={(e) => setContentForm({
                      ...contentForm,
                      eventDetails: {...contentForm.eventDetails, hostName: e.target.value}
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !contentForm.eventDetails.eventType} 
                  className="w-full h-12 text-base font-medium bg-[#333f63] hover:bg-[#2a3555]"
                >
                  {loading ? 'Creating your content...' : 'Generate Professional Content'}
                </Button>
              </form>
            )}

            {/* Image Generation Form */}
            {activeTab === 'images' && (
              <form onSubmit={handleImageGenerate} className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">AI Image Creator</h3>
                  <p className="text-gray-600">Generate stunning AI images for your event</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    What would you like to create? 🎨
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'decoration', label: '🎪 Decoration Setup', desc: 'Beautiful event decorations' },
                      { value: 'invitation', label: '💌 Invitation Design', desc: 'Elegant invitation cards' },
                      { value: 'venue', label: '🏛️ Venue Layout', desc: 'Perfect venue arrangements' },
                      { value: 'stage', label: '🎭 Stage Design', desc: 'Stunning stage setups' }
                    ].map((option) => (
                      <div 
                        key={option.value}
                        onClick={() => setImageForm({...imageForm, type: option.value})}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          imageForm.type === option.value 
                            ? 'border-[#333f63] bg-blue-50 shadow-lg' 
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <div className="font-medium text-sm mb-1 text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your vision ✨
                  </label>
                  <textarea
                    value={imageForm.prompt}
                    onChange={(e) => setImageForm({...imageForm, prompt: e.target.value})}
                    placeholder="Describe your event decoration in detail..."
                    className="w-full p-4 border border-gray-300 rounded-lg h-32 bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Event Type 🎉</label>
                    <select
                      value={imageForm.eventDetails.eventType}
                      onChange={(e) => setImageForm({
                        ...imageForm,
                        eventDetails: {...imageForm.eventDetails, eventType: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#333f63] focus:outline-none"
                    >
                      <option value="wedding">💒 Wedding</option>
                      <option value="corporate">🏢 Corporate Event</option>
                      <option value="birthday">🎂 Birthday Party</option>
                      <option value="anniversary">💕 Anniversary</option>
                      <option value="conference">🎤 Conference</option>
                      <option value="party">🎊 Party</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme/Style 🎨</label>
                    <input
                      type="text"
                      placeholder="e.g., Royal, Modern, Rustic, Elegant"
                      value={imageForm.eventDetails.theme}
                      onChange={(e) => setImageForm({
                        ...imageForm,
                        eventDetails: {...imageForm.eventDetails, theme: e.target.value}
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !imageForm.prompt.trim()} 
                  className="w-full h-12 text-base font-medium bg-[#333f63] hover:bg-[#2a3555]"
                >
                  {loading ? 'Creating your image...' : 'Generate AI Image'}
                </Button>
              </form>
            )}

            {/* Review Summary Form */}
            {activeTab === 'reviews' && (
              <form onSubmit={handleReviewSummary} className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Review Summary</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Provider ID</label>
                  <input
                    type="text"
                    placeholder="Enter provider ID to analyze reviews"
                    value={reviewForm.providerId}
                    onChange={(e) => setReviewForm({...reviewForm, providerId: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:border-[#333f63] focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="detailed"
                    checked={reviewForm.detailed}
                    onChange={(e) => setReviewForm({...reviewForm, detailed: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="detailed" className="text-sm font-medium text-gray-700">
                    Detailed Analysis (includes insights and recommendations)
                  </label>
                </div>

                <Button type="submit" disabled={loading || !reviewForm.providerId} className="w-full bg-[#333f63] hover:bg-[#2a3555]">
                  {loading ? 'Analyzing Reviews...' : 'Analyze Reviews'}
                </Button>
              </form>
            )}

            {/* Image Analysis Form */}
            {activeTab === 'vision' && (
              <form onSubmit={handleImageAnalysis} className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Image Analysis</h3>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Upload Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAnalysisForm({...analysisForm, imageFile: e.target.files[0]})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#333f63] focus:outline-none"
                    required
                  />
                  {analysisForm.imageFile && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(analysisForm.imageFile)} 
                        alt="Upload preview" 
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Analysis Type</label>
                  <select
                    value={analysisForm.analysisType}
                    onChange={(e) => setAnalysisForm({...analysisForm, analysisType: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#333f63] focus:outline-none"
                  >
                    <option value="decoration">Decoration Analysis</option>
                    <option value="venue">Venue Analysis</option>
                    <option value="catering">Catering Setup</option>
                    <option value="stage">Stage/Performance Area</option>
                    <option value="overall">Overall Event Setup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Event Type</label>
                  <input
                    type="text"
                    value={analysisForm.eventType}
                    onChange={(e) => setAnalysisForm({...analysisForm, eventType: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:border-[#333f63] focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="detailedAnalysis"
                    checked={analysisForm.detailed}
                    onChange={(e) => setAnalysisForm({...analysisForm, detailed: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="detailedAnalysis" className="text-sm font-medium text-gray-700">
                    Detailed Analysis (comprehensive insights)
                  </label>
                </div>

                <Button type="submit" disabled={loading || !analysisForm.imageFile} className="w-full bg-[#333f63] hover:bg-[#2a3555]">
                  {loading ? 'Analyzing Image...' : 'Analyze Image'}
                </Button>
              </form>
            )}

            {/* My Requests */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">My Requests</h3>
                
                {requests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No requests sent yet</p>
                    <p className="text-sm text-gray-500 mt-2">Generate an image and connect with providers to see requests here</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {requests.map((request) => (
                      <div key={request._id} className="border border-gray-300 rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{request.providerId?.businessName || 'Provider'}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{request.eventType} Event</p>
                        <p className="text-sm text-gray-700">{request.customerMessage}</p>
                        
                        {/* Provider Response */}
                        {request.providerResponse && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 mb-2">{request.providerResponse.message}</p>
                            {request.providerResponse.estimatedCost && (
                              <p className="text-sm font-medium text-green-700">
                                💰 Estimated Cost: ₹{request.providerResponse.estimatedCost.toLocaleString()}
                              </p>
                            )}
                            {request.providerResponse.contactDetails && (
                              <div className="text-xs text-gray-600 mt-2">
                                📞 {request.providerResponse.contactDetails.phone} | 📧 {request.providerResponse.contactDetails.email}
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-gray-400">
                            Sent: {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          
                          {/* Book Now Button for Accepted Requests */}
                          {request.status === 'accepted' && request.providerResponse?.canBook && (
                            <Button
                              size="sm"
                              onClick={() => handleBookAcceptedRequest(request)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              📅 Book Now
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button onClick={loadRequests} variant="outline" className="w-full border-[#333f63] text-[#333f63] hover:bg-[#333f63] hover:text-white">
                  Refresh Requests
                </Button>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="bg-white rounded-2xl shadow-lg border overflow-hidden h-[600px] flex flex-col">
            <div className="flex items-center space-x-3 p-6 pb-4 border-b border-gray-200">
              <div className="p-2 bg-[#333f63] rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">AI Results</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Assistant Results */}
              {activeTab === 'assistant' && results.assistant && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Generated by: {results.assistant.data?.source}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(results.assistant.data?.suggestions)}
                      className="border-[#333f63] text-[#333f63] hover:bg-[#333f63] hover:text-white"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded-lg text-gray-900 font-medium">
                      {results.assistant.data?.suggestions}
                    </pre>
                  </div>
                </div>
              )}

              {/* Content Results */}
              {activeTab === 'content' && results.content && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Generated by: {results.content.data?.source}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(results.content.data?.content)}
                      className="border-[#333f63] text-[#333f63] hover:bg-[#333f63] hover:text-white"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="prose max-w-none">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-900 font-medium">
                        {results.content.data?.content}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Results */}
              {activeTab === 'images' && results.image && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Generated by: {results.image.data?.source}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={handleFindProviders}
                        disabled={loading}
                        className="bg-gradient-to-r from-[#333f63] to-[#4a5a8a] hover:from-[#2a3555] hover:to-[#3d4a7a] text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Finding Providers...
                          </>
                        ) : (
                          <>
                            🔗 Connect with Providers
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = results.image.data?.image;
                          link.download = 'generated-image.png';
                          link.click();
                        }}
                        className="border-[#333f63] text-[#333f63] hover:bg-[#333f63] hover:text-white"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="text-center">
                    {results.image.data?.image ? (
                      <div className="relative">
                        {imageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#333f63]"></div>
                          </div>
                        )}
                        <img
                          src={results.image.data.image.startsWith('data:') || results.image.data.image.startsWith('http') ? 
                            results.image.data.image : 
                            `data:image/jpeg;base64,${results.image.data.image}`}
                          alt="AI Generated Event Image"
                          className="max-w-full h-auto max-h-80 object-contain rounded-lg shadow-md mx-auto"
                          onLoad={() => {
                            console.log('Image loaded successfully');
                            setImageLoading(false);
                          }}
                          onLoadStart={() => setImageLoading(true)}
                          onError={(e) => {
                            console.error('Image failed to load');
                            setImageLoading(false);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-100 rounded-lg p-8 text-center">
                        <p className="text-gray-600">Image not available</p>
                        <p className="text-sm text-gray-500 mt-2">Please try generating again</p>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Prompt:</strong> {results.image.data?.prompt}
                  </p>
                  
                  {/* Providers Section */}
                  {showProviders && (
                    <div className="mt-6 border-t pt-6">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold text-gray-900">🎯 Perfect Matches Found!</h4>
                        <span className="text-sm text-gray-500">{providers.length} providers available</span>
                      </div>
                      {providers.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <div className="text-4xl mb-3">😔</div>
                          <p className="text-gray-600 font-medium">No providers found for this event type.</p>
                          <p className="text-sm text-gray-500 mt-1">Try a different event type or theme.</p>
                        </div>
                      ) : (
                        <div className="grid gap-4 max-h-96 overflow-y-auto">
                          {providers.map((provider) => (
                            <div key={provider._id} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-[#333f63] hover:shadow-lg transition-all duration-300">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-[#333f63] to-[#4a5a8a] rounded-full flex items-center justify-center text-white font-bold text-lg">
                                      {(provider.businessName || provider.name).charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-gray-900 text-lg">{provider.businessName || provider.name}</h5>
                                      <p className="text-sm text-gray-600 flex items-center">
                                        📞 {provider.phone}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 mb-3">
                                    <p className="text-sm text-gray-600 flex items-center">
                                      📍 {provider.location?.city || 'Location not specified'}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                      <span className="text-yellow-400">⭐</span>
                                      <span className="text-sm font-medium text-gray-700">4.8</span>
                                    </div>
                                  </div>
                                  
                                  {provider.categories && provider.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {provider.categories.slice(0, 4).map((cat, idx) => (
                                        <span key={`cat-${provider._id}-${idx}`} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                                          {cat}
                                        </span>
                                      ))}
                                      {provider.categories.length > 4 && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                          +{provider.categories.length - 4} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4 flex flex-col space-y-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSendRequest(provider._id)}
                                    className="bg-gradient-to-r from-[#333f63] to-[#4a5a8a] hover:from-[#2a3555] hover:to-[#3d4a7a] text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                                  >
                                    💌 Send Request
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#333f63] text-[#333f63] hover:bg-[#333f63] hover:text-white text-xs"
                                  >
                                    View Profile
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Review Results */}
              {activeTab === 'reviews' && results.reviews && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Analysis by: {results.reviews.data?.source}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(results.reviews.data?.summary)}
                      className="border-[#333f63] text-[#333f63] hover:bg-[#333f63] hover:text-white"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-gray-900">Summary</h4>
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 font-medium">
                      {results.reviews.data?.summary}
                    </pre>
                  </div>
                </div>
              )}

              {/* Vision Analysis Results */}
              {activeTab === 'vision' && results.vision && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Analysis by: {results.vision.data?.source}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(results.vision.data?.analysis)}
                      className="border-[#333f63] text-[#333f63] hover:bg-[#333f63] hover:text-white"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-medium mb-2 text-gray-900">Analysis Results</h4>
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 font-medium">
                      {results.vision.data?.analysis}
                    </pre>
                  </div>
                </div>
              )}

              {/* My Requests Results */}
              {activeTab === 'requests' && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📬</div>
                    <p className="text-gray-600">Request tracking and status updates</p>
                    <p className="text-sm text-gray-500 mt-2">View your sent requests and provider responses</p>
                  </div>
                </div>
              )}

              {!results[activeTab] && !loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🚀</div>
                    <h4 className="text-lg font-semibold text-gray-900">Ready to Create Magic?</h4>
                    <p className="text-gray-600 text-sm">Fill out the form and let EVO generate amazing results!</p>
                    {activeTab === 'images' && (
                      <p className="text-gray-500 text-xs mt-2">Generate an image first, then connect with providers!</p>
                    )}
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#333f63] mx-auto"></div>
                    <p className="text-gray-600 text-sm font-medium">
                      {activeTab === 'images' ? '🎨 EVO is generating your image...' : 
                       activeTab === 'content' ? '📝 EVO is creating your content...' :
                       activeTab === 'assistant' ? '🤖 EVO is analyzing your requirements...' :
                       activeTab === 'reviews' ? '📊 EVO is analyzing reviews...' :
                       activeTab === 'vision' ? '👁️ EVO is analyzing your image...' :
                       'EVO is working on your request...'}
                    </p>
                    {activeTab === 'images' && (
                      <p className="text-gray-500 text-xs">Creating your perfect event image...</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Send Request</h3>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setCustomerMessage('');
                    setSelectedProvider(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#333f63] to-[#4a5a8a] rounded-full flex items-center justify-center text-white font-bold">
                    {(selectedProvider?.businessName || selectedProvider?.name)?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedProvider?.businessName || selectedProvider?.name}</h4>
                    <p className="text-sm text-gray-600">{selectedProvider?.phone}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={customerMessage}
                  onChange={(e) => setCustomerMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 bg-white text-gray-900 focus:border-[#333f63] focus:outline-none resize-none"
                  placeholder="Enter your message to the provider..."
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setShowMessageModal(false);
                    setCustomerMessage('');
                    setSelectedProvider(null);
                  }}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendRequestToProvider}
                  disabled={!customerMessage.trim()}
                  className="flex-1 bg-[#333f63] hover:bg-[#2a3555]"
                >
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDashboard;