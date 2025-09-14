import axios from 'axios';
import Provider from '../models/Provider.js';
import Event from '../models/EventModel.js';
import Follow from '../models/Follow.js';
import Review from '../models/Review.js';

// Custom responses for common queries
const customResponses = {
  greeting: [
    "Hello! Welcome to CALEVENT! 🎉 How can I help you plan your perfect event today?",
    "Hi there! I'm your CALEVENT assistant. What kind of event are you looking to organize?",
    "Welcome to CALEVENT! I'm here to help you find the best event services. What can I do for you?"
  ],
  
  services: {
    wedding: "We offer comprehensive wedding services including venues, decoration, catering, photography, and entertainment. Would you like me to show you some wedding packages?",
    corporate: "Our corporate event services include conference venues, team building activities, product launches, and business meetings. What type of corporate event are you planning?",
    birthday: "Birthday party planning made easy! We have venues, themes, entertainment, and catering options for all ages. Tell me more about your celebration!",
    party: "Let's make your party unforgettable! We offer DJ services, venues, catering, and decoration. What's the occasion?",
    conference: "Professional conference services including venues, AV equipment, catering, and event coordination. How many attendees are you expecting?"
  },

  contact: "You can reach our support team at:\n📞 Phone: +91 9876543210\n📧 Email: support@calevent.com\n🕒 Hours: 9 AM - 9 PM (Mon-Sun)\n\nOr continue chatting with me for instant help!",
  
  booking: "To book an event:\n1. Browse our events and services\n2. Select your preferred option\n3. Fill in the booking details\n4. Make payment\n5. Get confirmation!\n\nWould you like me to help you find specific services?",
  
  pricing: "Our pricing varies based on:\n• Event type and duration\n• Number of guests\n• Services included\n• Location and date\n\nFor accurate quotes, please share your requirements and I'll connect you with our providers!",

  location: "We provide event services across major cities in India including Mumbai, Delhi, Bangalore, Chennai, Pune, Hyderabad, and many more. Which city are you planning your event in?"
};

// Quick reply buttons
const quickReplies = {
  main: [
    "Find Wedding Venues",
    "Corporate Events",
    "Birthday Parties", 
    "Get Pricing",
    "Contact Support"
  ],
  
  wedding: [
    "Wedding Venues",
    "Wedding Photographers",
    "Catering Services",
    "Decoration",
    "Get Quote"
  ],
  
  corporate: [
    "Conference Venues",
    "Team Building",
    "Product Launch",
    "Business Meetings",
    "Get Quote"
  ]
};

// Handle image upload for decoration matching
export const handleImageAnalysis = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    const imageBuffer = req.file.buffer;
    const base64Image = imageBuffer.toString('base64');
    
    // Analyze image with Gemini Vision
    const analysis = await analyzeDecorationImage(base64Image);
    
    if (!analysis.success) {
      return res.json({
        success: true,
        data: {
          response: "I couldn't analyze this image clearly. Please try uploading a clearer photo of your decoration inspiration!",
          suggestions: ["Show Weddings", "Corporate Events", "Birthday Parties"]
        }
      });
    }

    // Find matching providers
    const matches = await findMatchingProviders(analysis.features);
    
    const response = formatImageAnalysisResponse(analysis.description, matches);
    
    res.json({
      success: true,
      data: {
        response: response.text,
        suggestions: response.suggestions,
        data: { providers: matches, type: 'decoration_matches' }
      }
    });
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze image'
    });
  }
};

