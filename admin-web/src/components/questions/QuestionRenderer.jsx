import katex from 'katex';
import 'katex/dist/katex.min.css';

function renderFormula(value) {
  try { return katex.renderToString(value, { throwOnError: false, displayMode: true }); } catch { return value; }
}

export function BlockRenderer({ block }) {
  if (block.type === 'text') return <p className="text-sm text-text-primary whitespace-pre-wrap">{block.value}</p>;
  if (block.type === 'formula') return (
    <div className="overflow-x-auto py-1 text-center" dangerouslySetInnerHTML={{ __html: renderFormula(block.value) }} />
  );
  if (block.type === 'image') return (
    <figure className="my-1">
      <img src={block.url} alt={block.alt} className="max-h-48 rounded-lg object-contain border border-border" />
      {block.alt && <figcaption className="text-xs text-text-muted mt-1 text-center">{block.alt}</figcaption>}
    </figure>
  );
  if (block.type === 'table') return (
    <div className="overflow-x-auto">
      {block.caption && <p className="text-xs text-text-muted mb-1">{block.caption}</p>}
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>{block.headers.map((h, i) => <th key={i} className="border border-border px-2 py-1 bg-surface text-left font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j} className="border border-border px-2 py-1">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return null;
}

export default function QuestionRenderer({ question, highlightIndex }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {question.content?.map((block, i) => <BlockRenderer key={i} block={block} />)}
      </div>
      {question.options?.length > 0 && (
        <div className="space-y-2 mt-3">
          {question.options.map((opt, i) => (
            <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border ${i === highlightIndex ? 'border-brand bg-brand-light' : 'border-border bg-white'}`}>
              <span className={`text-xs font-bold mt-0.5 shrink-0 ${i === highlightIndex ? 'text-brand' : 'text-text-muted'}`}>
                {String.fromCharCode(65 + i)}.
              </span>
              <div className="space-y-1 flex-1">
                {opt.content?.map((block, j) => <BlockRenderer key={j} block={block} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
