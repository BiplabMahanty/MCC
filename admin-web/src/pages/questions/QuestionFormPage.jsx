import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateQuestion, useUpdateQuestion, useQuestion } from '../../hooks/useQuestions';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import BlockEditor from '../../components/questions/BlockEditor';
import QuestionRenderer from '../../components/questions/QuestionRenderer';
import client from '../../api/client';
import katex from 'katex';

function useSubjectOptions() {
  return useQuery({
    queryKey: ['subjects-select'],
    queryFn: () => client.get('/admin/subjects', { params: { isActive: true, limit: 100 } }).then((r) => r.data.data),
    staleTime: 60_000,
  });
}

function validateBlocks(blocks) {
  for (const b of blocks) {
    if (b.type === 'text' && !b.value?.trim()) return 'Text block cannot be empty.';
    if (b.type === 'formula') {
      if (!b.value?.trim()) return 'Formula block cannot be empty.';
      try { katex.renderToString(b.value, { throwOnError: true }); } catch { return 'Formula block has invalid LaTeX.'; }
    }
    if (b.type === 'image' && !b.url) return 'Image block must have an uploaded image.';
    if (b.type === 'image' && !b.alt?.trim()) return 'Image block must have alt text.';
    if (b.type === 'table') {
      if (!b.headers?.length) return 'Table must have at least one column.';
      if (!b.rows?.length) return 'Table must have at least one row.';
      if (b.rows.some((r) => r.length !== b.headers.length)) return 'All table rows must match header column count.';
    }
  }
  return null;
}

export default function QuestionFormPage() {
  const { id } = useParams();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const create = useCreateQuestion();
  const update = useUpdateQuestion();
  const { data: subjects = [] } = useSubjectOptions();
  const { data: existing } = useQuestion(isEdit ? id : null);

  const [subjectId, setSubjectId] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [isActive, setIsActive] = useState(true);
  const [content, setContent] = useState([{ type: 'text', value: '' }]);
  const [options, setOptions] = useState([
    { content: [{ type: 'text', value: '' }] },
    { content: [{ type: 'text', value: '' }] },
  ]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setSubjectId(existing.subjectId?._id ?? existing.subjectId ?? '');
    setTopic(existing.topic ?? '');
    setDifficulty(existing.difficulty ?? 'easy');
    setIsActive(existing.isActive ?? true);
    setContent(existing.content ?? [{ type: 'text', value: '' }]);
    setOptions(existing.options ?? [{ content: [{ type: 'text', value: '' }] }, { content: [{ type: 'text', value: '' }] }]);
    setCorrectOptionIndex(existing.correctOptionIndex ?? 0);
  }, [existing]);

  const addOption = () => {
    if (options.length >= 8) return;
    setOptions([...options, { content: [{ type: 'text', value: '' }] }]);
  };
  const removeOption = (i) => {
    if (options.length <= 2) return;
    const next = options.filter((_, j) => j !== i);
    setOptions(next);
    if (correctOptionIndex >= next.length) setCorrectOptionIndex(next.length - 1);
  };
  const updateOption = (i, blocks) => setOptions(options.map((o, j) => j === i ? { content: blocks } : o));

  const handleSubmit = async () => {
    if (!subjectId) return toast.error('Please select a subject.');
    if (!topic.trim()) return toast.error('Topic is required.');
    if (content.length === 0) return toast.error('Add at least one content block.');

    const contentErr = validateBlocks(content);
    if (contentErr) return toast.error(contentErr);

    for (let i = 0; i < options.length; i++) {
      const err = validateBlocks(options[i].content);
      if (err) return toast.error(`Option ${String.fromCharCode(65 + i)}: ${err}`);
    }

    if (correctOptionIndex >= options.length) return toast.error('Correct answer index is out of range.');

    const payload = { subjectId, topic: topic.trim(), difficulty, isActive, content, options, correctOptionIndex };

    setSubmitting(true);
    try {
      if (isEdit) {
        await update.mutateAsync({ id, data: payload });
        toast.success('Question updated.');
      } else {
        await create.mutateAsync(payload);
        toast.success('Question created.');
      }
      navigate('/questions');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const subjectOptions = subjects.map((s) => ({ value: s._id, label: s.name }));

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">{isEdit ? 'Edit Question' : 'New Question'}</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" type="button" onClick={() => setShowPreview((p) => !p)}>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/questions')}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} loading={submitting}>{isEdit ? 'Save Changes' : 'Create Question'}</Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor */}
        <div className="space-y-6">
          {/* Meta */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <p className="text-sm font-medium text-text-primary">Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <Select
                  label="Subject *"
                  options={subjectOptions}
                  placeholder="Select subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                />
              </div>
              <Input label="Topic *" placeholder="Quadratic Equations" value={topic} onChange={(e) => setTopic(e.target.value)} />
              <Select
                label="Difficulty *"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]}
              />
            </div>
            <Checkbox label="Active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          </div>

          {/* Content blocks */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-text-primary">Question Content</p>
            <BlockEditor blocks={content} onChange={setContent} />
          </div>

          {/* Options */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">Options ({options.length}/8)</p>
              {options.length < 8 && (
                <button type="button" onClick={addOption} className="flex items-center gap-1 text-xs text-brand hover:underline">
                  <Plus size={12} /> Add option
                </button>
              )}
            </div>
            {options.map((opt, i) => (
              <div key={i} className={`rounded-xl border p-3 space-y-2 ${correctOptionIndex === i ? 'border-brand bg-brand-light' : 'border-border bg-white'}`}>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctOptionIndex === i}
                      onChange={() => setCorrectOptionIndex(i)}
                      className="accent-brand"
                    />
                    <span className="text-sm font-medium text-text-primary">Option {String.fromCharCode(65 + i)}</span>
                    {correctOptionIndex === i && <span className="text-xs text-brand font-medium">✓ Correct</span>}
                  </label>
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-error"><Trash2 size={14} /></button>
                  )}
                </div>
                <BlockEditor
                  blocks={opt.content}
                  onChange={(blocks) => updateOption(i, blocks)}
                  allowedTypes={['text', 'formula', 'image']}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3 h-fit sticky top-4">
            <p className="text-sm font-medium text-text-primary">Preview</p>
            <div className="flex gap-2 flex-wrap">
              {subjectOptions.find((s) => s.value === subjectId) && (
                <span className="text-xs bg-surface border border-border rounded px-2 py-0.5">
                  {subjectOptions.find((s) => s.value === subjectId)?.label}
                </span>
              )}
              {topic && <span className="text-xs bg-surface border border-border rounded px-2 py-0.5">{topic}</span>}
              {difficulty && <span className="text-xs bg-surface border border-border rounded px-2 py-0.5 capitalize">{difficulty}</span>}
            </div>
            <QuestionRenderer question={{ content, options }} highlightIndex={correctOptionIndex} />
          </div>
        )}
      </div>
    </div>
  );
}
