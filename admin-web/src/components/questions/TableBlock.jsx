import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function TableBlock({ value, onChange, onRemove }) {
  const [caption, setCaption] = useState(value?.caption ?? '');
  const [headers, setHeaders] = useState(value?.headers ?? ['']);
  const [rows, setRows] = useState(value?.rows ?? [['']]);

  const emit = (h, r, c) => onChange({ type: 'table', caption: c, headers: h, rows: r });

  const setHeader = (i, v) => {
    const h = headers.map((x, j) => j === i ? v : x);
    setHeaders(h); emit(h, rows, caption);
  };
  const addColumn = () => {
    const h = [...headers, ''];
    const r = rows.map((row) => [...row, '']);
    setHeaders(h); setRows(r); emit(h, r, caption);
  };
  const removeColumn = (i) => {
    const h = headers.filter((_, j) => j !== i);
    const r = rows.map((row) => row.filter((_, j) => j !== i));
    setHeaders(h); setRows(r); emit(h, r, caption);
  };
  const setCell = (ri, ci, v) => {
    const r = rows.map((row, i) => i === ri ? row.map((c, j) => j === ci ? v : c) : row);
    setRows(r); emit(headers, r, caption);
  };
  const addRow = () => {
    const r = [...rows, headers.map(() => '')];
    setRows(r); emit(headers, r, caption);
  };
  const removeRow = (i) => {
    const r = rows.filter((_, j) => j !== i);
    setRows(r); emit(headers, r, caption);
  };
  const setCap = (v) => { setCaption(v); emit(headers, rows, v); };

  return (
    <div className="border border-border rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Table</span>
        <button type="button" onClick={onRemove} className="text-xs text-error hover:underline">Remove</button>
      </div>
      <input value={caption} onChange={(e) => setCap(e.target.value)} placeholder="Caption (optional)"
        className="w-full rounded-lg border border-border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="border border-border p-1">
                  <div className="flex items-center gap-1">
                    <input value={h} onChange={(e) => setHeader(i, e.target.value)} placeholder={`Col ${i + 1}`}
                      className="w-full bg-surface rounded px-2 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand" />
                    {headers.length > 1 && (
                      <button type="button" onClick={() => removeColumn(i)} className="text-error shrink-0"><Trash2 size={12} /></button>
                    )}
                  </div>
                </th>
              ))}
              <th className="border border-border p-1 w-8">
                <button type="button" onClick={addColumn} className="text-brand"><Plus size={14} /></button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-border p-1">
                    <input value={cell} onChange={(e) => setCell(ri, ci, e.target.value)}
                      className="w-full bg-white rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand" />
                  </td>
                ))}
                <td className="border border-border p-1 text-center">
                  {rows.length > 1 && (
                    <button type="button" onClick={() => removeRow(ri)} className="text-error"><Trash2 size={12} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addRow} className="text-xs text-brand hover:underline flex items-center gap-1">
        <Plus size={12} /> Add row
      </button>
    </div>
  );
}
