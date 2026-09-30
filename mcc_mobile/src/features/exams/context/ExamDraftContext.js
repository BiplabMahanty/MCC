import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DEFAULTS = {
  name: '',
  examType: '',
  academicSession: '',
  batchId: '',
  subjectId: '',
  durationMinutes: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  totalMarks: '',
  marksPerQuestion: '',
  negativeMarks: '0',
  instructions: '',
  questionIds: [],
};

export const ExamDraftContext = createContext(null);

export default function ExamDraftProvider({ children }) {
  const [draft, setDraft] = useState(DEFAULTS);

  const setField = useCallback((field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Seeds the draft from an existing exam (edit mode).
  const initDraft = useCallback((prefill) => {
    function splitIso(iso) {
      if (!iso) return { date: '', time: '' };
      const d = new Date(iso);
      if (isNaN(d.getTime())) return { date: '', time: '' };
      return { date: d.toISOString().slice(0, 10), time: d.toISOString().slice(11, 16) };
    }
    const start = splitIso(prefill.startTime);
    const end = splitIso(prefill.endTime);
    setDraft({
      name: prefill.name ?? '',
      examType: prefill.examType ?? '',
      academicSession: prefill.academicSession ?? '',
      batchId: prefill.batchId ?? '',
      subjectId: prefill.subjectId ?? '',
      durationMinutes: prefill.durationMinutes ? String(prefill.durationMinutes) : '',
      startDate: start.date,
      startTime: start.time,
      endDate: end.date,
      endTime: end.time,
      totalMarks: prefill.totalMarks ? String(prefill.totalMarks) : '',
      marksPerQuestion: prefill.marksPerQuestion ? String(prefill.marksPerQuestion) : '',
      negativeMarks: prefill.negativeMarks ? String(prefill.negativeMarks) : '0',
      instructions: prefill.instructions ?? '',
      questionIds: prefill.questionIds ?? [],
    });
  }, []);

  // Resets to blank defaults — call after successful save or explicit discard.
  const resetDraft = useCallback(() => {
    setDraft(DEFAULTS);
  }, []);

  const value = useMemo(
    () => ({ draft, setField, initDraft, resetDraft }),
    [draft, setField, initDraft, resetDraft],
  );

  return (
    <ExamDraftContext.Provider value={value}>
      {children}
    </ExamDraftContext.Provider>
  );
}

export function useExamDraft() {
  const ctx = useContext(ExamDraftContext);
  if (!ctx) throw new Error('useExamDraft must be used inside ExamDraftProvider');
  return ctx;
}
