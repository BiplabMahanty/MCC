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

export async function uploadProfileImage(asset) {
  const detectedMimeType = asset.mimeType || 'image/jpeg';
  const mimeType =
    detectedMimeType === 'image/jpg' ? 'image/jpeg' : detectedMimeType;
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(mimeType)) {
    throw new ApiError('Use a PNG, JPG, or WEBP image.', {
      code: 'INVALID_FILE_TYPE',
    });
  }
  const size = asset.fileSize;
  if (!size) {
    throw new ApiError('Could not determine the image size. Try selecting it again.', {
      code: 'INVALID_FILE_SIZE',
    });
  }
  if (size > 5 * 1024 * 1024) {
    throw new ApiError('Image must be 5 MB or smaller.', {
      code: 'FILE_TOO_LARGE',
    });
  }
  const fileName = asset.fileName || `profile.${mimeType.split('/')[1]}`;
  const signed = await apiRequest('/admin/uploads/profile-image', {
    method: 'POST',
    body: { fileName, mimeType, size },
    auth: true,
  });
  const formData = new FormData();
  Object.entries(signed.data.fields).forEach(([k, v]) => formData.append(k, v));
  formData.append('file', {
    uri: asset.uri,
    name: fileName,
    type: mimeType,
  });
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
  return { url: signed.data.url, storageKey: signed.data.storageKey, mimeType };
}
