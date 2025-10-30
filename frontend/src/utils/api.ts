
import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 seconds timeout for AI processing (increased from 30s)
  headers: {
    'Content-Type': 'application/json',
  },
});


// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);


// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error: any) => {
    console.error('API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);
// Add a function definition that takes formData as a parameter
export const generateTeachingPlan = async (formData: {
  syllabus: string;
  subject: string;
  grade: string;
  duration: string;
}) => {
  try {
    console.log('API: Sending request with data:', formData);
    console.log('API: Duration value:', formData.duration, 'Parsed as:', parseInt(formData.duration));
    
    const requestData = {
      syllabus: formData.syllabus,
      subject: formData.subject,
      grade: formData.grade,
      duration: parseInt(formData.duration),
    };
    
    console.log('API: Final request data:', requestData);
    console.log('⏱️ Starting API request...');
    
    const response = await apiClient.post('/api/planning/generate-plan', requestData);
    
    console.log('✅ API request completed successfully');
    console.log('📦 Response data:', response.data);

    // Validate response structure
    if (!response.data) {
      throw new Error('No data received from server');
    }

    if (!response.data.semester_plan || !Array.isArray(response.data.semester_plan)) {
      console.error('❌ Invalid response structure:', response.data);
      throw new Error('Invalid response format: missing semester_plan');
    }

    if (response.data.semester_plan.length === 0) {
      console.error('❌ Empty semester_plan in response');
      throw new Error('Generated plan has no weeks');
    }

    console.log('✅ Response validation passed');
    return response.data;
  } catch (error: any) {
    console.error('❌ Generate plan error:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The AI is taking too long to respond. Please try with a shorter duration or simpler syllabus.');
    } else if (error.message === 'Network Error') {
      throw new Error('Cannot connect to backend server. Please ensure the backend is running on port 3000.');
    } else if (error.response?.status === 500) {
      throw new Error('Server error while generating plan. Please try again or use a shorter duration.');
    } else {
      throw new Error(error.message || 'Failed to generate teaching plan. Please try again.');
    }
  }
};

// Health check endpoint
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

export default apiClient;