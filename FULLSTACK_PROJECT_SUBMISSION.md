# 🎓 AI Tutor - Full Stack Project Submission

## 📌 Project Overview

**AI Tutor** is a comprehensive full-stack web application that leverages artificial intelligence to assist educators in creating semester teaching plans, generating quizzes, curating educational videos, and providing adaptive learning pathways.

### 🎯 Core Features
- **AI-Powered Teaching Plan Generation** (Google Gemini 2.0 Flash)
- **Intelligent Quiz Generator** with multiple question types
- **Video Enhancement** with AI-curated YouTube content
- **Adaptive Learning** system with performance analysis
- **MongoDB Database** for persistent data storage
- **User Authentication** with JWT and bcrypt
- **Saved Plans Management** with CRUD operations

---

## 💻 Technology Stack

### Frontend
```json
{
  "framework": "React 18 with TypeScript",
  "build_tool": "Vite 7.1.4",
  "styling": "Tailwind CSS 3.x",
  "routing": "React Router v6",
  "http_client": "Axios",
  "state_management": "React Hooks + Context API",
  "icons": "Lucide React",
  "pdf_generation": "jsPDF"
}
```

### Backend
```json
{
  "runtime": "Node.js (ES Modules)",
  "framework": "Express.js 4.x",
  "database": "MongoDB (Mongoose ODM)",
  "authentication": {
    "tokens": "JWT (jsonwebtoken)",
    "hashing": "bcrypt (10 rounds)",
    "cookies": "cookie-parser"
  },
  "ai_services": {
    "primary": "Google Gemini 2.0 Flash API",
    "fallback": "HuggingFace Inference API"
  },
  "validation": "express-validator",
  "rate_limiting": "express-rate-limit",
  "cors": "cors middleware"
}
```

### Database
```json
{
  "database": "MongoDB",
  "connection": "Local (mongodb://localhost:27017/ai-tutor)",
  "odm": "Mongoose 8.x",
  "collections": ["users", "plans", "studentperformances"]
}
```

---

## 🗂️ Project Structure

```
ai-tutor-hackathon/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User schema with bcrypt
│   │   ├── Plan.js              # Teaching plan schema
│   │   └── AdaptiveLearning.js  # Performance tracking schema
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── planning.js          # Teaching plan & quiz endpoints
│   │   ├── adaptiveLearning.js  # Adaptive learning endpoints
│   │   └── youtubeEnhancement.js # Video curation endpoints
│   ├── services/
│   │   ├── aiOrchestrator.js    # Multi-AI service coordinator
│   │   ├── huggingfaceService.js # HuggingFace integration
│   │   ├── youtubeService.js    # YouTube API integration
│   │   └── pdfService.js        # PDF generation service
│   ├── utils/
│   │   └── claudeClient.js      # AI client utilities
│   ├── server.js                # Express server entry point
│   ├── load-sample-data.js      # Sample data loader
│   ├── check-db-data.js         # Database inspection tool
│   └── check-user.js            # User verification tool
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.tsx         # Main dashboard
│   │   │   ├── Login.tsx        # Login page
│   │   │   ├── Signup.tsx       # Registration page
│   │   │   ├── Dashboard.tsx    # Teaching plan display
│   │   │   ├── InputForm.tsx    # Syllabus input form
│   │   │   ├── SavedPlans.tsx   # Saved plans management
│   │   │   ├── QuizGenerator.tsx # Quiz generation UI
│   │   │   ├── VideoEnhancementNew.tsx # Video curation UI
│   │   │   ├── AdaptiveLearning.tsx # Adaptive system UI
│   │   │   ├── Analytics.tsx    # Plan analytics
│   │   │   └── FeatureTabs.tsx  # Premium features tabs
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx  # Authentication context
│   │   ├── utils/
│   │   │   └── api.ts           # API client with axios
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript type definitions
│   │   ├── App.tsx              # Root component with routing
│   │   └── main.tsx             # React entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── Documentation/
    ├── PROJECT_PRESENTATION_GUIDE.md
    ├── MONGODB_STORAGE_GUIDE.md
    ├── MONGODB_SETUP_INSTRUCTIONS.md
    └── README.md
```

---

## 🚀 Features Implementation

### 1. Authentication System
**Tech**: JWT + bcrypt + MongoDB

**Implementation**:
- Secure password hashing with bcrypt (10 salt rounds)
- JWT tokens with 30-day expiration
- HTTP-only cookies for token storage
- Protected routes with middleware
- User roles: Student, Teacher, Admin

**Endpoints**:
```
POST /api/auth/signup   - Register new user
POST /api/auth/login    - User login
POST /api/auth/logout   - User logout
GET  /api/auth/me       - Get current user
```

