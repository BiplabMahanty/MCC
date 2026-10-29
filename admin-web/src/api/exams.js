import client from './client';

export const listExams = (params) =>
  client.get('/admin/exams', { params }).then((r) => r.data);

export const getExam = (id) =>
  client.get(`/admin/exams/${id}`).then((r) => r.data.data);

export const createExam = (body) =>
  client.post('/admin/exams', body).then((r) => r.data.data);

export const updateExam = (id, body) =>
  client.patch(`/admin/exams/${id}`, body).then((r) => r.data.data);

export const deleteExam = (id) =>
  client.delete(`/admin/exams/${id}`);

export const publishExam = (id) =>
  client.post(`/admin/exams/${id}/publish`).then((r) => r.data.data);

export const unpublishExam = (id) =>
  client.post(`/admin/exams/${id}/unpublish`).then((r) => r.data.data);

export const listExamResults = (examId, params) =>
  client.get(`/admin/exams/${examId}/results`, { params }).then((r) => r.data);

export const publishResults = (examId) =>
  client.post(`/admin/exams/${examId}/results/publish`).then((r) => r.data.data);

export const unpublishResults = (examId) =>
  client.post(`/admin/exams/${examId}/results/unpublish`);
