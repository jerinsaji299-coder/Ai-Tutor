
import axios from 'axios';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for AI processing
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
    const response = await apiClient.post('/api/planning/generate-plan', {
      syllabus: formData.syllabus,
      subject: formData.subject,
      grade: formData.grade,
      duration: parseInt(formData.duration),
    });

    return response.data;
  } catch (error: any) {
    console.error('Generate plan error:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else if (error.message === 'Network Error') {
      throw new Error('Network error. Please check your connection.');
    } else {
      throw new Error('Failed to generate teaching plan. Please try again.');
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