const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

// Test Review Summary
async function testReviewSummary() {
  console.log('\n🔍 Testing Review Summary...');
  
  try {
    const response = await fetch(`${API_BASE}/ai/reviews/test-provider-id?detailed=true`);
    const data = await response.json();
    
    console.log('✅ Review Summary Response:', {
      success: data.success,
      reviewCount: data.data?.reviewCount || 0,
      averageRating: data.data?.averageRating || 0,
      source: data.data?.source
    });
  } catch (error) {
    console.error('❌ Review Summary Error:', error.message);
  }
}

// Test Image Analysis (if test image exists)
async function testImageAnalysis() {
  console.log('\n📸 Testing Image Analysis...');
  
  // Check if test image exists
  const testImagePath = path.join(__dirname, 'wedding_stage.jpg');
  if (!fs.existsSync(testImagePath)) {
    console.log('⚠️ No test image found, skipping image analysis test');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    formData.append('analysisType', 'decoration');
    formData.append('eventType', 'wedding');
    formData.append('detailed', 'true');
    
    const response = await fetch(`${API_BASE}/ai/analyze-image`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    console.log('✅ Image Analysis Response:', {
      success: data.success,
      analysisType: data.data?.analysisType,
      confidence: data.data?.confidence,
      source: data.data?.source,
      hasAnalysis: !!data.data?.analysis
    });
  } catch (error) {
    console.error('❌ Image Analysis Error:', error.message);
  }
}

// Test Batch Review Analysis
async function testBatchAnalysis() {
  console.log('\n📊 Testing Batch Review Analysis...');
  
  try {
    const response = await fetch(`${API_BASE}/ai/batch-reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerIds: ['provider1', 'provider2', 'provider3'],
        analysisType: 'comparison'
      })
    });
    
    const data = await response.json();
    
    console.log('✅ Batch Analysis Response:', {
      success: data.success,
      providerCount: data.data?.providers?.length || 0,
      hasComparison: !!data.data?.comparison,
      timestamp: data.data?.timestamp
    });
  } catch (error) {
    console.error('❌ Batch Analysis Error:', error.message);
  }
}

// Test Enhanced Image Generation
async function testImageGeneration() {
  console.log('\n🎨 Testing Enhanced Image Generation...');
  
  try {
    const response = await fetch(`${API_BASE}/ai/generate-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'decoration',
        prompt: 'elegant wedding decoration with flowers and lights',
        eventDetails: {
          eventType: 'wedding',
          theme: 'elegant'
        },
        style: 'professional',
        size: '1024x1024'
      })
    });
    
    const data = await response.json();
    
    console.log('✅ Image Generation Response:', {
      success: data.success,
      type: data.data?.type,
      style: data.data?.style,
      source: data.data?.source,
      fallback: data.data?.fallback || false,
      hasImage: !!data.data?.image
    });
  } catch (error) {
    console.error('❌ Image Generation Error:', error.message);
  }
}

// Test AI Service Health
async function testAIServiceHealth() {
  console.log('\n🏥 Testing AI Service Health...');
  
  try {
    // Test basic text generation
    const response = await fetch(`${API_BASE}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'wedding',
        theme: 'elegant',
        budget: '100000',
        guestCount: '100',
        location: 'Mumbai'
      })
    });
    
    const data = await response.json();
    
    console.log('✅ AI Service Health:', {
      success: data.success,
      source: data.data?.source,
      hasSuggestions: !!data.data?.suggestions,
      vendorCount: data.data?.vendors?.length || 0
    });
  } catch (error) {
    console.error('❌ AI Service Health Error:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting AI Enhanced Features Test Suite...');
  console.log('=' .repeat(50));
  
  await testAIServiceHealth();
  await testReviewSummary();
  await testImageAnalysis();
  await testBatchAnalysis();
  await testImageGeneration();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Test Suite Complete!');
  console.log('\n💡 Tips:');
  console.log('- Make sure the backend server is running on port 5000');
  console.log('- Check that your AI API keys are configured in .env');
  console.log('- For image analysis, place a test image in the backend directory');
  console.log('- Review summary works best with actual provider data in MongoDB');
}

// Handle command line execution
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testReviewSummary,
  testImageAnalysis,
  testBatchAnalysis,
  testImageGeneration,
  testAIServiceHealth
};