import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAttendance, markAttendance, listBatchStudents } from '../api/attendance';

export function useAttendance(params) {
  return useQuery({
    queryKey: ['attendance', params],
    queryFn: () => listAttendance(params),
    enabled: !!(params.batchId || params.month || params.date),
    keepPreviousData: true,
  });
}

export function useBatchStudents(batchId) {
  return useQuery({
    queryKey: ['batch-students', batchId],
    queryFn: () => listBatchStudents(batchId),
    enabled: !!batchId,
    staleTime: 30_000,
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}
