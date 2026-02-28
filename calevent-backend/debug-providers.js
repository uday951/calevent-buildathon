import mongoose from 'mongoose';
import Provider from './models/Provider.js';
import dotenv from 'dotenv';

dotenv.config();

async function debugProviders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Get all providers
    const providers = await Provider.find({});
    console.log('\n📊 Total providers:', providers.length);
    
    if (providers.length > 0) {
      console.log('\n📋 First provider structure:');
      console.log(JSON.stringify(providers[0], null, 2));
      
      console.log('\n📋 All provider names and categories:');
      providers.forEach((p, i) => {
        console.log(`${i + 1}. ${p.businessName || p.name} - Categories: ${JSON.stringify(p.categories)}`);
      });
    } else {
      console.log('❌ No providers found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

debugProviders();