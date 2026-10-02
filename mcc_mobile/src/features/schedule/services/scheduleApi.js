import { apiRequest } from '../../../services/apiClient';

function qs(params) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function listSchedules(params, signal) {
  return apiRequest(`/admin/schedules${qs(params)}`, { auth: true, signal });
}

export function getSchedule(id, signal) {
  return apiRequest(`/admin/schedules/${id}`, { auth: true, signal });
}

export function createSchedule(body) {
  return apiRequest('/admin/schedules', { method: 'POST', body, auth: true });
}

export function updateSchedule(id, body) {
  return apiRequest(`/admin/schedules/${id}`, { method: 'PATCH', body, auth: true });
}

export function deleteSchedule(id) {
  return apiRequest(`/admin/schedules/${id}`, { method: 'DELETE', auth: true });
}

export function getPortalSchedule(role, signal) {
  return apiRequest(`/${role}/schedule`, { auth: true, signal });
}
