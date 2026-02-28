#!/usr/bin/env python3
"""
Test script for Hugging Face DETR object detection
"""

import requests
import base64
import os
from PIL import Image

# Configuration
HF_TOKEN = os.environ.get("HF_TOKEN", "your_hugging_face_token_here")
API_URL = "https://api-inference.huggingface.co/models/facebook/detr-resnet-50"

def test_detr_with_image(image_path):
    """Test DETR with a local image file"""
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return
    
    # Read and encode image
    with open(image_path, "rb") as f:
        image_data = f.read()
    
    image_b64 = base64.b64encode(image_data).decode()
    
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "inputs": image_b64
    }
    
    print(f"🔍 Testing DETR with {image_path}...")
    
    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        
        if response.status_code == 200:
            results = response.json()
            print("✅ DETR Detection Results:")
            
            event_objects = []
            for obj in results:
                if obj['label'] in ['person', 'chair', 'dining table', 'cup', 'bottle', 'cake', 'potted plant', 'vase']:
                    event_objects.append(obj)
                    print(f"  - {obj['label']}: {obj['score']:.3f}")
            
            print(f"\n📊 Found {len(event_objects)} event-relevant objects")
            
        else:
            print(f"❌ API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Error: {e}")

def test_with_sample_images():
    """Test with sample images if available"""
    
    sample_images = [
        "wedding_stage.jpg",
        "generated_image_blue_birthday_party_.jpg",
        "../public/weddings/images.jpg"
    ]
    
    for img in sample_images:
        if os.path.exists(img):
            test_detr_with_image(img)
            print("-" * 50)
        else:
            print(f"⚠️  Sample image not found: {img}")

if __name__ == "__main__":
    print("🚀 Testing Hugging Face DETR Object Detection")
    print("=" * 50)
    
    test_with_sample_images()
    
    print("\n💡 To test with your own image:")
    print("python test-detr.py your_image.jpg")