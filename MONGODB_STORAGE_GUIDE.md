# 💾 MongoDB Data Storage - Complete Guide

## 🎯 What Data is Saved to MongoDB?

Your AI Tutor application now **automatically saves** the following data to your local MongoDB database at `mongodb://localhost:27017/ai-tutor`:

---

## 📊 Collections & Data Structure

### 1. 👥 **Users Collection** (`users`)

**Automatically saved when:**
- User signs up with a new account
- User logs in (updates lastLogin timestamp)

**Data stored:**
```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...", // Hashed with bcrypt (secure)
  role: "student", // or "teacher"
  profilePicture: null,
  createdAt: "2025-10-29T21:20:22.000Z",
  lastLogin: "2025-10-29T21:22:15.000Z", // Updated on each login
  updatedAt: "2025-10-29T21:22:15.000Z",
  __v: 0
}
```

**Fields explained:**
- **name**: User's full name
- **email**: Unique email address (used for login)
- **password**: Securely hashed password (bcrypt with 10 rounds)
- **role**: Either "student" or "teacher"
- **createdAt**: Account creation timestamp
- **lastLogin**: Last successful login timestamp (updates every time user logs in)
- **updatedAt**: Last time user data was modified

---

### 2. 📚 **Plans Collection** (`plans`)

**Automatically saved when:**
- User generates a teaching plan using AI
- Plan generation completes successfully

**Data stored:**
```javascript
{
  _id: ObjectId("..."),
  teacherName: "Anonymous", // or provided name
  subject: "Computer Science",
  grade: "10",
  duration: 16, // in weeks
  syllabusText: "Complete syllabus content that was entered...",
  semesterPlan: [
    {
      week: 1,
      topics: "Introduction to Programming",
      activities: "Discussion on programming concepts, hands-on coding..."
    },
    {
      week: 2,
      topics: "Variables and Data Types",
      activities: "Practice exercises, coding challenges..."
    }
    // ... continues for all weeks
  ],
  lessonAids: [
    "PowerPoint: Programming Basics",
    "Video: Introduction to Python",
    "Worksheet: Variable Practice"
  ],
  assessments: [
    "Weekly quizzes on programming concepts",
    "Mid-term project: Simple calculator",
    "Final exam: Comprehensive programming test"
  ],
  createdAt: "2025-10-29T22:00:00.000Z",
  __v: 0
}
```

**Fields explained:**
- **teacherName**: Name of the teacher (optional, defaults to "Anonymous")
- **subject**: Subject of the course (e.g., "Computer Science", "Mathematics")
- **grade**: Grade level (e.g., "10", "12")
- **duration**: Number of weeks in the semester
- **syllabusText**: Original syllabus content provided by user
- **semesterPlan**: Array of weekly breakdown with topics and activities
- **lessonAids**: Array of recommended teaching materials
- **assessments**: Array of assessment strategies
- **createdAt**: When the plan was generated

---

### 3. 📊 **Student Performance Collection** (`studentperformances`)

**Will be saved when:**
- Student takes a quiz or test
- Adaptive learning analysis is performed

**Data structure:**
```javascript
{
  _id: ObjectId("..."),
  studentId: "user_id_here",
  testId: "test_123",
  subject: "Computer Science",
  grade: "10",
  score: 85, // Percentage
  correctAnswers: 17,
  totalQuestions: 20,
  timeSpent: 25, // minutes
  weakAreas: ["Loops", "Functions"],
  strongAreas: ["Variables", "Data Types"],
  difficultyAnalysis: {
    easy: { correct: 8, total: 8 },
    medium: { correct: 7, total: 10 },
    hard: { correct: 2, total: 2 }
  },
  learningEfficiency: 0.85,
  recommendations: {
    type: "improvement",
    message: "Focus on loops and functions",
    suggestedActions: [
      "Practice loop exercises",
      "Watch tutorial videos on functions"
    ]
  },
  timestamp: "2025-10-29T22:15:00.000Z"
}
```

**Note:** Quiz results are currently shown in the UI but not yet saved to MongoDB. This will be implemented in the next update.

---

## 🔄 How Data Gets Saved

### User Signup Flow:
```
1. User fills signup form (name, email, password, role)
   ↓
2. Frontend sends POST to /api/auth/signup
   ↓
3. Backend checks if MongoDB is connected
   ↓
4. Backend hashes password with bcrypt
   ↓
5. Backend creates new User document in MongoDB
   ↓
6. User data saved with createdAt timestamp
   ↓
7. JWT token generated and sent to frontend
```

### User Login Flow:
```
1. User enters email and password
   ↓
2. Frontend sends POST to /api/auth/login
   ↓
3. Backend finds user in MongoDB by email
   ↓
4. Backend compares password with bcrypt
   ↓
5. Backend updates lastLogin field in MongoDB
   ↓
6. User document saved with new lastLogin timestamp
   ↓
7. JWT token generated and sent to frontend
```

