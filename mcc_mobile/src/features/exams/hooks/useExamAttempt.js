import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAttempt,
  startAttempt,
  submitAttempt,
  syncAnswers,
} from '../services/examsApi';

export function useStartAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: startAttempt,
    onSuccess: (_, examId) =>
      qc.invalidateQueries({ queryKey: ['attempt', examId] }),
  });
}

export function useAttempt(examId) {
  return useQuery({
    queryKey: ['attempt', examId],
    queryFn: ({ signal }) => getAttempt(examId, signal),
    enabled: !!examId,
    staleTime: 0,
  });
}

export function useSyncAnswers() {
  return useMutation({
    mutationFn: ({ examId, answers }) => syncAnswers(examId, answers),
  });
}

export function useSubmitAttempt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitAttempt,
    onSuccess: (_, examId) => {
      qc.invalidateQueries({ queryKey: ['attempt', examId] });
      qc.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}
