import { useInfiniteQuery } from '@tanstack/react-query';
import { listQuestionSets } from '../services/examsApi';

export function useQuestionSets(params = {}) {
  return useInfiniteQuery({
    queryKey: ['question-sets', params],
    queryFn: ({ pageParam = 1 }) =>
      listQuestionSets({ ...params, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
