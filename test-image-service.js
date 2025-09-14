// Test script for image generation service
const fetch = require('node-fetch');

async function testImageService() {
  console.log('🧪 Testing Image Generation Service...\n');
  
  const serviceUrl = 'http://localhost:5001';
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${serviceUrl}/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status);
      return;
    }
    
    // Test image generation
    console.log('\n2. Testing image generation...');
    const prompt = 'elegant corporate decoration setup with red and silver colors';
    
    const generateResponse = await fetch(`${serviceUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (generateResponse.ok) {
      const result = await generateResponse.json();
      if (result.success) {
        console.log('✅ Image generation successful!');
        console.log('📊 Response data:', {
          prompt: result.prompt,
          timestamp: result.timestamp,
          imageSize: result.image ? `${result.image.length} characters` : 'No image data'
        });
      } else {
        console.log('❌ Image generation failed:', result.error);
      }
    } else {
      const errorData = await generateResponse.json().catch(() => ({ error: 'Unknown error' }));
      console.log('❌ Request failed:', generateResponse.status, errorData);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the image service is running:');
    console.log('   cd image-service');
    console.log('   start-simple.bat');
  }
}

testImageService();