### Teaching Plan Generation Flow:
```
1. User enters syllabus and clicks "Generate"
   ↓
2. Frontend sends POST to /api/planning/generate-plan
   ↓
3. Backend sends request to Gemini AI
   ↓
4. AI generates complete teaching plan (20-60 seconds)
   ↓
5. Backend receives and validates plan
   ↓
6. Backend saves Plan document to MongoDB
   ↓
7. Plan saved with all weeks, aids, and assessments
   ↓
8. Backend responds with plan + savedPlanId
   ↓
9. Frontend displays the plan
```

---

## 📍 Current Database Status

Run this command to check your database:
```bash
cd backend
node check-db-data.js
```

**Current data as of now:**
- **Users**: 1 user (jino@gmail.com)
- **Plans**: 0 plans (will increase when you generate plans)
- **Performance**: 0 records (will be added with quiz features)

---

## 🎯 New Features Added

### 1. Automatic Plan Saving
✅ Every teaching plan generated is now automatically saved to MongoDB
✅ Plans include complete week-by-week breakdown
✅ Syllabus text is preserved for reference
✅ Each plan gets a unique ID

### 2. Login Tracking
✅ Every successful login updates the `lastLogin` field
✅ Track when users last accessed the system
✅ Useful for analytics and user engagement

### 3. New API Endpoints

**Get all saved plans:**
```
GET /api/planning/saved-plans
```
Returns list of all teaching plans (up to 50 most recent)

**Get specific plan:**
```
GET /api/planning/saved-plans/:id
```
Returns a single teaching plan by ID

**Delete a plan:**
```
DELETE /api/planning/saved-plans/:id
```
Removes a teaching plan from database

---

## 📊 Response Format

When you generate a teaching plan, you now get:
```javascript
{
  "semester_plan": [...],
  "lesson_aids": [...],
  "assessments": [...],
  "metadata": {
    "subject": "Computer Science",
    "grade": "10",
    "duration": 16,
    "generated_at": "2025-10-29T22:00:00.000Z",
    "total_weeks": 16
  },
  "saved": true, // Indicates if saved to MongoDB
  "savedPlanId": "67217abc123..." // MongoDB document ID
}
```

---

## 🔍 Verify Data in MongoDB

### Method 1: Using the check script
```bash
cd backend
node check-db-data.js
```

### Method 2: Using MongoDB Compass (GUI)
1. Open MongoDB Compass application
2. Connect to: `mongodb://localhost:27017`
3. Select database: `ai-tutor`
4. Browse collections: `users`, `plans`, `studentperformances`

### Method 3: Using mongosh (CLI)
```bash
mongosh mongodb://localhost:27017/ai-tutor
db.users.find().pretty()
db.plans.find().pretty()
```

---

## 💡 Benefits of MongoDB Storage

✅ **Data Persistence**: Data survives server restarts
✅ **User Accounts**: Real user authentication with secure passwords
✅ **Plan History**: Access previously generated teaching plans
✅ **Login Tracking**: See when users last logged in
✅ **Analytics Ready**: Data structured for future analytics features
✅ **Scalable**: Can handle thousands of users and plans
✅ **Searchable**: Can query plans by subject, grade, etc.

---

## 🚀 What's Next?

### Coming Soon:
1. **Quiz Result Saving**: Save quiz scores and performance
2. **User Dashboard**: View your saved plans history
3. **Plan Editing**: Edit and update saved plans
4. **Sharing**: Share plans with other teachers
5. **Templates**: Create reusable plan templates
6. **Export History**: Track all your PDF downloads

---

## ⚠️ Important Notes

### Password Security
- Passwords are **hashed** using bcrypt (industry standard)
- **Never** stored in plain text
- Salted with 10 rounds (very secure)
- Cannot be reversed or decrypted

### Data Backup
Your data is stored in: `C:\data\db`

**To backup:**
```bash
mongodump --db ai-tutor --out C:\backup\mongodb
```

**To restore:**
```bash
mongorestore --db ai-tutor C:\backup\mongodb\ai-tutor
```

### Privacy
- All data stored locally on your computer
- No cloud syncing (unless you configure MongoDB Atlas)
- You have full control over your data
- Can delete database anytime: `mongosh` → `use ai-tutor` → `db.dropDatabase()`

---

## 🎉 Summary

Your AI Tutor application now has **full MongoDB integration** with:

✅ User registration and authentication
✅ Secure password storage (bcrypt hashing)
✅ Login tracking (lastLogin timestamp)
✅ Automatic teaching plan saving
✅ Complete plan history storage
✅ API endpoints for data retrieval
✅ Local data persistence

All data is automatically saved - you don't need to do anything special!

---

*Last updated: October 29, 2025*
*MongoDB connection: mongodb://localhost:27017/ai-tutor*
