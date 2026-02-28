const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

async function testVisionDETR() {
  console.log('🔍 Testing DETR Vision Analysis...');
  
  // Check for test images
  const testImages = [
    'wedding_stage.jpg',
    'generated_image_blue_birthday_party_.jpg',
    '../public/weddings/images.jpg'
  ];
  
  let testImage = null;
  for (const img of testImages) {
    if (fs.existsSync(img)) {
      testImage = img;
      break;
    }
  }
  
  if (!testImage) {
    console.log('⚠️ No test images found. Please add an image to test.');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImage));
    formData.append('analysisType', 'venue');
    
    console.log(`📸 Testing with image: ${testImage}`);
    
    const response = await fetch(`${API_BASE}/ai/vision`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    console.log('✅ Response Status:', response.status);
    console.log('✅ Success:', data.success);
    console.log('✅ Source:', data.data?.source);
    console.log('✅ Objects Found:', data.data?.objects?.length || 0);
    
    if (data.data?.objects?.length > 0) {
      console.log('\n🎯 Detected Objects:');
      data.data.objects.forEach(obj => {
        console.log(`  - ${obj.label}: ${(obj.score * 100).toFixed(1)}%`);
      });
    }
    
    console.log('\n📝 Analysis:');
    console.log(data.data?.analysis);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testDirectHF() {
  console.log('\n🧪 Testing Direct Hugging Face DETR...');
  const HF_TOKEN = process.env.HF_TOKEN || 'your_hugging_face_token_here';
  
  // Create a simple test image (base64)
  const testImageB64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/detr-resnet-50', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: testImageB64
      })
    });
    
    console.log('✅ HF Response Status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ HF DETR is working');
      console.log('✅ Objects detected:', result.length);
    } else {
      const error = await response.text();
      console.log('❌ HF Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Direct HF test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting DETR Vision Analysis Tests');
  console.log('=' .repeat(50));
  
  await testVisionDETR();
  await testDirectHF();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Tests Complete!');
}

runTests().catch(console.error);