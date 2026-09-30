import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFeePlan,
  deleteFeePlan,
  getFeePlan,
  getStudentFees,
  listBatchOptions,
  listFeeRecords,
  listFeePlans,
  recordPayment,
  updateFeePlan,
  waiveFeeRecord,
} from '../services/feesApi';

const PAGE_SIZE = 20;

// ── Fee Plans ─────────────────────────────────────────────────────────────────

export function useFeePlans({ batchId, isActive } = {}) {
  return useInfiniteQuery({
    queryKey: ['admin', 'fees', { batchId, isActive }],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listFeePlans({ page: pageParam, limit: PAGE_SIZE, batchId, isActive }, signal),
    getNextPageParam(lastPage) {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}

export function useFeePlan(id) {
  return useQuery({
    queryKey: ['admin', 'fees', id],
    queryFn: ({ signal }) => getFeePlan(id, signal),
    enabled: Boolean(id),
  });
}

export function useCreateFeePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFeePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'fees'] }),
  });
}

export function useUpdateFeePlan(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input) => updateFeePlan(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'fees'] }),
  });
}

export function useDeleteFeePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFeePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'fees'] }),
  });
}

// ── Fee Records ───────────────────────────────────────────────────────────────

export function useFeeRecords(planId, { status, studentId } = {}) {
  return useInfiniteQuery({
    queryKey: ['admin', 'feeRecords', planId, { status, studentId }],
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      listFeeRecords(planId, { page: pageParam, limit: PAGE_SIZE, status, studentId }, signal),
    getNextPageParam(lastPage) {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    enabled: Boolean(planId),
  });
}

// ── Payments ──────────────────────────────────────────────────────────────────

export function useRecordPayment(planId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recordPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'feeRecords', planId] });
      qc.invalidateQueries({ queryKey: ['admin', 'fees', planId] });
      qc.invalidateQueries({ queryKey: ['admin', 'studentFees'] });
    },
  });
}

// ── Waive ─────────────────────────────────────────────────────────────────────

export function useWaiveFeeRecord(planId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, note }) => waiveFeeRecord(recordId, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'feeRecords', planId] });
      qc.invalidateQueries({ queryKey: ['admin', 'studentFees'] });
    },
  });
}

// ── Student fees ──────────────────────────────────────────────────────────────

export function useStudentFees(studentId) {
  return useQuery({
    queryKey: ['admin', 'studentFees', studentId],
    queryFn: ({ signal }) => getStudentFees(studentId, signal),
    enabled: Boolean(studentId),
  });
}

// ── Batch options ─────────────────────────────────────────────────────────────

export function useBatchOptions() {
  return useQuery({
    queryKey: ['admin', 'batches-options'],
    queryFn: ({ signal }) => listBatchOptions(signal),
    staleTime: 60_000,
  });
}
