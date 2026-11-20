import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Checkbox from '../../components/ui/Checkbox';
import Spinner from '../../components/ui/Spinner';
import client from '../../api/client';
import { createQuestionSet, updateQuestionSet, getQuestionSet } from '../../api/questionSets';

function useSubjectOptions() {
  return useQuery({
    queryKey: ['subjects-select'],
    queryFn: () =>
      client
        .get('/admin/subjects', { params: { isActive: true, limit: 100 } })
        .then((r) => r.data.data),
    staleTime: 60000,
  });
}

function useQuestionOptions(subjectId, chapterId) {
  return useQuery({
    queryKey: ['questions-select', subjectId, chapterId],
    queryFn: () =>
      client
        .get('/admin/questions', {
          params: { subjectId, ...(chapterId && { chapterId }), isActive: true, limit: 100 },
        })
        .then((r) => r.data.data),
    enabled: !!subjectId,
    staleTime: 60000,
  });
}

export default function QuestionSetFormPage() {
  const { id } = useParams();
  const isEdit = !!id && id !== 'new';
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: subjects = [] } = useSubjectOptions();
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const { data: chapters = [] } = useQuery({ queryKey: ['chapters-select', selectedSubjectId], queryFn: () => client.get('/admin/chapters', { params: { subjectId: selectedSubjectId, isActive: true, limit: 100 } }).then((r) => r.data.data), enabled: !!selectedSubjectId, staleTime: 60000 });
  const { data: questions = [], isLoading: loadingQuestions } =
    useQuestionOptions(selectedSubjectId, chapterId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [questionIds, setQuestionIds] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['question-set', id],
    queryFn: () => getQuestionSet(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!existing) return;
    setName(existing.name ?? '');
    setDescription(existing.description ?? '');
    setSubjectId(existing.subjectId?._id ?? existing.subjectId ?? '');
    setSelectedSubjectId(existing.subjectId?._id ?? existing.subjectId ?? '');
    setChapterId(existing.chapterId?._id ?? existing.chapterId ?? '');
    setQuestionIds(
      existing.questionIds?.map((q) => (typeof q === 'string' ? q : q._id)) ??
        []
    );
    setIsActive(existing.isActive ?? true);
  }, [existing]);

  const create = useMutation({
    mutationFn: (data) => createQuestionSet(data),
    onSuccess: () => {
      toast.success('Question set created.');
      navigate('/question-sets');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ?? 'Failed to create question set.'
      );
    },
  });

  const update = useMutation({
    mutationFn: (data) => updateQuestionSet(id, data),
    onSuccess: () => {
      toast.success('Question set updated.');
      navigate('/question-sets');
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message ?? 'Failed to update question set.'
      );
    },
  });

  const handleSubmit = async () => {
    if (!name.trim()) return toast.error('Name is required.');
    if (!subjectId) return toast.error('Subject is required.');
    if (questionIds.length === 0)
      return toast.error('Select at least one question.');

    const payload = {
      name: name.trim(),
      description: description.trim(),
      subjectId,
      questionIds,
      isActive,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await update.mutateAsync(payload);
      } else {
        await create.mutateAsync(payload);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQuestion = (qId) => {
    setQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const filteredQuestions = questions.filter((q) => {
    const preview = (q.preview ?? '').toLowerCase();
    const topic = (q.topic ?? '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return preview.includes(query) || topic.includes(query);
  });

  const subjectOptions = subjects.map((s) => ({ value: s._id, label: s.name }));

  if (isEdit && loadingExisting) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          {isEdit ? 'Edit Question Set' : 'Create Question Set'}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/question-sets')}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} loading={submitting}>
            {isEdit ? 'Save Changes' : 'Create Set'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <p className="text-sm font-medium text-text-primary">Details</p>

            <Input
              label="Name *"
              placeholder="e.g., Algebra Basics"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Description
              </label>
              <textarea
                placeholder="Optional description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                rows={3}
              />
            </div>

            <Select
              label="Subject *"
              options={subjectOptions}
              placeholder="Select subject"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setSelectedSubjectId(e.target.value);
                setChapterId('');
                setQuestionIds([]);
              }}
            />

            {subjectId && chapters.length > 0 && <Select label="Chapter filter" options={chapters.map((c) => ({ value: c._id, label: c.name }))} placeholder="All chapters" value={chapterId} onChange={(e) => { setChapterId(e.target.value); setQuestionIds([]); }} />}

            <Checkbox
              label="Active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">
                Questions
                {selectedSubjectId && !loadingQuestions && (
                  <span className="text-xs text-text-muted ml-2">
                    ({questionIds.length} selected)
                  </span>
                )}
              </p>
              {!subjectId && (
                <p className="text-xs text-text-muted">Select a subject first</p>
              )}
            </div>

            {loadingQuestions && selectedSubjectId ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Spinner />
                <p className="text-sm text-text-muted">Loading questions...</p>
              </div>
            ) : subjectId ? (
              <>
                {questions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Search size={16} className="text-text-muted" />
                    <Input
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                )}

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredQuestions.length === 0 ? (
                    <p className="text-center py-8 text-text-muted text-sm">
                      {questions.length === 0
                        ? 'No questions available for this subject.'
                        : 'No questions match your search.'}
                    </p>
                  ) : (
                    filteredQuestions.map((q) => {
                      const selected = questionIds.includes(q._id);
                      return (
                        <div
                          key={q._id}
                          onClick={() => toggleQuestion(q._id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selected
                              ? 'border-brand bg-brand-light'
                              : 'border-border bg-white hover:bg-surface'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {}}
                              className="mt-1 accent-brand"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text-primary line-clamp-2">
                                {q.preview || 'Question'}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs bg-surface border border-border rounded px-2 py-0.5">
                                  {q.topic}
                                </span>
                                <span className="text-xs text-text-muted capitalize">
                                  {q.difficulty}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-text-muted">
                <p className="text-sm">
                  Select a subject to view available questions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
