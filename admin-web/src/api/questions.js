import client from './client';

export const listQuestions = (params) =>
  client.get('/admin/questions', { params }).then((r) => r.data);

export const getQuestion = (id) =>
  client.get(`/admin/questions/${id}`).then((r) => r.data.data);

export const createQuestion = (body) =>
  client.post('/admin/questions', body).then((r) => r.data.data);

export const updateQuestion = (id, body) =>
  client.patch(`/admin/questions/${id}`, body).then((r) => r.data.data);

export const deleteQuestion = (id) =>
  client.delete(`/admin/questions/${id}`);

export const getQuestionImageUploadUrl = (body) =>
  client.post('/admin/uploads/question-image', body).then((r) => r.data.data);
