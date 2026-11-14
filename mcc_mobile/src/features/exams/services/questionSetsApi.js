import { apiRequest } from '../../../services/apiClient';

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function listQuestionSets(params, signal) {
  return apiRequest(`/admin/question-sets${qs(params)}`, { auth: true, signal });
}

export function getQuestionSet(id, signal) {
  return apiRequest(`/admin/question-sets/${id}`, { auth: true, signal });
}

export function createQuestionSet(body) {
  return apiRequest('/admin/question-sets', {
    method: 'POST',
    body,
    auth: true,
  });
}

export function updateQuestionSet(id, body) {
  return apiRequest(`/admin/question-sets/${id}`, {
    method: 'PATCH',
    body,
    auth: true,
  });
}

export function deleteQuestionSet(id) {
  return apiRequest(`/admin/question-sets/${id}`, { method: 'DELETE', auth: true });
}
