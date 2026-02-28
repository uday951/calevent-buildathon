import OpenAI from 'openai';
import Provider from '../models/Provider.js';
import Event from '../models/EventModel.js';

// Initialize OpenAI client
let openai = null;

const getOpenAIClient = () => {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    openai = new OpenAI({ apiKey });
  }
  return openai;
};

// Chat endpoint - handles text/chat queries
// Send image request to provider
export const sendImageRequestToProvider = async (req, res) => {
  try {
    const { providerId, generatedImage, imagePrompt, eventDetails, customerMessage } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Import ImageRequest model
    const ImageRequest = (await import('../models/ImageRequest.js')).default;

    const imageRequest = new ImageRequest({
      customerId,
      providerId,
      generatedImage,
      imagePrompt,
      eventType: eventDetails?.eventType || 'wedding',
      eventDetails,
      customerMessage,
      status: 'pending'
    });

    await imageRequest.save();

    res.json({
      success: true,
      data: {
        requestId: imageRequest._id,
        message: 'Request sent to provider successfully! They will respond within 24 hours.'
      }
    });

  } catch (error) {
    console.error('Send image request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send request',
      error: error.message
    });
  }
};

export const handleChatMessage = async (req, res) => {
  try {
    const { message, context = {}, conversationHistory = [] } = req.body;
    
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

    // Check for context-aware responses (yes/no, follow-ups)
    const contextResponse = await getContextAwareResponse(userMessage, conversationHistory, context);
    if (contextResponse) {
      response = contextResponse.response;
      suggestions = contextResponse.suggestions || [];
      data = contextResponse.data || null;
    }
    // Check for custom responses
    else {
      const customResponse = await getCustomResponse(userMessage, context);
      if (customResponse) {
        response = customResponse.response;
        suggestions = customResponse.suggestions || [];
        data = customResponse.data || null;
      } else {
        // Use OpenAI for natural responses
        const aiResponse = await getAIResponse(message, context);
        if (aiResponse.success) {
          response = aiResponse.response;
          suggestions = ['Find Events', 'Contact Support', 'Browse Providers'];
        } else {
          response = "🎉 **Welcome to CALEVENT!** I'm your AI assistant.\\n\\n✨ I can help you with:\\n• 💒 Wedding planning & venues\\n• 🏢 Corporate events & conferences\\n• 🎂 Birthday parties & celebrations\\n• 💰 Pricing & quotes\\n• 📞 Contact information";
          suggestions = ['Find Events', 'Contact Support', 'Browse Providers'];
        }
      }
    }

    res.json({
      success: true,
      data: {
        response,
        suggestions,
        data,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.',
      error: error.message
    });
  }
};

// Image generation endpoint
export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('🎨 Generating image with Hugging Face...');
    const hfResult = await tryHuggingFaceImage(prompt);
    
    if (hfResult && hfResult.success) {
      console.log('✅ Hugging Face image generated successfully');
      
      return res.json({
        success: true,
        data: {
          image: hfResult.imageData,
          prompt: prompt,
          source: 'Hugging Face',
          created: new Date().toISOString()
        }
      });
    }

    console.log('❌ Image generation failed');
    res.status(500).json({
      success: false,
      message: 'Image generation failed. Please try again later.',
      prompt: prompt
    });

  } catch (error) {
    console.error('❌ Image generation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to generate image',
      error: error.message
    });
  }
};

