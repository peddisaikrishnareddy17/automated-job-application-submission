import axios from 'axios';
import type {
  RegisterData,
  LoginData,
  AuthResponse,
  JobPreferences,
  Job,
  Application,
  ResumeUploadResponse,
} from '@/types';

// Default to mock backend server started at http://localhost:4000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // For HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async (): Promise<any> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (payload: { name?: string; phone?: string | null; password?: string }): Promise<any> => {
    const response = await api.put('/auth/profile', payload);
    return response.data;
  },
};

// Resume API
export const resumeApi = {
  upload: async (file: File): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append('resume', file);
    
    const response = await api.post<ResumeUploadResponse>(
      '/upload-resume',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

// Preferences API
export const preferencesApi = {
  save: async (preferences: JobPreferences): Promise<void> => {
    await api.put('/preferences', { preferences });
  },
  get: async (): Promise<JobPreferences> => {
    const response = await api.get('/preferences');
    return response.data && response.data.preferences ? response.data.preferences : null;
  },
};

// Jobs API
export const jobsApi = {
  getJobs: async (): Promise<Job[]> => {
    const response = await api.get<Job[]>('/jobs');
    return response.data;
  },
  fetch: async (providerUrl?: string, service?: string): Promise<Job[]> => {
    const payload: any = {};
    if (providerUrl) payload.providerUrl = providerUrl;
    if (service) payload.service = service;
    const response = await api.post<Job[]>('/jobs/fetch', payload);
    return response.data && response.data.jobs ? response.data.jobs : [];
  },
};

// API Keys
export const keysApi = {
  saveKey: async (service: string, apiKey: string): Promise<void> => {
    await api.post('/api/keys', { service, apiKey });
  },
};

// Applications API
export const applicationsApi = {
  getApplications: async (): Promise<Application[]> => {
    const response = await api.get<Application[]>('/applications');
    return response.data;
  },

  apply: async (jobId: string): Promise<void> => {
    await api.post(`/applications/apply`, { jobId });
  },
};
