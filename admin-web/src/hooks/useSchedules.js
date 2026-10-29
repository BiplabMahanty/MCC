import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSchedules, createSchedule, updateSchedule, deleteSchedule } from '../api/schedules';

export function useSchedules(params) {
  return useQuery({
    queryKey: ['schedules', params],
    queryFn: () => listSchedules(params),
    keepPreviousData: true,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
}

export function useUpdateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSchedule(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
}
