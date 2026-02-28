const fetch = require('node-fetch');

async function testImageGeneration() {
  console.log('🧪 Testing Image Generation Fix...');
  
  try {
    const response = await fetch('http://localhost:5000/api/ai/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'decoration',
        prompt: 'elegant wedding decoration',
        eventDetails: {
          eventType: 'wedding',
          theme: 'elegant'
        }
      })
    });
    
    const data = await response.json();
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Success:', data.success);
    console.log('✅ Has Image:', !!data.data?.image);
    console.log('✅ Image Type:', data.data?.image?.substring(0, 30) + '...');
    console.log('✅ Source:', data.data?.source);
    console.log('✅ Fallback:', data.data?.fallback || false);
    
    if (data.data?.image === 'undefined' || !data.data?.image) {
      console.log('❌ Image is still undefined!');
    } else {
      console.log('✅ Image data is valid');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImageGeneration();