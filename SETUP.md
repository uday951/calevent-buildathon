# CALEVENT Full Stack Setup Guide

This guide will help you set up both the frontend and backend of the CALEVENT event booking platform.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git
- Code editor (VS Code recommended)

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd calevent-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file:**
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/calevent
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_here
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**Start the backend server:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd vignan

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Environment Configuration

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Optional |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Optional |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | Optional |
| `SMTP_HOST` | Email SMTP host | Optional |
| `SMTP_PORT` | Email SMTP port | Optional |
| `EMAIL_USER` | Email username | Optional |
| `EMAIL_PASS` | Email password | Optional |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

### Frontend Environment Variables

The frontend `.env` file is already configured:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get connection string
5. Update `MONGO_URI` in backend `.env`

### Option 2: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use local connection string: `mongodb://localhost:27017/calevent`

## 🔑 API Keys Setup

### Razorpay (Payment Gateway)

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get API keys from dashboard
3. Add to both frontend and backend `.env` files

### Google Gemini AI (Chatbot)

1. Get API key from [Google AI Studio](https://makersuite.google.com/)
2. Add to both frontend and backend `.env` files

### Email Service (SMTP)

For Gmail:
1. Enable 2-factor authentication
2. Generate app password
3. Use app password in `EMAIL_PASS`

## 🚀 Running the Application

### Development Mode

**Terminal 1 (Backend):**
```bash
cd calevent-backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd vignan
npm run dev
```

### Production Mode

**Backend:**
```bash
cd calevent-backend
npm start
```

**Frontend:**
```bash
cd vignan
npm run build
npm run preview
```

## 📱 Application URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health
- **API Documentation**: http://localhost:5000/

## 🧪 Testing the Setup

### 1. Backend Health Check
```bash
curl http://localhost:5000/health
```

### 2. Frontend Access
Open browser and navigate to `http://localhost:5173`

### 3. API Integration Test
- Register a new customer account
- Browse events
- Test chatbot functionality

## 🔍 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection
- Verify all required environment variables
- Check port availability

**Frontend API errors:**
- Ensure backend is running
- Check CORS configuration
- Verify API base URL

**Database connection issues:**
- Check MongoDB URI format
- Verify network access (for Atlas)
- Check firewall settings

**File upload issues:**
- Ensure uploads directory exists
- Check file permissions
- Verify multer configuration

## 📁 Project Structure

```
calevent/
├── vignan/                 # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── .env
│   └── package.json
├── calevent-backend/       # Backend (Node.js + Express)
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── .env
│   └── package.json
└── SETUP.md
```

## 🔐 Security Notes

- Never commit `.env` files
- Use strong JWT secrets
- Enable MongoDB authentication
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)

1. Set environment variables
2. Configure MongoDB Atlas
3. Set up domain and SSL
4. Deploy application

### Frontend Deployment (Vercel/Netlify)

1. Build the application
2. Configure environment variables
3. Set up custom domain
4. Deploy static files

## 📞 Support

If you encounter any issues:

1. Check the logs for error messages
2. Verify environment configuration
3. Test API endpoints individually
4. Check database connectivity

## 🎉 Success!

If everything is set up correctly, you should see:

- ✅ Backend server running on port 5000
- ✅ Frontend application on port 5173
- ✅ Database connected successfully
- ✅ API endpoints responding
- ✅ File uploads working
- ✅ Authentication functional

Your CALEVENT platform is now ready for development and testing!