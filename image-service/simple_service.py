#!/usr/bin/env python3
"""
Lightweight image generation service using Hugging Face API
"""
from flask import Flask, request, jsonify
import requests
import base64
import os
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Hugging Face API configuration
HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"
HF_TOKEN = os.getenv('HF_TOKEN', 'hf_your_token_here')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'lightweight-image-generation',
        'timestamp': datetime.now().isoformat(),
        'hf_token_configured': bool(HF_TOKEN and HF_TOKEN != 'hf_your_token_here')
    })

@app.route('/generate', methods=['POST'])
def generate_image():
    """Generate image using Hugging Face API"""
    try:
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
        
        # Check if HF token is configured
        if not HF_TOKEN or HF_TOKEN == 'hf_your_token_here':
            return jsonify({
                'success': False,
                'error': 'Hugging Face token not configured'
            }), 500
        
        # Make request to Hugging Face API
        headers = {
            "Authorization": f"Bearer {HF_TOKEN}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "num_inference_steps": 20,
                "guidance_scale": 7.5,
                "width": 512,
                "height": 512
            }
        }
        
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=60)
        
        if not response.ok:
            error_msg = f"HF API error: {response.status_code}"
            try:
                error_data = response.json()
                if 'error' in error_data:
                    error_msg += f" - {error_data['error']}"
            except:
                pass
            
            logger.error(error_msg)
            return jsonify({
                'success': False,
                'error': error_msg
            }), 500
        
        # Convert response to base64
        image_bytes = response.content
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        logger.info("✅ Image generated successfully")
        
        return jsonify({
            'success': True,
            'image': base64_image,
            'prompt': prompt,
            'timestamp': datetime.now().isoformat()
        })
        
    except requests.exceptions.Timeout:
        logger.error("❌ Request timeout")
        return jsonify({
            'success': False,
            'error': 'Request timeout - image generation took too long'
        }), 504
        
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
    port = int(os.getenv('PYTHON_SERVICE_PORT', 5001))
    logger.info(f"🚀 Starting lightweight image service on port {port}")
    logger.info(f"🔑 HF Token configured: {bool(HF_TOKEN and HF_TOKEN != 'hf_your_token_here')}")
    
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)