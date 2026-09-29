import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createEntity,
  deleteEntity,
  getEntity,
  listEntities,
  updateEntity,
} from '../services/adminApi';

const PAGE_SIZE = 20;

export function useAdminOptions(entityType, enabled = true) {
  return useQuery({
    queryKey: ['admin', `${entityType}-options`],
    queryFn: ({ signal }) =>
      listEntities(entityType, { page: 1, limit: 100, isActive: true }, signal),
    enabled,
    staleTime: 60_000,
  });
}

export function useAdminEntities(entityType, { search, isActive }) {
  return useInfiniteQuery({
    queryKey: ['admin', entityType, { search, isActive }],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listEntities(
        entityType,
        {
          page: pageParam,
          limit: PAGE_SIZE,
          search,
          isActive,
        },
        signal,
      ),
    getNextPageParam(lastPage) {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useAdminEntity(entityType, id) {
  return useQuery({
    queryKey: ['admin', entityType, id],
    queryFn: ({ signal }) => getEntity(entityType, id, signal),
    enabled: Boolean(id),
  });
}

export function useSaveAdminEntity(entityType, id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input) =>
      id
        ? updateEntity(entityType, id, input)
        : createEntity(entityType, input),
    async onSuccess() {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', entityType] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      ]);
    },
  });
}

export function useDeleteAdminEntity(entityType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteEntity(entityType, id),
    async onSuccess() {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', entityType] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] }),
      ]);
    },
  });
}