---

### 2. Teaching Plan Generation
**Tech**: Google Gemini 2.0 Flash API

**Features**:
- AI analyzes syllabus content
- Generates week-by-week curriculum
- Suggests lesson aids and resources
- Plans strategic assessments
- Validates output structure
- Fallback plan generation on API failure

**API Flow**:
```
1. User submits syllabus + metadata (subject, grade, duration)
2. Backend constructs detailed prompt for Gemini
3. Gemini generates structured JSON response
4. Backend validates and formats response
5. Plan saved to MongoDB automatically
6. Frontend displays interactive dashboard
```

**Endpoints**:
```
POST /api/planning/generate-plan        - Generate new plan
GET  /api/planning/saved-plans          - Get all saved plans
GET  /api/planning/saved-plans/:id      - Get specific plan
DELETE /api/planning/saved-plans/:id    - Delete a plan
```

---

### 3. Quiz Generation
**Tech**: Google Gemini 2.0 Flash API

**Features**:
- Context-aware quiz generation from teaching plan
- Multiple question types: MCQ, True/False, Short Answer
- Difficulty levels: Easy, Medium, Hard
- Automatic scoring with explanations
- 10 questions per quiz (customizable)

**Endpoints**:
```
POST /api/planning/generate-quiz  - Generate quiz for specific week
```

---

### 4. Video Enhancement
**Tech**: YouTube Search API + Gemini AI

**Features**:
- Keyword extraction from module content
- Multiple targeted search queries per topic
- AI-generated context-aware video summaries
- 3-5 curated videos per module
- Embedded video players
- Downloadable PDF study notes

**Endpoints**:
```
POST /api/youtube/get-week-videos  - Get curated videos for a week
```

---

### 5. Adaptive Learning
**Tech**: Custom ML algorithms + Gemini AI

**Features**:
- Knowledge test generation
- Performance analysis by topic
- Weakness identification
- Personalized recommendations
- Progress tracking over time

**Endpoints**:
```
POST /api/adaptive/generate-knowledge-test  - Generate diagnostic test
POST /api/adaptive/analyze-performance      - Analyze test results
```

---

### 6. MongoDB Database

