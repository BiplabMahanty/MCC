import { apiRequest } from '../../../services/apiClient';

function qs(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function listExams(role, params, signal) {
  return apiRequest(`/${role}/exams${qs(params)}`, { auth: true, signal });
}

export function getExam(role, id, signal) {
  return apiRequest(`/${role}/exams/${id}`, { auth: true, signal });
}

// Admin only
export function createExam(body) {
  return apiRequest('/admin/exams', { method: 'POST', body, auth: true });
}

export function updateExam(id, body) {
  return apiRequest(`/admin/exams/${id}`, {
    method: 'PATCH',
    body,
    auth: true,
  });
}

export function deleteExam(id) {
  return apiRequest(`/admin/exams/${id}`, { method: 'DELETE', auth: true });
}

export function publishExam(id) {
  return apiRequest(`/admin/exams/${id}/publish`, {
    method: 'POST',
    auth: true,
  });
}

export function unpublishExam(id) {
  return apiRequest(`/admin/exams/${id}/unpublish`, {
    method: 'POST',
    auth: true,
  });
}

// Student attempt
export function startAttempt(examId) {
  return apiRequest(`/student/exams/${examId}/attempt`, {
    method: 'POST',
    auth: true,
  });
}

export function getAttempt(examId, signal) {
  return apiRequest(`/student/exams/${examId}/attempt`, { auth: true, signal });
}

export function syncAnswers(examId, answers) {
  return apiRequest(`/student/exams/${examId}/attempt/answers`, {
    method: 'PUT',
    body: { answers },
    auth: true,
  });
}

export function submitAttempt(examId) {
  return apiRequest(`/student/exams/${examId}/attempt/submit`, {
    method: 'POST',
    auth: true,
  });
}

// Results
export function listStudentResults(params, signal) {
  return apiRequest(`/student/results${qs(params)}`, { auth: true, signal });
}

export function getStudentResult(examId, signal) {
  return apiRequest(`/student/results/${examId}`, { auth: true, signal });
}

export function listExamResults(examId, params, signal) {
  return apiRequest(`/admin/exams/${examId}/results${qs(params)}`, {
    auth: true,
    signal,
  });
}

export function publishResults(examId) {
  return apiRequest(`/admin/exams/${examId}/results/publish`, {
    method: 'POST',
    auth: true,
  });
}

export function unpublishResults(examId) {
  return apiRequest(`/admin/exams/${examId}/results/unpublish`, {
    method: 'POST',
    auth: true,
  });
}

// Teacher analytics
export function getExamMonitor(examId, signal) {
  return apiRequest(`/teacher/exams/${examId}/monitor`, { auth: true, signal });
}

export function getExamAnalytics(examId, signal) {
  return apiRequest(`/teacher/exams/${examId}/analytics`, {
    auth: true,
    signal,
  });
}

export function listTeacherExamResults(examId, params, signal) {
  return apiRequest(`/teacher/exams/${examId}/results${qs(params)}`, {
    auth: true,
    signal,
  });
}
