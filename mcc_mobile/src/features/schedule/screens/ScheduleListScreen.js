import { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import { useDeleteSchedule, useSchedules } from '../hooks/useSchedule';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SLOT_COLORS = [
  colors.iconBgBlue,
  colors.iconBgPurple,
  colors.iconBgOrange,
  colors.iconBgGreen,
  colors.iconBgPink,
  colors.iconBgTeal,
];

function slotColor(index) {
  return SLOT_COLORS[index % SLOT_COLORS.length];
}

function ScheduleItem({ item, index, onEdit, onDelete }) {
  const batch = item.batchId?.name ?? '—';
  const subject = item.subjectId?.name ?? '—';
  const teacher = item.teacherId?.name ?? '—';
  const day = DAYS[item.dayOfWeek] ?? '—';
  const time = `${item.startTime} – ${item.endTime}`;

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: slotColor(index) }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardMain}>
            <Text style={styles.cardSubject}>{subject}</Text>
            <Text style={styles.cardTime}>{day}  ·  {time}</Text>
            <Text style={styles.cardMeta}>{batch}</Text>
            {item.room ? <Text style={styles.cardRoom}>📍 {item.room}</Text> : null}
            <Text style={styles.cardTeacher}>👨🏫 {teacher}</Text>
          </View>
          <View style={[styles.activeBadge, !item.isActive && styles.inactiveBadge]}>
            <Text style={[styles.activeBadgeText, !item.isActive && styles.inactiveBadgeText]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
            onPress={onEdit}
          >
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, styles.deleteBtn, pressed && styles.pressed]}
            onPress={onDelete}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function DayPill({ label, selected, onPress }) {
  return (
    <Pressable
      style={[styles.dayPill, selected && styles.dayPillSelected]}
      onPress={onPress}
    >
      <Text style={[styles.dayPillText, selected && styles.dayPillTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function ScheduleListScreen({ navigation }) {
  const [dayOfWeek, setDayOfWeek] = useState(undefined);
  const query = useSchedules({ dayOfWeek });
  const deleteMutation = useDeleteSchedule();

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  function confirmDelete(item) {
    Alert.alert('Delete slot?', `${item.subjectId?.name} on ${DAYS[item.dayOfWeek]} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(item._id);
          } catch (e) {
            Alert.alert('Delete failed', e.message);
          }
        },
      },
    ]);
  }

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading schedule…" />
      </Screen>
    );
  }

  if (query.error) {
    return (
      <Screen>
        <ErrorState message={query.error.message} onRetry={query.refetch} retrying={query.isFetching} />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AdminHeader
          title="Schedule"
          subtitle="Manage class time slots."
          onBack={navigation.goBack}
          actionLabel="+ Add Slot"
          onAction={() => navigation.navigate('ScheduleForm')}
        />

        {/* Day filter pills */}
        <View style={styles.pillRow}>
          <DayPill
            label="All"
            selected={dayOfWeek === undefined}
            onPress={() => setDayOfWeek(undefined)}
          />
          {DAYS.map((d, i) => (
            <DayPill
              key={d}
              label={d}
              selected={dayOfWeek === i}
              onPress={() => setDayOfWeek(dayOfWeek === i ? undefined : i)}
            />
          ))}
        </View>

        <FlashList
          data={items}
          keyExtractor={(item) => item._id}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              title="No schedule slots found"
              message="Tap + Add Slot to create the first class time slot."
            />
          }
          ListFooterComponent={
            query.isFetchingNextPage
              ? <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
              : null
          }
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          renderItem={({ item, index }) => (
            <ScheduleItem
              item={item}
              index={index}
              onEdit={() => navigation.navigate('ScheduleForm', { id: item._id })}
              onDelete={() => confirmDelete(item)}
            />
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  listContent: { paddingBottom: 24 },
  footerLoader: { paddingVertical: 20 },

  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayPill: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  dayPillSelected: {
    backgroundColor: colors.dashGreen,
    borderColor: colors.dashGreen,
  },
  dayPillText: { fontSize: 13, fontWeight: '700', color: colors.mutedText },
  dayPillTextSelected: { color: colors.white },

  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardAccent: { width: 5 },
  cardBody: { flex: 1, padding: 12, gap: 10 },
  cardTop: { flexDirection: 'row', gap: 10 },
  cardMain: { flex: 1, gap: 3 },
  cardSubject: { fontSize: 15, fontWeight: '800', color: colors.black },
  cardTime: { fontSize: 13, fontWeight: '700', color: colors.dashGreen },
  cardMeta: { fontSize: 12, color: colors.mutedText },
  cardRoom: { fontSize: 12, color: colors.mutedText },
  cardTeacher: { fontSize: 12, color: colors.mutedText, marginTop: 2 },

  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.successSurface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inactiveBadge: { backgroundColor: colors.lightNeutral },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: colors.success },
  inactiveBadgeText: { color: colors.mutedText },

  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  deleteBtn: { borderColor: '#FEE2E2' },
  editText: { fontSize: 13, fontWeight: '700', color: colors.darkNeutral },
  deleteText: { fontSize: 13, fontWeight: '700', color: colors.error },
  pressed: { opacity: 0.6 },
});
