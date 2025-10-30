import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor');
    console.log('✅ Connected to MongoDB\n');

    const user = await User.findOne({ email: 'jino@gmail.com' }).select('+password');
    
    if (user) {
      console.log('👤 User found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Created:', user.createdAt);
      console.log('   Last Login:', user.lastLogin);
      console.log('   Password Hash:', user.password.substring(0, 20) + '...');
      console.log('   Hash starts with $2a$:', user.password.startsWith('$2a$'));
      console.log('\n💡 This user exists! If you forgot the password, you can:');
      console.log('   1. Try the password you used when creating the account');
      console.log('   2. Login with demo account: student@demo.com / demo123');
      console.log('   3. Create a new account');
    } else {
      console.log('❌ User not found: jino@gmail.com');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkUser();
