const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/FleetTrack';

// Try importing your actual User model if present, otherwise fallback
let User;
try {
  User = require('./models/User');
} catch (e) {
  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'admin' }
  });
  User = mongoose.model('User', userSchema);
}

const seedAdmin = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for Seeding...');

    // Delete previous admin if credentials were corrupted
    await User.deleteOne({ email: 'admin@fleettrack.com' });

    // Re-create Admin (Using User.create so schema hooks like bcrypt automatically hash the password)
    const admin = new User({
      name: 'System Admin',
      email: 'admin@fleettrack.com',
      password: 'Admin@123',
      role: 'admin'
    });

    await admin.save();
    console.log('✅ Admin user created/reset successfully!');
    console.log('\n-----------------------------------');
    console.log(' Email:    admin@fleettrack.com');
    console.log(' Password: Admin@123');
    console.log('-----------------------------------\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();