import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Event from './models/EventModel.js';

dotenv.config();

const checkImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');
    
    const events = await Event.find().limit(5);
    
    console.log('Sample event images:');
    events.forEach((event, i) => {
      console.log(`\n${i + 1}. ${event.title}`);
      console.log(`   eventImage: "${event.eventImage}"`);
      console.log(`   Starts with http: ${event.eventImage?.startsWith('http')}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkImages();
