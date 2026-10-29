import { getProfileImageUploadUrl } from './students';

export async function uploadProfileImage(file) {
  // 1. Get signed upload params from backend
  const { uploadUrl, fields, url, storageKey } = await getProfileImageUploadUrl({
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  });

  // 2. POST binary directly to Cloudinary as multipart
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  form.append('file', file);

  const res = await fetch(uploadUrl, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Cloudinary upload failed');

  return { url, storageKey, mimeType: file.type };
}
