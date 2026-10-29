import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion } from '../api/questions';

export function useQuestions(params) {
  return useQuery({
    queryKey: ['questions', params],
    queryFn: () => listQuestions(params),
    keepPreviousData: true,
  });
}

export function useQuestion(id) {
  return useQuery({
    queryKey: ['questions', id],
    queryFn: () => getQuestion(id),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions'] }),
  });
}

export function useUpdateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateQuestion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions'] }),
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions'] }),
  });
}