// Chatbot main handler
export const handleChatMessage = async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const userMessage = message.toLowerCase().trim();
    let response = '';
    let suggestions = [];
    let data = null;

    // Check for custom responses first
    const customResponse = await getCustomResponse(userMessage, context);
    if (customResponse) {
      response = customResponse.response;
      suggestions = customResponse.suggestions || [];
      data = customResponse.data || null;
    } else {
      // Use Gemini AI for natural responses
      const aiResponse = await getGeminiResponse(message, context);
      if (aiResponse.success) {
        response = aiResponse.response;
        suggestions = quickReplies.main;
      } else {
        // Enhanced fallback response
        response = "🎉 **Welcome to CALEVENT!** I'm your AI assistant.\n\n✨ I can help you with:\n• 💒 Wedding planning & venues\n• 🏢 Corporate events & conferences\n• 🎂 Birthday parties & celebrations\n• 💰 Pricing & quotes\n• 📞 Contact information\n\n**Try asking:** 'Show weddings' or 'Corporate events'";
        suggestions = quickReplies.main;
      }
    }

    res.json({
      success: true,
      data: {
        response,
        suggestions,
        data,
        actions: customResponse?.actions || [],
        navigation: customResponse?.navigation || null,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again or contact support.',
      error: error.message
    });
  }
};

// Get custom response for common queries
const getCustomResponse = async (message, context) => {
  try {
    // Greeting detection
    if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      return {
        response: customResponses.greeting[Math.floor(Math.random() * customResponses.greeting.length)],
        suggestions: quickReplies.main
      };
    }

    // Decoration design requests (check before wedding events)
    if (message.includes('design') || message.includes('decoration') || message.includes('stage') || message.includes('setup') || 
        (message.includes('want') && (message.includes('stage') || message.includes('decoration') || message.includes('drapes') || message.includes('lighting')))) {
      const designResponse = await handleDecorationDesign(message);
      if (designResponse) {
        return designResponse;
      }
    }

    // Service-specific queries
    if (message.includes('wedding') || message.includes('show') && message.includes('wedding')) {
      const events = await getEventsByCategory('wedding', 6);
      const providers = await getProvidersByCategory('wedding', 3);
      return {
        response: `🎉 Here are some beautiful wedding events available! ✨\n\nFound ${events.length} amazing wedding options:`,
        suggestions: quickReplies.wedding,
        data: { events, providers, category: 'wedding', type: 'event_showcase' }
      };
    }

    if (message.includes('corporate') || message.includes('business') || message.includes('conference')) {
      const events = await getEventsByCategory('corporate', 6);
      const providers = await getProvidersByCategory('corporate', 3);
      return {
        response: "🏢 **Professional Corporate Events** 💼\n\nFound amazing business event options for you:",
        suggestions: quickReplies.corporate,
        data: { events, providers, category: 'corporate', type: 'event_showcase' }
      };
    }

    if (message.includes('birthday')) {
      const events = await getEventsByCategory('birthday', 6);
      const providers = await getProvidersByCategory('birthday', 3);
      return {
        response: "🎂 **Amazing Birthday Celebrations** 🎈\n\nMake your special day unforgettable:",
        suggestions: quickReplies.main,
        data: { events, providers, category: 'birthday', type: 'event_showcase' }
      };
    }

    if (message.includes('party')) {
      const providers = await getProvidersByCategory('party', 3);
      return {
        response: customResponses.services.party,
        suggestions: quickReplies.main,
        data: { providers, category: 'party' }
      };
    }

    // Contact information
    if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('support')) {
      return {
        response: customResponses.contact,
        suggestions: quickReplies.main
      };
    }

    // Booking process
    if (message.includes('book') || message.includes('booking') || message.includes('reserve')) {
      return {
        response: customResponses.booking,
        suggestions: quickReplies.main
      };
    }

    // Pricing queries
    if (message.includes('price') || message.includes('cost') || message.includes('quote') || message.includes('budget')) {
      return {
        response: customResponses.pricing,
        suggestions: quickReplies.main
      };
    }

    // Location queries
    if (message.includes('location') || message.includes('city') || message.includes('where')) {
      return {
        response: customResponses.location,
        suggestions: quickReplies.main
      };
    }



    // Profile navigation
    if (message.includes('profile') || message.includes('my profile')) {
      return {
        response: "👤 **Redirecting to your profile...**\n\nYou can view and edit your profile information there!",
        suggestions: quickReplies.main,
        actions: ['navigate'],
        navigation: { page: 'profile' }
      };
    }

    // Provider search
    if (message.includes('provider') || message.includes('vendor') || message.includes('list') || message.includes('show')) {
      const providers = await searchProviders(message);
      
      if (providers.length === 0) {
        return {
          response: "🔍 **No providers found matching your criteria.**\n\n📝 **Try these options:**\n• Browse by category: 'wedding providers', 'corporate events'\n• Search by location: 'providers in Mumbai'\n• Or contact our support team for personalized assistance!\n\n💡 **Popular categories:** Wedding, Corporate, Birthday, Conference",
          suggestions: quickReplies.main,
          data: { providers: [] }
        };
      }
      
      return {
        response: `🎉 **Found ${providers.length} amazing providers for you!**\n\nHere are some top-rated options to make your event perfect:`,
        suggestions: quickReplies.main,
        data: { providers, type: 'provider_list' }
      };
    }

    return null;
  } catch (error) {
    console.error('Custom response error:', error);
    return null;
  }
};

