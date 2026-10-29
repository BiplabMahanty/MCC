import { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function FormulaBlock({ value, onChange, onRemove }) {
  const [latex, setLatex] = useState(value ?? '');
  const [error, setError] = useState('');

  const handleChange = (v) => {
    setLatex(v);
    try {
      katex.renderToString(v, { throwOnError: true, trust: false });
      setError('');
    } catch (e) {
      setError(e.message);
    }
    onChange({ type: 'formula', value: v });
  };

  let rendered = '';
  try { rendered = katex.renderToString(latex, { throwOnError: false, displayMode: true }); } catch {}

  return (
    <div className="border border-border rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Formula (LaTeX)</span>
        <button type="button" onClick={onRemove} className="text-xs text-error hover:underline">Remove</button>
      </div>
      <textarea
        rows={2}
        value={latex}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="\frac{-b \pm \sqrt{b^2-4ac}}{2a}"
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand resize-none"
      />
      {error && <p className="text-xs text-error">{error}</p>}
      {latex && !error && (
        <div className="p-2 bg-surface rounded-lg overflow-x-auto text-center" dangerouslySetInnerHTML={{ __html: rendered }} />
      )}
    </div>
  );
}
