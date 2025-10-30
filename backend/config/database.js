import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor';
    
    console.log('🔍 MongoDB URI (masked):', mongoURI.replace(/:[^:@]+@/, ':****@'));
    
    // Set connection timeout to 10 seconds
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database Name: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('📋 Error Details:', error.name);
    
    // Common issues and solutions
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Tip: MongoDB server is not running or not accessible');
    } else if (error.message.includes('Authentication failed') || error.message.includes('auth')) {
      console.log('💡 Tip: Check username and password in MONGODB_URI');
    } else if (error.message.includes('timed out') || error.message.includes('timeout')) {
      console.log('💡 Tip: IP not whitelisted in MongoDB Atlas Network Access');
      console.log('   👉 Go to MongoDB Atlas → Network Access → Add IP Address → Allow from Anywhere');
    }
    
    // If MongoDB is optional, continue without it
    if (process.env.MONGODB_OPTIONAL === 'true') {
      console.log('⚠️  Continuing without MongoDB (MONGODB_OPTIONAL=true)');
      return null;
    } else if (process.env.MONGODB_OPTIONAL === 'false') {
      console.log('⚠️  Continuing without MongoDB (Connection failed but MONGODB_OPTIONAL=false)');
      return null;
    }
    
    // Otherwise exit the process
    process.exit(1);
  }
};

export default connectDB;
