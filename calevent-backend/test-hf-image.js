import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('🧪 Testing Hugging Face Free-Image-Generation model...');
console.log('HF_TOKEN exists:', !!process.env.HF_TOKEN);

async function testHuggingFaceImage() {
  try {
    const prompt = "Astronaut in a jungle, cold color palette, muted colors, detailed, 8k";
    
    console.log('📝 Prompt:', prompt);
    console.log('🔗 Model: aiyouthalliance/Free-Image-Generation');
    
    const response = await fetch(
      "https://api-inference.huggingface.co/models/aiyouthalliance/Free-Image-Generation",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 20,
            guidance_scale: 7.5
          }
        }),
      }
    );

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const contentType = response.headers.get('content-type');
    console.log('📄 Content-Type:', contentType);

    if (contentType && contentType.includes('image')) {
      const imageBlob = await response.blob();
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64Image = Buffer.from(arrayBuffer).toString('base64');
      
      // Save image
      const buffer = Buffer.from(base64Image, 'base64');
      fs.writeFileSync('test-output.png', buffer);
      
      console.log('✅ Image generated successfully!');
      console.log('💾 Saved as: test-output.png');
      console.log('📏 Image size:', buffer.length, 'bytes');
    } else {
      const textResponse = await response.text();
      console.log('📝 Text response:', textResponse);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHuggingFaceImage();