// frontend/src/api/api.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Your FastAPI backend URL
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const uploadFile = (userId, file) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('file', file);
  return apiClient.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const postQuery = (userId, query) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('query', query);
  return apiClient.post('/chat/', formData, {
     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const getDocuments = (userId) => {
  return apiClient.get(`/documents/?user_id=${userId}`);
};

export const deleteDocument = (userId, filename) => {
  return apiClient.delete(`/documents/${filename}?user_id=${userId}`);
};

export const streamQuery = (userId, query) => {
  const formData = new FormData();
  formData.append('user_id', userId);
  formData.append('query', query);
  
  return fetch('http://127.0.0.1:8000/chat/stream', {
    method: 'POST',
    body: formData,
  });
};