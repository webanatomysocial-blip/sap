import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Response error logger
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data?.message || error.message);
        return Promise.reject(error);
    }
);

// CSRF token injector for all mutating requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('csrf_token');

  if (token && config.method !== 'get') {
    // Inject into headers for normal JSON requests
    config.headers['X-CSRF-Token'] = token;

    // Inject into FormData for multipart/form-data requests
    if (config.data instanceof FormData) {
      config.data.append('csrf_token', token);
    }
  }

  return config;
});

// ── Public endpoints ─────────────────────────────────────────────────────────
export const getPosts = (page = 1) => api.get(`/posts?page=${page}`);
export const getPostBySlug = (slug) => api.get(`/posts/${slug}`);
export const getCommentsByBlogId = (blogId) => api.get(`/get_comments.php?blogId=${blogId}`);
export const submitComment = (data) => api.post('/save_comment.php', data);
export const applyContributor = (data) => api.post('/contributors/apply', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const updatePostViews = (data) => api.post('/views', data);
export const getAdsByZone = (zone) => api.get(`/ads${zone ? `?zone=${zone}` : ''}`);
export const getPublicAds = (zone) => api.get(`/ads${zone ? `?zone=${zone}` : ''}`);
export const getPublicAnnouncements = () => api.get('/announcements');
export const getCommunityStats = () => api.get('/stats/community');
export const getApprovedContributors = () => api.get('/contributors/approved');
export const getContributorProfile = (id) => api.get(`/contributors/profile/${id}`);
export const getHomepageData = () => api.get('/get_homepage_data.php');
export const getCategories = () => api.get('/get_categories.php');

// ── Blog Management (Admin) ──────────────────────────────────────────────────
export const getBlogs = () => api.get('/posts');
export const saveBlog = (data) => api.post('/posts', data);
export const deleteBlog = (id) => api.delete(`/posts/${id}`);
export const uploadBlogImage = (formData) => api.post('/upload-blog-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// ── Contributors Management (Admin) ───────────────────────────────────────────
export const getContributors = () => api.get('/admin/contributors');
export const updateContributorStatus = (data) => api.post('/admin/contributors', data);
export const deleteContributor = (id) => api.post('/delete_contributor.php', { id });

// ── Admin Profile ─────────────────────────────────────────────────────────────
export const getAdminProfile = () => api.get('/admin/profile');
export const updateAdminProfile = (formData) => api.post('/admin/profile/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const resetAdminPassword = (data) => api.post('/admin/reset-password', data);
export const getAuthors = () => api.get('/admin/authors');

// ── Dashboard Stats ───────────────────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats');
export const getContributorStats = () => api.get('/contributor/stats');

// ── Contributor Login Management ─────────────────────────────────────────────
export const getContributorLogin = (contributorId) =>
    api.get(`/admin/contributor-login?contributor_id=${contributorId}`);

export const createContributorLogin = (data) =>
    api.post('/admin/create-contributor-login', data);

export const updateContributorAccess = (data) =>
    api.post('/admin/update-contributor-access', data);

// ── Blog Review Workflow ──────────────────────────────────────────────────────
export const getPendingBlogs = (status = "pending") =>
  api.get(`/admin/blogs/pending?status=${status}`);

export const reviewBlog = (id, action, rejection_reason = '') =>
    api.put(`/admin/blogs/${id}/review`, { action, rejection_reason });

export const recalculatePlagiarism = (blogId) => api.post('/recalculate_plagiarism.php', { id: blogId });
export const bulkRecalculatePlagiarism = () => api.post('/bulk_recalculate_plagiarism.php');

// ── Ads Management (Admin) ───────────────────────────────────────────────────
export const getAds = () => api.get('/admin/ads');
export const saveAd = (data) => api.post('/admin/ads', data);

// ── Comments Management (Admin) ───────────────────────────────────────────────
export const getComments = () => api.get('/admin/comments');
export const updateComment = (data) => api.post('/admin/comments', data);

// ── Announcements Management (Admin) ──────────────────────────────────────────
export const getAnnouncements = (isAdmin = false) =>
  api.get(isAdmin ? "/admin/announcements" : "/announcements");

export const saveAnnouncement = (data) =>
  api.post("/admin/announcements", data);

export default api;
