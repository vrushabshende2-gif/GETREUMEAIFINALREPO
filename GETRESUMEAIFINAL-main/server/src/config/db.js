const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@getresume.ai';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminSecurePass123!';
    
    const adminExists = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        isAdmin: true,
        isVerified: true
      });
      console.log(`[SEED] Admin user (${adminEmail}) seeded successfully.`);
    } else {
      if (!adminExists.isAdmin || !adminExists.isVerified) {
        adminExists.isAdmin = true;
        adminExists.isVerified = true;
        await adminExists.save({ validateBeforeSave: false });
        console.log(`[SEED] Existing user updated to verified Admin.`);
      }
    }
  } catch (error) {
    console.error(`[SEED] Error seeding admin: ${error.message}`);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedAdmin();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

