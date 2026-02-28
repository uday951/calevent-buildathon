import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const ProviderRequestDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ai/provider-requests?status=${filter}`);
      const data = await response.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
    setLoading(false);
  };

  const respondToRequest = async (requestId, status, responseData) => {
    try {
      const response = await fetch(`${API_BASE}/ai/respond-request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          ...responseData
        })
      });
      
      if (response.ok) {
        fetchRequests(); // Refresh the list
      }
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  const RequestCard = ({ request }) => {
    const [showResponse, setShowResponse] = useState(false);
    const [responseForm, setResponseForm] = useState({
      message: '',
      estimatedCost: '',
      availability: true
    });

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {request.eventType} Event Request
              </CardTitle>
              <p className="text-sm text-gray-600">
                From: {request.customerId?.name} • {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              request.status === 'accepted' ? 'bg-green-100 text-green-800' :
              request.status === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {request.status}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Generated Image */}
          <div>
            <h4 className="font-medium mb-2">Customer's Vision:</h4>
            <img
              src={request.generatedImage.startsWith('data:') ? request.generatedImage : `data:image/png;base64,${request.generatedImage}`}
              alt="Customer's vision"
              className="w-full max-w-sm rounded-lg"
            />
            <p className="text-sm text-gray-600 mt-2">{request.imagePrompt}</p>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium">Event Details:</h4>
              <ul className="text-sm text-gray-600 mt-1">
                <li>Theme: {request.eventDetails?.theme || 'Not specified'}</li>
                <li>Budget: ₹{request.eventDetails?.budget?.toLocaleString() || 'Not specified'}</li>
                <li>Guests: {request.eventDetails?.guestCount || 'Not specified'}</li>
                <li>Location: {request.eventDetails?.location || 'Not specified'}</li>
              </ul>
            </div>
            
            {request.customerMessage && (
              <div>
                <h4 className="font-medium">Customer Message:</h4>
                <p className="text-sm text-gray-600 mt-1">{request.customerMessage}</p>
              </div>
            )}
          </div>

          {/* Response Section */}
          {request.status === 'pending' && (
            <div className="border-t pt-4">
              {!showResponse ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowResponse(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Accept & Respond
                  </button>
                  <button
                    onClick={() => respondToRequest(request._id, 'rejected', { message: 'Unable to fulfill this request at the moment.' })}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Response Message</label>
                    <textarea
                      value={responseForm.message}
                      onChange={(e) => setResponseForm({...responseForm, message: e.target.value})}
                      placeholder="Respond to the customer..."
                      className="w-full p-2 border rounded h-20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Estimated Cost (₹)</label>
                      <input
                        type="number"
                        value={responseForm.estimatedCost}
                        onChange={(e) => setResponseForm({...responseForm, estimatedCost: e.target.value})}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Availability</label>
                      <select
                        value={responseForm.availability}
                        onChange={(e) => setResponseForm({...responseForm, availability: e.target.value === 'true'})}
                        className="w-full p-2 border rounded"
                      >
                        <option value="true">Available</option>
                        <option value="false">Not Available</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => respondToRequest(request._id, 'accepted', responseForm)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Send Response
                    </button>
                    <button
                      onClick={() => setShowResponse(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show Provider Response */}
          {request.providerResponse && (
            <div className="border-t pt-4 bg-gray-50 p-3 rounded">
              <h4 className="font-medium mb-2">Your Response:</h4>
              <p className="text-sm mb-2">{request.providerResponse.message}</p>
              {request.providerResponse.estimatedCost && (
                <p className="text-sm">Estimated Cost: ₹{request.providerResponse.estimatedCost.toLocaleString()}</p>
              )}
              <p className="text-sm">Availability: {request.providerResponse.availability ? 'Available' : 'Not Available'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Provider Request Dashboard</h1>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No requests found for the selected filter.
        </div>
      ) : (
        <div>
          {requests.map((request) => (
            <RequestCard key={request._id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderRequestDashboard;