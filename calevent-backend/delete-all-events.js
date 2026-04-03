import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/EventModel.js';

dotenv.config();

const deleteAllEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const count = await Event.countDocuments();
    console.log(`📊 Found ${count} events in database\n`);

    if (count === 0) {
      console.log('✨ No events to delete. Database is already empty.\n');
      process.exit(0);
    }

    console.log('🗑️  Deleting all events...\n');
    const result = await Event.deleteMany({});
    
    console.log(`✅ Successfully deleted ${result.deletedCount} events!\n`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

deleteAllEvents();
