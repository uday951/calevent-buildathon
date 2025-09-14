import OpenAI from 'openai';
import Provider from '../models/Provider.js';
import Event from '../models/EventModel.js';
import Follow from '../models/Follow.js';
import Review from '../models/Review.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

// Chat endpoint - handles text/chat queries
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
      // Use OpenAI GPT for natural responses
      const aiResponse = await getOpenAIResponse(message, context);
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

// Image generation endpoint - uses DALL·E
export const generateImage = async (req, res) => {
  try {
    const { prompt, size = '512x512', n = 1, response_format = 'url' } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    // Validate size parameter
    const validSizes = ['256x256', '512x512', '1024x1024'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid size. Must be one of: 256x256, 512x512, 1024x1024'
      });
    }

    // Validate response format
    const validFormats = ['url', 'b64_json'];
    if (!validFormats.includes(response_format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid response_format. Must be "url" or "b64_json"'
      });
    }

    // Generate image with DALL·E
    const response = await openai.images.generate({
      model: "dall-e-3", // Use DALL·E 3 for better quality
      prompt: prompt,
      n: Math.min(n, 1), // DALL·E 3 only supports n=1
      size: size,
      response_format: response_format,
      quality: "standard" // or "hd" for higher quality
    });

    res.json({
      success: true,
      data: {
        images: response.data,
        prompt: prompt,
        size: size,
        created: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'content_policy_violation') {
      return res.status(400).json({
        success: false,
        message: 'The prompt violates OpenAI content policy. Please try a different description.'
      });
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate image',
      error: error.message
    });
  }
};

// Handle image upload for decoration matching with OpenAI Vision
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
    
    // Analyze image with OpenAI Vision
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

