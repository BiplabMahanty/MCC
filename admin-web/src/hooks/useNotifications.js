import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markRead, sendAnnouncement } from '../api/notifications';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: listNotifications,
    staleTime: 30_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useSendAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}
