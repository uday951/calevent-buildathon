import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/EventModel.js';

dotenv.config();

// Free image URLs from Unsplash, Pexels, and Pixabay
const eventImages = {
  wedding: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?w=800',
    'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?w=800',
    'https://cdn.pixabay.com/photo/2016/11/18/17/46/wedding-1836315_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/07/15/11/32/wedding-2506066_1280.jpg'
  ],
  corporate: [
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?w=800',
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?w=800',
    'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/08/06/22/01/lounge-2596430_1280.jpg'
  ],
  birthday: [
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
    'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800',
    'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?w=800',
    'https://images.pexels.com/photos/1857157/pexels-photo-1857157.jpeg?w=800',
    'https://cdn.pixabay.com/photo/2017/06/20/22/14/man-2425121_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/29/02/05/audience-1866738_1280.jpg'
  ],
  anniversary: [
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?w=800',
    'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?w=800',
    'https://cdn.pixabay.com/photo/2016/11/21/16/03/candles-1846038_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/02/15/10/39/salad-2068220_1280.jpg'
  ],
  conference: [
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?w=800',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?w=800',
    'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg',
    'https://cdn.pixabay.com/photo/2014/07/31/23/00/wembley-407046_1280.jpg'
  ],
  party: [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?w=800',
    'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?w=800',
    'https://cdn.pixabay.com/photo/2016/11/29/02/05/audience-1866738_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg'
  ]
};

// Get random image for category
const getRandomImage = (category) => {
  const images = eventImages[category] || eventImages.party;
  return images[Math.floor(Math.random() * images.length)];
};

const updateEventImages = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all events
    const events = await Event.find({});
    console.log(`📊 Found ${events.length} events to update`);

    if (events.length === 0) {
      console.log('⚠️  No events found in database');
      process.exit(0);
    }

    let updatedCount = 0;

    // Update each event with appropriate image
    for (const event of events) {
      const newImage = getRandomImage(event.category);
      
      console.log(`\n📝 Updating: ${event.title}`);
      console.log(`   Category: ${event.category}`);
      console.log(`   Old Image: ${event.eventImage}`);
      console.log(`   New Image: ${newImage}`);

      event.eventImage = newImage;
      await event.save();
      updatedCount++;
    }

    console.log(`\n✅ Successfully updated ${updatedCount} events with free images!`);
    console.log('\n📸 Image sources used:');
    console.log('   - Unsplash (https://unsplash.com)');
    console.log('   - Pexels (https://pexels.com)');
    console.log('   - Pixabay (https://pixabay.com)');
    console.log('\n✨ All images are free to use and safe!');

  } catch (error) {
    console.error('❌ Error updating event images:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the update
updateEventImages();
