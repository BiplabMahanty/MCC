import client from './client';

export const listChapters = (params) => client.get('/admin/chapters', { params }).then((r) => r.data);
export const createChapter = (body) => client.post('/admin/chapters', body).then((r) => r.data.data);
export const updateChapter = (id, body) => client.patch(`/admin/chapters/${id}`, body).then((r) => r.data.data);
export const deleteChapter = (id) => client.delete(`/admin/chapters/${id}`);
