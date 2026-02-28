import mongoose from 'mongoose';
import Provider from './models/Provider.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleProviders = [
  {
    businessName: "Royal Events Co.",
    email: "contact@royalevents.com",
    password: "password123",
    categories: ["wedding", "corporate"],
    location: { city: "Mumbai", state: "Maharashtra" },
    contactInfo: { phone: "+91-9876543210" },
    rating: 4.5,
    isActive: true
  },
  {
    businessName: "Dream Decorators",
    email: "info@dreamdecorators.com", 
    password: "password123",
    categories: ["wedding", "birthday"],
    location: { city: "Delhi", state: "Delhi" },
    contactInfo: { phone: "+91-9876543211" },
    rating: 4.2,
    isActive: true
  },
  {
    businessName: "Elite Party Planners",
    email: "hello@eliteparty.com",
    password: "password123", 
    categories: ["corporate", "anniversary"],
    location: { city: "Bangalore", state: "Karnataka" },
    contactInfo: { phone: "+91-9876543212" },
    rating: 4.7,
    isActive: true
  },
  {
    businessName: "Celebration Masters",
    email: "team@celebrationmasters.com",
    password: "password123",
    categories: ["wedding", "birthday", "corporate"],
    location: { city: "Mumbai", state: "Maharashtra" },
    contactInfo: { phone: "+91-9876543213" },
    rating: 4.3,
    isActive: true
  },
  {
    businessName: "Perfect Moments",
    email: "contact@perfectmoments.com",
    password: "password123",
    categories: ["wedding", "anniversary"],
    location: { city: "Pune", state: "Maharashtra" },
    contactInfo: { phone: "+91-9876543214" },
    rating: 4.6,
    isActive: true
  }
];

async function seedProviders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing providers
    await Provider.deleteMany({});
    console.log('Cleared existing providers');
    
    // Insert sample providers
    await Provider.insertMany(sampleProviders);
    console.log('✅ Sample providers added successfully!');
    
    const count = await Provider.countDocuments();
    console.log(`Total providers in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error seeding providers:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedProviders();