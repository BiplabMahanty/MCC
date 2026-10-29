import client from './client';

export const listCourses = (params) =>
  client.get('/admin/courses', { params }).then((r) => r.data);

export const createCourse = (body) =>
  client.post('/admin/courses', body).then((r) => r.data.data);

export const updateCourse = (id, body) =>
  client.patch(`/admin/courses/${id}`, body).then((r) => r.data.data);

export const deleteCourse = (id) =>
  client.delete(`/admin/courses/${id}`);
