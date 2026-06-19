import api from './api';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');

// Schools
export const getSchools = (params) => api.get('/super-admin/schools', { params });
export const getSchool = (id) => api.get(`/super-admin/schools/${id}`);
export const getSchoolStats = (id) => api.get(`/super-admin/schools/${id}/stats`);
export const createSchool = (data) => api.post('/super-admin/schools', data);
export const updateSchool = (id, data) => api.put(`/super-admin/schools/${id}`, data);
export const deactivateSchool = (id) => api.post(`/super-admin/schools/${id}/deactivate`);
export const activateSchool = (id) => api.post(`/super-admin/schools/${id}/activate`);

// Admins
export const getAdmins = (params) => api.get('/super-admin/admins', { params });
export const createAdmin = (data) => api.post('/super-admin/admins', data);
export const removeAdmin = (id) => api.delete(`/super-admin/admins/${id}`);
export const resetAdminPassword = (id) => api.post(`/super-admin/admins/${id}/reset-password`);

// Overview
export const getOverview = () => api.get('/super-admin/overview');

// Monitoring
export const getActiveTrips = () => api.get('/super-admin/monitoring/active-trips');
export const getRecentTrips = (params) => api.get('/super-admin/monitoring/recent-trips', { params });
export const getTripHistory = (params) => api.get('/super-admin/monitoring/trip-history', { params });
export const getGrowthMetrics = (params) => api.get('/super-admin/monitoring/growth', { params });
export const getSchoolGrowth = () => api.get('/super-admin/monitoring/school-growth');
export const getAlerts = () => api.get('/super-admin/monitoring/alerts');
export const getAuditLogs = (params) => api.get('/super-admin/monitoring/audit-logs', { params });
export const getRecentLogins = (params) => api.get('/super-admin/monitoring/recent-logins', { params });
export const getSubscriptions = (params) => api.get('/super-admin/monitoring/subscriptions', { params });
export const createSubscription = (data) => api.post('/super-admin/monitoring/subscriptions', data);
export const getUsage = () => api.get('/super-admin/monitoring/usage');
