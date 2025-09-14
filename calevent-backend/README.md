# CALEVENT Backend API

A comprehensive Node.js/Express backend for the CALEVENT event booking platform with dual user authentication, AI chatbot, payment processing, and real-time booking management.

## 🚀 Features

- **Dual User Authentication**: Separate authentication for Customers and Providers
- **Event Management**: CRUD operations for events with image uploads
- **Booking System**: Complete booking workflow with status tracking
- **Payment Integration**: Razorpay payment gateway with signature verification
- **AI Chatbot**: Hybrid chatbot with custom responses and Gemini AI
- **File Upload**: Secure image upload with validation
- **Email Service**: Automated email notifications
- **Search & Filtering**: Advanced search capabilities
- **Security**: Comprehensive security middleware stack

## 📦 Tech Stack

- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM 7.5.0
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer middleware
- **Payment**: Razorpay integration
- **Email**: Nodemailer with SMTP
- **AI**: Gemini API integration
- **Security**: Helmet, CORS, Rate limiting

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd calevent-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/calevent
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/customer/register` - Customer registration
- `POST /api/auth/customer/login` - Customer login
- `POST /api/auth/provider/register` - Provider registration
- `POST /api/auth/provider/login` - Provider login
- `GET /api/auth/verify` - Token verification

### Events
- `GET /api/events` - Get all events (with filtering)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (Provider only)
- `PUT /api/events/:id` - Update event (Provider only)
- `DELETE /api/events/:id` - Delete event (Provider only)
- `POST /api/events/:id/like` - Like/unlike event (Customer only)

### Bookings
- `POST /api/bookings` - Create booking (Customer only)
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `PATCH /api/bookings/:id/status` - Update booking status (Provider only)

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Payment history

### Providers
- `GET /api/provider` - Get all providers
- `GET /api/provider/profile/:id` - Get provider profile
- `GET /api/provider/dashboard/stats` - Dashboard statistics
- `PUT /api/provider/profile` - Update provider profile

### Chatbot
- `POST /api/chatbot/chat` - Chat with AI bot
- `GET /api/chatbot/test-gemini` - Test Gemini API

### Search
- `GET /api/search/events` - Search events
- `GET /api/search/providers` - Search providers

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📁 Project Structure

```
calevent-backend/
├── config/
│   └── db.js                 # Database configuration
├── controllers/              # Route controllers
├── middleware/              # Custom middleware
│   ├── auth.js              # Authentication middleware
│   ├── security.js          # Security middleware
│   ├── upload.js            # File upload middleware
│   └── validation.js        # Input validation
├── models/                  # Mongoose models
├── routes/                  # API routes
├── services/               # Business logic services
│   ├── emailService.js     # Email service
│   └── paymentService.js   # Payment service
├── uploads/                # File uploads directory
├── .env                    # Environment variables
└── server.js              # Main server file
```

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request rate limiting
- **Input Validation**: Request validation and sanitization
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with 12 rounds
- **File Upload Security**: File type and size validation

## 💳 Payment Integration

The API integrates with Razorpay for payment processing:

1. Create payment order
2. Process payment on frontend
3. Verify payment signature
4. Update booking status
5. Send confirmation emails

## 🤖 AI Chatbot

Hybrid chatbot system:
- **Custom Responses**: Pre-defined responses for common queries
- **Provider Lookup**: Dynamic provider information
- **Gemini AI**: Advanced natural language processing
- **Context Awareness**: Maintains conversation context

## 📧 Email Service

Automated email notifications:
- Welcome emails for new users
- Booking confirmations
- Payment confirmations
- Password reset emails

## 🚀 Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure MongoDB Atlas
   - Set up SMTP service
   - Configure Razorpay keys

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

## 📊 Monitoring

- Health check endpoint: `GET /health`
- Error logging and handling
- Request rate monitoring
- Database connection monitoring

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests (if available)
npm test
```

## 📝 API Documentation

Visit `http://localhost:5000/` for API documentation and endpoint information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@calevent.com
- Phone: +91 9876543210

---

**CALEVENT Backend** - Powering seamless event booking experiences! 🎉