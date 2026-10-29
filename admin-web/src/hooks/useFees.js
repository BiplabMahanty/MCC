import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listFeePlans, getFeePlan, createFeePlan, updateFeePlan, deleteFeePlan,
  listFeeRecords, recordPayment, waiveRecord, recordPayments, studentFeeAdmin, markOverdue,
} from '../api/fees';

export function useFeePlans(params) {
  return useQuery({
    queryKey: ['fee-plans', params],
    queryFn: () => listFeePlans(params),
    keepPreviousData: true,
  });
}

export function useFeePlan(id) {
  return useQuery({
    queryKey: ['fee-plan', id],
    queryFn: () => getFeePlan(id),
    enabled: !!id,
  });
}

export function useCreateFeePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFeePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fee-plans'] }),
  });
}

export function useUpdateFeePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateFeePlan(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['fee-plans'] });
      qc.invalidateQueries({ queryKey: ['fee-plan', id] });
    },
  });
}

export function useDeleteFeePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFeePlan,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fee-plans'] }),
  });
}

export function useFeeRecords(planId, params) {
  return useQuery({
    queryKey: ['fee-records', planId, params],
    queryFn: () => listFeeRecords(planId, params),
    enabled: !!planId,
    keepPreviousData: true,
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: recordPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-records'] });
      qc.invalidateQueries({ queryKey: ['fee-plan'] });
    },
  });
}

export function useWaiveRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ recordId, note }) => waiveRecord(recordId, { note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fee-records'] }),
  });
}

export function useRecordPayments(recordId) {
  return useQuery({
    queryKey: ['record-payments', recordId],
    queryFn: () => recordPayments(recordId),
    enabled: !!recordId,
  });
}

export function useStudentFeeAdmin(studentId) {
  return useQuery({
    queryKey: ['student-fee', studentId],
    queryFn: () => studentFeeAdmin(studentId),
    enabled: !!studentId,
  });
}

export function useMarkOverdue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markOverdue,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['fee-records'] }),
  });
}
