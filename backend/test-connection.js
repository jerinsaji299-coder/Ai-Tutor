import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing MongoDB Connection...\n');

const uri = process.env.MONGODB_URI;
console.log('📋 Connection Details:');
console.log('- Full URI:', uri);
console.log('- Username:', uri?.match(/mongodb\+srv:\/\/([^:]+):/)?.[1] || 'NOT FOUND');
console.log('- Cluster:', uri?.match(/@([^/]+)/)?.[1] || 'NOT FOUND');
console.log('- Database:', uri?.match(/\/([^?]+)/)?.[1] || 'NOT FOUND');

console.log('\n🔄 Attempting connection with 30 second timeout...\n');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000
})
.then(() => {
  console.log('✅ SUCCESS! MongoDB Connected');
  console.log('📊 Connection State:', mongoose.connection.readyState);
  console.log('🎯 Database Name:', mongoose.connection.name);
  console.log('🌐 Host:', mongoose.connection.host);
  process.exit(0);
})
.catch((error) => {
  console.log('❌ CONNECTION FAILED\n');
  console.log('Error Name:', error.name);
  console.log('Error Message:', error.message);
  console.log('\n📋 Full Error Object:');
  console.log(JSON.stringify(error, null, 2));
  
  console.log('\n🔧 Troubleshooting Checklist:');
  console.log('1. ✓ IP Whitelist: You confirmed 0.0.0.0/0 is added');
  console.log('2. ⚠️  Check Database Access in Atlas:');
  console.log('   - Username: jerinsaji_db_user exists?');
  console.log('   - Password: yxJ2GeSaC0z2W9vp is correct?');
  console.log('   - User has "Read and write to any database" role?');
  console.log('3. ⚠️  Check Cluster Status:');
  console.log('   - Is cluster showing as "Active" (not paused)?');
  console.log('   - Has cluster finished deploying?');
  console.log('4. ⚠️  Wait 2-3 minutes if you just:');
  console.log('   - Created the cluster');
  console.log('   - Added IP to whitelist');
  console.log('   - Created database user');
  console.log('5. ⚠️  Try Alternative Connection String:');
  console.log('   - In Atlas, click "Connect" → "Connect your application"');
  console.log('   - Copy fresh connection string');
  console.log('   - Replace <password> with: yxJ2GeSaC0z2W9vp');
  
  process.exit(1);
});
