import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCourses, createCourse, updateCourse, deleteCourse } from '../api/courses';
import { listBatches, createBatch, updateBatch, deleteBatch } from '../api/batches';
import { listSubjects, createSubject, updateSubject, deleteSubject } from '../api/subjects';

// ── Courses ──────────────────────────────────────────────────────────────────
export function useCourses(params) {
  return useQuery({ queryKey: ['courses', params], queryFn: () => listCourses(params), keepPreviousData: true });
}
export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createCourse, onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); qc.invalidateQueries({ queryKey: ['courses-select'] }); } });
}
export function useUpdateCourse() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }) => updateCourse(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); qc.invalidateQueries({ queryKey: ['courses-select'] }); } });
}
export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteCourse, onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); qc.invalidateQueries({ queryKey: ['courses-select'] }); } });
}

// ── Batches ───────────────────────────────────────────────────────────────────
export function useBatches(params) {
  return useQuery({ queryKey: ['batches', params], queryFn: () => listBatches(params), keepPreviousData: true });
}
export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createBatch, onSuccess: () => { qc.invalidateQueries({ queryKey: ['batches'] }); qc.invalidateQueries({ queryKey: ['batches-select'] }); } });
}
export function useUpdateBatch() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }) => updateBatch(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['batches'] }); qc.invalidateQueries({ queryKey: ['batches-select'] }); } });
}
export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteBatch, onSuccess: () => { qc.invalidateQueries({ queryKey: ['batches'] }); qc.invalidateQueries({ queryKey: ['batches-select'] }); } });
}

// ── Subjects ──────────────────────────────────────────────────────────────────
export function useSubjects(params) {
  return useQuery({ queryKey: ['subjects', params], queryFn: () => listSubjects(params), keepPreviousData: true });
}
export function useCreateSubject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: createSubject, onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); qc.invalidateQueries({ queryKey: ['subjects-select'] }); } });
}
export function useUpdateSubject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }) => updateSubject(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); qc.invalidateQueries({ queryKey: ['subjects-select'] }); } });
}
export function useDeleteSubject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteSubject, onSuccess: () => { qc.invalidateQueries({ queryKey: ['subjects'] }); qc.invalidateQueries({ queryKey: ['subjects-select'] }); } });
}
