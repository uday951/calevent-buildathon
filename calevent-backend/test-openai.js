import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

console.log('Environment variables loaded:');
console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0);

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Test OpenAI connection
async function testOpenAI() {
  try {
    console.log('\n🧪 Testing OpenAI API connection...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello in one word." }
      ],
      max_tokens: 10
    });

    console.log('✅ OpenAI API test successful!');
    console.log('Response:', completion.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ OpenAI API test failed:', error.message);
    
    if (error.code === 'invalid_api_key') {
      console.error('🔑 Invalid API key. Please check your OPENAI_API_KEY.');
    } else if (error.code === 'insufficient_quota') {
      console.error('💰 Insufficient quota. Please check your OpenAI billing.');
    }
  }
}

testOpenAI();