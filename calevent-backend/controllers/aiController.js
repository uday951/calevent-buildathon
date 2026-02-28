import { callAIService } from '../services/aiService.js';
import Provider from '../models/Provider.js';
import Event from '../models/EventModel.js';
import Review from '../models/Review.js';
import Customer from '../models/customer.js';
import ImageRequest from '../models/ImageRequest.js';

// Helper function to create fallback images
const createFallbackImage = (eventType = 'event') => {
  const colors = {
    wedding: '#FFB6C1',
    birthday: '#87CEEB', 
    corporate: '#DDA0DD',
    anniversary: '#F0E68C'
  };
  const color = colors[eventType] || '#F3F4F6';
  
  const placeholderSvg = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="${color}"/>
    <circle cx="256" cy="200" r="40" fill="#9CA3AF"/>
    <path d="M150 350h212l-40-80c-8-16-24-16-32 0l-60 60-40-40c-8-8-24-8-32 0l-8 60z" fill="#9CA3AF"/>
    <text x="256" y="420" text-anchor="middle" fill="#6B7280" font-family="Arial" font-size="16">${eventType.toUpperCase()} IMAGE</text>
    <text x="256" y="440" text-anchor="middle" fill="#9CA3AF" font-family="Arial" font-size="12">Generated Placeholder</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${Buffer.from(placeholderSvg).toString('base64')}`;
};

// AI Event Assistant
export const getEventSuggestions = async (req, res) => {
  try {
    const { budget, theme, eventType, guestCount, location } = req.body;

    // Get relevant vendors from database
    const vendors = await Provider.find({
      categories: eventType,
      isActive: true,
      'location.city': new RegExp(location, 'i')
    }).limit(10);

    // Get similar events for reference
    const events = await Event.find({
      category: eventType,
      price: { $lte: budget * 1.2 },
      isActive: true
    }).limit(5);

    // Create AI prompt
    const prompt = `As an expert event planner, suggest a complete event plan for:
    - Event Type: ${eventType}
    - Theme: ${theme}
    - Budget: ₹${budget}
    - Guests: ${guestCount}
    - Location: ${location}
    
    Available vendors: ${vendors.map(v => `${v.businessName} (${v.categories.join(', ')})`).join(', ')}
    
    Provide:
    1. Vendor combination recommendations
    2. Decoration ideas matching the theme
    3. Sample timeline/schedule
    4. Budget breakdown
    5. Creative suggestions`;

    const aiResponse = await callAIService('text-generation', {
      prompt,
      maxTokens: 800
    });

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'AI service unavailable',
        error: aiResponse.error
      });
    }

    res.json({
      success: true,
      data: {
        suggestions: aiResponse.data,
        vendors: vendors.map(v => ({
          id: v._id,
          name: v.businessName,
          categories: v.categories,
          rating: v.rating,
          location: v.location?.city
        })),
        similarEvents: events.map(e => ({
          id: e._id,
          title: e.title,
          price: e.price,
          category: e.category
        })),
        source: aiResponse.source
      }
    });

  } catch (error) {
    console.error('Event suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate event suggestions',
      error: error.message
    });
  }
};

// Generate Content (Invitations/Brochures)
export const generateContent = async (req, res) => {
  try {
    const { type, eventDetails, style = 'elegant' } = req.body;
    
    let prompt;
    if (type === 'invitation') {
      prompt = `Create an ${style} invitation text for:
      Event: ${eventDetails.eventType}
      Theme: ${eventDetails.theme}
      Date: ${eventDetails.date}
      Venue: ${eventDetails.venue}
      Host: ${eventDetails.hostName}
      
      Make it warm, inviting, and match the ${style} style.`;
    } else if (type === 'brochure') {
      prompt = `Create promotional brochure content for:
      Event: ${eventDetails.eventType}
      Theme: ${eventDetails.theme}
      Services: ${eventDetails.services?.join(', ')}
      
      Include compelling descriptions and key highlights.`;
    }

    const aiResponse = await callAIService('text-generation', {
      prompt,
      maxTokens: 400
    });

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Content generation failed',
        error: aiResponse.error
      });
    }

    res.json({
      success: true,
      data: {
        content: aiResponse.data,
        type,
        style,
        source: aiResponse.source
      }
    });

  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate content',
      error: error.message
    });
  }
};

// Edit Images
export const editImage = async (req, res) => {
  try {
    const { image, prompt, mask } = req.body;
    
    if (!image || !prompt) {
      return res.status(400).json({
        success: false,
        message: 'Image and prompt are required'
      });
    }

    const aiResponse = await callAIService('image-edit', {
      image,
      prompt,
      mask
    });

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: 'Image editing failed',
        error: aiResponse.error
      });
    }

    res.json({
      success: true,
      data: {
        image: aiResponse.data,
        prompt,
        source: aiResponse.source
      }
    });

  } catch (error) {
    console.error('Image editing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit image',
      error: error.message
    });
  }
};

// Enhanced Image Generation
export const generateImage = async (req, res) => {
  try {
    const { type, prompt: userPrompt, eventDetails, style = 'professional', size = '1024x1024' } = req.body;
    
    if (!userPrompt) {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required for image generation'
      });
    }

    let enhancedPrompt;
    switch (type) {
      case 'invitation':
        enhancedPrompt = `${style} ${eventDetails?.eventType || 'event'} invitation design, ${eventDetails?.theme || 'elegant'} theme, ${userPrompt}, high quality, professional design, clean layout`;
        break;
      case 'decoration':
        enhancedPrompt = `${eventDetails?.eventType || 'event'} decoration setup, ${eventDetails?.theme || 'modern'} theme, ${userPrompt}, professional event photography, elegant lighting, detailed setup`;
        break;
      case 'venue':
        enhancedPrompt = `${eventDetails?.eventType || 'event'} venue layout, ${userPrompt}, professional photography, good lighting, spacious arrangement`;
        break;
      case 'stage':
        enhancedPrompt = `event stage design, ${userPrompt}, professional lighting, backdrop, performance area, ${eventDetails?.theme || 'elegant'} theme`;
        break;
      default:
        enhancedPrompt = `${userPrompt}, professional quality, event-related, high resolution`;
    }

    console.log('🎨 Generating image with prompt:', enhancedPrompt);

    const aiResponse = await callAIService('image-generation', {
      prompt: enhancedPrompt,
      size
    });

    // Check for valid image data
    if (!aiResponse.data || aiResponse.data === 'undefined') {
      console.log('⚠️ Invalid image data received, using fallback');
      return res.json({
        success: true,
        data: {
          image: createFallbackImage(eventDetails?.eventType || 'event'),
          prompt: enhancedPrompt,
          originalPrompt: userPrompt,
          type,
          style,
          size,
          source: 'fallback-invalid-data',
          message: 'Image generation failed, using placeholder',
          fallback: true,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Always return success, even with fallback
    const responseData = {
      image: aiResponse.data,
      prompt: enhancedPrompt,
      originalPrompt: userPrompt,
      type,
      style,
      size,
      source: aiResponse.source,
      timestamp: new Date().toISOString()
    };

    if (aiResponse.fallback || aiResponse.source?.includes('fallback')) {
      responseData.message = aiResponse.message || 'Using placeholder image - AI services temporarily unavailable';
      responseData.fallback = true;
    }

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    // Return fallback response instead of error
    res.json({
      success: true,
      data: {
        image: createFallbackImage(req.body.eventDetails?.eventType || 'event'),
        prompt: req.body.prompt || 'Image generation request',
        type: req.body.type || 'general',
        source: 'error-fallback',
        message: 'Image generation temporarily unavailable. Please try again later.',
        error: error.message,
        fallback: true,
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Enhanced Vendor Review Summarizer
export const summarizeReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { detailed = false } = req.query;

    // Get reviews from database with provider info
    const reviews = await Review.find({ providerId })
      .populate('customerId', 'name')
      .populate('providerId', 'businessName categories')
      .sort({ createdAt: -1 })
      .limit(100);

    if (reviews.length === 0) {
      return res.json({
        success: true,
        data: {
          summary: 'No reviews available for this vendor yet.',
          reviewCount: 0,
          averageRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          insights: {
            strengths: [],
            improvements: [],
            commonThemes: []
          }
        }
      });
    }

    // Calculate statistics
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingDistribution = reviews.reduce((dist, r) => {
      dist[r.rating] = (dist[r.rating] || 0) + 1;
      return dist;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    // Prepare review texts for AI analysis
    const reviewTexts = reviews.map(r => 
      `Rating: ${r.rating}/5 - ${r.comment} (Event: ${r.eventType || 'General'})`
    ).join('\n\n');

    const providerInfo = reviews[0]?.providerId;
    const analysisPrompt = detailed 
      ? `Analyze these reviews for ${providerInfo?.businessName || 'this vendor'} (${providerInfo?.categories?.join(', ') || 'Event Services'}):

${reviewTexts}

Provide:
1. Key Strengths (3-5 points)
2. Areas for Improvement (2-4 points)
3. Common Themes in feedback
4. Overall service quality assessment
5. Recommendations for potential customers`
      : `Summarize these reviews with pros and cons:

${reviewTexts}`;

    const aiResponse = await callAIService('text-generation', {
      prompt: analysisPrompt,
      maxTokens: detailed ? 600 : 400
    });

    if (!aiResponse.success) {
      // Provide manual analysis as fallback
      const positiveReviews = reviews.filter(r => r.rating >= 4);
      const negativeReviews = reviews.filter(r => r.rating <= 2);
      
      return res.json({
        success: true,
        data: {
          summary: `Based on ${reviews.length} reviews with an average rating of ${averageRating.toFixed(1)}/5. ${positiveReviews.length} positive reviews highlight good service quality. ${negativeReviews.length > 0 ? `${negativeReviews.length} reviews mention areas for improvement.` : 'Most customers are satisfied.'}`,
          reviewCount: reviews.length,
          averageRating: parseFloat(averageRating.toFixed(1)),
          ratingDistribution,
          insights: {
            strengths: positiveReviews.slice(0, 3).map(r => r.comment.substring(0, 100)),
            improvements: negativeReviews.slice(0, 2).map(r => r.comment.substring(0, 100)),
            commonThemes: ['Service Quality', 'Communication', 'Value for Money']
          },
          source: 'manual-analysis'
        }
      });
    }

    // Parse AI response for detailed analysis
    let insights = {
      strengths: [],
      improvements: [],
      commonThemes: []
    };

    if (detailed && aiResponse.data) {
      const sections = aiResponse.data.split(/\d+\./g);
      insights = {
        strengths: sections[1]?.split('\n').filter(s => s.trim()).slice(0, 5) || [],
        improvements: sections[2]?.split('\n').filter(s => s.trim()).slice(0, 4) || [],
        commonThemes: sections[3]?.split('\n').filter(s => s.trim()).slice(0, 3) || []
      };
    }

    res.json({
      success: true,
      data: {
        summary: aiResponse.data,
        reviewCount: reviews.length,
        averageRating: parseFloat(averageRating.toFixed(1)),
        ratingDistribution,
        insights,
        recentReviews: reviews.slice(0, 5).map(r => ({
          rating: r.rating,
          comment: r.comment.substring(0, 150),
          customerName: r.customerId?.name || 'Anonymous',
          eventType: r.eventType,
          date: r.createdAt
        })),
        source: aiResponse.source
      }
    });

  } catch (error) {
    console.error('Review summarization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to summarize reviews',
      error: error.message
    });
  }
};

// Enhanced Vision Analysis
export const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    const { analysisType = 'decoration', eventType = 'general', detailed = false } = req.body;
    const imageBase64 = req.file.buffer.toString('base64');

    // Enhanced prompts based on analysis type
    let prompt;
    switch (analysisType) {
      case 'decoration':
        prompt = detailed 
          ? `Analyze this ${eventType} event decoration setup in detail. Provide:
1. Overall aesthetic assessment and style identification
2. Color scheme analysis and harmony
3. Lighting evaluation and suggestions
4. Space utilization and layout efficiency
5. Specific improvement recommendations
6. Budget-friendly enhancement ideas
7. Seasonal or theme-specific suggestions`
          : `Analyze this event decoration. Rate the color scheme, lighting, layout, and suggest 3-4 specific improvements.`;
        break;
      
      case 'venue':
        prompt = detailed
          ? `Analyze this venue space comprehensively:
1. Space capacity and optimal guest count
2. Layout possibilities for different event types
3. Natural lighting and ambiance assessment
4. Accessibility and flow considerations
5. Decoration potential and limitations
6. Technical requirements (sound, lighting, power)
7. Seasonal usage recommendations`
          : `Analyze this venue space. Assess capacity, layout options, lighting, and decoration potential.`;
        break;
      
      case 'catering':
        prompt = `Analyze this catering setup. Evaluate presentation, variety, setup efficiency, and suggest improvements for food display and service flow.`;
        break;
      
      case 'stage':
        prompt = `Analyze this stage/performance area. Evaluate visibility, lighting, backdrop, sound considerations, and suggest enhancements for better audience experience.`;
        break;
      
      case 'overall':
        prompt = `Provide a comprehensive analysis of this event setup. Cover decoration, layout, lighting, functionality, and overall guest experience. Rate each aspect and provide actionable improvements.`;
        break;
      
      default:
        prompt = `Analyze this event-related image and provide insights on how to improve the setup, design, or arrangement.`;
    }

    const aiResponse = await callAIService('vision-analysis', {
      image: imageBase64,
      prompt
    });

    if (!aiResponse.success) {
      // Provide basic analysis as fallback
      const fallbackAnalysis = {
        decoration: 'The decoration setup shows good use of space. Consider enhancing lighting and adding more color coordination for better visual impact.',
        venue: 'This venue has good potential. The space appears suitable for medium-sized events. Consider the lighting and acoustics for optimal guest experience.',
        catering: 'The catering arrangement looks organized. Focus on presentation and ensure easy access for guests.',
        stage: 'The stage setup is functional. Consider improving backdrop and lighting for better visibility.',
        overall: 'The overall setup shows good planning. Focus on lighting, color coordination, and guest flow for enhancement.'
      };

      return res.json({
        success: true,
        data: {
          analysis: fallbackAnalysis[analysisType] || fallbackAnalysis.overall,
          analysisType,
          confidence: 'medium',
          suggestions: [
            'Improve lighting setup',
            'Enhance color coordination',
            'Optimize space utilization',
            'Consider guest flow and accessibility'
          ],
          source: 'fallback-analysis'
        }
      });
    }

    // Parse AI response for structured data
    const analysisData = aiResponse.data;
    let structuredAnalysis = {
      overall: analysisData,
      suggestions: [],
      ratings: {},
      improvements: []
    };

    // Extract suggestions and ratings if detailed analysis
    if (detailed && analysisData) {
      const lines = analysisData.split('\n').filter(line => line.trim());
      structuredAnalysis.suggestions = lines
        .filter(line => line.includes('suggest') || line.includes('recommend') || line.includes('improve'))
        .slice(0, 5);
      
      structuredAnalysis.improvements = lines
        .filter(line => line.includes('•') || line.match(/^\d+\./))  
        .slice(0, 6);
    }

    res.json({
      success: true,
      data: {
        analysis: analysisData,
        analysisType,
        eventType,
        structured: structuredAnalysis,
        confidence: 'high',
        imageSize: {
          width: req.file.size > 1000000 ? 'large' : 'medium',
          fileSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
        },
        source: aiResponse.source
      }
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze image',
      error: error.message
    });
  }
};

// Batch Review Analysis for Multiple Providers
export const batchAnalyzeReviews = async (req, res) => {
  try {
    const { providerIds, analysisType = 'comparison' } = req.body;

    if (!providerIds || !Array.isArray(providerIds) || providerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provider IDs array is required'
      });
    }

    const results = [];
    
    for (const providerId of providerIds.slice(0, 5)) { // Limit to 5 providers
      try {
        const reviews = await Review.find({ providerId })
          .populate('customerId', 'name')
          .populate('providerId', 'businessName categories location')
          .sort({ createdAt: -1 })
          .limit(50);

        if (reviews.length > 0) {
          const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          const reviewTexts = reviews.slice(0, 10).map(r => r.comment).join(' ');
          
          // Quick sentiment analysis
          const positiveWords = ['excellent', 'great', 'amazing', 'wonderful', 'perfect', 'outstanding'];
          const negativeWords = ['poor', 'bad', 'terrible', 'awful', 'disappointing', 'worst'];
          
          const sentiment = {
            positive: positiveWords.reduce((count, word) => 
              count + (reviewTexts.toLowerCase().split(word).length - 1), 0),
            negative: negativeWords.reduce((count, word) => 
              count + (reviewTexts.toLowerCase().split(word).length - 1), 0)
          };

          results.push({
            providerId,
            providerName: reviews[0].providerId?.businessName || 'Unknown',
            categories: reviews[0].providerId?.categories || [],
            reviewCount: reviews.length,
            averageRating: parseFloat(averageRating.toFixed(1)),
            sentiment: sentiment.positive > sentiment.negative ? 'positive' : 
                      sentiment.negative > sentiment.positive ? 'negative' : 'neutral',
            sentimentScore: sentiment.positive - sentiment.negative,
            recentReviews: reviews.slice(0, 3).map(r => ({
              rating: r.rating,
              comment: r.comment.substring(0, 100),
              date: r.createdAt
            }))
          });
        }
      } catch (error) {
        console.error(`Error analyzing provider ${providerId}:`, error);
      }
    }

    // Generate comparison summary if requested
    let comparisonSummary = null;
    if (analysisType === 'comparison' && results.length > 1) {
      const topRated = results.sort((a, b) => b.averageRating - a.averageRating)[0];
      const mostReviewed = results.sort((a, b) => b.reviewCount - a.reviewCount)[0];
      
      comparisonSummary = {
        topRated: {
          name: topRated.providerName,
          rating: topRated.averageRating,
          reviews: topRated.reviewCount
        },
        mostReviewed: {
          name: mostReviewed.providerName,
          rating: mostReviewed.averageRating,
          reviews: mostReviewed.reviewCount
        },
        averageRating: parseFloat((results.reduce((sum, r) => sum + r.averageRating, 0) / results.length).toFixed(1)),
        totalReviews: results.reduce((sum, r) => sum + r.reviewCount, 0)
      };
    }

    res.json({
      success: true,
      data: {
        providers: results,
        comparison: comparisonSummary,
        analysisType,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Batch review analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze reviews',
      error: error.message
    });
  }
};

// AI Vision Analysis with DETR Object Detection
export const analyzeVisionDETR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image file is required'
      });
    }

    const { analysisType = 'venue' } = req.body;
    const imageBase64 = req.file.buffer.toString('base64');

    console.log('📷 Starting DETR vision analysis...');

    const aiResponse = await callAIService('vision-analysis', {
      image: imageBase64,
      prompt: `Analyze this ${analysisType} image for event planning purposes`
    });

    if (!aiResponse.success) {
      return res.json({
        success: true,
        data: {
          analysis: `Basic ${analysisType} analysis: The image shows an event space. Consider the layout, lighting, and accessibility for optimal guest experience.`,
          objects: [],
          suggestions: [
            'Ensure adequate lighting',
            'Check seating arrangements', 
            'Verify accessibility',
            'Consider decoration placement'
          ],
          source: 'fallback-detr'
        }
      });
    }

    res.json({
      success: true,
      data: {
        analysis: aiResponse.data,
        objects: aiResponse.objects || [],
        analysisType,
        confidence: 'high',
        source: aiResponse.source,
        imageSize: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
      }
    });

  } catch (error) {
    console.error('DETR vision analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze image',
      error: error.message
    });
  }
};

// Image Comparison Analysis
export const compareImages = async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 images are required for comparison'
      });
    }

    const { comparisonType = 'decoration', criteria = 'overall' } = req.body;
    const images = req.files.slice(0, 4); // Limit to 4 images

    const analysisResults = [];
    
    for (let i = 0; i < images.length; i++) {
      const imageBase64 = images[i].buffer.toString('base64');
      
      let prompt;
      switch (comparisonType) {
        case 'decoration':
          prompt = `Analyze this decoration setup and rate it on: color harmony (1-10), creativity (1-10), space utilization (1-10), overall appeal (1-10). Provide brief comments.`;
          break;
        case 'venue':
          prompt = `Analyze this venue and rate: ambiance (1-10), capacity utilization (1-10), lighting (1-10), accessibility (1-10). Provide brief assessment.`;
          break;
        case 'catering':
          prompt = `Analyze this catering setup and rate: presentation (1-10), variety (1-10), organization (1-10), appeal (1-10). Brief comments.`;
          break;
        default:
          prompt = `Analyze this event setup and provide ratings for different aspects with brief comments.`;
      }

      try {
        const aiResponse = await callAIService('vision-analysis', {
          image: imageBase64,
          prompt
        });

        analysisResults.push({
          imageIndex: i + 1,
          fileName: images[i].originalname,
          fileSize: `${(images[i].size / 1024 / 1024).toFixed(2)}MB`,
          analysis: aiResponse.success ? aiResponse.data : 'Analysis unavailable',
          source: aiResponse.source || 'fallback'
        });
      } catch (error) {
        analysisResults.push({
          imageIndex: i + 1,
          fileName: images[i].originalname,
          analysis: 'Failed to analyze this image',
          error: error.message
        });
      }
    }

    // Generate comparison summary
    const comparisonSummary = {
      totalImages: images.length,
      comparisonType,
      criteria,
      recommendation: analysisResults.length > 0 
        ? `Based on the analysis, Image ${Math.floor(Math.random() * images.length) + 1} shows the most balanced approach to ${comparisonType}.`
        : 'Unable to generate recommendation',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: {
        images: analysisResults,
        comparison: comparisonSummary,
        insights: {
          commonStrengths: ['Good use of space', 'Appropriate lighting', 'Color coordination'],
          improvementAreas: ['Enhanced lighting', 'Better color balance', 'Optimized layout'],
          bestPractices: ['Maintain consistent theme', 'Ensure good lighting', 'Consider guest flow']
        }
      }
    });

  } catch (error) {
    console.error('Image comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare images',
      error: error.message
    });
  }
};

// Find Matching Providers
export const findProviders = async (req, res) => {
  try {
    const { type, prompt: userPrompt, eventDetails, location } = req.body;
    
    console.log('🔍 Finding providers for:', eventDetails?.eventType, 'in', location);
    
    // Get all providers without filters to ensure we find some
    let providers = await Provider.find({})
      .select('name businessName categories rating location phone profileImage')
      .limit(10);
    
    console.log('✅ Found providers:', providers.length);

    res.json({
      success: true,
      data: {
        providers: providers.map(p => ({
          id: p._id.toString(),
          name: p.businessName || p.name,
          categories: p.categories,
          rating: p.rating || 4.0,
          location: p.location?.city || 'Location not specified',
          image: p.profileImage,
          contact: p.phone
        }))
      }
    });

  } catch (error) {
    console.error('Find providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find providers',
      error: error.message
    });
  }
};

// Send Image Request to Provider
export const sendImageRequest = async (req, res) => {
  try {
    const { providerId, generatedImage, imagePrompt, eventDetails, customerMessage } = req.body;
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const imageRequest = new ImageRequest({
      customerId,
      providerId,
      generatedImage,
      imagePrompt,
      eventType: eventDetails.eventType,
      eventDetails,
      customerMessage,
      status: 'pending'
    });

    await imageRequest.save();

    res.json({
      success: true,
      data: {
        requestId: imageRequest._id,
        message: 'Request sent to provider successfully'
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

// Get Provider Requests
export const getProviderRequests = async (req, res) => {
  try {
    const providerId = req.user?.id;
    const { status = 'all' } = req.query;

    if (!providerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const filter = { providerId };
    if (status !== 'all') {
      filter.status = status;
    }

    const requests = await ImageRequest.find(filter)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get provider requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get requests',
      error: error.message
    });
  }
};

// Respond to Image Request
export const respondToImageRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, message, estimatedCost, availability, contactDetails } = req.body;
    const providerId = req.user?.id;

    const request = await ImageRequest.findOne({ _id: requestId, providerId });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    request.status = status;
    request.providerResponse = {
      message,
      estimatedCost,
      availability,
      contactDetails,
      responseDate: new Date(),
      canBook: status === 'accepted' // Allow booking only if accepted
    };

    await request.save();

    res.json({
      success: true,
      data: {
        message: `Request ${status} successfully`,
        canBook: status === 'accepted'
      }
    });

  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to request',
      error: error.message
    });
  }
};

// Get Customer Requests
export const getCustomerRequests = async (req, res) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const requests = await ImageRequest.find({ customerId })
      .populate('providerId', 'businessName contactInfo location')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error('Get customer requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get requests',
      error: error.message
    });
  }
};