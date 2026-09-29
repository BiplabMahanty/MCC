import { apiRequest } from '../../../services/apiClient';

export function login(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export function refreshSession(refreshToken) {
  return apiRequest('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
  });
}

export function logout(refreshToken) {
  return apiRequest('/auth/logout', {
    method: 'POST',
    body: { refreshToken },
  });
}

export function getCurrentUser({ signal } = {}) {
  return apiRequest('/auth/me', { auth: true, signal });
}
