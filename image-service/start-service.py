#!/usr/bin/env python3
"""
Simple startup script for the Free-Image-Generation service
"""
import subprocess
import sys
import os
import time

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install requirements: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def start_service():
    """Start the Flask service"""
    print("🚀 Starting Free-Image-Generation service...")
    try:
        # Set environment variables
        os.environ['FLASK_ENV'] = 'production'
        os.environ['PYTHONPATH'] = os.getcwd()
        
        # Import and run the app
        from app import app, load_model, logger
        
        # Load model first
        if not load_model():
            print("❌ Failed to load model")
            return False
            
        # Start Flask app
        port = int(os.getenv('PYTHON_SERVICE_PORT', 5001))
        print(f"🌟 Service starting on http://localhost:{port}")
        app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
        
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Free-Image-Generation Service Startup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install requirements
    if not install_requirements():
        print("⚠️  Continuing without installing requirements...")
    
    # Start service
    start_service()

if __name__ == "__main__":
    main()