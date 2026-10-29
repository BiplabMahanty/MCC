import client from './client';

export const listSchedules = (params) =>
  client.get('/admin/schedules', { params }).then((r) => r.data);

export const createSchedule = (body) =>
  client.post('/admin/schedules', body).then((r) => r.data.data);

export const updateSchedule = (id, body) =>
  client.patch(`/admin/schedules/${id}`, body).then((r) => r.data.data);

export const deleteSchedule = (id) =>
  client.delete(`/admin/schedules/${id}`);
