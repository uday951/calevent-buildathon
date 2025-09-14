// Test script for chatbot functionality
const testChatbot = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🤖 Testing CALEVENT Chatbot Integration...\n');
  
  // Test 1: Gemini API Connection
  try {
    console.log('1. Testing Gemini API connection...');
    const response = await fetch(`${baseURL}/chatbot/test-gemini`);
    const result = await response.json();
    console.log('✅ Gemini API:', result.success ? 'Connected' : 'Failed');
    console.log('Response:', result.message);
  } catch (error) {
    console.log('❌ Gemini API test failed:', error.message);
  }
  
  // Test 2: Basic Chat Message
  try {
    console.log('\n2. Testing basic chat message...');
    const response = await fetch(`${baseURL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello, show me some weddings'
      })
    });
    const result = await response.json();
    console.log('✅ Chat Response:', result.success ? 'Success' : 'Failed');
    console.log('Bot Response:', result.data?.response?.substring(0, 100) + '...');
    console.log('Suggestions:', result.data?.suggestions);
    console.log('Data Type:', result.data?.data?.type);
    console.log('Events Found:', result.data?.data?.events?.length || 0);
  } catch (error) {
    console.log('❌ Chat test failed:', error.message);
  }
  
  // Test 3: Navigation Command
  try {
    console.log('\n3. Testing navigation command...');
    const response = await fetch(`${baseURL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'take me to events page'
      })
    });
    const result = await response.json();
    console.log('✅ Navigation:', result.success ? 'Success' : 'Failed');
    console.log('Navigation Data:', result.data?.navigation);
    console.log('Actions:', result.data?.actions);
  } catch (error) {
    console.log('❌ Navigation test failed:', error.message);
  }
  
  // Test 4: Search Functionality
  try {
    console.log('\n4. Testing search functionality...');
    const response = await fetch(`${baseURL}/chatbot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'search for birthday parties'
      })
    });
    const result = await response.json();
    console.log('✅ Search:', result.success ? 'Success' : 'Failed');
    console.log('Search Results:', result.data?.data?.events?.length || 0, 'events found');
  } catch (error) {
    console.log('❌ Search test failed:', error.message);
  }
  
  console.log('\n🎉 Chatbot testing completed!');
};

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testChatbot();
} else {
  // Browser environment
  window.testChatbot = testChatbot;
  console.log('Chatbot test function loaded. Run testChatbot() in console.');
}

module.exports = testChatbot;