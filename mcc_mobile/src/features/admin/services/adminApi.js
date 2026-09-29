import { apiRequest } from '../../../services/apiClient';

function queryString(params) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function getAdminDashboard({ signal } = {}) {
  return apiRequest('/admin/dashboard', { auth: true, signal });
}

export function getAdminAnalytics(params = {}, { signal } = {}) {
  return apiRequest(`/admin/analytics${queryString(params)}`, {
    auth: true,
    signal,
  });
}

export function listEntities(entityType, params, signal) {
  return apiRequest(`/admin/${entityType}${queryString(params)}`, {
    auth: true,
    signal,
  });
}

export function getEntity(entityType, id, signal) {
  return apiRequest(`/admin/${entityType}/${id}`, { auth: true, signal });
}

export function createEntity(entityType, input) {
  return apiRequest(`/admin/${entityType}`, {
    method: 'POST',
    body: input,
    auth: true,
  });
}

export function updateEntity(entityType, id, input) {
  return apiRequest(`/admin/${entityType}/${id}`, {
    method: 'PATCH',
    body: input,
    auth: true,
  });
}

export function deleteEntity(entityType, id) {
  return apiRequest(`/admin/${entityType}/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}
