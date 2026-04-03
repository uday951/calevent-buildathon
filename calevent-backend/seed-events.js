import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/EventModel.js';

dotenv.config();

const events = [
  // ─── WEDDINGS ───────────────────────────────────────────────
  {
    title: "Royal Palace Wedding Experience",
    description: "Transform your special day into a fairytale with our premium palace wedding package. Grand mandap, floral decorations, catering for 500 guests, live music, and professional photography.",
    category: "wedding", subcategory: "full_package", tag: "premium", createdBy: "admin",
    price: 850000, priceMax: 1200000,
    eventImage: "/weddings/m.jpg",
    images: ["/weddings/m (2).jpg", "/weddings/m (3).jpg", "/weddings/m (4).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Heritage Palace Grounds", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
    features: ["Grand Mandap", "500+ Guest Capacity", "Premium Catering", "Live Band", "Professional Photography", "Luxury Decor"],
    maxCapacity: 500, minCapacity: 200, duration: "Full Day (12 hours)",
    inclusions: ["Venue Decoration", "Catering", "Photography", "Videography", "DJ & Sound", "Lighting"],
    exclusions: ["Guest Accommodation", "Transportation"],
    rating: 4.9, isActive: true
  },
  {
    title: "Beachside Destination Wedding",
    description: "Say 'I do' with waves as your backdrop. Intimate beach wedding setup with sunset ceremony, bonfire reception, and gourmet seafood catering.",
    category: "wedding", subcategory: "venue", tag: "trending", createdBy: "admin",
    price: 650000, priceMax: 900000,
    eventImage: "/weddings/m (5).jpg",
    images: ["/weddings/m (6).jpg", "/weddings/m (7).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Sunset Beach Resort", city: "Goa", state: "Goa", pincode: "403001" },
    features: ["Beach Setup", "Sunset Ceremony", "Bonfire", "Seafood Catering", "Acoustic Music"],
    maxCapacity: 150, minCapacity: 50, duration: "8 hours",
    inclusions: ["Beach Decor", "Catering", "Music", "Basic Photography"],
    exclusions: ["Accommodation", "Alcohol"],
    rating: 4.8, isActive: true
  },
  {
    title: "Garden Wedding Elegance",
    description: "Enchanting garden wedding with floral arches, fairy lights, and nature-inspired decor. Perfect for intimate ceremonies with up to 200 guests.",
    category: "wedding", subcategory: "decoration", tag: "popular", createdBy: "admin",
    price: 320000, priceMax: 450000,
    eventImage: "/weddings/m (8).jpg",
    images: ["/weddings/m (9).jpg", "/weddings/m (10).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Botanical Gardens", city: "Bangalore", state: "Karnataka", pincode: "560001" },
    features: ["Floral Arches", "Fairy Lights", "Garden Setup", "Organic Catering"],
    maxCapacity: 200, minCapacity: 80, duration: "6 hours",
    inclusions: ["Decoration", "Catering", "Photography"],
    exclusions: ["DJ", "Videography"],
    rating: 4.7, isActive: true
  },
  {
    title: "Traditional Indian Mandap Wedding",
    description: "A grand traditional Indian wedding with an ornate mandap, priest arrangements, full catering, baraat welcome, and complete decor.",
    category: "wedding", subcategory: "full_package", tag: "bestseller", createdBy: "admin",
    price: 480000, priceMax: 700000,
    eventImage: "/weddings/m (11).jpg",
    images: ["/weddings/images.jpg", "/weddings/images-2.jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Grand Banquet Hall", city: "Delhi", state: "Delhi", pincode: "110001" },
    features: ["Ornate Mandap", "Priest Arrangements", "Baraat Welcome", "Full Catering", "Bridal Suite"],
    maxCapacity: 400, minCapacity: 150, duration: "Full Day",
    inclusions: ["Mandap", "Catering", "Decoration", "Sound System", "Photography"],
    exclusions: ["Accommodation", "Honeymoon Package"],
    rating: 4.8, isActive: true
  },
  {
    title: "Royal Bridal Wedding Package",
    description: "Complete bridal experience with makeup artists, bridal suite, phera ceremony, and a grand reception dinner for 300 guests.",
    category: "wedding", subcategory: "full_package", tag: "premium", createdBy: "admin",
    price: 720000, priceMax: 1000000,
    eventImage: "/weddings/royal_broz_event_and_wedding_planner_1_15_232983_157303596628983.jpg",
    images: ["/weddings/wedding-party-event-management.jpg", "/weddings/429baf18cbb66c62afa1fcb44918dd6e.jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "5-Star Hotel Ballroom", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    features: ["Bridal Suite", "Makeup Artists", "Phera Ceremony", "Grand Reception", "Live Orchestra"],
    maxCapacity: 300, minCapacity: 100, duration: "Full Day (14 hours)",
    inclusions: ["Bridal Makeup", "Decoration", "Catering", "Photography", "Videography", "DJ"],
    exclusions: ["Honeymoon", "Guest Accommodation"],
    rating: 4.9, isActive: true
  },

  // ─── CORPORATE ──────────────────────────────────────────────
  {
    title: "Executive Conference & Summit",
    description: "Professional conference setup with state-of-the-art AV equipment, breakout rooms, networking lounge, and gourmet catering for 200–500 attendees.",
    category: "corporate", subcategory: "full_package", tag: "premium", createdBy: "admin",
    price: 450000, priceMax: 750000,
    eventImage: "/corporate/1df693c9-6be4-43be-a0a7-683ed62d091e.jpg",
    images: ["/corporate/3b2d72e0-8816-429a-8b95-d534b8849067.jpg", "/corporate/f9a645c2-2f8a-4bcc-add7-c6652a6251c4.jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Tech Convention Center", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    features: ["AV Equipment", "Stage Setup", "Breakout Rooms", "High-Speed WiFi", "Registration Desk"],
    maxCapacity: 500, minCapacity: 200, duration: "Full Day",
    inclusions: ["Venue", "AV Equipment", "Catering", "Registration Management"],
    exclusions: ["Accommodation", "Travel"],
    rating: 4.8, isActive: true
  },
  {
    title: "Product Launch Extravaganza",
    description: "Make your product launch unforgettable with LED walls, interactive displays, media coverage setup, and celebrity host arrangements.",
    category: "corporate", subcategory: "stage", tag: "trending", createdBy: "admin",
    price: 580000, priceMax: 850000,
    eventImage: "/corporate/3b2d72e0-8816-429a-8b95-d534b8849067.jpg",
    images: ["/corporate/f9a645c2-2f8a-4bcc-add7-c6652a6251c4.jpg", "/corporate/1df693c9-6be4-43be-a0a7-683ed62d091e.jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Grand Exhibition Hall", city: "Delhi", state: "Delhi", pincode: "110001" },
    features: ["LED Walls", "Interactive Displays", "Media Setup", "Celebrity Host", "Red Carpet"],
    maxCapacity: 300, minCapacity: 100, duration: "4 hours",
    inclusions: ["Stage Setup", "Lighting", "Sound", "Media Management"],
    exclusions: ["Celebrity Fees", "Catering"],
    rating: 4.9, isActive: true
  },
  {
    title: "Team Building Retreat",
    description: "Outdoor team building activities, workshops, adventure sports, and bonding sessions. Includes meals and activity coordinators.",
    category: "corporate", subcategory: "full_package", tag: "popular", createdBy: "admin",
    price: 180000, priceMax: 280000,
    eventImage: "/corporate/f9a645c2-2f8a-4bcc-add7-c6652a6251c4.jpg",
    images: ["/corporate/1df693c9-6be4-43be-a0a7-683ed62d091e.jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Adventure Resort", city: "Lonavala", state: "Maharashtra", pincode: "410401" },
    features: ["Adventure Activities", "Team Games", "Workshop Rooms", "Outdoor Setup"],
    maxCapacity: 100, minCapacity: 30, duration: "2 Days",
    inclusions: ["Activities", "Meals", "Coordinators", "Equipment"],
    exclusions: ["Accommodation", "Transportation"],
    rating: 4.6, isActive: true
  },

  // ─── BIRTHDAYS ──────────────────────────────────────────────
  {
    title: "Kids Birthday Carnival",
    description: "Ultimate kids party with bouncy castles, magic show, face painting, games, themed decor, and custom cake. Entertainment guaranteed!",
    category: "birthday", subcategory: "full_package", tag: "bestseller", createdBy: "admin",
    price: 45000, priceMax: 75000,
    eventImage: "/Birthdays/b.jpg",
    images: ["/Birthdays/b (2).jpg", "/Birthdays/b (3).jpg", "/Birthdays/b (4).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Party Lawn", city: "Pune", state: "Maharashtra", pincode: "411001" },
    features: ["Bouncy Castle", "Magic Show", "Face Painting", "Games", "Themed Decor", "Custom Cake"],
    maxCapacity: 80, minCapacity: 20, duration: "4 hours",
    inclusions: ["Entertainment", "Decoration", "Cake", "Snacks"],
    exclusions: ["Meals", "Return Gifts"],
    rating: 4.8, isActive: true
  },
  {
    title: "Luxury Adult Birthday Bash",
    description: "Sophisticated birthday celebration with DJ, premium bar, gourmet catering, and elegant decor. Perfect for milestone birthdays.",
    category: "birthday", subcategory: "full_package", tag: "premium", createdBy: "admin",
    price: 125000, priceMax: 200000,
    eventImage: "/Birthdays/b (5).jpg",
    images: ["/Birthdays/b (6).jpg", "/Birthdays/b (7).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Rooftop Lounge", city: "Mumbai", state: "Maharashtra", pincode: "400050" },
    features: ["DJ", "Premium Bar", "Gourmet Catering", "Elegant Decor", "Photo Booth"],
    maxCapacity: 150, minCapacity: 50, duration: "6 hours",
    inclusions: ["DJ", "Catering", "Bar", "Decoration", "Photography"],
    exclusions: ["Valet Parking"],
    rating: 4.7, isActive: true
  },
  {
    title: "Surprise Birthday Party Setup",
    description: "We plan the perfect surprise! Secret coordination with family, balloon drops, custom banners, and a fully themed venue setup.",
    category: "birthday", subcategory: "decoration", tag: "trending", createdBy: "admin",
    price: 35000, priceMax: 60000,
    eventImage: "/Birthdays/b (8).jpg",
    images: ["/Birthdays/b (9).jpg", "/Birthdays/b (10).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Banquet Hall", city: "Hyderabad", state: "Telangana", pincode: "500001" },
    features: ["Surprise Coordination", "Balloon Drop", "Custom Banners", "Themed Setup", "Cake"],
    maxCapacity: 60, minCapacity: 15, duration: "3 hours",
    inclusions: ["Decoration", "Cake", "Balloon Setup", "Coordination"],
    exclusions: ["Catering", "DJ"],
    rating: 4.6, isActive: true
  },
  {
    title: "Neon Glow Birthday Night",
    description: "Trendy neon-themed birthday party with UV lights, glow accessories, DJ, and a vibrant dance floor for teens and young adults.",
    category: "birthday", subcategory: "dj", tag: "trending", createdBy: "admin",
    price: 55000, priceMax: 90000,
    eventImage: "/Birthdays/b (2).jpg",
    images: ["/Birthdays/b (3).jpg", "/Birthdays/b (4).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Club Venue", city: "Bangalore", state: "Karnataka", pincode: "560001" },
    features: ["UV Lights", "Glow Accessories", "DJ", "Dance Floor", "Neon Decor"],
    maxCapacity: 100, minCapacity: 30, duration: "5 hours",
    inclusions: ["DJ", "Lighting", "Decoration", "Glow Accessories"],
    exclusions: ["Catering", "Bar"],
    rating: 4.7, isActive: true
  },

  // ─── ENGAGEMENT ─────────────────────────────────────────────
  {
    title: "Romantic Engagement Ceremony",
    description: "Intimate engagement setup with floral arrangements, ring ceremony stage, professional photography, and dinner for close family and friends.",
    category: "engagement", subcategory: "decoration", tag: "trending", createdBy: "admin",
    price: 95000, priceMax: 150000,
    eventImage: "/enggement/e.jpg",
    images: ["/enggement/e (2).jpg", "/enggement/e (3).jpg", "/enggement/e (4).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Garden Banquet", city: "Chandigarh", state: "Punjab", pincode: "160001" },
    features: ["Floral Decor", "Ring Ceremony Stage", "Photography", "Catering"],
    maxCapacity: 100, minCapacity: 30, duration: "4 hours",
    inclusions: ["Decoration", "Photography", "Catering"],
    exclusions: ["Videography", "DJ"],
    rating: 4.8, isActive: true
  },
  {
    title: "Grand Engagement Celebration",
    description: "A lavish engagement event with a grand stage, live music, premium catering, and a stunning floral backdrop for the perfect ring moment.",
    category: "engagement", subcategory: "full_package", tag: "premium", createdBy: "admin",
    price: 180000, priceMax: 280000,
    eventImage: "/enggement/e (5).jpg",
    images: ["/enggement/e (6).jpg", "/enggement/e (7).jpg", "/enggement/e (8).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "5-Star Hotel", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    features: ["Grand Stage", "Live Music", "Premium Catering", "Floral Backdrop", "Photo Booth"],
    maxCapacity: 200, minCapacity: 80, duration: "6 hours",
    inclusions: ["Stage", "Decoration", "Catering", "Photography", "Videography", "Music"],
    exclusions: ["Accommodation"],
    rating: 4.9, isActive: true
  },
  {
    title: "Intimate Ring Ceremony",
    description: "A cozy and intimate ring ceremony for close family with elegant decor, a beautiful ring exchange setup, and a sit-down dinner.",
    category: "engagement", subcategory: "decoration", tag: "popular", createdBy: "admin",
    price: 55000, priceMax: 85000,
    eventImage: "/enggement/e (9).jpg",
    images: ["/enggement/e (10).jpg", "/enggement/e (11).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Private Banquet", city: "Jaipur", state: "Rajasthan", pincode: "302001" },
    features: ["Elegant Decor", "Ring Exchange Setup", "Sit-Down Dinner", "Floral Arrangements"],
    maxCapacity: 60, minCapacity: 20, duration: "3 hours",
    inclusions: ["Decoration", "Dinner", "Floral Setup"],
    exclusions: ["Photography", "DJ"],
    rating: 4.7, isActive: true
  },
  {
    title: "Rooftop Engagement Under Stars",
    description: "A dreamy rooftop engagement ceremony with fairy lights, candles, a live acoustic guitarist, and a gourmet dinner for two families.",
    category: "engagement", subcategory: "venue", tag: "trending", createdBy: "admin",
    price: 120000, priceMax: 180000,
    eventImage: "/enggement/e (12).jpg",
    images: ["/enggement/e (13).jpg", "/enggement/e (14).jpg", "/enggement/e (15).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Rooftop Venue", city: "Delhi", state: "Delhi", pincode: "110001" },
    features: ["Fairy Lights", "Candle Setup", "Acoustic Guitarist", "Gourmet Dinner", "Starlit Ambience"],
    maxCapacity: 80, minCapacity: 25, duration: "4 hours",
    inclusions: ["Decoration", "Music", "Catering", "Photography"],
    exclusions: ["Videography"],
    rating: 4.8, isActive: true
  },

  // ─── HALDI ──────────────────────────────────────────────────
  {
    title: "Traditional Haldi Ceremony",
    description: "Vibrant haldi ceremony with traditional decor, marigold flowers, dhol players, and authentic catering. Celebrate with colors and joy!",
    category: "haldi", subcategory: "decoration", tag: "popular", createdBy: "admin",
    price: 65000, priceMax: 95000,
    eventImage: "/haldi/h.jpg",
    images: ["/haldi/h (2).jpg", "/haldi/h (3).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Traditional Courtyard", city: "Jaipur", state: "Rajasthan", pincode: "302016" },
    features: ["Marigold Decor", "Dhol Players", "Traditional Setup", "Haldi Arrangements"],
    maxCapacity: 120, minCapacity: 40, duration: "3 hours",
    inclusions: ["Decoration", "Dhol", "Catering", "Haldi Setup"],
    exclusions: ["Photography", "DJ"],
    rating: 4.6, isActive: true
  },
  {
    title: "Grand Haldi & Mehendi Celebration",
    description: "A combined haldi and mehendi event with professional mehendi artists, dhol, folk music, traditional food, and vibrant floral decor.",
    category: "haldi", subcategory: "full_package", tag: "trending", createdBy: "admin",
    price: 95000, priceMax: 140000,
    eventImage: "/haldi/h (4).jpg",
    images: ["/haldi/h (5).jpg", "/haldi/h (6).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Heritage Haveli", city: "Udaipur", state: "Rajasthan", pincode: "313001" },
    features: ["Mehendi Artists", "Dhol", "Folk Music", "Traditional Food", "Floral Decor"],
    maxCapacity: 150, minCapacity: 50, duration: "5 hours",
    inclusions: ["Mehendi", "Decoration", "Catering", "Music", "Dhol"],
    exclusions: ["Photography", "Videography"],
    rating: 4.7, isActive: true
  },
  {
    title: "Intimate Haldi Morning Ritual",
    description: "A close-knit haldi morning with family, featuring turmeric paste ceremony, traditional songs, and a light breakfast spread.",
    category: "haldi", subcategory: "decoration", tag: "popular", createdBy: "admin",
    price: 35000, priceMax: 55000,
    eventImage: "/haldi/h (2).jpg",
    images: ["/haldi/h (3).jpg", "/haldi/h.jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Home Venue / Lawn", city: "Pune", state: "Maharashtra", pincode: "411001" },
    features: ["Turmeric Ceremony", "Traditional Songs", "Breakfast Spread", "Floral Decor"],
    maxCapacity: 60, minCapacity: 20, duration: "2 hours",
    inclusions: ["Decoration", "Haldi Setup", "Breakfast"],
    exclusions: ["DJ", "Photography"],
    rating: 4.5, isActive: true
  },

  // ─── ANNIVERSARY ────────────────────────────────────────────
  {
    title: "Golden Anniversary Celebration",
    description: "Celebrate 50 years of togetherness with an elegant anniversary party. Includes live music, gourmet dinner, and memory slideshow.",
    category: "anniversary", subcategory: "full_package", tag: "premium", createdBy: "admin",
    price: 155000, priceMax: 220000,
    eventImage: "/weddings/m (3).jpg",
    images: ["/weddings/m (4).jpg", "/weddings/m (5).jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Heritage Hotel", city: "Udaipur", state: "Rajasthan", pincode: "313001" },
    features: ["Live Music", "Gourmet Dinner", "Memory Slideshow", "Elegant Decor"],
    maxCapacity: 150, minCapacity: 50, duration: "5 hours",
    inclusions: ["Venue", "Catering", "Music", "Decoration", "AV Setup"],
    exclusions: ["Accommodation"],
    rating: 4.9, isActive: true
  },

  // ─── PARTY ──────────────────────────────────────────────────
  {
    title: "Pool Party Extravaganza",
    description: "Ultimate pool party with DJ, cocktail bar, BBQ grill, pool games, and tropical decor. Perfect for summer celebrations!",
    category: "party", subcategory: "dj", tag: "trending", createdBy: "admin",
    price: 85000, priceMax: 130000,
    eventImage: "/parties/images-3.jpg",
    images: ["/parties/images-4.jpg", "/parties/images-5.jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Poolside Resort", city: "Goa", state: "Goa", pincode: "403516" },
    features: ["Pool Access", "DJ", "Cocktail Bar", "BBQ", "Tropical Decor", "Pool Games"],
    maxCapacity: 100, minCapacity: 30, duration: "6 hours",
    inclusions: ["DJ", "Bar", "BBQ", "Decoration", "Pool Games"],
    exclusions: ["Accommodation"],
    rating: 4.7, isActive: true
  },
  {
    title: "New Year's Eve Gala",
    description: "Ring in the new year with style! Live band, champagne toast, gourmet buffet, and spectacular fireworks display.",
    category: "party", subcategory: "full_package", tag: "bestseller", createdBy: "admin",
    price: 195000, priceMax: 280000,
    eventImage: "/parties/images-4.jpg",
    images: ["/parties/images-5.jpg", "/parties/images-3.jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "Sky Lounge", city: "Mumbai", state: "Maharashtra", pincode: "400001" },
    features: ["Live Band", "Champagne Toast", "Gourmet Buffet", "Fireworks", "Premium Bar"],
    maxCapacity: 200, minCapacity: 80, duration: "8 hours",
    inclusions: ["Entertainment", "Catering", "Bar", "Fireworks", "Decoration"],
    exclusions: ["Valet Parking"],
    rating: 4.9, isActive: true
  },

  // ─── CONFERENCE ─────────────────────────────────────────────
  {
    title: "Tech Summit & Expo",
    description: "Large-scale tech conference with exhibition booths, keynote stage, networking zones, and digital registration system.",
    category: "conference", subcategory: "full_package", tag: "premium", createdBy: "admin",
    price: 680000, priceMax: 950000,
    eventImage: "/corporate/1df693c9-6be4-43be-a0a7-683ed62d091e.jpg",
    images: ["/corporate/3b2d72e0-8816-429a-8b95-d534b8849067.jpg"],
    providerName: "CALEVENT", providerId: null,
    location: { address: "International Convention Center", city: "Bangalore", state: "Karnataka", pincode: "560001" },
    features: ["Exhibition Booths", "Keynote Stage", "Networking Zones", "Digital Registration", "High-Speed WiFi"],
    maxCapacity: 1000, minCapacity: 300, duration: "3 Days",
    inclusions: ["Venue", "AV Equipment", "Registration System", "Catering", "WiFi"],
    exclusions: ["Booth Setup", "Accommodation"],
    rating: 4.8, isActive: true
  }
];

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');

    await Event.insertMany(events);
    console.log(`✅ Successfully seeded ${events.length} events`);
    console.log('Categories: wedding(5), corporate(3), birthday(4), engagement(4), haldi(3), anniversary(1), party(2), conference(1)');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
