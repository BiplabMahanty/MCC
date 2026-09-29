import {
  useMutation,
  useQuery,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import {
  createExam,
  deleteExam,
  getExam,
  getExamAnalytics,
  getExamMonitor,
  getStudentResult,
  listExamResults,
  listExams,
  listStudentResults,
  listTeacherExamResults,
  publishExam,
  publishResults,
  unpublishExam,
  unpublishResults,
  updateExam,
} from '../services/examsApi';

export function useExams(role, params) {
  return useInfiniteQuery({
    queryKey: ['exams', role, params],
    queryFn: ({ pageParam = 1, signal }) =>
      listExams(role, { ...params, page: pageParam }, signal),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useExam(role, id) {
  return useQuery({
    queryKey: ['exam', role, id],
    queryFn: ({ signal }) => getExam(role, id, signal),
    enabled: !!id,
    select: (d) => d.data,
  });
}

export function useCreateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExam,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function useUpdateExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateExam(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function useDeleteExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExam,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function usePublishExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishExam,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

export function useUnpublishExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unpublishExam,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['exams'] }),
  });
}

// ── Results ───────────────────────────────────────────────────────────────────

export function useStudentResults(params) {
  return useInfiniteQuery({
    queryKey: ['studentResults', params],
    queryFn: ({ pageParam = 1, signal }) =>
      listStudentResults({ ...params, page: pageParam }, signal),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useStudentResult(examId) {
  return useQuery({
    queryKey: ['studentResult', examId],
    queryFn: ({ signal }) => getStudentResult(examId, signal),
    enabled: !!examId,
    select: (d) => d.data,
  });
}

export function useExamResults(examId, params) {
  return useInfiniteQuery({
    queryKey: ['examResults', examId, params],
    queryFn: ({ pageParam = 1, signal }) =>
      listExamResults(examId, { ...params, page: pageParam }, signal),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!examId,
  });
}

export function usePublishResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishResults,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examResults'] }),
  });
}

export function useUnpublishResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unpublishResults,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['examResults'] }),
  });
}

export function useTeacherExamResults(examId, params) {
  return useInfiniteQuery({
    queryKey: ['teacherExamResults', examId, params],
    queryFn: ({ pageParam = 1, signal }) =>
      listTeacherExamResults(examId, { ...params, page: pageParam }, signal),
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.totalPages
        ? last.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!examId,
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export function useExamMonitor(examId) {
  return useQuery({
    queryKey: ['examMonitor', examId],
    queryFn: ({ signal }) => getExamMonitor(examId, signal),
    enabled: !!examId,
    select: (d) => d.data,
    refetchInterval: 15000, // poll every 15s for live monitoring
  });
}

export function useExamAnalytics(examId) {
  return useQuery({
    queryKey: ['examAnalytics', examId],
    queryFn: ({ signal }) => getExamAnalytics(examId, signal),
    enabled: !!examId,
    select: (d) => d.data,
  });
}