// Export the reusable callGemini function for other modules
export { callGemini };



// Get events by category
const getEventsByCategory = async (category, limit = 6) => {
  try {
    const events = await Event.find({
      category: category,
      isActive: true
    })
    .populate('providerId', 'name businessName rating totalReviews location profileImage')
    .select('title description price location images category date duration maxGuests')
    .sort({ createdAt: -1, rating: -1 })
    .limit(limit);

    return events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description?.substring(0, 100) + '...',
      price: event.price,
      location: typeof event.location === 'string' ? event.location : event.location?.city || event.location?.address || 'Location',
      image: event.images?.[0] || `/images/${category}/1.jpg`,
      category: event.category,
      date: event.date,
      duration: event.duration,
      maxGuests: event.maxGuests,
      provider: {
        id: event.providerId?._id,
        name: event.providerId?.businessName || event.providerId?.name,
        rating: event.providerId?.rating,
        reviews: event.providerId?.totalReviews,
        location: event.providerId?.location?.city,
        image: event.providerId?.profileImage
      }
    }));
  } catch (error) {
    console.error('Get events by category error:', error);
    return [];
  }
};

// Get providers by category
const getProvidersByCategory = async (category, limit = 5) => {
  try {
    const providers = await Provider.find({
      categories: category,
      isActive: true,
      isVerified: true
    })
    .select('name businessName rating totalReviews location.city profileImage')
    .sort({ rating: -1, totalReviews: -1 })
    .limit(limit);

    return providers.map(provider => ({
      id: provider._id,
      name: provider.businessName || provider.name,
      rating: provider.rating,
      reviews: provider.totalReviews,
      location: provider.location?.city,
      image: provider.profileImage
    }));
  } catch (error) {
    console.error('Get providers by category error:', error);
    return [];
  }
};

