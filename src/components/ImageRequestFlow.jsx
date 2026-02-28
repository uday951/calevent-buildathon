import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const ImageRequestFlow = () => {
  const [step, setStep] = useState(1);
  const [generatedData, setGeneratedData] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    prompt: '',
    eventType: 'wedding',
    theme: '',
    budget: '',
    guestCount: '',
    location: '',
    date: '',
    message: ''
  });

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  // Step 1: Generate Image with Providers
  const generateImageWithProviders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ai/generate-with-providers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'decoration',
          prompt: formData.prompt,
          eventDetails: {
            eventType: formData.eventType,
            theme: formData.theme,
            budget: parseInt(formData.budget),
            guestCount: parseInt(formData.guestCount),
            date: formData.date
          },
          location: formData.location
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedData(data.data);
        setStep(2);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  // Step 2: Send Request to Provider
  const sendRequestToProvider = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/ai/send-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProvider.id,
          generatedImage: generatedData.image,
          imagePrompt: formData.prompt,
          eventDetails: {
            eventType: formData.eventType,
            theme: formData.theme,
            budget: parseInt(formData.budget),
            guestCount: parseInt(formData.guestCount),
            date: formData.date,
            location: formData.location
          },
          customerMessage: formData.message
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setStep(3);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Image Request Flow</h1>
      
      {/* Progress Steps */}
      <div className="flex items-center mb-8">
        <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>1</div>
          <span className="ml-2">Generate Image</span>
        </div>
        <div className="flex-1 h-px bg-gray-300 mx-4"></div>
        <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>2</div>
          <span className="ml-2">Select Provider</span>
        </div>
        <div className="flex-1 h-px bg-gray-300 mx-4"></div>
        <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>3</div>
          <span className="ml-2">Request Sent</span>
        </div>
      </div>

      {/* Step 1: Generate Image */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Event Vision</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Event Description</label>
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({...formData, prompt: e.target.value})}
                placeholder="Describe your dream event setup..."
                className="w-full p-3 border rounded-lg h-24"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Event Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="wedding">Wedding</option>
                  <option value="birthday">Birthday</option>
                  <option value="corporate">Corporate</option>
                  <option value="anniversary">Anniversary</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <input
                  type="text"
                  value={formData.theme}
                  onChange={(e) => setFormData({...formData, theme: e.target.value})}
                  placeholder="e.g., Royal, Modern"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Budget (₹)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                  placeholder="100000"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Guests</label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({...formData, guestCount: e.target.value})}
                  placeholder="100"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Mumbai"
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>
            
            <button
              onClick={generateImageWithProviders}
              disabled={loading || !formData.prompt}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Image & Find Providers'}
            </button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Provider */}
      {step === 2 && generatedData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generated Image</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={generatedData.image.startsWith('data:') ? generatedData.image : `data:image/png;base64,${generatedData.image}`}
                alt="Generated event setup"
                className="w-full max-w-md mx-auto rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-2 text-center">{generatedData.prompt}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matching Providers ({generatedData.providers?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedData.providers?.map((provider) => (
                  <div
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedProvider?.id === provider.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {provider.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{provider.name}</h3>
                        <p className="text-sm text-gray-600">{provider.categories?.join(', ')}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm ml-1">{provider.rating}/5</span>
                          <span className="text-sm text-gray-500 ml-2">{provider.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedProvider && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Message to Provider</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Tell the provider about your requirements..."
                      className="w-full p-3 border rounded-lg h-24"
                    />
                  </div>
                  
                  <button
                    onClick={sendRequestToProvider}
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : `Send Request to ${selectedProvider.name}`}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold mb-2">Request Sent Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your request has been sent to {selectedProvider?.name}. They will review your requirements and respond soon.
            </p>
            <button
              onClick={() => {
                setStep(1);
                setGeneratedData(null);
                setSelectedProvider(null);
                setFormData({
                  prompt: '',
                  eventType: 'wedding',
                  theme: '',
                  budget: '',
                  guestCount: '',
                  location: '',
                  date: '',
                  message: ''
                });
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Another Request
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageRequestFlow;