import { ApiError, apiRequest } from '../../../services/apiClient';

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

function root(role) {
  return role === 'admin' ? '/admin/questions' : '/teacher/questions';
}

export function listQuestions(role, params, signal) {
  return apiRequest(`${root(role)}${queryString(params)}`, {
    auth: true,
    signal,
  });
}

export function getQuestion(role, id, signal) {
  return apiRequest(`${root(role)}/${id}`, { auth: true, signal });
}

export function createQuestion(input) {
  return apiRequest('/admin/questions', {
    method: 'POST',
    body: input,
    auth: true,
  });
}

export function updateQuestion(id, input) {
  return apiRequest(`/admin/questions/${id}`, {
    method: 'PATCH',
    body: input,
    auth: true,
  });
}

export function deleteQuestion(id) {
  return apiRequest(`/admin/questions/${id}`, { method: 'DELETE', auth: true });
}

export async function uploadQuestionImage(asset) {
  const sourceResponse = await fetch(asset.uri);
  const blob = await sourceResponse.blob();
  const detectedMimeType = asset.mimeType || blob.type || 'image/jpeg';
  const mimeType =
    detectedMimeType === 'image/jpg' ? 'image/jpeg' : detectedMimeType;
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
  ];
  if (!allowedMimeTypes.includes(mimeType)) {
    throw new ApiError('Use a PNG, JPG, WEBP, or SVG image.', {
      code: 'INVALID_FILE_TYPE',
    });
  }
  const size = asset.fileSize || blob.size;
  const fileName = asset.fileName || `question-image.${mimeType.split('/')[1]}`;
  const signed = await apiRequest('/admin/uploads/question-image', {
    method: 'POST',
    body: { fileName, mimeType, size },
    auth: true,
  });
  const formData = new FormData();
  Object.entries(signed.data.fields).forEach(([k, v]) => formData.append(k, v));
  formData.append('file', blob);

  const upload = await fetch(signed.data.uploadUrl, {
    method: 'POST',
    body: formData,
  });

  if (!upload.ok) {
    throw new ApiError('The image upload failed.', {
      status: upload.status,
      code: 'UPLOAD_FAILED',
    });
  }

  return {
    type: 'image',
    url: signed.data.url,
    storageKey: signed.data.storageKey,
    mimeType,
    alt: asset.fileName || 'Question image',
    ...(asset.width > 0 && { width: asset.width }),
    ...(asset.height > 0 && { height: asset.height }),
  };
}