// Search providers - simplified to get all active providers when no specific query
const searchProviders = async (query) => {
  try {
    let searchFilter = { isActive: true };
    
    // If there's a specific search query, add search conditions
    if (query && query.trim() && !query.includes('provider') && !query.includes('vendor')) {
      searchFilter.$or = [
        { name: new RegExp(query, 'i') },
        { businessName: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { categories: new RegExp(query, 'i') }
      ];
    }

    const providers = await Provider.find(searchFilter)
      .select('name businessName rating totalReviews location.city profileImage categories')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(8);

    return providers.map(provider => ({
      id: provider._id,
      name: provider.businessName || provider.name,
      rating: provider.rating || 0,
      reviews: provider.totalReviews || 0,
      location: provider.location?.city || provider.location?.address || 'India',
      image: provider.profileImage ? `http://localhost:5000/${provider.profileImage.replace(/\\/g, '/')}` : null,
      categories: provider.categories
    }));
  } catch (error) {
    console.error('Search providers error:', error);
    return [];
  }
};

// Production-ready Gemini API with advanced retry logic
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const callGemini = async (model, requestData, maxRetries = 5) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  const headers = { 'Content-Type': 'application/json' };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.post(url, requestData, { headers, timeout: 15000 });
      return { success: true, data: response.data };
    } catch (error) {
      const status = error.response?.status;
      const errorData = error.response?.data?.error;
      
      // Handle 503 - Model overloaded
      if (status === 503 || errorData?.code === 503) {
        if (attempt === maxRetries - 1) throw error;
        const delay = Math.pow(2, attempt) * 1000; // 1s → 2s → 4s → 8s → 16s
        if (process.env.NODE_ENV === 'development') {
          console.log(`Gemini ${model} overloaded, retry ${attempt + 1}/${maxRetries} after ${delay}ms`);
        }
        await sleep(delay);
        continue;
      }
      
      // Handle 429 - Quota exceeded with RetryInfo
      if (status === 429 || errorData?.code === 429) {
        if (attempt === maxRetries - 1) throw error;
        
        // Parse RetryInfo from error.details
        let retryDelay = Math.pow(2, attempt) * 1000; // Default exponential backoff
        if (errorData?.details) {
          const retryInfo = errorData.details.find(d => d['@type']?.includes('RetryInfo'));
          if (retryInfo?.retryDelay) {
            const seconds = parseInt(retryInfo.retryDelay.replace('s', '')) || 0;
            retryDelay = seconds * 1000;
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Gemini ${model} quota exceeded, retry ${attempt + 1}/${maxRetries} after ${retryDelay}ms`);
        }
        await sleep(retryDelay);
        continue;
      }
      
      // Non-retryable errors (400, 401, etc.)
      throw error;
    }
  }
};

// Get response from Gemini AI with model fallback
const getGeminiResponse = async (message, context) => {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'Gemini API key not configured' };
  }

  const prompt = `You are CALEVENT AI Assistant, a helpful and friendly chatbot for an event booking platform.

About CALEVENT: We help customers find and book event services like weddings, corporate events, birthday parties, conferences, etc. We connect customers with verified service providers across India.

User message: "${message}"

Instructions:
- Be conversational, helpful, and enthusiastic about events
- Use emojis appropriately to make responses engaging  
- Keep responses under 150 words but informative
- If asked about specific events, suggest they use commands like "show weddings"
- For bookings, guide them through our platform features
- Always end with a helpful question or suggestion

Respond as the friendly CALEVENT AI Assistant:`;

  const requestData = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const models = ['gemini-1.5-flash', 'gemini-1.5-pro'];

  // Try each model with full retry logic
  for (const model of models) {
    try {
      const result = await callGemini(model, requestData);
      
      if (result.success && result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return {
          success: true,
          response: result.data.candidates[0].content.parts[0].text
        };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      if (process.env.NODE_ENV === 'development') {
        console.error(`Gemini ${model} failed after retries:`, errorMsg);
      }
      
      // Continue to next model
      if (model !== models[models.length - 1]) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Falling back to next model...`);
        }
        continue;
      }
    }
  }

  return { 
    success: false, 
    error: 'I\'m having trouble connecting right now. Try asking: "show weddings", "corporate events", or "contact support".' 
  };
};

// Analyze decoration image with Gemini Vision
const analyzeDecorationImage = async (base64Image) => {
  const prompt = `Analyze this event decoration image and extract key features:
1. Main colors (list 2-3 dominant colors)
2. Decoration style (elegant, rustic, modern, traditional, etc.)
3. Event type (wedding, birthday, corporate, etc.)
4. Key objects/elements (flowers, drapes, lights, etc.)
5. Theme description (1-2 words)

Provide a brief description and categorize the style.`;

  const requestData = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: "image/jpeg",
            data: base64Image
          }
        }
      ]
    }]
  };

  try {
    const result = await callGemini('gemini-1.5-flash', requestData);
    
    if (result.success && result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const analysisText = result.data.candidates[0].content.parts[0].text;
      
      const features = extractFeaturesFromAnalysis(analysisText);
      
      return {
        success: true,
        description: analysisText.split('\n')[0] || 'Beautiful decoration setup',
        features
      };
    }
  } catch (error) {
    console.error('Gemini Vision error:', error);
  }
  
  return { success: false };
};

