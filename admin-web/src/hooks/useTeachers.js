import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listTeachers, createTeacher, updateTeacher, deleteTeacher } from '../api/teachers';

export function useTeachers(params) {
  return useQuery({
    queryKey: ['teachers', params],
    queryFn: () => listTeachers(params),
    keepPreviousData: true,
  });
}

export function useCreateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTeacher,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); qc.invalidateQueries({ queryKey: ['teachers-select'] }); },
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateTeacher(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); qc.invalidateQueries({ queryKey: ['teachers-select'] }); },
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTeacher,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teachers'] }); qc.invalidateQueries({ queryKey: ['teachers-select'] }); },
  });
}
