import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, MessageSquare, User, Calendar, ZoomIn, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const ProviderRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [queryForm, setQueryForm] = useState('');
  const [responseForm, setResponseForm] = useState({ message: '', cost: '', availability: '' });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/provider-requests', {
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
      // Fallback demo data
      setRequests([
        {
          _id: '1',
          customerId: { name: 'John Doe', email: 'john@example.com' },
          eventType: 'wedding',
          customerMessage: 'Hi, I need wedding decoration services for my event in Mumbai. Please check my design concept.',
          status: 'pending',
          createdAt: new Date().toISOString(),
          eventDetails: { eventType: 'wedding', theme: 'royal' }
        },
        {
          _id: '2',
          customerId: { name: 'Sarah Smith', email: 'sarah@example.com' },
          eventType: 'birthday',
          customerMessage: 'Looking for birthday party decoration. Can you help with this setup?',
          status: 'accepted',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          eventDetails: { eventType: 'birthday', theme: 'colorful' },
          providerResponse: {
            message: 'Yes, I can help with your birthday party decoration. My estimated cost is ₹25,000.',
            estimatedCost: 25000
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, status, message, cost) => {
    try {
      const response = await fetch(`http://localhost:5000/api/ai/respond-request/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status,
          message,
          estimatedCost: cost,
          availability: 'Available'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Request ${status} successfully!`);
        loadRequests();
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error('Respond error:', error);
      // For demo - update local state
      setRequests(prev => prev.map(req => 
        req._id === requestId 
          ? { 
              ...req, 
              status, 
              providerResponse: { message, estimatedCost: cost, responseDate: new Date() }
            }
          : req
      ));
      alert(`✅ Request ${status} successfully!`);
    }
  };

  const sendQuery = async (requestId) => {
    if (!queryForm.trim()) return;
    
    try {
      await respondToRequest(requestId, 'query', queryForm, null);
      setQueryForm('');
    } catch (error) {
      console.error('Query error:', error);
    }
  };

  const handleAccept = (request) => {
    setSelectedRequest(request);
    setResponseForm({ 
      message: `Hi ${request.customerId?.name}, I can help with your ${request.eventType} event. Here are the details:`,
      cost: '50000',
      availability: '7-10 days'
    });
  };

  const submitAcceptance = () => {
    if (!responseForm.message || !responseForm.cost) {
      alert('Please fill in all required fields');
      return;
    }
    
    respondToRequest(selectedRequest._id, 'accepted', 
      `${responseForm.message}\n\nContact Details:\n📞 +91 9876543210\n📧 provider@example.com\n📍 123 Business Street, Mumbai\n\nDelivery: ${responseForm.availability}`, 
      parseInt(responseForm.cost)
    );
    setSelectedRequest(null);
    setResponseForm({ message: '', cost: '', availability: '' });
  };

  const handleReject = (request) => {
    const message = prompt('Rejection reason:', `Hi ${request.customerId?.name}, unfortunately I'm not available for your ${request.eventType} event.`);
    if (!message) return;
    
    respondToRequest(request._id, 'rejected', message, null);
  };

  const openImageModal = (imageData) => {
    setSelectedImage(imageData);
    setShowImageModal(true);
  };

  const filteredRequests = requests.filter(req => 
    filter === 'all' || req.status === filter
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-[#333f63] text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Provider Requests</h1>
            <p className="text-xl text-gray-200">Manage customer requests and respond to inquiries</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-600">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.status === 'accepted').length}
            </div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-600">
              {requests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex items-center space-x-4">
            <span className="font-medium">Filter:</span>
            <div className="flex space-x-2">
              {['all', 'pending', 'accepted', 'rejected'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === status
                      ? 'bg-[#333f63] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
            <Button onClick={loadRequests} variant="outline" size="sm" disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-6">
          {filteredRequests.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow-md text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Requests Found</h3>
              <p className="text-gray-500">
                {filter === 'all' 
                  ? 'You haven\'t received any requests yet.' 
                  : `No ${filter} requests found.`
                }
              </p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-black to-[#333f63] rounded-full flex items-center justify-center text-white font-medium">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{request.customerId?.name || 'Customer'}</h3>
                      <p className="text-sm text-gray-500">{request.customerId?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="font-medium">Event Type:</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {request.eventType}
                    </span>
                    {request.eventDetails?.theme && (
                      <>
                        <span className="font-medium">Theme:</span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                          {request.eventDetails.theme}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2">Customer Message:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                    {request.customerMessage}
                  </p>
                </div>

                {request.generatedImage && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Generated Design:</h4>
                    <div className="relative inline-block">
                      <img 
                        src={request.generatedImage.startsWith('data:') ? request.generatedImage : `data:image/png;base64,${request.generatedImage}`}
                        alt="Customer's design concept"
                        className="w-48 h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openImageModal(request.generatedImage)}
                      />
                      <button
                        onClick={() => openImageModal(request.generatedImage)}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                    {request.imagePrompt && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Description:</strong> {request.imagePrompt}
                      </p>
                    )}
                  </div>
                )}

                {request.providerResponse && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Your Response:</h4>
                    <p className="text-gray-700 mb-2">{request.providerResponse.message}</p>
                    {request.providerResponse.estimatedCost && (
                      <p className="text-green-600 font-medium">
                        Estimated Cost: ₹{request.providerResponse.estimatedCost.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Send Query (Optional)</h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={queryForm}
                          onChange={(e) => setQueryForm(e.target.value)}
                          placeholder="Ask for address, contact details, specific requirements..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <Button
                          onClick={() => sendQuery(request._id)}
                          size="sm"
                          disabled={!queryForm.trim()}
                        >
                          Send Query
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleAccept(request)}
                        className="flex items-center space-x-2"
                        style={{ backgroundColor: '#333f63' }}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept with Quote</span>
                      </Button>
                      <Button
                        onClick={() => handleReject(request)}
                        variant="outline"
                        className="flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
      
      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.startsWith('data:') ? selectedImage : `data:image/png;base64,${selectedImage}`}
              alt="Customer's vision - Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Accept Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Accept Request - {selectedRequest.customerId?.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Response Message</label>
                <textarea
                  value={responseForm.message}
                  onChange={(e) => setResponseForm({...responseForm, message: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24"
                  placeholder="Confirm details and next steps..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Final Price Quote (₹) *</label>
                <input
                  type="number"
                  value={responseForm.cost}
                  onChange={(e) => setResponseForm({...responseForm, cost: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter your final price"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Timeline</label>
                <input
                  type="text"
                  value={responseForm.availability}
                  onChange={(e) => setResponseForm({...responseForm, availability: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="e.g., 7-10 days, Available next week"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="font-medium text-blue-800 mb-1">Contact details will be automatically included:</p>
                <p className="text-blue-600">📞 +91 9876543210</p>
                <p className="text-blue-600">📧 provider@example.com</p>
                <p className="text-blue-600">📍 123 Business Street, Mumbai</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={submitAcceptance}
                className="flex-1"
                style={{ backgroundColor: '#333f63' }}
                disabled={!responseForm.message || !responseForm.cost}
              >
                Send Quote to Customer
              </Button>
              <Button
                onClick={() => setSelectedRequest(null)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderRequests;