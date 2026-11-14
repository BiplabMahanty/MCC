import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import {
  listQuestionSets,
  getQuestionSet,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet,
} from '../services/questionSetsApi';

export function useQuestionSetsList(params = {}) {
  return useInfiniteQuery({
    queryKey: ['question-sets-list', params],
    queryFn: ({ pageParam = 1, signal }) =>
      listQuestionSets({ ...params, page: pageParam, limit: 20 }, signal),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}

export function useQuestionSet(id) {
  return useQuery({
    queryKey: ['question-set', id],
    queryFn: ({ signal }) => getQuestionSet(id, signal),
    enabled: !!id,
  });
}

export function useCreateQuestionSet() {
  return useMutation({
    mutationFn: (data) => createQuestionSet(data),
  });
}

export function useUpdateQuestionSet() {
  return useMutation({
    mutationFn: ({ id, data }) => updateQuestionSet(id, data),
  });
}

export function useDeleteQuestionSet() {
  return useMutation({
    mutationFn: (id) => deleteQuestionSet(id),
  });
}
