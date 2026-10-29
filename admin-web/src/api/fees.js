import client from './client';

export const listFeePlans = (params) =>
  client.get('/admin/fees', { params }).then((r) => r.data);

export const getFeePlan = (id) =>
  client.get(`/admin/fees/${id}`).then((r) => r.data.data);

export const createFeePlan = (body) =>
  client.post('/admin/fees', body).then((r) => r.data.data);

export const updateFeePlan = (id, body) =>
  client.patch(`/admin/fees/${id}`, body).then((r) => r.data.data);

export const deleteFeePlan = (id) =>
  client.delete(`/admin/fees/${id}`);

export const listFeeRecords = (planId, params) =>
  client.get(`/admin/fees/${planId}/records`, { params }).then((r) => r.data);

export const recordPayment = (body) =>
  client.post('/admin/fees/payments', body).then((r) => r.data.data);

export const waiveRecord = (recordId, body) =>
  client.patch(`/admin/fees/records/${recordId}/waive`, body).then((r) => r.data.data);

export const recordPayments = (recordId) =>
  client.get(`/admin/fees/records/${recordId}/payments`).then((r) => r.data);

export const studentFeeAdmin = (studentId) =>
  client.get(`/admin/fees/students/${studentId}/fees`).then((r) => r.data);

export const markOverdue = () =>
  client.post('/admin/fees/mark-overdue').then((r) => r.data);
