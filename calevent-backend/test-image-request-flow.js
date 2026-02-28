const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api';

async function testImageRequestFlow() {
  console.log('🚀 Testing Image Request Flow...');
  console.log('=' .repeat(50));

  // Step 1: Generate Image with Providers
  console.log('\n1️⃣ Testing Generate Image with Providers...');
  try {
    const response = await fetch(`${API_BASE}/ai/generate-with-providers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'decoration',
        prompt: 'elegant wedding decoration with flowers and lights',
        eventDetails: {
          eventType: 'wedding',
          theme: 'elegant',
          budget: 100000,
          guestCount: 100,
          date: '2024-06-15'
        },
        location: 'Mumbai'
      })
    });
    
    const data = await response.json();
    console.log('✅ Response Status:', response.status);
    console.log('✅ Success:', data.success);
    console.log('✅ Has Image:', !!data.data?.image);
    console.log('✅ Providers Found:', data.data?.providers?.length || 0);
    
    if (data.data?.providers?.length > 0) {
      console.log('📋 Sample Provider:', {
        name: data.data.providers[0].name,
        categories: data.data.providers[0].categories,
        rating: data.data.providers[0].rating
      });
    }
    
  } catch (error) {
    console.error('❌ Generate with providers failed:', error.message);
  }

  // Step 2: Test Send Request (will fail without auth, but tests endpoint)
  console.log('\n2️⃣ Testing Send Request Endpoint...');
  try {
    const response = await fetch(`${API_BASE}/ai/send-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: 'test-provider-id',
        generatedImage: 'data:image/svg+xml;base64,test',
        imagePrompt: 'test prompt',
        eventDetails: {
          eventType: 'wedding',
          theme: 'elegant'
        },
        customerMessage: 'Test message'
      })
    });
    
    const data = await response.json();
    console.log('✅ Response Status:', response.status);
    console.log('✅ Expected Auth Error:', data.message?.includes('Authentication'));
    
  } catch (error) {
    console.error('❌ Send request test failed:', error.message);
  }

  // Step 3: Test Provider Requests (will fail without auth)
  console.log('\n3️⃣ Testing Provider Requests Endpoint...');
  try {
    const response = await fetch(`${API_BASE}/ai/provider-requests`);
    const data = await response.json();
    console.log('✅ Response Status:', response.status);
    console.log('✅ Expected Auth Error:', data.message?.includes('Authentication'));
    
  } catch (error) {
    console.error('❌ Provider requests test failed:', error.message);
  }

  // Step 4: Test Customer Requests (will fail without auth)
  console.log('\n4️⃣ Testing Customer Requests Endpoint...');
  try {
    const response = await fetch(`${API_BASE}/ai/customer-requests`);
    const data = await response.json();
    console.log('✅ Response Status:', response.status);
    console.log('✅ Expected Auth Error:', data.message?.includes('Authentication'));
    
  } catch (error) {
    console.error('❌ Customer requests test failed:', error.message);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Image Request Flow Tests Complete!');
  console.log('\n💡 Notes:');
  console.log('- Image generation with providers should work');
  console.log('- Other endpoints require authentication');
  console.log('- Use the frontend components for full testing');
}

testImageRequestFlow().catch(console.error);