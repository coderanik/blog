import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog';
// For local MongoDB without authentication, just use the URI directly
const connectionString = MONGODB_URI;

async function createAdmin() {
  try {
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB');

    const username = process.argv[2] || process.env.ADMIN_USERNAME || 'admin';
    const password = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin123';

    // Check if admin already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      console.log('❌ User already exists');
      process.exit(1);
    }

    // Create admin user
    const admin = new User({
      username: username.toLowerCase(),
      password,
      email: `admin@example.com`
    });

    await admin.save();
    console.log(`✅ Admin user created successfully!`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();

