export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface JobPreferences {
  domain: string;
  preferredLocation: string;
  workMode: 'Remote' | 'Hybrid' | 'Onsite';
  expectedSalary: number;
  experienceLevel: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  description?: string;
  salary?: string;
  workMode?: 'Remote' | 'Hybrid' | 'Onsite';
}

export interface Application {
  id: string;
  company: string;
  role: string;
  status: 'Applied' | 'Pending' | 'Failed';
  date: string;
  jobId: string;
}

export interface ResumeUploadResponse {
  success: boolean;
  fileName: string;
  message: string;
}
