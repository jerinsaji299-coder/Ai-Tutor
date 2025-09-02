// Form data interface for user input
export interface FormData {
  syllabus: string;
  subject: string;
  grade: string;
  duration: string;
}

// Individual week plan structure
export interface WeekPlan {
  week: number;
  topics: string;
  activities: string;
}

// Complete teaching plan response from API
export interface TeachingPlan {
  semester_plan: WeekPlan[];
  lesson_aids: string[];
  assessments: string[];
  metadata?: {
    subject: string;
    grade: string;
    duration: number;
    generated_at: string;
    total_weeks: number;
  };
}

// API response structure
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// Loading states for UI
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// Error state interface
export interface ErrorState {
  hasError: boolean;
  message: string;
  code?: number;
}

// Subject options for dropdown
export interface SubjectOption {
  value: string;
  label: string;
}

// Pro feature structure
export interface ProFeature {
  icon: string;
  title: string;
  description: string;
  available: boolean;
}