// Extract searchable features from analysis text
const extractFeaturesFromAnalysis = (text) => {
  const lowerText = text.toLowerCase();
  
  const colorKeywords = ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'gold', 'silver', 'white', 'black', 'orange'];
  const styleKeywords = ['elegant', 'rustic', 'modern', 'traditional', 'vintage', 'minimalist', 'luxury'];
  const eventKeywords = ['wedding', 'birthday', 'corporate', 'anniversary', 'party'];
  
  return {
    colors: colorKeywords.filter(color => lowerText.includes(color)),
    style: styleKeywords.find(style => lowerText.includes(style)) || 'elegant',
    eventType: eventKeywords.find(event => lowerText.includes(event)) || 'wedding'
  };
};

// Find matching providers based on features
const findMatchingProviders = async (features) => {
  try {
    const searchTerms = [features.eventType, features.style, ...features.colors].filter(Boolean);
    
    const providers = await Provider.find({
      $or: [
        { categories: features.eventType },
        { description: new RegExp(searchTerms.join('|'), 'i') }
      ],
      isActive: true
    })
    .select('name businessName rating totalReviews location.city profileImage categories')
    .sort({ rating: -1, totalReviews: -1 });

    return providers.map(provider => ({
      id: provider._id,
      name: provider.businessName || provider.name,
      rating: provider.rating || 0,
      reviews: provider.totalReviews || 0,
      location: provider.location?.city || 'Location not set',
      image: provider.profileImage ? `http://localhost:5000/${provider.profileImage.replace(/\\/g, '/')}` : null,
      categories: provider.categories
    }));
  } catch (error) {
    console.error('Provider matching error:', error);
    return [];
  }
};

// Format response for image analysis
const formatImageAnalysisResponse = (description, matches) => {
  if (matches.length === 0) {
    return {
      text: `${description}\n\n🎨 I couldn't find any providers matching this decoration style in our database.\n\n💡 **Try these options:**\n• Upload a different decoration image\n• Browse providers by category\n• Contact our support team for personalized assistance`,
      suggestions: ['Show Weddings', 'Corporate Events', 'Browse Providers']
    };
  }

  const matchText = matches.map((provider, i) => 
    `${i + 1}. **${provider.name}**\n   ⭐ ${provider.rating}/5 (${provider.reviews} reviews)\n   📍 ${provider.location}\n   🏷️ Categories: ${provider.categories?.join(', ') || 'Not specified'}`
  ).join('\n\n');

  const providerWord = matches.length === 1 ? 'provider' : 'providers';

  return {
    text: `🎨 **${description}**\n\n✨ Found ${matches.length} ${providerWord} with similar decoration styles:\n\n${matchText}\n\n💡 Click on a provider to view their full profile and contact them directly!`,
    suggestions: ['View Provider Profile', 'Upload Another Image', 'Browse More Providers']
  };
};

// Handle decoration design requests
const handleDecorationDesign = async (message) => {
  try {
    // Extract design features from user description
    const designFeatures = await analyzeDecorationDescription(message);
    
    if (!designFeatures.success) {
      return {
        response: "🎨 I'd love to help you design your decoration! Could you describe it in more detail?\n\nFor example: 'I want a royal wedding stage with red drapes and golden lighting'\n\nTell me about:\n• Event type (wedding, birthday, corporate)\n• Colors you prefer\n• Style (elegant, rustic, modern)\n• Special elements (flowers, lights, drapes)",
        suggestions: ['Wedding Decoration', 'Birthday Setup', 'Corporate Event Design']
      };
    }

    // Generate AI image based on design
    const generatedImage = await generateDecorationImage(designFeatures);
    
    // Find matching providers based on design
    const matchingProviders = await findProvidersForDesign(designFeatures);
    
    return formatDecorationDesignResponse(designFeatures, matchingProviders, generatedImage);
  } catch (error) {
    console.error('Decoration design error:', error);
    return null;
  }
};

// Generate decoration image using Hugging Face Stable Diffusion
const generateDecorationImage = async (designFeatures) => {
  if (!process.env.HF_TOKEN) {
    console.log('HF_TOKEN not configured, skipping image generation');
    return null;
  }

  try {
    // Create refined prompt using Gemini analysis
    const refinedPrompt = await createImagePrompt(designFeatures);
    
    const response = await fetch(
      "https://router.huggingface.co/nscale/v1/images/generations",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          response_format: "b64_json",
          prompt: refinedPrompt,
          model: "stabilityai/stable-diffusion-xl-base-1.0",
          size: "512x512"
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.data && result.data[0] && result.data[0].b64_json) {
      return {
        success: true,
        imageData: result.data[0].b64_json,
        prompt: refinedPrompt
      };
    }
  } catch (error) {
    console.error('Image generation error:', error);
  }
  
  return null;
};

