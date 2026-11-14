import client from './client';

export const listQuestionSets = (params) =>
  client.get('/admin/question-sets', { params }).then((r) => r.data);

export const getQuestionSet = (id) =>
  client.get(`/admin/question-sets/${id}`).then((r) => r.data.data);

export const createQuestionSet = (body) =>
  client.post('/admin/question-sets', body).then((r) => r.data.data);

export const updateQuestionSet = (id, body) =>
  client.patch(`/admin/question-sets/${id}`, body).then((r) => r.data.data);

export const deleteQuestionSet = (id) =>
  client.delete(`/admin/question-sets/${id}`);
