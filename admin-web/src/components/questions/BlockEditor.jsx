import { Plus } from 'lucide-react';
import FormulaBlock from './FormulaBlock';
import ImageBlock from './ImageBlock';
import TableBlock from './TableBlock';

function TextBlock({ value, onChange, onRemove }) {
  return (
    <div className="border border-border rounded-lg p-3 space-y-2 bg-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">Text</span>
        <button type="button" onClick={onRemove} className="text-xs text-error hover:underline">Remove</button>
      </div>
      <textarea
        rows={3}
        value={value?.value ?? ''}
        onChange={(e) => onChange({ type: 'text', value: e.target.value })}
        placeholder="Enter text..."
        className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
      />
    </div>
  );
}

export default function BlockEditor({ blocks, onChange, allowedTypes = ['text', 'formula', 'image', 'table'] }) {
  const update = (i, block) => onChange(blocks.map((b, j) => j === i ? block : b));
  const remove = (i) => onChange(blocks.filter((_, j) => j !== i));
  const add = (type) => {
    const defaults = {
      text: { type: 'text', value: '' },
      formula: { type: 'formula', value: '' },
      image: { type: 'image', url: '', storageKey: '', alt: '', mimeType: 'image/png' },
      table: { type: 'table', caption: '', headers: [''], rows: [['']] },
    };
    onChange([...blocks, defaults[type]]);
  };

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const props = { key: i, value: block, onChange: (b) => update(i, b), onRemove: () => remove(i) };
        if (block.type === 'text') return <TextBlock {...props} />;
        if (block.type === 'formula') return <FormulaBlock {...props} />;
        if (block.type === 'image') return <ImageBlock {...props} />;
        if (block.type === 'table') return <TableBlock {...props} />;
        return null;
      })}
      <div className="flex flex-wrap gap-2">
        {allowedTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => add(type)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-border text-xs text-text-muted hover:border-brand hover:text-brand transition-colors"
          >
            <Plus size={12} /> {type}
          </button>
        ))}
      </div>
    </div>
  );
}
