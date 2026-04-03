import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './models/EventModel.js';

dotenv.config();

// Comprehensive collection of free, high-quality images from Unsplash, Pexels, and Pixabay
const eventImages = {
  wedding: [
    // Unsplash - Wedding Images
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80', // Wedding ceremony
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80', // Wedding decoration
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80', // Wedding venue
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80', // Wedding flowers
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80', // Wedding table
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=1200&q=80', // Wedding arch
    
    // Pexels - Wedding Images
    'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2253870/pexels-photo-2253870.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200',
    
    // Pixabay - Wedding Images
    'https://cdn.pixabay.com/photo/2016/11/18/17/46/wedding-1836315_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/07/15/11/32/wedding-2506066_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/03/26/22/21/wedding-1281862_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/08/06/12/52/wedding-2592302_1280.jpg'
  ],
  
  corporate: [
    // Unsplash - Corporate/Conference Images
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80', // Conference room
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80', // Business meeting
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80', // Conference hall
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80', // Auditorium
    'https://images.unsplash.com/photo-1560439514-4e9645039924?w=1200&q=80', // Corporate event
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&q=80', // Business seminar
    
    // Pexels - Corporate Images
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1200',
    
    // Pixabay - Corporate Images
    'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/08/06/22/01/lounge-2596430_1280.jpg',
    'https://cdn.pixabay.com/photo/2015/07/02/10/40/writing-828911_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/02/19/11/19/office-1209640_1280.jpg'
  ],
  
  birthday: [
    // Unsplash - Birthday/Party Images
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80', // Birthday balloons
    'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1200&q=80', // Birthday cake
    'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200&q=80', // Birthday party
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1200&q=80', // Birthday decoration
    'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=1200&q=80', // Party setup
    'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&q=80', // Birthday celebration
    
    // Pexels - Birthday Images
    'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1857157/pexels-photo-1857157.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=1200',
    
    // Pixabay - Birthday Images
    'https://cdn.pixabay.com/photo/2017/06/20/22/14/man-2425121_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/29/02/05/audience-1866738_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/07/21/23/57/concert-2527495_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/29/09/32/concept-1868728_1280.jpg'
  ],
  
  anniversary: [
    // Unsplash - Anniversary/Celebration Images
    'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80', // Romantic dinner
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&q=80', // Elegant table
    'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80', // Celebration
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80', // Anniversary party
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80', // Romantic setup
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80', // Fine dining
    
    // Pexels - Anniversary Images
    'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/3171815/pexels-photo-3171815.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=1200',
    
    // Pixabay - Anniversary Images
    'https://cdn.pixabay.com/photo/2016/11/21/16/03/candles-1846038_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/02/15/10/39/salad-2068220_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/29/12/54/cafe-1869656_1280.jpg',
    'https://cdn.pixabay.com/photo/2015/05/15/14/27/restaurant-768441_1280.jpg'
  ],
  
  conference: [
    // Unsplash - Conference/Seminar Images
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80', // Conference
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80', // Meeting room
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80', // Large conference
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80', // Conference hall
    'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&q=80', // Tech conference
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&q=80', // Business event
    
    // Pexels - Conference Images
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=1200',
    
    // Pixabay - Conference Images
    'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg',
    'https://cdn.pixabay.com/photo/2014/07/31/23/00/wembley-407046_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/02/19/11/19/office-1209640_1280.jpg',
    'https://cdn.pixabay.com/photo/2015/07/02/10/40/writing-828911_1280.jpg'
  ],
  
  party: [
    // Unsplash - Party/Event Images
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80', // Party crowd
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80', // Music event
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80', // DJ party
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80', // Night party
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80', // Dance party
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80', // Party lights
    
    // Pexels - Party Images
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200',
    'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1200',
    
    // Pixabay - Party Images
    'https://cdn.pixabay.com/photo/2016/11/29/02/05/audience-1866738_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/23/15/48/audience-1853662_1280.jpg',
    'https://cdn.pixabay.com/photo/2017/07/21/23/57/concert-2527495_1280.jpg',
    'https://cdn.pixabay.com/photo/2016/11/22/19/15/hand-1850120_1280.jpg'
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
    console.log('✅ Connected to MongoDB\n');

    // Get all events
    const events = await Event.find({});
    console.log(`📊 Found ${events.length} events to update\n`);

    if (events.length === 0) {
      console.log('⚠️  No events found in database');
      process.exit(0);
    }

    let updatedCount = 0;
    const categoryCount = {};

    // Update each event with appropriate image
    for (const event of events) {
      const newImage = getRandomImage(event.category);
      
      // Track category counts
      categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
      
      console.log(`📝 [${updatedCount + 1}/${events.length}] ${event.title}`);
      console.log(`   📂 Category: ${event.category}`);
      console.log(`   🖼️  New Image: ${newImage.substring(0, 60)}...`);

      event.eventImage = newImage;
      await event.save();
      updatedCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Successfully updated all events with free images!');
    console.log('='.repeat(60));
    
    console.log('\n📊 Summary by Category:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`   ${category.padEnd(15)}: ${count} events`);
    });

    console.log('\n📸 Image Sources Used:');
    console.log('   ✓ Unsplash (https://unsplash.com) - Free high-quality photos');
    console.log('   ✓ Pexels (https://pexels.com) - Free stock photos');
    console.log('   ✓ Pixabay (https://pixabay.com) - Free images & videos');
    
    console.log('\n✨ All images are:');
    console.log('   • Completely FREE to use');
    console.log('   • High quality (1200px width)');
    console.log('   • Safe and licensed');
    console.log('   • No attribution required');
    console.log('   • Optimized for web');

  } catch (error) {
    console.error('\n❌ Error updating event images:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the update
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║        CALEVENT - Event Image Updater                     ║');
console.log('║        Using Free Images from Trusted Sources             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

updateEventImages();
