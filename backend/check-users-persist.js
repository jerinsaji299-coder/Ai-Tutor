import mongoose from 'mongoose';
import User from './models/User.js';

const checkUsers = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ai-tutor');
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find();
    console.log(`\n📊 Total users in database: ${users.length}\n`);
    
    users.forEach(user => {
      console.log(`  • ${user.email} (${user.role})`);
      console.log(`    Name: ${user.name}`);
      console.log(`    Created: ${user.createdAt}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkUsers();