// Create refined image prompt using Gemini
const createImagePrompt = async (designFeatures) => {
  const { eventType, colors, style, elements } = designFeatures.features;
  
  const promptRequest = `Create a detailed image generation prompt for a ${style} ${eventType} decoration setup.

Design elements:
- Colors: ${colors.join(', ')}
- Style: ${style}
- Elements: ${elements.join(', ')}

Generate a professional photography prompt for Stable Diffusion that describes:
1. The overall scene and setup
2. Lighting and atmosphere
3. Specific decorative elements
4. Professional photography style

Keep it under 100 words and focus on visual details.`;

  try {
    const result = await callGemini('gemini-1.5-flash', {
      contents: [{ parts: [{ text: promptRequest }] }]
    });
    
    if (result.success && result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.data.candidates[0].content.parts[0].text.trim();
    }
  } catch (error) {
    console.error('Prompt generation error:', error);
  }
  
  // Fallback prompt
  return `${style} ${eventType} decoration stage with ${colors.join(' and ')} colors, featuring ${elements.join(', ')}, professional event photography, high quality, detailed`;
};

// Analyze decoration description using Gemini
const analyzeDecorationDescription = async (description) => {
  const prompt = `Analyze this event decoration description and extract key design elements:

Description: "${description}"

Extract:
1. Event type (wedding, birthday, corporate, anniversary, party)
2. Color scheme (list main colors)
3. Style (elegant, rustic, modern, traditional, luxury, minimal)
4. Key elements (flowers, drapes, lighting, stage, backdrop, etc.)
5. Theme/mood (royal, romantic, professional, fun, etc.)

Provide a structured analysis of the decoration requirements.`;

  const requestData = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const result = await callGemini('gemini-1.5-flash', requestData);
    
    if (result.success && result.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const analysisText = result.data.candidates[0].content.parts[0].text;
      const features = extractDesignFeatures(analysisText);
      
      return {
        success: true,
        description: analysisText,
        features,
        originalRequest: description
      };
    }
  } catch (error) {
    console.error('Design analysis error:', error);
  }
  
  return { success: false };
};

// Extract design features from analysis
const extractDesignFeatures = (analysisText) => {
  const lowerText = analysisText.toLowerCase();
  
  const eventTypes = ['wedding', 'birthday', 'corporate', 'anniversary', 'party'];
  const colors = ['red', 'blue', 'green', 'yellow', 'pink', 'purple', 'gold', 'silver', 'white', 'black', 'orange', 'rose'];
  const styles = ['elegant', 'rustic', 'modern', 'traditional', 'luxury', 'minimal', 'royal', 'romantic'];
  const elements = ['flowers', 'drapes', 'lighting', 'stage', 'backdrop', 'chandelier', 'arch', 'candles'];
  
  return {
    eventType: eventTypes.find(type => lowerText.includes(type)) || 'wedding',
    colors: colors.filter(color => lowerText.includes(color)),
    style: styles.find(style => lowerText.includes(style)) || 'elegant',
    elements: elements.filter(element => lowerText.includes(element)),
    analysisText
  };
};

// Find providers that match the design requirements
const findProvidersForDesign = async (designFeatures) => {
  try {
    const { eventType, colors, style, elements } = designFeatures.features;
    
    // Create search terms from design features
    const searchTerms = [
      eventType,
      style,
      ...colors,
      ...elements
    ].filter(Boolean);
    
    const providers = await Provider.find({
      $or: [
        { categories: eventType },
        { description: new RegExp(searchTerms.join('|'), 'i') },
        { businessName: new RegExp(style, 'i') }
      ],
      isActive: true
    })
    .select('name businessName rating totalReviews location.city profileImage categories description')
    .sort({ rating: -1, totalReviews: -1 });

    return providers.map(provider => ({
      id: provider._id,
      name: provider.businessName || provider.name,
      rating: provider.rating || 0,
      reviews: provider.totalReviews || 0,
      location: provider.location?.city || 'Location not set',
      image: provider.profileImage ? `http://localhost:5000/${provider.profileImage.replace(/\\/g, '/')}` : null,
      categories: provider.categories,
      description: provider.description
    }));
  } catch (error) {
    console.error('Provider search error:', error);
    return [];
  }
};