// Get response from OpenAI GPT
const getOpenAIResponse = async (message, context) => {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'OpenAI API key not configured' };
  }

  try {
    const systemPrompt = `You are CALEVENT AI Assistant, a helpful and friendly chatbot for an event booking platform.

About CALEVENT: We help customers find and book event services like weddings, corporate events, birthday parties, conferences, etc. We connect customers with verified service providers across India.

Instructions:
- Be conversational, helpful, and enthusiastic about events
- Use emojis appropriately to make responses engaging  
- Keep responses under 150 words but informative
- If asked about specific events, suggest they use commands like "show weddings"
- For bookings, guide them through our platform features
- Always end with a helpful question or suggestion

Respond as the friendly CALEVENT AI Assistant.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Use GPT-4o for better performance
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 200,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    if (completion.choices && completion.choices[0] && completion.choices[0].message) {
      return {
        success: true,
        response: completion.choices[0].message.content.trim()
      };
    }

    return { success: false, error: 'No response generated' };

  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'rate_limit_exceeded') {
      return { success: false, error: 'Rate limit exceeded. Please try again in a moment.' };
    }
    
    if (error.code === 'insufficient_quota') {
      return { success: false, error: 'API quota exceeded. Please contact support.' };
    }

    return { 
      success: false, 
      error: 'I\'m having trouble connecting right now. Try asking: "show weddings", "corporate events", or "contact support".' 
    };
  }
};

// Analyze decoration image with OpenAI Vision
const analyzeDecorationImage = async (base64Image) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // GPT-4o has vision capabilities
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this event decoration image and extract key features:
1. Main colors (list 2-3 dominant colors)
2. Decoration style (elegant, rustic, modern, traditional, etc.)
3. Event type (wedding, birthday, corporate, etc.)
4. Key objects/elements (flowers, drapes, lights, etc.)
5. Theme description (1-2 words)

Provide a brief description and categorize the style.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "low" // Use "low" for faster processing, "high" for more detail
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    if (response.choices && response.choices[0] && response.choices[0].message) {
      const analysisText = response.choices[0].message.content;
      const features = extractFeaturesFromAnalysis(analysisText);
      
      return {
        success: true,
        description: analysisText.split('\n')[0] || 'Beautiful decoration setup',
        features
      };
    }

    return { success: false };

  } catch (error) {
    console.error('OpenAI Vision error:', error);
    return { success: false };
  }
};

// Generate decoration image using DALL·E
const generateDecorationImage = async (designFeatures) => {
  try {
    const { eventType, colors, style, elements } = designFeatures.features;
    
    // Create refined prompt
    const prompt = `${style} ${eventType} decoration setup with ${colors.join(' and ')} colors, featuring ${elements.join(', ')}, professional event photography, high quality, detailed, elegant lighting`;

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json",
      quality: "standard"
    });

    if (response.data && response.data[0]) {
      return {
        success: true,
        imageData: response.data[0].b64_json,
        prompt: prompt
      };
    }

    return null;

  } catch (error) {
    console.error('DALL·E image generation error:', error);
    return null;
  }
};

// Get custom response for common queries (same as before)
const getCustomResponse = async (message, context) => {
  try {
    // Greeting detection
    if (message.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      return {
        response: customResponses.greeting[Math.floor(Math.random() * customResponses.greeting.length)],
        suggestions: quickReplies.main
      };
    }

    // Decoration design requests
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

    // Contact, booking, pricing, location queries (same as before)
    if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('support')) {
      return {
        response: customResponses.contact,
        suggestions: quickReplies.main
      };
    }

    if (message.includes('book') || message.includes('booking') || message.includes('reserve')) {
      return {
        response: customResponses.booking,
        suggestions: quickReplies.main
      };
    }

    if (message.includes('price') || message.includes('cost') || message.includes('quote') || message.includes('budget')) {
      return {
        response: customResponses.pricing,
        suggestions: quickReplies.main
      };
    }

    if (message.includes('location') || message.includes('city') || message.includes('where')) {
      return {
        response: customResponses.location,
        suggestions: quickReplies.main
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

// Handle decoration design requests using OpenAI
const handleDecorationDesign = async (message) => {
  try {
    // Extract design features from user description using OpenAI
    const designFeatures = await analyzeDecorationDescription(message);
    
    if (!designFeatures.success) {
      return {
        response: "🎨 I'd love to help you design your decoration! Could you describe it in more detail?\n\nFor example: 'I want a royal wedding stage with red drapes and golden lighting'\n\nTell me about:\n• Event type (wedding, birthday, corporate)\n• Colors you prefer\n• Style (elegant, rustic, modern)\n• Special elements (flowers, lights, drapes)",
        suggestions: ['Wedding Decoration', 'Birthday Setup', 'Corporate Event Design']
      };
    }

    // Generate AI image based on design using DALL·E
    const generatedImage = await generateDecorationImage(designFeatures);
    
    // Find matching providers based on design
    const matchingProviders = await findProvidersForDesign(designFeatures);
    
    return formatDecorationDesignResponse(designFeatures, matchingProviders, generatedImage);
  } catch (error) {
    console.error('Decoration design error:', error);
    return null;
  }
};

// Analyze decoration description using OpenAI
const analyzeDecorationDescription = async (description) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert event decorator analyzer. Extract key design elements from decoration descriptions."
        },
        {
          role: "user",
          content: `Analyze this event decoration description and extract key design elements:

Description: "${description}"

Extract:
1. Event type (wedding, birthday, corporate, anniversary, party)
2. Color scheme (list main colors)
3. Style (elegant, rustic, modern, traditional, luxury, minimal)
4. Key elements (flowers, drapes, lighting, stage, backdrop, etc.)
5. Theme/mood (royal, romantic, professional, fun, etc.)

Provide a structured analysis of the decoration requirements.`
        }
      ],
      max_tokens: 300,
      temperature: 0.3
    });

    if (response.choices && response.choices[0] && response.choices[0].message) {
      const analysisText = response.choices[0].message.content;
      const features = extractDesignFeatures(analysisText);
      
      return {
        success: true,
        description: analysisText,
        features,
        originalRequest: description
      };
    }

    return { success: false };

  } catch (error) {
    console.error('Design analysis error:', error);
    return { success: false };
  }
};

// Test OpenAI API connection
export const testOpenAIAPI = async (req, res) => {
  try {
    const testMessage = "Hello, can you help me plan a wedding?";
    const result = await getOpenAIResponse(testMessage, {});
    
    res.json({
      success: result.success,
      message: result.success ? 'OpenAI API is working' : 'OpenAI API test failed',
      data: result.success ? { response: result.response } : { error: result.error }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'OpenAI API test failed',
      error: error.message
    });
  }
};

// Utility functions (same as before)
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

const searchProviders = async (query) => {
  try {
    let searchFilter = { isActive: true };
    
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

const findProvidersForDesign = async (designFeatures) => {
  try {
    const { eventType, colors, style, elements } = designFeatures.features;
    
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

const formatDecorationDesignResponse = (designFeatures, providers, generatedImage) => {
  const { eventType, colors, style, elements } = designFeatures.features;
  
  let designSummary = `🎨 **Your ${style} ${eventType} decoration design:**\n` +
    `🎨 Style: ${style}\n` +
    (colors.length > 0 ? `🌈 Colors: ${colors.join(', ')}\n` : '') +
    (elements.length > 0 ? `✨ Elements: ${elements.join(', ')}\n` : '');

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