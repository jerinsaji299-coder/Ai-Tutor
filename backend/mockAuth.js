// Mock Authentication Storage (In-Memory)
// This is a temporary solution for testing without MongoDB

import bcrypt from 'bcryptjs';

const mockUsers = new Map();

// Pre-populate with demo users (passwords are hashed)
const initializeDemoUsers = async () => {
  const demoUsers = [
    {
      id: '1',
      name: 'John Student',
      email: 'student@demo.com',
      password: await bcrypt.hash('demo123', 10),
      role: 'student',
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Jane Teacher',
      email: 'teacher@demo.com',
      password: await bcrypt.hash('demo123', 10),
      role: 'teacher',
      createdAt: new Date()
    },
    {
      id: '3',
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('test123', 10),
      role: 'student',
      createdAt: new Date()
    }
  ];

  // Initialize with demo users
  demoUsers.forEach(user => {
    mockUsers.set(user.email, user);
  });

  console.log('✅ Mock Auth Service initialized with', mockUsers.size, 'demo users');
  console.log('📝 Demo accounts for testing:');
  console.log('   1. student@demo.com / demo123 (Student)');
  console.log('   2. teacher@demo.com / demo123 (Teacher)');
  console.log('   3. test@example.com / test123 (Student)');
  console.log('⚠️  Demo mode active - Data will not persist after server restart!');
};

// Initialize on import
initializeDemoUsers();

export const mockAuthService = {
  // Find user by email
  findByEmail: (email) => {
    return mockUsers.get(email) || null;
  },

  // Create new user
  createUser: (userData) => {
    const user = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date()
    };
    mockUsers.set(user.email, user);
    console.log('✅ New user created in demo mode:', user.email);
    return user;
  },

  // Check if email exists
  emailExists: (email) => {
    return mockUsers.has(email);
  },

  // Get all users (for debugging)
  getAllUsers: () => {
    return Array.from(mockUsers.values());
  },

  // Clear all users (reset)
  clearAll: () => {
    mockUsers.clear();
  },

  // Get user count
  getUserCount: () => {
    return mockUsers.size;
  }
};

