import client from './client';

export const getDashboardHome = () =>
  client.get('/admin/dashboard-home').then((r) => r.data.data);

export const getAnalytics = (params = {}) =>
  client.get('/admin/analytics', { params }).then((r) => r.data.data);
