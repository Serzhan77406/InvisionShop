// import axios from "axios";

// const API_URL = "http://localhost:8001/api";

// export const api = axios.create({
//   baseURL: API_URL,
// });

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("access_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export function saveTokens(access: string, refresh: string) {
//   localStorage.setItem("access_token", access);
//   localStorage.setItem("refresh_token", refresh);
// }

// export function clearTokens() {
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
// }

// export function isAuthenticated() {
//   return Boolean(localStorage.getItem("access_token"));
// }


import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8001/api', // Порт вашего бэкенда в Docker
});

// Перехватчик для автоматического добавления JWT-токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
