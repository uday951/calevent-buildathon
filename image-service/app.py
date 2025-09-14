from flask import Flask, request, jsonify
from diffusers import DiffusionPipeline
import torch
import base64
import io
from PIL import Image
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Global pipeline variable
pipe = None

def load_model():
    """Load the Free-Image-Generation model"""
    global pipe
    try:
        logger.info("🔄 Loading Free-Image-Generation model...")
        
        # Load base model and LoRA weights
        pipe = DiffusionPipeline.from_pretrained(
            "stabilityai/stable-diffusion-xl-base-1.0",
            torch_dtype=torch.float16,
            use_safetensors=True,
            variant="fp16"
        )
        
        # Load LoRA weights
        pipe.load_lora_weights("aiyouthalliance/Free-Image-Generation")
        
        # Move to GPU if available
        if torch.cuda.is_available():
            pipe = pipe.to("cuda")
            logger.info("✅ Model loaded on GPU")
        else:
            logger.info("✅ Model loaded on CPU")
            
        return True
    except Exception as e:
        logger.error(f"❌ Failed to load model: {str(e)}")
        return False

def image_to_base64(image):
    """Convert PIL Image to base64 string"""
    buffer = io.BytesIO()
    image.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return img_str

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': pipe is not None,
        'timestamp': datetime.now().isoformat(),
        'gpu_available': torch.cuda.is_available()
    })

@app.route('/generate', methods=['POST'])
def generate_image():
    """Generate image from prompt"""
    try:
        # Check if model is loaded
        if pipe is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Get prompt from request
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({
                'success': False,
                'error': 'Prompt is required'
            }), 400
        
        prompt = data['prompt']
        if not prompt or not isinstance(prompt, str):
            return jsonify({
                'success': False,
                'error': 'Valid prompt string is required'
            }), 400
        
        logger.info(f"🎨 Generating image for prompt: {prompt}")
        
        # Generate image
        with torch.no_grad():
            image = pipe(
                prompt,
                num_inference_steps=25,
                guidance_scale=7.5,
                width=512,
                height=512
            ).images[0]
        
        # Convert to base64
        base64_image = image_to_base64(image)
        
        logger.info("✅ Image generated successfully")
        
        return jsonify({
            'success': True,
            'image': base64_image,
            'prompt': prompt,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"❌ Image generation failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Load model on startup
    logger.info("🚀 Starting Free-Image-Generation service...")
    
    if load_model():
        port = int(os.getenv('PYTHON_SERVICE_PORT', 5001))
        logger.info(f"🌟 Service starting on port {port}")
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        logger.error("💥 Failed to start service - model loading failed")
        exit(1)