// Format response for decoration design
const formatDecorationDesignResponse = (designFeatures, providers, generatedImage) => {
  const { eventType, colors, style, elements } = designFeatures.features;
  
  // Create design summary
  let designSummary = `🎨 **Your ${style} ${eventType} decoration design:**\n` +
    `🎨 Style: ${style}\n` +
    (colors.length > 0 ? `🌈 Colors: ${colors.join(', ')}\n` : '') +
    (elements.length > 0 ? `✨ Elements: ${elements.join(', ')}\n` : '');

  // Add image generation status
  if (generatedImage && generatedImage.success) {
    designSummary += `\n🖼️ **AI-Generated Mockup:** Created based on your description!`;
  }

  if (providers.length === 0) {
    return {
      response: `${designSummary}\n\n🔍 I couldn't find providers specializing in this exact style in our database.\n\n💡 **Let me help you:**\n• Try a different decoration style\n• Browse all wedding decorators\n• Contact our team for custom decoration services\n\nWould you like me to suggest similar decoration themes?`,
      suggestions: ['Browse Wedding Decorators', 'Try Different Style', 'Contact Custom Team'],
      data: { 
        providers: [], 
        type: 'decoration_design', 
        designFeatures,
        generatedImage 
      }
    };
  }

  const providerText = providers.map((provider, i) => 
    `${i + 1}. **${provider.name}**\n   ⭐ ${provider.rating}/5 (${provider.reviews} reviews)\n   📍 ${provider.location}\n   🏷️ Specializes in: ${provider.categories?.join(', ') || 'Event decoration'}`
  ).join('\n\n');

  const providerWord = providers.length === 1 ? 'decorator' : 'decorators';

  return {
    response: `${designSummary}\n\n🎆 **Perfect! Found ${providers.length} ${providerWord} who can create this design:**\n\n${providerText}\n\n💡 Would you like me to connect you with any of these decorators?`,
    suggestions: ['Connect with Decorator', 'View Full Profile', 'Design Something Else'],
    data: { 
      providers, 
      type: 'decoration_design', 
      designFeatures,
      generatedImage 
    }
  };
};

// Test Gemini API connection
export const testGeminiAPI = async (req, res) => {
  try {
    const testMessage = "Hello, can you help me plan a wedding?";
    const result = await getGeminiResponse(testMessage, {});
    
    res.json({
      success: result.success,
      message: result.success ? 'Gemini API is working' : 'Gemini API test failed',
      data: result.success ? { response: result.response } : { error: result.error }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gemini API test failed',
      error: error.message
    });
  }
};

// Debug function to check database providers
export const debugProviders = async (req, res) => {
  try {
    const totalProviders = await Provider.countDocuments();
    const activeProviders = await Provider.countDocuments({ isActive: true });
    const verifiedProviders = await Provider.countDocuments({ isVerified: true });
    
    const sampleProviders = await Provider.find()
      .select('name businessName isActive isVerified categories')
      .limit(5);
    
    // Check Follow and Review collections
    const totalFollows = await Follow.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    const sampleFollows = await Follow.find()
      .populate('customerId', 'name')
      .populate('providerId', 'businessName')
      .limit(3);
      
    const sampleReviews = await Review.find()
      .populate('customerId', 'name')
      .populate('providerId', 'businessName')
      .limit(3);
    
    res.json({
      success: true,
      data: {
        totalProviders,
        activeProviders,
        verifiedProviders,
        sampleProviders,
        totalFollows,
        totalReviews,
        sampleFollows,
        sampleReviews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Debug failed',
      error: error.message
    });
  }
};