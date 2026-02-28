import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const AITestDashboard = () => {
  const [reviewSummary, setReviewSummary] = useState(null);
  const [imageAnalysis, setImageAnalysis] = useState(null);
  const [batchAnalysis, setBatchAnalysis] = useState(null);
  const [imageComparison, setImageComparison] = useState(null);
  const [loading, setLoading] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api`;

  // Test Review Summary
  const testReviewSummary = async (providerId, detailed = false) => {
    setLoading(prev => ({ ...prev, review: true }));
    try {
      const response = await fetch(`${API_BASE}/ai/reviews/${providerId}?detailed=${detailed}`);
      const data = await response.json();
      setReviewSummary(data);
    } catch (error) {
      console.error('Review summary error:', error);
      setReviewSummary({ success: false, error: error.message });
    }
    setLoading(prev => ({ ...prev, review: false }));
  };

  // Test Image Analysis
  const testImageAnalysis = async (analysisType = 'decoration', detailed = false) => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    setLoading(prev => ({ ...prev, image: true }));
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('analysisType', analysisType);
    formData.append('eventType', 'wedding');
    formData.append('detailed', detailed);

    try {
      const response = await fetch(`${API_BASE}/ai/analyze-image`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setImageAnalysis(data);
    } catch (error) {
      console.error('Image analysis error:', error);
      setImageAnalysis({ success: false, error: error.message });
    }
    setLoading(prev => ({ ...prev, image: false }));
  };

  // Test DETR Vision Analysis
  const testDETRVision = async (analysisType = 'venue') => {
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    setLoading(prev => ({ ...prev, detr: true }));
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('analysisType', analysisType);

    try {
      const response = await fetch(`${API_BASE}/ai/vision`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setImageAnalysis({ ...data, isDETR: true });
    } catch (error) {
      console.error('DETR vision error:', error);
      setImageAnalysis({ success: false, error: error.message, isDETR: true });
    }
    setLoading(prev => ({ ...prev, detr: false }));
  };

  // Test Batch Review Analysis
  const testBatchAnalysis = async () => {
    setLoading(prev => ({ ...prev, batch: true }));
    try {
      const response = await fetch(`${API_BASE}/ai/batch-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerIds: ['provider1', 'provider2', 'provider3'], // Replace with actual IDs
          analysisType: 'comparison'
        })
      });
      const data = await response.json();
      setBatchAnalysis(data);
    } catch (error) {
      console.error('Batch analysis error:', error);
      setBatchAnalysis({ success: false, error: error.message });
    }
    setLoading(prev => ({ ...prev, batch: false }));
  };

  // Test Image Comparison
  const testImageComparison = async () => {
    if (selectedFiles.length < 2) {
      alert('Please select at least 2 images for comparison');
      return;
    }

    setLoading(prev => ({ ...prev, comparison: true }));
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('images', file);
    });
    formData.append('comparisonType', 'decoration');
    formData.append('criteria', 'overall');

    try {
      const response = await fetch(`${API_BASE}/ai/compare-images`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setImageComparison(data);
    } catch (error) {
      console.error('Image comparison error:', error);
      setImageComparison({ success: false, error: error.message });
    }
    setLoading(prev => ({ ...prev, comparison: false }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center mb-8">AI Features Test Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Review Summary Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Review Summary Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => testReviewSummary('test-provider-id', false)}
                disabled={loading.review}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {loading.review ? 'Loading...' : 'Basic Summary'}
              </button>
              <button
                onClick={() => testReviewSummary('test-provider-id', true)}
                disabled={loading.review}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading.review ? 'Loading...' : 'Detailed Analysis'}
              </button>
            </div>
            
            {reviewSummary && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Review Summary Result:</h4>
                <pre className="text-sm overflow-auto max-h-64">
                  {JSON.stringify(reviewSummary, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Analysis Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Image Analysis Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => testImageAnalysis('decoration', false)}
                disabled={loading.image}
                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50 text-sm"
              >
                Decoration
              </button>
              <button
                onClick={() => testImageAnalysis('venue', false)}
                disabled={loading.image}
                className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 text-sm"
              >
                Venue
              </button>
              <button
                onClick={() => testImageAnalysis('decoration', true)}
                disabled={loading.image}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
              >
                Detailed
              </button>
              <button
                onClick={() => testDETRVision('venue')}
                disabled={loading.detr}
                className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50 text-sm"
              >
                {loading.detr ? 'DETR...' : 'DETR Vision'}
              </button>
            </div>
            
            {imageAnalysis && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">
                  {imageAnalysis.isDETR ? 'DETR Vision Analysis:' : 'Image Analysis Result:'}
                </h4>
                
                {imageAnalysis.isDETR && imageAnalysis.data?.objects?.length > 0 && (
                  <div className="mb-4">
                    <h5 className="font-medium mb-2">🎯 Detected Objects:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {imageAnalysis.data.objects.map((obj, idx) => (
                        <div key={idx} className="bg-white p-2 rounded text-sm">
                          <span className="font-medium">{obj.label}</span>
                          <span className="text-gray-500 ml-2">
                            {(obj.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <pre className="text-sm overflow-auto max-h-64">
                  {JSON.stringify(imageAnalysis, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batch Analysis Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Review Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <button
              onClick={testBatchAnalysis}
              disabled={loading.batch}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:opacity-50"
            >
              {loading.batch ? 'Analyzing...' : 'Compare Multiple Providers'}
            </button>
            
            {batchAnalysis && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Batch Analysis Result:</h4>
                <pre className="text-sm overflow-auto max-h-64">
                  {JSON.stringify(batchAnalysis, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Comparison Testing */}
        <Card>
          <CardHeader>
            <CardTitle>Image Comparison Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="text-xs text-gray-500">Select 2-4 images for comparison</p>
            </div>
            
            <button
              onClick={testImageComparison}
              disabled={loading.comparison}
              className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
            >
              {loading.comparison ? 'Comparing...' : 'Compare Images'}
            </button>
            
            {imageComparison && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Image Comparison Result:</h4>
                <pre className="text-sm overflow-auto max-h-64">
                  {JSON.stringify(imageComparison, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Information */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Review Summary:</strong> Tests both basic and detailed review analysis for providers</p>
            <p><strong>Image Analysis:</strong> Upload an event image to get AI-powered insights on decoration, venue, etc.</p>
            <p><strong>DETR Vision:</strong> Uses Hugging Face DETR to detect objects like chairs, tables, people in event images</p>
            <p><strong>Batch Analysis:</strong> Compare multiple providers' reviews simultaneously</p>
            <p><strong>Image Comparison:</strong> Upload multiple images to compare different setups</p>
            <p className="text-blue-600"><strong>Note:</strong> Make sure the backend server is running on port 5000</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AITestDashboard;