import client from './client';

export const login = (email, password) =>
  client.post('/auth/login', { email, password }).then((r) => r.data);

export const refresh = (refreshToken) =>
  client.post('/auth/refresh', { refreshToken }).then((r) => r.data);

export const logout = (refreshToken) =>
  client.post('/auth/logout', { refreshToken }).then((r) => r.data);

export const getMe = () => client.get('/auth/me').then((r) => r.data);
