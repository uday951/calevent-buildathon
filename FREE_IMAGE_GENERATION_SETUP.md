# 🎨 Free-Image-Generation Integration Guide

## 🏗️ **Architecture Overview**

```
Frontend → Node.js Backend → Python Microservice → Free-Image-Generation Model
```

### **Components:**
1. **Python Microservice** (Port 5001) - Runs Free-Image-Generation model
2. **Node.js Backend** (Port 5000) - Handles API requests and calls Python service
3. **Multi-tier Fallback** - DALL·E → Python Service → Hugging Face

## 🚀 **Quick Setup**

### **Step 1: Start Python Microservice**
```bash
cd d:\vignan\image-service
start.bat
```

### **Step 2: Verify Node.js Integration**
```bash
cd d:\vignan\calevent-backend
npm start
```

### **Step 3: Test the Integration**
```bash
# Test Python service health
curl http://localhost:5001/health

# Test Node.js integration
curl http://localhost:5000/api/image/health

# Generate test image
curl -X POST http://localhost:5000/api/image/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "beautiful wedding decoration with roses"}'
```

## 📋 **Detailed Setup Instructions**

### **Python Microservice Setup:**

1. **Navigate to image service directory:**
   ```bash
   cd d:\vignan\image-service
   ```

2. **Run the setup script:**
   ```bash
   start.bat
   ```
   This will:
   - Create virtual environment
   - Install dependencies
   - Download Free-Image-Generation model
   - Start Flask service on port 5001

3. **Manual setup (alternative):**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

### **Node.js Backend Integration:**

The backend is already configured with:
- ✅ Environment variable: `PYTHON_IMAGE_SERVICE_URL=http://localhost:5001`
- ✅ Multi-tier image generation system
- ✅ Health checks and error handling
- ✅ Automatic fallbacks

## 🧪 **Testing Endpoints**

### **Python Service Endpoints:**
```bash
# Health check
GET http://localhost:5001/health

# Generate image
POST http://localhost:5001/generate
{
  "prompt": "astronaut in jungle, detailed, 8k"
}
```

### **Node.js API Endpoints:**
```bash
# Health check (shows Python service status)
GET http://localhost:5000/api/image/health

# Generate image (with fallbacks)
POST http://localhost:5000/api/image/generate-image
{
  "prompt": "elegant wedding decoration"
}

# Test endpoint
GET http://localhost:5000/api/image/test
```

### **Chatbot Integration:**
```bash
# Chat with decoration design request
POST http://localhost:5000/api/chatbot/chat
{
  "message": "I want a royal wedding stage with red drapes"
}
```

## 🔧 **Configuration**

### **Environment Variables:**

**Node.js (.env):**
```env
PYTHON_IMAGE_SERVICE_URL=http://localhost:5001
```

**Python (.env):**
```env
PYTHON_SERVICE_PORT=5001
CUDA_VISIBLE_DEVICES=0
```

### **Model Configuration:**
- **Base Model:** stabilityai/stable-diffusion-xl-base-1.0
- **LoRA Weights:** aiyouthalliance/Free-Image-Generation
- **Image Size:** 512x512
- **Inference Steps:** 25
- **Guidance Scale:** 7.5

## 🎯 **Integration Flow**

### **Image Generation Priority:**
1. **DALL·E** (if OpenAI billing available)
2. **Python Free-Image-Generation** (primary fallback)
3. **Hugging Face Stable Diffusion** (final fallback)

### **Chatbot Decoration Design:**
1. User requests decoration design
2. AI analyzes requirements
3. Python service generates mockup image
4. System finds matching providers
5. Returns design + providers + image

## 📊 **Performance & Optimization**

### **Speed Optimization:**
- **GPU Support:** Automatic CUDA detection
- **Model Caching:** Model loaded once on startup
- **Timeout Handling:** 60s timeout for generation
- **Health Checks:** Fast service availability checks

### **Cost Optimization:**
- **Local Processing:** No API costs for Free-Image-Generation
- **Smart Fallbacks:** Only use paid services when needed
- **Efficient Prompts:** Optimized prompt engineering

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **Python service not starting:**
   ```bash
   # Check Python installation
   python --version
   
   # Check CUDA (optional)
   nvidia-smi
   
   # Install dependencies manually
   pip install torch torchvision diffusers transformers
   ```

2. **Model download issues:**
   ```bash
   # Clear cache and retry
   rm -rf ~/.cache/huggingface
   python app.py
   ```

3. **Connection errors:**
   ```bash
   # Verify service is running
   curl http://localhost:5001/health
   
   # Check firewall/ports
   netstat -an | findstr 5001
   ```

4. **Memory issues:**
   ```bash
   # Reduce batch size or use CPU
   # Edit app.py: torch_dtype=torch.float32
   ```

### **Logs & Debugging:**
- **Python logs:** Console output from Flask service
- **Node.js logs:** Server console shows API calls
- **Health status:** `/health` endpoints show service status

## 🎉 **Success Indicators**

### **✅ Python Service Ready:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "gpu_available": true
}
```

### **✅ Node.js Integration Working:**
```json
{
  "success": true,
  "python_service": {
    "status": "healthy"
  }
}
```

### **✅ Image Generation Working:**
```json
{
  "success": true,
  "data": {
    "image": "base64-encoded-image",
    "source": "Free-Image-Generation (Python Service)"
  }
}
```

## 🚀 **Production Deployment**

### **Docker Setup (Optional):**
```dockerfile
# Python service Dockerfile
FROM python:3.9-slim
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app.py .
CMD ["python", "app.py"]
```

### **Scaling Considerations:**
- **Multiple instances:** Load balance Python services
- **GPU allocation:** Distribute across multiple GPUs
- **Caching:** Implement Redis for generated images
- **Queue system:** Use Celery for async processing

## 📞 **Support**

If you encounter issues:
1. Check service health endpoints
2. Verify environment variables
3. Review console logs
4. Test with simple prompts first
5. Ensure sufficient disk space for model downloads

**Model Size:** ~6GB (SDXL + LoRA weights)
**RAM Requirements:** 8GB+ (16GB recommended)
**GPU:** Optional but recommended for speed