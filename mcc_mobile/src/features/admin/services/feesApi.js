import { apiRequest } from '../../../services/apiClient';

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `?${q}` : '';
}

// ── Fee Plans ─────────────────────────────────────────────────────────────────

export function listFeePlans(params, signal) {
  return apiRequest(`/admin/fees${qs(params)}`, { auth: true, signal });
}

export function getFeePlan(id, signal) {
  return apiRequest(`/admin/fees/${id}`, { auth: true, signal });
}

export function createFeePlan(input) {
  return apiRequest('/admin/fees', { method: 'POST', body: input, auth: true });
}

export function updateFeePlan(id, input) {
  return apiRequest(`/admin/fees/${id}`, { method: 'PATCH', body: input, auth: true });
}

export function deleteFeePlan(id) {
  return apiRequest(`/admin/fees/${id}`, { method: 'DELETE', auth: true });
}

// ── Fee Records ───────────────────────────────────────────────────────────────

export function listFeeRecords(planId, params, signal) {
  return apiRequest(`/admin/fees/${planId}/records${qs(params)}`, { auth: true, signal });
}

// ── Payments ──────────────────────────────────────────────────────────────────

export function recordPayment(input) {
  return apiRequest('/admin/fees/payments', { method: 'POST', body: input, auth: true });
}

// ── Waive ─────────────────────────────────────────────────────────────────────

export function waiveFeeRecord(recordId, note) {
  return apiRequest(`/admin/fees/records/${recordId}/waive`, {
    method: 'PATCH',
    body: { note },
    auth: true,
  });
}

// ── Student fee summary (admin view) ─────────────────────────────────────────

export function getStudentFees(studentId, signal) {
  return apiRequest(`/admin/fees/students/${studentId}/fees`, { auth: true, signal });
}

// ── Batch options (reuse existing admin endpoint) ─────────────────────────────

export function listBatchOptions(signal) {
  return apiRequest('/admin/batches?page=1&limit=100&isActive=true', { auth: true, signal });
}
