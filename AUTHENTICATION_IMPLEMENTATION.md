# Authentication System Implementation Guide

## ✅ What Has Been Implemented

### Backend (Node.js/Express)

#### 1. **Database Configuration** (`backend/config/database.js`)
- MongoDB connection using Mongoose
- Optional MongoDB mode (app works without database)
- Error handling and connection logging
- Supports both local MongoDB and MongoDB Atlas

#### 2. **User Model** (`backend/models/User.js`)
- User schema with validation
- Fields: name, email, password, role, profilePicture, lastLogin
- Password hashing with bcrypt (10 salt rounds)
- Password comparison method
- Automatic password field exclusion in queries
- Role-based system: teacher, student, admin

#### 3. **Authentication Middleware** (`backend/middleware/auth.js`)
- `protect`: Verify JWT token and authenticate user
- `authorize`: Role-based access control
- `optionalAuth`: Optional authentication (doesn't fail if no token)
- Token verification from Authorization header or cookies
- User attachment to request object

#### 4. **Authentication Routes** (`backend/routes/auth.js`)
- **POST /api/auth/signup**: Register new user
  - Validates: name, email, password (min 6 chars)
  - Checks for duplicate emails
  - Creates user with hashed password
  - Returns JWT token and user data
  
- **POST /api/auth/login**: Login user
  - Validates email and password
  - Compares password with bcrypt
  - Updates lastLogin timestamp
  - Returns JWT token and user data
  
- **GET /api/auth/me**: Get current user profile (Protected)
  - Requires authentication
  - Returns user data without password
  
- **POST /api/auth/logout**: Logout user (Protected)
  - Clears authentication cookie
  - Returns success message
  
- **PUT /api/auth/update-profile**: Update user profile (Protected)
  - Update name and email
  - Validates unique email
  - Returns updated user data

#### 5. **Server Integration** (`backend/server.js`)
- Cookie parser middleware
- CORS with credentials support
- Database connection on startup
- Auth routes mounted at `/api/auth`

### Frontend (React/TypeScript)

#### 1. **Auth Context** (`frontend/src/contexts/AuthContext.tsx`)
- Global authentication state management
- User state and loading state
- Functions: login, signup, logout
- Automatic authentication check on mount
- Token storage in localStorage
- Axios integration with credentials

#### 2. **Login Component** (`frontend/src/components/Login.tsx`)
- Email and password form
- Error handling and display
- Loading states
- Navigation to signup
- "Continue without login" option
- Responsive design with Tailwind CSS

#### 3. **Signup Component** (`frontend/src/components/Signup.tsx`)
- Registration form: name, email, password, confirm password, role
- Client-side validation
- Password confirmation
- Role selection (teacher/student)
- Error handling
- Navigation to login
- "Continue without signup" option

#### 4. **Home Component** (`frontend/src/components/Home.tsx`)
- Displays user info when logged in
- Login/Signup buttons when not logged in
- Logout functionality
- Original app functionality preserved

#### 5. **Routing** (`frontend/src/App.tsx` and `main.tsx`)
- React Router DOM integration
- Routes: `/`, `/login`, `/signup`, `/dashboard`
- AuthProvider wraps entire app
- Loading state during authentication check

### Packages Installed

**Backend:**
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `mongoose` - MongoDB ODM
- `express-validator` - Input validation
- `cookie-parser` - Cookie handling

**Frontend:**
- `react-router-dom` - Routing
- `axios` - HTTP requests (already installed)

### Environment Variables

**Backend (`.env`):**
```properties
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_OPTIONAL=true
MONGODB_URI=mongodb://localhost:27017/ai-tutor
FRONTEND_URL=http://localhost:3001
```

**Frontend (`.env`):**
```properties
VITE_API_URL=http://localhost:3000
```

## 🚀 How to Use

### 1. Start MongoDB (Optional)
If you want to use the database:

**Option A: Install MongoDB locally**
```bash
# Download and install from: https://www.mongodb.com/try/download/community
# Start MongoDB service:
net start MongoDB
```

**Option B: Use MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Get connection string
4. Update `MONGODB_URI` in `backend/.env`
5. Set `MONGODB_OPTIONAL=false`

**Option C: Skip MongoDB**
- Leave `MONGODB_OPTIONAL=true` in `.env`
- App will work without authentication features
- All other AI features will work

### 2. Start Backend Server
```bash
cd backend
npm start
```
Server runs on http://localhost:3000

### 3. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:3001

### 4. Test Authentication

**Without MongoDB:**
- App works normally
- Login/Signup buttons visible but won't work
- All AI features work

**With MongoDB:**
1. Click "Sign Up" button
2. Fill in registration form
3. Choose role (teacher/student)
4. Submit - automatically logged in
5. See your name and role in header
6. Click "Logout" to logout

## 📝 API Endpoints

### Public Endpoints
```
POST /api/auth/signup
POST /api/auth/login
```

### Protected Endpoints (Require Token)
```
GET /api/auth/me
POST /api/auth/logout
PUT /api/auth/update-profile
```

### Request Examples

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "teacher"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Profile:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔒 Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: 30-day expiration
3. **HTTP-Only Cookies**: Protection against XSS
4. **CORS with Credentials**: Restricted to frontend URL
5. **Input Validation**: express-validator for all inputs
6. **Email Validation**: Regex pattern matching
7. **Password Requirements**: Minimum 6 characters
8. **Unique Email**: Database-level uniqueness check
9. **Role-Based Access**: Middleware for authorization
10. **Token Verification**: Every protected route

## 🎯 Next Steps

### Immediate (Required for Production)
1. **Install MongoDB**: Either locally or use MongoDB Atlas
2. **Change JWT_SECRET**: Use a long random string
3. **Enable MongoDB**: Set `MONGODB_OPTIONAL=false`
4. **Test Authentication**: Try signup/login flow

### Short-term Enhancements
1. **Email Verification**: Send verification email on signup
2. **Password Reset**: Forgot password functionality
3. **Refresh Tokens**: Implement token refresh mechanism
4. **Rate Limiting**: Limit login/signup attempts
5. **Session Management**: Track active sessions

### Medium-term Features
1. **Protected Routes**: Require auth for certain features
2. **User Dashboard**: Personal user profile page
3. **Save Teaching Plans**: Store plans per user
4. **Analytics**: Track user activity
5. **Social Login**: Google/Microsoft OAuth

## 🐛 Troubleshooting

### "MongoDB Connection Error"
- Check if MongoDB is running: `net start MongoDB`
- Verify `MONGODB_URI` in `.env`
- Or set `MONGODB_OPTIONAL=true` to continue without DB

### "CORS Error" in Browser
- Check `FRONTEND_URL` in backend `.env`
- Ensure both servers are running
- Clear browser cache

### "Token Invalid" Error
- Token expired (30 days)
- Logout and login again
- Check `JWT_SECRET` matches

### Frontend Can't Reach Backend
- Ensure backend is running on port 3000
- Check `VITE_API_URL` in frontend `.env`
- Look for API status indicator in header

## 📚 File Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   └── auth.js             # JWT verification middleware
├── models/
│   └── User.js             # User schema
├── routes/
│   └── auth.js             # Auth endpoints
├── server.js               # Updated with auth routes
└── .env                    # Environment variables

frontend/
├── src/
│   ├── components/
│   │   ├── Home.tsx        # Main app with auth UI
│   │   ├── Login.tsx       # Login form
│   │   └── Signup.tsx      # Registration form
│   ├── contexts/
│   │   └── AuthContext.tsx # Global auth state
│   ├── App.tsx             # Routing setup
│   └── main.tsx            # AuthProvider wrapper
└── .env                    # API URL
```

## 🎉 Success Criteria

✅ **Backend:**
- [x] User model with password hashing
- [x] Authentication routes (signup, login, logout, profile)
- [x] JWT token generation and verification
- [x] Auth middleware for protected routes
- [x] Database connection (optional mode)

✅ **Frontend:**
- [x] Login page with form
- [x] Signup page with form
- [x] Auth context for state management
- [x] Routing with React Router
- [x] User info display in header
- [x] Logout functionality

✅ **Integration:**
- [x] CORS configured
- [x] Cookies working
- [x] Token storage
- [x] API communication

## 📖 Code Examples

### Protect a Route (Backend)
```javascript
import { protect, authorize } from '../middleware/auth.js';

// Only authenticated users
router.get('/protected', protect, (req, res) => {
  res.json({ user: req.user });
});

// Only teachers
router.post('/teacher-only', protect, authorize('teacher'), (req, res) => {
  res.json({ message: 'Teacher access granted' });
});
```

### Use Auth in Component (Frontend)
```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}
```

## 🎓 Documentation References

- [Mongoose Docs](https://mongoosejs.com/docs/)
- [JWT.io](https://jwt.io/)
- [bcrypt.js](https://www.npmjs.com/package/bcryptjs)
- [React Router](https://reactrouter.com/)
- [Express Validator](https://express-validator.github.io/)

---

**Status**: ✅ Fully Implemented and Ready to Use (with or without MongoDB)
**Last Updated**: January 2025
**Estimated Setup Time**: 10 minutes (with MongoDB: 30 minutes)
