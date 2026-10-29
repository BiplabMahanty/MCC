import { useRef, useState } from 'react';
import { getQuestionImageUploadUrl } from '../../api/questions';
import Spinner from '../ui/Spinner';

export default function ImageBlock({ value, onChange, onRemove }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const { uploadUrl, fields, url, storageKey } = await getQuestionImageUploadUrl({
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });
      const form = new FormData();
      Object.entries(fields).forEach(([k, v]) => form.append(k, v));
      form.append('file', file);
      const res = await fetch(uploadUrl, { method: 'POST', body: form });
      if (!res.ok) throw new Error('Upload failed');
      onChange({ type: 'image', url, storageKey, mimeType: file.type, alt: file.name });
    } catch (err) {
      setError(err.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Image</span>
        <button type="button" onClick={onRemove} className="text-xs text-error hover:underline">Remove</button>
      </div>
      {value?.url ? (
        <div className="space-y-2">
          <img src={value.url} alt={value.alt} className="max-h-40 rounded-lg object-contain border border-border" />
          <input
            type="text"
            value={value.alt ?? ''}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            placeholder="Alt text (required)"
            className="w-full rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button type="button" onClick={() => fileRef.current.click()} className="text-xs text-brand hover:underline">Change image</button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="w-full h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-sm text-text-muted hover:border-brand hover:text-brand transition-colors"
        >
          {uploading ? <Spinner size="sm" /> : 'Click to upload PNG, JPG, WEBP (max 5 MB)'}
        </button>
      )}
      {error && <p className="text-xs text-error">{error}</p>}
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleFile} />
    </div>
  );
}