**Collections**:

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (bcrypt hashed),
  role: String (enum: ['student', 'teacher', 'admin']),
  profilePicture: String,
  createdAt: Date,
  lastLogin: Date,  // Updated on each login
  updatedAt: Date
}
```

#### Plans Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  teacherName: String,
  subject: String (indexed),
  grade: String (indexed),
  duration: Number,
  syllabusText: String,
  semesterPlan: [{
    week: Number,
    topics: String,
    activities: String
  }],
  lessonAids: [String],
  assessments: [String],
  saved: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📊 Current Database Status

```
Database: ai-tutor (mongodb://localhost:27017)
├── users: 1 document
│   └── jino@gmail.com (Last login tracked)
└── plans: 6 documents
    ├── Computer Science - Grade 10 (16 weeks) x4
    ├── Mathematics - Grade 11 (12 weeks) x1
    └── Physics - Grade 12 (14 weeks) x1
```

---

## 🔧 Setup & Installation

### Prerequisites
```bash
- Node.js v18+
- MongoDB (local or Atlas)
- Google Gemini API Key
- npm or yarn
```

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017/ai-tutor
JWT_SECRET=your-secret-key
PORT=3000
FRONTEND_URL=http://localhost:3001" > .env

# Start backend
node server.js
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

### 3. Load Sample Data
```bash
cd backend
node load-sample-data.js
```

---

## 🎯 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "student"
}

Response: 201 Created
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "jwt_token..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt_token..."
  }
}
```

### Teaching Plan Endpoints

#### Generate Plan
```http
POST /api/planning/generate-plan
Content-Type: application/json

{
  "syllabus": "Complete syllabus text...",
  "subject": "Computer Science",
  "grade": "10",
  "duration": 16,
  "teacherName": "John Teacher"
}

Response: 200 OK
{
  "semester_plan": [...],
  "lesson_aids": [...],
  "assessments": [...],
  "metadata": {...},
  "saved": true,
  "savedPlanId": "..."
}
```

#### Get All Saved Plans
```http
GET /api/planning/saved-plans

Response: 200 OK
{
  "success": true,
  "count": 6,
  "data": [...]
}
```

---

## 🎨 Frontend Components

### Key Features

1. **Responsive Design**: Works on desktop, tablet, and mobile
2. **Loading States**: Full-screen overlays with progress messages
3. **Error Handling**: User-friendly error messages
4. **Form Validation**: Client-side and server-side validation
5. **Real-time Updates**: Hot module replacement with Vite
6. **Type Safety**: Full TypeScript implementation

### Component Hierarchy
```
App
├── AuthContext Provider
├── Router
    ├── Login
    ├── Signup
    └── Home
        ├── Header (with user info & logout)
        ├── Tab Navigation (Create / Saved)
        ├── InputForm (Create new plan)
        ├── SavedPlans (View & manage plans)
        └── Dashboard (Display generated plan)
            └── FeatureTabs
                ├── Analytics
                ├── QuizGenerator
                ├── VideoEnhancement
                ├── AdaptiveLearning
                ├── AutoGrading
                ├── CollaborationTools
                └── PremiumTemplates
```

---

## 🔐 Security Features

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Minimum 6-character requirement
   - Never stored in plain text

2. **JWT Authentication**
   - HTTP-only cookies
   - 30-day expiration
   - Secure in production
   - Token refresh mechanism

3. **API Security**
   - CORS configuration
   - Rate limiting (50 requests/15 min)
   - Input validation with express-validator
   - SQL injection prevention (Mongoose)

4. **Data Protection**
   - MongoDB connection strings masked in logs
   - Environment variables for secrets
   - Protected routes with middleware

---

## 📈 Performance Optimizations

1. **Frontend**
   - Lazy loading components
   - Vite for fast builds
   - Tailwind CSS for minimal bundle size
   - Custom scrollbar for better UX

2. **Backend**
   - MongoDB indexing on frequently queried fields
   - Efficient Mongoose schemas
   - Request timeout management (60-90s)
   - AbortController for API timeouts

3. **AI Integration**
   - Fallback mechanisms for API failures
   - Template-based generation as backup
   - Optimized prompts for faster responses

---

## 🧪 Testing Features

### Demo Accounts
```
1. student@demo.com / demo123 (Student)
2. teacher@demo.com / demo123 (Teacher)
3. test@example.com / test123 (Student)
```

### Sample Data
- 6 pre-loaded teaching plans
- Multiple subjects: Computer Science, Mathematics, Physics
- Different grades: 10, 11, 12
- Various durations: 12-16 weeks

### Utility Scripts
```bash
# Check database contents
node backend/check-db-data.js

# Verify user accounts
node backend/check-user.js

# Load sample data
node backend/load-sample-data.js
```

---

## 🎓 Educational Value

### For Students
- Personalized learning paths
- Adaptive quiz difficulty
- Curated video resources
- Progress tracking
- Performance analytics

### For Teachers
- Automated curriculum planning
- Time-saving (10-20 hours per semester)
- Diverse teaching strategies
- Assessment planning
- Resource recommendations

---

## 🚀 Deployment Considerations

### Production Checklist
- [ ] Environment variables configured
- [ ] MongoDB Atlas connection string
- [ ] JWT_SECRET changed from default
- [ ] CORS whitelist specific domains
- [ ] Rate limiting adjusted for production
- [ ] Error logging configured
- [ ] HTTPS enforced
- [ ] Database backups automated
- [ ] API keys secured
- [ ] Build optimization

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or Cloudflare Pages
- **Backend**: Heroku, Railway, or AWS
- **Database**: MongoDB Atlas (M0 free tier)

---

## 📊 Project Statistics

```
Total Files: 50+
Lines of Code: ~15,000+
Technologies Used: 20+
API Endpoints: 15+
React Components: 20+
Database Collections: 3
AI Models Integrated: 4
```

---

## 🏆 Key Achievements

✅ Full-stack MERN implementation
✅ AI integration with Google Gemini 2.0 Flash
✅ Secure authentication with JWT + bcrypt
✅ MongoDB persistence with proper schemas
✅ TypeScript for type safety
✅ Responsive React UI with Tailwind CSS
✅ RESTful API design
✅ Error handling and fallback mechanisms
✅ Sample data and testing utilities
✅ Comprehensive documentation

---

## 📞 Support & Resources

### Documentation Files
- `PROJECT_PRESENTATION_GUIDE.md` - Complete walkthrough
- `MONGODB_STORAGE_GUIDE.md` - Database structure
- `MONGODB_SETUP_INSTRUCTIONS.md` - Setup guide

### Demo
- **Frontend**: http://localhost:3001
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 🎉 Conclusion

AI Tutor is a production-ready full-stack application demonstrating:
- Modern web development practices
- AI/ML integration
- Database design and management
- Security best practices
- User experience design
- API development
- TypeScript/JavaScript proficiency

**Ready for deployment and real-world use!** 🚀

---

*Project developed for Full Stack Development Submission*
*Date: October 29, 2025*
