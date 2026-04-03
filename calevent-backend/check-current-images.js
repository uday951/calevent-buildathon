import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/EventModel.js';

dotenv.config();

const checkImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const events = await Event.find({}).select('title eventImage category').sort({ createdAt: -1 });
    
    console.log(`📊 Total Events: ${events.length}\n`);
    
    // Group by image URL
    const imageGroups = {};
    events.forEach(event => {
      const img = event.eventImage || 'NO_IMAGE';
      if (!imageGroups[img]) imageGroups[img] = [];
      imageGroups[img].push(event.title);
    });

    console.log('🖼️  IMAGE USAGE ANALYSIS:\n');
    Object.entries(imageGroups).forEach(([url, titles]) => {
      console.log(`Image: ${url}`);
      console.log(`Used by ${titles.length} events:`);
      titles.forEach(t => console.log(`  - ${t}`));
      console.log('');
    });

    // Show all events with their images
    console.log('\n📋 ALL EVENTS WITH IMAGES:\n');
    events.forEach((e, i) => {
      console.log(`${i + 1}. [${e.category}] ${e.title}`);
      console.log(`   Image: ${e.eventImage || 'NONE'}\n`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

checkImages();
