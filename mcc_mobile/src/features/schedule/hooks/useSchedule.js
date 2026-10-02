import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createSchedule,
  deleteSchedule,
  getPortalSchedule,
  getSchedule,
  listSchedules,
  updateSchedule,
} from '../services/scheduleApi';

const PAGE_SIZE = 20;

export function useSchedules(params) {
  return useInfiniteQuery({
    queryKey: ['admin', 'schedules', params],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listSchedules({ page: pageParam, limit: PAGE_SIZE, ...params }, signal),
    getNextPageParam(lastPage) {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useSchedule(id) {
  return useQuery({
    queryKey: ['admin', 'schedules', id],
    queryFn: ({ signal }) => getSchedule(id, signal),
    enabled: Boolean(id),
  });
}

export function useSaveSchedule(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body) =>
      id ? updateSchedule(id, body) : createSchedule(body),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['admin', 'schedules'] });
    },
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteSchedule(id),
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['admin', 'schedules'] });
    },
  });
}

export function usePortalSchedule(role) {
  return useQuery({
    queryKey: ['portal', role, 'schedule'],
    queryFn: ({ signal }) => getPortalSchedule(role, signal),
  });
}