// Handle image analysis with provider matching
export const handleImageAnalysis = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    // Extract event type from analysis or default to wedding
    const eventType = 'wedding'; // Could be enhanced with AI analysis
    const location = 'Mumbai'; // Could be from user profile
    
    // Find matching providers
    console.log(`🔍 Finding providers for: ${eventType} in ${location}`);
    
    // Debug: Check all providers first
    const allProviders = await Provider.find({ isActive: true }).select('name businessName categories location.city');
    console.log('📊 Total active providers in DB:', allProviders.length);
    
    const providers = await findMatchingProviders(eventType, location);
    console.log(`✅ Found providers: ${providers.length}`);
    
    res.json({
      success: true,
      data: {
        response: `I can see your image! This looks like a great decoration setup.\\n\\n🔍 **Finding providers for: ${eventType} in ${location}**\\n✅ **Found ${providers.length} matching providers** who can create similar setups!`,
        suggestions: providers.length > 0 ? ["Connect with Providers", "View Profiles", "Get Quotes"] : ["Browse Events", "Try Different Location", "Contact Support"],
        data: {
          type: 'image_analysis_with_providers',
          providers,
          eventType,
          location
        }
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

// Test OpenAI API
export const testOpenAIAPI = async (req, res) => {
  try {
    const testMessage = "Hello, can you help me plan a wedding?";
    const result = await getAIResponse(testMessage, {});
    
    res.json({
      success: result.success,
      message: result.success ? 'AI system working' : 'AI services failed',
      data: result.success ? { response: result.response } : { error: result.error }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'AI system test failed',
      error: error.message
    });
  }
};

// AI response function using the same AI service as AI Dashboard
const getAIResponse = async (message, context) => {
  try {
    const { callAIService } = await import('../services/aiService.js');
    
    const prompt = `You are EVO, a friendly and conversational AI assistant for CALEVENT event booking platform. 

User message: ${message}

Respond naturally and helpfully about events, weddings, corporate events, and birthday parties. Be conversational, friendly, and keep responses under 150 words. Use emojis appropriately.`;

    const aiResponse = await callAIService('text-generation', {
      prompt,
      maxTokens: 150
    });

    if (aiResponse.success) {
      return {
        success: true,
        response: aiResponse.data
      };
    }

    return { success: false, error: aiResponse.error || 'AI service failed' };

  } catch (error) {
    console.error('AI service failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Handle context-aware responses for follow-up questions
const getContextAwareResponse = async (message, conversationHistory, context) => {
  if (!conversationHistory || conversationHistory.length === 0) {
    return null;
  }

  const lastBotMessage = conversationHistory
    .filter(msg => msg.sender === 'bot')
    .pop();

  if (!lastBotMessage) return null;

  const userMessage = message.toLowerCase().trim();
  const lastResponse = lastBotMessage.text.toLowerCase();

  // Handle yes/no responses
  if (userMessage.match(/^(yes|yeah|yep|sure|ok|okay|y)$/)) {
    // If bot asked about showing weddings
    if (lastResponse.includes('wedding') && (lastResponse.includes('show') || lastResponse.includes('display'))) {
      const events = await getEventsByCategory('wedding', 6);
      return {
        response: `🎉 Here are beautiful wedding events for you! ✨\n\nFound ${events.length} amazing wedding options:`,
        suggestions: ['Wedding Venues', 'Wedding Photographers', 'Get Quote'],
        data: { events, category: 'wedding', type: 'event_showcase' }
      };
    }
    
    // If bot asked about corporate events
    if (lastResponse.includes('corporate') && (lastResponse.includes('show') || lastResponse.includes('display'))) {
      const events = await getEventsByCategory('corporate', 6);
      return {
        response: "🏢 **Professional Corporate Events** 💼\n\nFound amazing business event options:",
        suggestions: ['Conference Venues', 'Team Building', 'Get Quote'],
        data: { events, category: 'corporate', type: 'event_showcase' }
      };
    }
    
    // If bot asked about birthday parties
    if (lastResponse.includes('birthday') && (lastResponse.includes('show') || lastResponse.includes('display'))) {
      const events = await getEventsByCategory('birthday', 6);
      return {
        response: "🎂 **Amazing Birthday Celebrations** 🎈\n\nMake your special day unforgettable:",
        suggestions: ['Birthday Venues', 'Party Planners', 'Get Quote'],
        data: { events, category: 'birthday', type: 'event_showcase' }
      };
    }
    
    // If bot asked about generating/creating images
    if (lastResponse.includes('generate') || lastResponse.includes('create') || lastResponse.includes('design')) {
      return {
        response: "🎨 Great! Please describe what you'd like me to create:\n\nFor example:\n• 'Blue birthday stage with flowers and balloons'\n• 'Elegant wedding decoration with gold and red'\n• 'Modern corporate event setup'\n\nJust tell me your vision and I'll generate it for you!",
        suggestions: ['Wedding Design', 'Birthday Setup', 'Corporate Design']
      };
    }
    
    // If bot offered to find providers (image analysis follow-up)
    if (lastResponse.includes('find similar providers') || lastResponse.includes('help you find') || lastResponse.includes('decoration setup')) {
      const providers = await findMatchingProviders('wedding', 'Mumbai');
    console.log(`✅ Found providers for image analysis: ${providers.length}`);
      return {
        response: "🎨 **Perfect! Here are top decoration providers who can create similar setups:**\n\nThese experts specialize in event decoration and can bring your vision to life!",
        suggestions: ['View Profiles', 'Get Quotes', 'Contact Providers'],
        data: { providers, type: 'provider_list' }
      };
    }
  }
  
  // Handle no responses
  if (userMessage.match(/^(no|nope|not now|maybe later|n)$/)) {
    return {
      response: "No problem! 😊 What else can I help you with today?\n\n✨ I can assist you with:\n• Finding events and venues\n• Connecting with providers\n• Creating custom designs\n• Getting pricing information",
      suggestions: ['Find Events', 'Contact Support', 'Browse Providers']
    };
  }
  
  return null;
};

// Custom responses for common queries with website control
const getCustomResponse = async (message, context) => {
  try {
    const { user } = context;
    
    // Website navigation and control
    if (message.includes('home') || message.includes('dashboard')) {
      return {
        response: "🏠 **Taking you to the homepage!**\n\nYou'll find featured events, trending providers, and personalized recommendations there.",
        suggestions: ['Browse Events', 'Find Providers', 'View Profile'],
        actions: ['navigate'],
        navigation: { page: 'home' }
      };
    }
    
    if (message.includes('profile') || message.includes('my account')) {
      return {
        response: "👤 **Redirecting to your profile!**\n\nManage your bookings, preferences, and account settings.",
        suggestions: ['Edit Profile', 'View Bookings', 'Settings'],
        actions: ['navigate'],
        navigation: { page: 'profile' }
      };
    }
    
    if (message.includes('booking') || message.includes('my booking')) {
      return {
        response: "📅 **Opening your bookings!**\n\nView all your event bookings, status updates, and payment history.",
        suggestions: ['Active Bookings', 'Booking History', 'Cancel Booking'],
        actions: ['navigate'],
        navigation: { page: 'bookings' }
      };
    }
    
    // Personalized recommendations based on user data
    if (message.includes('recommend') || message.includes('suggest') || message.includes('for me')) {
      return await getPersonalizedRecommendations(user);
    }
    
    // Location-based queries
    if (message.includes('near me') || message.includes('in my area') || message.includes('location')) {
      return await getLocationBasedEvents(user);
    }
    
    // Budget-based queries
    if (message.includes('budget') || message.includes('cheap') || message.includes('affordable') || message.includes('price range')) {
      return await getBudgetFriendlyEvents(user);
    }
    
    // Trending and popular content
    if (message.includes('trending') || message.includes('popular') || message.includes('best')) {
      return await getTrendingContent();
    }
    
    // Image generation requests
    if (message.includes('design') || message.includes('create') || message.includes('generate') || 
        message.includes('make') || message.includes('image') || message.includes('picture')) {
      console.log('🎨 Processing image generation request:', message);
      const designResponse = await handleDecorationDesign(message);
      if (designResponse) {
        return designResponse;
      }
    }

    // Event queries with personalization
    if (message.includes('wedding') || message.includes('show') && message.includes('wedding')) {
      const events = await getPersonalizedEvents('wedding', user, 6);
      return {
        response: `💒 **Personalized Wedding Recommendations!** ✨\n\nBased on your preferences, here are ${events.length} perfect wedding options:`,
        suggestions: ['Wedding Venues', 'Wedding Photographers', 'Get Quote'],
        data: { events, category: 'wedding', type: 'event_showcase' }
      };
    }

    if (message.includes('corporate') || message.includes('business')) {
      const events = await getPersonalizedEvents('corporate', user, 6);
      return {
        response: "🏢 **Corporate Events Tailored for You!** 💼\n\nProfessional events matching your business needs:",
        suggestions: ['Conference Venues', 'Team Building', 'Get Quote'],
        data: { events, category: 'corporate', type: 'event_showcase' }
      };
    }

    if (message.includes('birthday')) {
      const events = await getPersonalizedEvents('birthday', user, 6);
      return {
        response: "🎂 **Birthday Celebrations Just for You!** 🎈\n\nPersonalized party options based on your style:",
        suggestions: ['Birthday Venues', 'Party Planners', 'Get Quote'],
        data: { events, category: 'birthday', type: 'event_showcase' }
      };
    }
    
    // Combo events and packages
    if (message.includes('combo') || message.includes('package') || message.includes('bundle')) {
      const comboPackages = await getComboPackages(user);
      return {
        response: "🎁 **Amazing Combo Packages!** ✨\n\nSave more with our bundled event services - everything you need in one package:",
        suggestions: ['Wedding Combos', 'Corporate Packages', 'Birthday Bundles'],
        data: { events: comboPackages, type: 'combo_showcase' }
      };
    }
    
    // Help and support
    if (message.includes('help') || message.includes('support') || message.includes('contact')) {
      return {
        response: "🆘 **I'm here to help!**\n\n📞 Contact Support: +91 9876543210\n📧 Email: support@calevent.com\n💬 Live Chat: Available 24/7\n\n**I can help you with:**\n• Finding perfect events\n• Booking assistance\n• Payment issues\n• Account management",
        suggestions: ['Call Support', 'Email Support', 'FAQ']
      };
    }

    return null;
  } catch (error) {
    console.error('Custom response error:', error);
    return null;
  }
};

// Handle decoration design requests with provider matching
const handleDecorationDesign = async (message) => {
  try {
    // Extract event type and location from message
    const eventType = extractEventType(message);
    const location = extractLocation(message) || 'Mumbai';
    
    const prompt = `elegant ${eventType} decoration setup based on: ${message}`;
    console.log('🎨 Generating decoration image with prompt:', prompt);
    
    const generatedImage = await tryHuggingFaceImage(prompt);
    
    // Find matching providers
    console.log(`🔍 Finding providers for: ${eventType} in ${location}`);
    
    // First, let's check what providers exist in the database
    const allProviders = await Provider.find({ isActive: true }).select('name businessName categories location.city');
    console.log('📊 Total active providers in DB:', allProviders.length);
    console.log('📋 All providers:', allProviders.map(p => ({ 
      name: p.businessName, 
      categories: p.categories, 
      city: p.location?.city 
    })));
    
    const providers = await findMatchingProviders(eventType, location);
    console.log(`✅ Found providers: ${providers.length}`);
    
    if (generatedImage && generatedImage.success) {
      const locationText = providers.length > 0 && providers[0].location !== 'Location not specified' 
        ? `in ${location}` 
        : 'available';
      
      return {
        response: `🎨 **I've created a decoration design for you!**\\n\\n✨ Based on your description, here's a beautiful setup concept.\\n\\n🔍 **Finding providers for: ${eventType} ${locationText}**\\n✅ **Found ${providers.length} matching providers** who can create this design!`,
        suggestions: providers.length > 0 ? ['Connect with Providers', 'View Profiles', 'Get Quotes'] : ['Browse More Designs', 'Contact Support', 'View All Providers'],
        data: { 
          type: 'decoration_design_with_providers',
          generatedImage,
          providers,
          eventType,
          location,
          imagePrompt: prompt
        }
      };
    }

    return {
      response: "🎨 I'd love to help you design your decoration! Could you describe what you have in mind?\\n\\nFor example: 'elegant wedding stage with red and gold colors in Mumbai'",
      suggestions: ['Wedding Decoration', 'Birthday Setup', 'Corporate Design']
    };
  } catch (error) {
    console.error('Decoration design error:', error);
    return null;
  }
};

// Extract event type from message
const extractEventType = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('wedding') || msg.includes('marriage') || msg.includes('bride')) return 'wedding';
  if (msg.includes('birthday') || msg.includes('party') || msg.includes('celebration')) return 'birthday';
  if (msg.includes('corporate') || msg.includes('business') || msg.includes('conference')) return 'corporate';
  if (msg.includes('anniversary')) return 'anniversary';
  return 'wedding'; // default
};

// Extract location from message
const extractLocation = (message) => {
  const msg = message.toLowerCase();
  const cities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad'];
  for (const city of cities) {
    if (msg.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  return null;
};

// Find matching providers
const findMatchingProviders = async (eventType, location) => {
  try {
    console.log('🔍 Query params:', { eventType, location });
    
    // First try with location filter
    let query = {
      isActive: true,
      categories: eventType
    };
    
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }
    
    console.log('📋 MongoDB query with location:', JSON.stringify(query, null, 2));
    
    let providers = await Provider.find(query)
      .select('name businessName categories rating location phone profileImage totalReviews')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(10);
    
    console.log('📊 Providers found with location filter:', providers.length);
    
    // If no providers found with location, try without location filter
    if (providers.length === 0 && location) {
      console.log('🔄 Trying without location filter...');
      query = {
        isActive: true,
        categories: eventType
      };
      
      providers = await Provider.find(query)
        .select('name businessName categories rating location phone profileImage totalReviews')
        .sort({ rating: -1, totalReviews: -1 })
        .limit(10);
      
      console.log('📊 Providers found without location filter:', providers.length);
    }
    
    console.log('📝 Final provider details:', providers.map(p => ({ 
      name: p.businessName, 
      categories: p.categories, 
      city: p.location?.city 
    })));
    
    return providers.map(p => ({
      id: p._id,
      name: p.businessName || p.name,
      categories: p.categories,
      rating: p.rating || 4.0,
      location: p.location?.city || 'Location not specified',
      image: p.profileImage,
      contact: p.phone
    }));
  } catch (error) {
    console.error('Find providers error:', error);
    return [];
  }
};

// Hugging Face image generation
const tryHuggingFaceImage = async (prompt) => {
  if (!process.env.HF_TOKEN) {
    return null;
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            num_inference_steps: 15,
            guidance_scale: 7.0
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HF API error: ${response.status}`);
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    
    return {
      success: true,
      imageData: base64Image,
      prompt: prompt
    };
  } catch (error) {
    console.error('❌ Hugging Face failed:', error.message);
  }
  
  return null;
};

// Get personalized recommendations
const getPersonalizedRecommendations = async (user) => {
  try {
    if (!user) {
      return {
        response: "🎯 **Sign in for personalized recommendations!**\n\nOnce you're logged in, I can suggest events based on:\n• Your booking history\n• Preferred locations\n• Budget range\n• Event types you love",
        suggestions: ['Sign In', 'Browse Events', 'Popular Events']
      };
    }
    
    const recommendations = await getPersonalizedEvents('mixed', user, 8);
    return {
      response: `🎯 **Personalized Just for You, ${user.name}!**\n\nBased on your preferences and booking history, here are my top recommendations:`,
      suggestions: ['View All', 'Refine Preferences', 'Book Now'],
      data: { events: recommendations, type: 'personalized_showcase' }
    };
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    return null;
  }
};

// Get location-based events
const getLocationBasedEvents = async (user) => {
  try {
    const userLocation = user?.location?.city || 'your area';
    const events = await Event.find({
      $or: [
        { 'location.city': new RegExp(userLocation, 'i') },
        { 'location.address': new RegExp(userLocation, 'i') }
      ],
      isActive: true
    }).limit(6);
    
    return {
      response: `📍 **Events Near You in ${userLocation}!**\n\nFound ${events.length} amazing events in your area:`,
      suggestions: ['View Map', 'Filter Distance', 'All Locations'],
      data: { events: events.map(formatEvent), type: 'location_showcase' }
    };
  } catch (error) {
    return {
      response: "📍 **Location-based events coming soon!**\n\nFor now, browse our featured events from all locations.",
      suggestions: ['Browse All Events', 'Set Location', 'Popular Events']
    };
  }
};

// Get budget-friendly events
const getBudgetFriendlyEvents = async (user) => {
  try {
    const maxBudget = user?.preferences?.budget || 50000;
    const events = await Event.find({
      price: { $lte: maxBudget },
      isActive: true
    })
    .sort({ price: 1 })
    .limit(6);
    
    return {
      response: `💰 **Budget-Friendly Events Under ₹${maxBudget.toLocaleString()}!**\n\nGreat value events that fit your budget:`,
      suggestions: ['Set Budget', 'Premium Events', 'Payment Plans'],
      data: { events: events.map(formatEvent), type: 'budget_showcase' }
    };
  } catch (error) {
    return {
      response: "💰 **Budget-friendly options available!**\n\nLet me know your budget range and I'll find perfect events for you.",
      suggestions: ['Under ₹25K', 'Under ₹50K', 'Under ₹1L']
    };
  }
};

// Get trending content
const getTrendingContent = async () => {
  try {
    const trendingEvents = await Event.find({ isActive: true })
      .sort({ views: -1, bookings: -1 })
      .limit(6);
    
    return {
      response: "🔥 **Trending Events Right Now!**\n\nMost popular events that everyone's talking about:",
      suggestions: ['View Trending', 'Popular Providers', 'Hot Deals'],
      data: { events: trendingEvents.map(formatEvent), type: 'trending_showcase' }
    };
  } catch (error) {
    return {
      response: "🔥 **Trending events loading...**\n\nCheck out our featured events while I fetch the latest trends!",
      suggestions: ['Featured Events', 'New Arrivals', 'Popular Categories']
    };
  }
};

// Get personalized events by category
const getPersonalizedEvents = async (category, user, limit = 6) => {
  try {
    let query = { isActive: true };
    
    if (category !== 'mixed') {
      query.category = category;
    }
    
    // Add user preferences to query if available
    if (user?.preferences?.budget) {
      query.price = { $lte: user.preferences.budget };
    }
    
    if (user?.location?.city) {
      query.$or = [
        { 'location.city': new RegExp(user.location.city, 'i') },
        query.$or || {}
      ];
    }
    
    const events = await Event.find(query)
      .populate('providerId', 'name businessName rating totalReviews')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit);
    
    return events.map(formatEvent);
  } catch (error) {
    console.error('Personalized events error:', error);
    return await getEventsByCategory(category === 'mixed' ? 'wedding' : category, limit);
  }
};

// Get combo packages
const getComboPackages = async (user) => {
  try {
    // Import ComboPackage model
    const ComboPackage = (await import('../models/ComboPackageModel.js')).default;
    
    const packages = await ComboPackage.find({ isActive: true })
      .populate('providers.providerId', 'name businessName rating totalReviews')
      .sort({ savingsPercent: -1, createdAt: -1 })
      .limit(6);
    
    return packages.map(pkg => ({
      id: pkg._id,
      title: pkg.title,
      description: pkg.description?.substring(0, 100) + '...',
      price: pkg.comboPrice,
      originalPrice: pkg.originalPrice,
      discount: pkg.savingsPercent,
      services: pkg.services?.map(s => s.name) || [],
      category: pkg.category,
      image: pkg.images?.[0] || '/images/combo/1.jpg',
      providers: pkg.providers?.map(p => ({
        name: p.providerId?.businessName || p.providerId?.name || p.name,
        rating: p.providerId?.rating || p.rating,
        service: p.service
      })) || [],
      savings: pkg.savings
    }));
  } catch (error) {
    console.error('Combo packages error:', error);
    // Fallback to regular events if combo model doesn't exist
    return [
      {
        id: 'combo1',
        title: 'Wedding Complete Package',
        description: 'Venue + Decoration + Catering + Photography - Everything included!',
        price: 150000,
        originalPrice: 200000,
        discount: 25,
        services: ['Venue', 'Decoration', 'Catering', 'Photography'],
        category: 'wedding',
        image: '/images/wedding/combo.jpg',
        providers: [{ name: 'Premium Weddings', rating: 4.8, service: 'Full Service' }],
        savings: 50000
      },
      {
        id: 'combo2', 
        title: 'Corporate Event Bundle',
        description: 'Conference Hall + AV Equipment + Catering + Team Activities',
        price: 80000,
        originalPrice: 100000,
        discount: 20,
        services: ['Venue', 'AV Equipment', 'Catering', 'Activities'],
        category: 'corporate',
        image: '/images/corporate/combo.jpg',
        providers: [{ name: 'Corporate Solutions', rating: 4.6, service: 'Business Events' }],
        savings: 20000
      },
      {
        id: 'combo3',
        title: 'Birthday Party Special',
        description: 'Venue + Decoration + Entertainment + Cake + Photography',
        price: 25000,
        originalPrice: 35000,
        discount: 28,
        services: ['Venue', 'Decoration', 'Entertainment', 'Cake'],
        category: 'birthday',
        image: '/images/birthday/combo.jpg',
        providers: [{ name: 'Party Planners', rating: 4.7, service: 'Birthday Events' }],
        savings: 10000
      }
    ];
  }
};

// Format event for consistent output
const formatEvent = (event) => ({
  id: event._id,
  title: event.title,
  description: event.description?.substring(0, 100) + '...',
  price: event.price,
  location: event.location?.city || event.location?.address || 'Location',
  image: event.images?.[0] || `/images/${event.category}/1.jpg`,
  category: event.category,
  provider: {
    name: event.providerId?.businessName || event.providerId?.name,
    rating: event.providerId?.rating
  }
});

// Get providers by category
const getProvidersByCategory = async (category, limit = 5) => {
  try {
    const providers = await Provider.find({
      categories: category, // Direct match since categories is an array
      isActive: true
    })
    .select('name businessName rating totalReviews location profileImage categories')
    .sort({ rating: -1, totalReviews: -1 })
    .limit(limit);

    console.log(`🔍 Found ${providers.length} providers for category: ${category}`);

    return providers.map(provider => ({
      id: provider._id,
      name: provider.businessName || provider.name,
      rating: provider.rating || 0,
      reviews: provider.totalReviews || 0,
      location: provider.location?.city || 'Location',
      image: provider.profileImage,
      categories: provider.categories
    }));
  } catch (error) {
    console.error('Get providers error:', error);
    return [];
  }
};

// Get events by category
const getEventsByCategory = async (category, limit = 6) => {
  try {
    const events = await Event.find({
      category: category,
      isActive: true
    })
    .populate('providerId', 'name businessName rating totalReviews')
    .select('title description price location images category')
    .sort({ createdAt: -1 })
    .limit(limit);

    return events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description?.substring(0, 100) + '...',
      price: event.price,
      location: event.location?.city || event.location?.address || 'Location',
      image: event.images?.[0] || `/images/${category}/1.jpg`,
      category: event.category,
      provider: {
        name: event.providerId?.businessName || event.providerId?.name,
        rating: event.providerId?.rating
      }
    }));
  } catch (error) {
    console.error('Get events error:', error);
    return [];
  }
};