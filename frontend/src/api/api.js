// frontend/src/api/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
});

export const uploadFile = (userId, file) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('file', file);
  return apiClient.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDocuments = (userId) => {
  return apiClient.get(`/documents/?user_id=${userId}`);
};

export const deleteDocument = (userId, filename) => {
  return apiClient.delete(`/documents/${filename}?user_id=${userId}`);
};

// This is the function that handles streaming chat responses
export const streamQuery = (userId, query) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('query', query);
  
  return fetch('http://127.0.0.1:8000/chat/stream', {
    method: 'POST',
    body: formData,
  });
};

// --- THIS IS THE MISSING FUNCTION ---
// Add this to your file
export const generateQuiz = (userId) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  return apiClient.post('/generate-quiz', formData);
};