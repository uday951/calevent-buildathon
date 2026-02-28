import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@calevent.com' });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    // Create super admin
    const admin = new Admin({
      name: 'Super Admin',
      email: 'admin@calevent.com',
      password: 'admin123', // Change this in production
      role: 'super_admin',
      permissions: ['manage_users', 'verify_providers', 'moderate_content', 'view_analytics', 'manage_payments']
    });

    await admin.save();
    console.log('✅ Super admin created successfully');
    console.log('Email: admin@calevent.com');
    console.log('Password: admin123');
    console.log('⚠️  Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();