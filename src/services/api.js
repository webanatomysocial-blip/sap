import axios from 'axios';

// Base URL for the Laravel API
// In production, this should be https://sap.kaphi.in/api/v1
// In local dev, it might be http://localhost:8000/api/v1 (or whatever port Laravel serves)
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Important for Sanctum/Session auth if used
});

// Interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

// Request interceptor to add CSRF token
api.interceptors.request.use((config) => {
    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken && (config.method === 'post' || config.method === 'delete' || config.method === 'put')) {
        config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
});

export const getPosts = (page = 1) => api.get(`/posts?page=${page}`);
export const getPostBySlug = (slug) => api.get(`/posts/${slug}`);
export const submitComment = (data) => fetch('/api/save_comment.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
export const applyContributor = (data) => api.post('/contributors/apply', data);
export const trackAnalytics = (data) => api.post('/analytics/track', data);
export const getAds = (zone) => api.get(`/ads${zone ? `?zone=${zone}` : ''}`);
export const getAnnouncements = () => api.get('/announcements');
export const getCommunityStats = () => api.get('/stats/community');
export const getApprovedContributors = () => api.get('/contributors/approved');

// Admin Profile Methods
export const getAdminProfile = () => api.get('/admin/profile');
export const updateAdminProfile = (formData) => api.post('/admin/profile/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const resetAdminPassword = (data) => api.post('/admin/reset-password', data);

export default api;
