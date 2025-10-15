// frontend/src/api/api.js
import axios from 'axios';
import { supabase } from '../supabaseClient';

// Create a new axios instance with the CORRECT base URL
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Corrected from 1227.0.0.1
});

// This interceptor automatically adds the auth token to every request
apiClient.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API FUNCTIONS ---

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDocuments = () => {
  return apiClient.get('/documents/');
};

export const deleteDocument = (filename) => {
  return apiClient.delete(`/documents/${filename}`);
};

export const streamQuery = (query) => {
    return supabase.auth.getSession().then(({ data: { session } }) => {
        const formData = new FormData();
        formData.append('query', query);

        return fetch('http://127.0.0.1:8000/chat/stream', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
            },
        });
    });
};

export const generateQuiz = () => {
  return apiClient.post('/generate-quiz');
};