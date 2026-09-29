import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createQuestion,
  deleteQuestion,
  getQuestion,
  listQuestions,
  updateQuestion,
} from '../services/questionsApi';

const PAGE_SIZE = 20;

export function useQuestions(role, filters) {
  return useInfiniteQuery({
    queryKey: ['questions', role, filters],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listQuestions(
        role,
        { ...filters, page: pageParam, limit: PAGE_SIZE },
        signal,
      ),
    getNextPageParam(lastPage) {
      return lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;
    },
  });
}

export function useQuestion(role, id) {
  return useQuery({
    queryKey: ['questions', role, id],
    queryFn: ({ signal }) => getQuestion(role, id, signal),
    enabled: Boolean(id),
  });
}

export function useSaveQuestion(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) =>
      id ? updateQuestion(id, input) : createQuestion(input),
    async onSuccess() {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['questions'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
        queryClient.invalidateQueries({
          queryKey: ['portal', 'teacher', 'dashboard'],
        }),
      ]);
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestion,
    async onSuccess() {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['questions'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      ]);
    },
  });
}
