import axios from 'axios';

const api = axios.create({
  baseURL: 'https://quest-0dt9.onrender.com/api',
  withCredentials: true,
});

export default api;
