import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listStudents, getStudent, createStudent, updateStudent, deleteStudent } from '../api/students';

export function useStudents(params) {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => listStudents(params),
    keepPreviousData: true,
  });
}

export function useStudent(id) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => getStudent(id),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  });
}
