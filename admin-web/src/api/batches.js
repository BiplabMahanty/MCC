import client from './client';

export const listBatches = (params) =>
  client.get('/admin/batches', { params }).then((r) => r.data);

export const createBatch = (body) =>
  client.post('/admin/batches', body).then((r) => r.data.data);

export const updateBatch = (id, body) =>
  client.patch(`/admin/batches/${id}`, body).then((r) => r.data.data);

export const deleteBatch = (id) =>
  client.delete(`/admin/batches/${id}`);
