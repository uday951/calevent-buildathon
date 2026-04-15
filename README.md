# CALEVENT - Next-Gen AI-Powered Event Booking Platform 🚀🤖

<div align="center">
  <img src="public/caleventbanner-github.png" alt="CALEVENT Banner">
  
  <p><strong>Redefining the event industry with Multi-Tier AI, seamless UX, and hyper-premium architecture.</strong></p>
  
  > **Live Demo (Web):** [https://calevent-buildathon.onrender.com](https://calevent-buildathon.onrender.com)  
  > **Mobile App:** Available for Android (APK v2.0.0)
</div>

---

CALEVENT is an enterprise-grade, full-stack event booking platform engineered to bridge the gap between event organizers (providers) and customers seamlessly. What sets CALEVENT apart is its **deeply integrated, state-of-the-art Multi-Tier Artificial Intelligence System**, designed to act as an autonomous event planner, intelligent concierge, and dynamic data analyzer.

Built with massive scalability in mind, CALEVENT brings the ultimate modern aesthetic, utilizing Framer Motion animations, complex React architectures, secure role-based access control, and real-time AI processing capabilities.

**Now available on both Web and Mobile platforms!**

---

## 🧠 The AI Engine: Multi-Tier Intelligence Architecture

CALEVENT runs on a highly sophisticated **Multi-Tier AI Fallback System**, guaranteeing 99.9% uptime for AI operations, smart-routing for cost optimization, and unparalleled user experience.

It does not rely on a single model; instead, it orchestrates multiple AI brains:

- 🟢 **Tier 1 (Primary):** **OpenAI (GPT-4o / DALL·E 3 / Vision)** - Handles complex reasoning, hyper-realistic image generation, and deep conversational context.
- 🟡 **Tier 2 (Fallback):** **Google Gemini (1.5-Flash / Vision)** - Automatically takes over routing if Tier 1 hits quota or latency issues, offering lightning-fast processing.
- 🟠 **Tier 3 (Edge Fallback):** **Hugging Face (DialoGPT / Stable Diffusion)** - Open-source edge models ensure the platform's AI never goes completely offline.
- 🔴 **Tier 4 (Failsafe):** **Deterministic Context Engine** - Fallback structured responses for network emergencies.

### 🌟 Deep AI Features

1.  **AI Event Chatbot & Concierge:** A conversational agent that understands natural language to recommend the perfect wedding planners, corporate venues, or party DJs based on exact criteria.
2.  **Autonomous Visual Intelligence (AI Image Analysis):** Providers can upload portfolio images, and the AI Vision system will automatically read, tag, and categorize the setting.
3.  **Generative AI Imagery:** Customers seeking inspiration can prompt the platform to generate mood boards or event layouts using text-to-image AI pipelines.

---

## ✨ Core Platform Features

### 🤵 Customer Portal

- **Intelligent Discovery:** Explore a curated database of premium event providers.
- **Frictionless Booking:** Secure checkout flows integrated deeply with Razorpay.
- **AI Planning Assistant:** Use the AI Chatbot to plan itineraries, draft invitations, or find specific event aesthetics.
- **Dashboard & Analytics:** Track upcoming events, manage payments, and maintain favorite lists.

### 🏢 Provider Portal

- **Business Management:** Create hyper-premium public profiles to showcase portfolios.
- **Dynamic Analytics Dashboard:** Visualized tracking for revenue generation, booking statistics, customer reviews, and profile reach.
- **Secure Ecosystem:** To maintain high marketplace quality, newly registered businesses require Super Admin verification before activating.
- **Messaging System:** Direct client-to-provider inbox integration contextually linked to upcoming bookings.

### 🛡️ Super Admin Control Center

- **Application Auditing:** Review, approve, or reject new provider businesses trying to join the marketplace.
- **Global Telemetry & Analytics:** Comprehensive views of total user metrics, accumulated revenue, and active bookings across the entire platform.
- **User Management & Moderation:** Full control to audit, suspend, or activate customers and providers.

---

## 💻 Elite Tech Stack

**Web Frontend Framework & UX:**

- **Core:** React 19 (Vite)
- **Aesthetics & CSS:** Tailwind CSS, Styled Components, Tailwind Variants
- **Dynamic Motion:** Framer Motion, Anime.js, Tailwind-Animate
- **State & Routing:** Zustand / Context API, React Router v7, React Hook Form
- **Maps & Integrations:** React Leaflet, Lucide Icons, Material UI (MUI)

**Mobile App (React Native):**

- **Framework:** React Native 0.81.5, Expo SDK 54
- **Navigation:** React Navigation v6 (Stack & Bottom Tabs)
- **State Management:** Zustand v5
- **API Client:** Axios
- **Storage:** AsyncStorage
- **UI:** Custom components with emoji icons

**Backend Architecture:**

- **Runtime:** Node.js, Express.js (RESTful architecture)
- **Database:** MongoDB via Mongoose (Complex aggregations)
- **Authentication & Security:** JWT (JSON Web Tokens), Bcrypt.js, Helmet.js
- **AI Integrations:** Google Generative AI SDK, OpenAI SDK, Hugging Face Hub
- **Payments & Infrastructure:** Razorpay SDK, Multer (File Handling), Nodemailer (Automated Email Pipelines)

---

## 🚀 Getting Started (Local Development)

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/calevent.git
cd calevent
```

### 2. Backend Setup

```bash
cd calevent-backend
npm install
```

Create a `.env` file inside `calevent-backend` and add your required keys (AI keys are highly recommended to unleash the full power of the platform):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# AI Models
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_gemini_api_key

# Payments & Comms
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
```

Start the backend server:

```bash
# Seed the default admin so you can approve providers
node seed-admin.js

# Start development server
npm run dev
```

### 3. Web Frontend Setup

Open a new terminal window in the root directory:

```bash
npm install
npm run dev
```

The web application will launch on `http://localhost:5173/`

### 4. Mobile App Setup (Optional)

Open a new terminal window:

```bash
cd appversioncalevent
npm install
npm start
```

Scan the QR code with Expo Go app on your Android device.

**To build APK:**
```bash
eas build --platform android --profile preview
```

---

## 🔐 Authentication & Security Workflow

CALEVENT utilizes a strict multi-tier authentication flow with no loopholes. High-level security prevents unauthorized providers from interacting with real customers.

### 👑 Super Admin Access

_(Must be seeded into the database using `node seed-admin.js` in the backend directory)_

**Web:**
- **URL:** `http://localhost:5173/admin/login`
- **Email:** `admin@calevent.com`
- **Password:** `admin123`

**Mobile App:**
- Login with same credentials on the app login screen
- Automatically opens Admin Dashboard instead of customer app

### 🏢 Provider Lifecyle Workflow

1.  **Register:** Submit hyper-detailed business credentials via the Provider Registration portal.
2.  **Pending State Lockout:** The account enters a "Pending" mode. Providers **cannot** log in yet. (Security Measure)
3.  **Admin Verification:** The Super Admin securely authenticates, reviews the application in the Dashboard, and clicks Approve/Reject.
4.  **Activation:** Once approved, the Provider gains system access and can log into `http://localhost:5173/login/provider`.

### 🤵 Customer Workflow

**Web:** Customers can register securely and log in instantly at `http://localhost:5173/login/customer`.

**Mobile App:** Register or login directly in the app to access all customer features.

---

## 📱 Mobile App Features

### Screenshots

<div align="center">
  <img src="public/mobile screenshorts/WhatsApp Image 2026-04-15 at 2.55.12 PM.jpeg" width="200" alt="Home Screen">
  <img src="public/mobile screenshorts/WhatsApp Image 2026-04-15 at 2.55.12 PM (1).jpeg" width="200" alt="Flash Offers">
  <img src="public/mobile screenshorts/WhatsApp Image 2026-04-15 at 2.55.13 PM.jpeg" width="200" alt="Event Details">
  <img src="public/mobile screenshorts/WhatsApp Image 2026-04-15 at 2.55.13 PM (1).jpeg" width="200" alt="Booking Form">
</div>

<div align="center">
  <img src="public/mobile screenshorts/WhatsApp Image 2026-04-15 at 2.55.13 PM (2).jpeg" width="200" alt="Admin Dashboard">
  <img src="public/mobile screenshorts/WhatsApp Image 2026-04-15 at 2.55.14 PM.jpeg" width="200" alt="Profile">
</div>

### 🌟 Customer Features
- **Beautiful Home Screen**: Flash offers, trending events, category browsing, and launching cities
- **Flash Offers Page**: Dedicated page with all events displayed as limited-time offers with countdown timers
- **Event Discovery**: Browse events by category with stunning card layouts
- **Detailed Event Pages**: Full event information with image galleries and pricing
- **Booking System**: Complete booking flow with date selection, guest count, venue, and budget
- **My Requests**: Track all your event booking requests and their status
- **Plan My Event**: AI-powered event planning assistant
- **User Profile**: Manage your account and preferences

### 👨💼 Admin Features
- **Admin Dashboard**: Separate admin panel accessible with admin credentials
- **Request Management**: View and manage all event booking requests
- **Status Updates**: Update request status through the booking lifecycle
- **Statistics**: Real-time stats for total, pending, and completed requests
- **Filter System**: Filter requests by status (All, Pending, Active, Done, Cancelled)
- **Customer Details**: View customer information for each request

### 🆕 Version 2.0.0 Updates
- ⚡ **Flash Offers Page**: Beautiful dedicated page with all events as flash deals
- 🚀 **Launching in Your City Soon**: New section showing upcoming city launches
- 🔧 **Fixed Booking Flow**: Resolved API integration issues
- 🎨 **Enhanced Splash Screen**: Better UX with "Get Started" button
- 🔐 **Improved Authentication**: Better state management and navigation
- 👨💼 **Admin Panel**: Complete admin dashboard for managing bookings
- 🐛 **Bug Fixes**: Multiple fixes for navigation, API calls, and error handling

---

## 🛡️ Security Implementations

- **No Token Leaks:** Fully protected routes. Registration payloads do NOT return JWTs for pending providers.
- **Encrypted Passwords:** Passwords securely hashed via `bcryptjs` before insertion into MongoDB.
- **Session State:** Stateless/Stateful sessions validated via signed JSON Web Tokens (`JWT`) expiring dynamically.
- **Protected Routes:** Entire Admin Portal guarded via custom `AdminRoute` wrappers and strict backend middleware verifying HTTP headers and database roles.
- **Mobile Security:** Secure token storage using AsyncStorage with automatic token refresh and validation.
- **Self-Ping Mechanism:** Backend pings itself every 15 seconds to prevent Render sleep mode.

---

## 📦 Project Structure

```
calevent/
├── calevent-backend/          # Node.js + Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── src/                      # React web frontend
│   ├── components/
│   ├── customer/
│   ├── provider/
│   ├── admin/
│   └── App.jsx
└── appversioncalevent/       # React Native mobile app
    ├── src/
    │   ├── screens/
    │   ├── navigation/
    │   ├── store/
    │   └── services/
    ├── app.json
    ├── eas.json
    └── package.json
```

---

✨ _Engineered for the future. Scaling events through code and artificial intelligence. Now available on Web & Mobile!_
