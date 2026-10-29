import client from './client';

export const listNotifications = () =>
  client.get('/notifications').then((r) => r.data.data ?? r.data);

export const markRead = (id) =>
  client.patch(`/notifications/${id}/read`).then((r) => r.data);

export const sendAnnouncement = (body) =>
  client.post('/notifications/announcement', body).then((r) => r.data);
