import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Check Python service health
const checkPythonService = async () => {
  try {
    const serviceUrl = process.env.PYTHON_IMAGE_SERVICE_URL || 'http://localhost:5001';
    const response = await fetch(`${serviceUrl}/health`, { 
      method: 'GET',
      timeout: 5000 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// POST /generate-image endpoint
router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Prompt is required'
      });
    }

    console.log('🎨 Generating image with Free-Image-Generation model:', prompt);

    // Check if Python service is available
    const serviceAvailable = await checkPythonService();
    if (!serviceAvailable) {
      console.error('❌ Python image service is not available');
      return res.status(503).json({
        success: false,
        message: 'Image generation service is currently unavailable',
        error: 'Python microservice not responding'
      });
    }

    // Call Python microservice
    const serviceUrl = process.env.PYTHON_IMAGE_SERVICE_URL || 'http://localhost:5001';
    const response = await fetch(`${serviceUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
      timeout: 60000 // 60 second timeout for image generation
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('❌ Python service error:', response.status, errorData);
      return res.status(response.status).json({
        success: false,
        message: 'Image generation failed',
        error: errorData.error || 'Python service error'
      });
    }

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Image generation failed:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Image generation failed',
        error: result.error
      });
    }

    // Save image locally as output.png
    const base64Image = result.image;
    const buffer = Buffer.from(base64Image, 'base64');
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filename = `output-${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);
    
    console.log('✅ Image generated and saved:', filename);

    res.json({
      success: true,
      data: {
        image: base64Image,
        prompt: prompt,
        filename: filename,
        source: 'Free-Image-Generation (Python Service)',
        created: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Image generation error:', error.message);
    
    // Handle timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return res.status(408).json({
        success: false,
        message: 'Image generation timed out. Please try again.',
        error: 'Request timeout'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to generate image',
      error: error.message
    });
  }
});

// Health check
router.get('/health', async (req, res) => {
  const pythonServiceHealth = await checkPythonService();
  
  res.json({
    success: true,
    message: 'Image generation API is running',
    model: 'aiyouthalliance/Free-Image-Generation',
    python_service: {
      url: process.env.PYTHON_IMAGE_SERVICE_URL || 'http://localhost:5001',
      status: pythonServiceHealth ? 'healthy' : 'unavailable'
    },
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
router.get('/test', async (req, res) => {
  try {
    const testPrompt = 'beautiful sunset landscape';
    console.log('🧪 Testing image generation with prompt:', testPrompt);
    
    const serviceUrl = process.env.PYTHON_IMAGE_SERVICE_URL || 'http://localhost:5001';
    const response = await fetch(`${serviceUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: testPrompt }),
      timeout: 30000
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return res.status(response.status).json({
        success: false,
        message: 'Test failed',
        error: errorData.error
      });
    }

    const result = await response.json();
    
    res.json({
      success: true,
      message: 'Test completed successfully',
      prompt: testPrompt,
      image_generated: !!result.image,
      timestamp: result.timestamp
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

export default router;