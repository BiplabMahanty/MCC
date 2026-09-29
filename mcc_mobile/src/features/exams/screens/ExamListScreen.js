import { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import { useDeleteExam, useExams, usePublishExam } from '../hooks/useExams';

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
];

function statusColor(status) {
  if (status === 'published') return colors.success;
  if (status === 'cancelled') return colors.error;
  return colors.mutedText;
}

function ExamItem({ item, role, onPress, onPublish, onDelete }) {
  const start = item.startTime
    ? new Date(item.startTime).toLocaleString()
    : '—';
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.badge, { color: statusColor(item.status) }]}>
          {item.status?.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.cardMeta}>
        {item.batchId?.name} · {item.subjectId?.name}
      </Text>
      <Text style={styles.cardMeta}>{start}</Text>
      <Text style={styles.cardMeta}>
        {item.durationMinutes} min · {item.totalMarks} marks
      </Text>
      {role === 'admin' && (
        <View style={styles.actions}>
          {item.status === 'draft' && (
            <Pressable accessibilityRole="button" onPress={onPublish}>
              <Text style={styles.actionPublish}>Publish</Text>
            </Pressable>
          )}
          {item.status === 'draft' && (
            <Pressable accessibilityRole="button" onPress={onDelete}>
              <Text style={styles.actionDelete}>Delete</Text>
            </Pressable>
          )}
        </View>
      )}
    </Pressable>
  );
}

export default function ExamListScreen({ navigation, route }) {
  const { role } = route.params ?? {};
  const admin = role === 'admin';
  const [status, setStatus] = useState(undefined);
  const query = useExams(role, { status });
  const publishMutation = usePublishExam();
  const deleteMutation = useDeleteExam();

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  function confirmDelete(id) {
    Alert.alert('Delete exam?', 'Draft exams only.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(id);
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  }

  async function handlePublish(id) {
    try {
      await publishMutation.mutateAsync(id);
    } catch (e) {
      Alert.alert('Publish failed', e.message);
    }
  }

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading exams…" />
      </Screen>
    );
  }

  if (query.error) {
    return (
      <Screen>
        <ErrorState
          message={query.error.message}
          onRetry={query.refetch}
          retrying={query.isFetching}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AdminHeader
          actionLabel={admin ? 'Create exam' : undefined}
          onAction={
            admin ? () => navigation.navigate('ExamForm', { role }) : undefined
          }
          onBack={navigation.goBack}
          subtitle={
            admin
              ? 'Create, publish and manage exams.'
              : 'View your assigned exams.'
          }
          title="Exams"
        />

        {admin && (
          <View style={styles.filters}>
            {STATUS_FILTERS.map((f) => {
              const sel = status === f.value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                  key={f.label}
                  onPress={() => setStatus(f.value)}
                  style={[styles.filter, sel && styles.filterSel]}
                >
                  <Text style={[styles.filterTxt, sel && styles.filterTxtSel]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <FlashList
          data={items}
          estimatedItemSize={140}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <EmptyState
              message={
                admin
                  ? 'Create the first exam to get started.'
                  : 'No exams available yet.'
              }
              title="No exams"
            />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={styles.footer} />
            ) : null
          }
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage)
              query.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <ExamItem
              item={item}
              role={role}
              onDelete={() => confirmDelete(item._id)}
              onPress={() =>
                navigation.navigate('ExamDetail', { role, id: item._id })
              }
              onPublish={() => handlePublish(item._id)}
            />
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  filters: { flexDirection: 'row', gap: 8 },
  filter: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterSel: { backgroundColor: colors.black, borderColor: colors.black },
  filterTxt: { color: colors.mutedText, fontSize: 12, fontWeight: '700' },
  filterTxtSel: { color: colors.white },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginBottom: 12,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardName: {
    color: colors.black,
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },
  badge: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  cardMeta: { color: colors.mutedText, fontSize: 13 },
  actions: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 20,
    paddingTop: 10,
    marginTop: 4,
  },
  actionPublish: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  actionDelete: { color: colors.error, fontSize: 13, fontWeight: '800' },
  footer: { paddingVertical: 20 },
});
