import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// User Schema (duplicated here to avoid circular dependencies)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'teacher'],
    default: 'student'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

const demoUsers = [
  {
    name: 'John Student',
    email: 'student@demo.com',
    password: 'demo123',
    role: 'student'
  },
  {
    name: 'Jane Teacher',
    email: 'teacher@demo.com',
    password: 'demo123',
    role: 'teacher'
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123',
    role: 'student'
  }
];

async function seedDemoUsers() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor';
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 URI:', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');

    // Check existing users
    const existingCount = await User.countDocuments();
    console.log(`📊 Found ${existingCount} existing users in database`);

    // Seed demo users
    let created = 0;
    let skipped = 0;

    for (const userData of demoUsers) {
      try {
        // Check if user already exists
        const existing = await User.findOne({ email: userData.email });
        
        if (existing) {
          console.log(`⏭️  Skipping ${userData.email} - already exists`);
          skipped++;
        } else {
          // Create new user (password will be hashed by pre-save middleware)
          const user = await User.create(userData);
          console.log(`✅ Created demo user: ${user.email} (${user.role})`);
          created++;
        }
      } catch (err) {
        console.error(`❌ Error creating user ${userData.email}:`, err.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created} users`);
    console.log(`   ⏭️  Skipped: ${skipped} users (already exist)`);
    console.log(`   📦 Total users in DB: ${await User.countDocuments()}`);

    console.log('\n🎉 Demo users seeding completed!');
    console.log('\n📝 You can now login with:');
    console.log('   • student@demo.com / demo123 (Student)');
    console.log('   • teacher@demo.com / demo123 (Teacher)');
    console.log('   • test@example.com / test123 (Student)');

  } catch (error) {
    console.error('❌ Error seeding demo users:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n👋 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seeder
seedDemoUsers();
