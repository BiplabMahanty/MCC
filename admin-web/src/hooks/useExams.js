import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listExams, getExam, createExam, updateExam, deleteExam,
  publishExam, unpublishExam, listExamResults, publishResults, unpublishResults,
} from '../api/exams';

export function useExams(params) {
  return useQuery({
    queryKey: ['exams', params],
    queryFn: () => listExams(params),
    keepPreviousData: true,
  });
}

export function useExam(id) {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => getExam(id),
    enabled: !!id,
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
    mutationFn: ({ id, data }) => updateExam(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      qc.invalidateQueries({ queryKey: ['exam', id] });
    },
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
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      qc.invalidateQueries({ queryKey: ['exam', id] });
    },
  });
}

export function useUnpublishExam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unpublishExam,
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['exams'] });
      qc.invalidateQueries({ queryKey: ['exam', id] });
    },
  });
}

export function useExamResults(examId, params) {
  return useQuery({
    queryKey: ['exam-results', examId, params],
    queryFn: () => listExamResults(examId, params),
    enabled: !!examId,
    keepPreviousData: true,
  });
}

export function usePublishResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishResults,
    onSuccess: (_, examId) => qc.invalidateQueries({ queryKey: ['exam-results', examId] }),
  });
}

export function useUnpublishResults() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unpublishResults,
    onSuccess: (_, examId) => qc.invalidateQueries({ queryKey: ['exam-results', examId] }),
  });
}
