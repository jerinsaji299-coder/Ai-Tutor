import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-tutor';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('📊 DATABASE: ai-tutor');
    console.log('=' .repeat(60));
    console.log(`\n📁 Total Collections: ${collections.length}\n`);

    // Check each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      const count = await db.collection(collectionName).countDocuments();
      
      console.log(`\n📦 Collection: ${collectionName}`);
      console.log(`   Documents: ${count}`);
      
      if (count > 0) {
        // Get sample documents (first 3)
        const samples = await db.collection(collectionName).find({}).limit(3).toArray();
        console.log(`   Sample Data:`);
        
        samples.forEach((doc, index) => {
          console.log(`\n   Document ${index + 1}:`);
          
          // Show relevant fields based on collection
          if (collectionName === 'users') {
            console.log(`      - Name: ${doc.name}`);
            console.log(`      - Email: ${doc.email}`);
            console.log(`      - Role: ${doc.role}`);
            console.log(`      - Created: ${doc.createdAt}`);
            console.log(`      - Last Login: ${doc.lastLogin || 'Never'}`);
          } else if (collectionName === 'plans') {
            console.log(`      - Subject: ${doc.subject}`);
            console.log(`      - Grade: ${doc.grade}`);
            console.log(`      - Duration: ${doc.duration} weeks`);
            console.log(`      - Teacher: ${doc.teacherName || 'N/A'}`);
            console.log(`      - Weeks: ${doc.semesterPlan?.length || 0}`);
            console.log(`      - Created: ${doc.createdAt}`);
          } else if (collectionName === 'studentperformances') {
            console.log(`      - Student ID: ${doc.studentId}`);
            console.log(`      - Subject: ${doc.subject}`);
            console.log(`      - Score: ${doc.score}%`);
            console.log(`      - Correct: ${doc.correctAnswers}/${doc.totalQuestions}`);
            console.log(`      - Weak Areas: ${doc.weakAreas?.join(', ') || 'None'}`);
            console.log(`      - Date: ${doc.timestamp}`);
          } else {
            // Generic display for other collections
            const keys = Object.keys(doc).filter(k => k !== '_id' && k !== '__v');
            keys.slice(0, 5).forEach(key => {
              let value = doc[key];
              if (typeof value === 'object' && value !== null) {
                value = Array.isArray(value) ? `Array(${value.length})` : 'Object';
              }
              console.log(`      - ${key}: ${value}`);
            });
          }
        });
      }
      console.log('-'.repeat(60));
    }

    // Summary
    console.log('\n📈 SUMMARY:');
    console.log('=' .repeat(60));
    
    const userCount = await db.collection('users').countDocuments().catch(() => 0);
    const planCount = await db.collection('plans').countDocuments().catch(() => 0);
    const performanceCount = await db.collection('studentperformances').countDocuments().catch(() => 0);
    
    console.log(`👥 Total Users: ${userCount}`);
    console.log(`📚 Total Teaching Plans: ${planCount}`);
    console.log(`📊 Total Performance Records: ${performanceCount}`);
    
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

checkDatabase();
