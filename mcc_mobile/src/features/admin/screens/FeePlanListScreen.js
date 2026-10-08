import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import colors from '../../../theme/colors';
import { useDeleteFeePlan, useFeePlans } from '../hooks/useFees';

const TYPE_LABELS = {
  one_time: 'One-Time',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
  custom: 'Custom',
};

const TYPE_ICONS = {
  one_time: '💵',
  monthly: '📅',
  quarterly: '📆',
  yearly: '🗓️',
  custom: '⚙️',
};

const STATUS_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

function PlanCard({ plan, onEdit, onDelete, onViewRecords }) {
  const batch = plan.batchId?.name ?? '—';
  const typeLabel = TYPE_LABELS[plan.type] ?? plan.type;
  const typeIcon = TYPE_ICONS[plan.type] ?? '💳';
  const amountText =
    plan.type === 'custom'
      ? `${plan.installments?.length ?? 0} installments`
      : `₹${plan.amount?.toLocaleString('en-IN')}`;

  return (
    <View style={styles.card}>
      {/* Card top row */}
      <View style={styles.cardTop}>
        <View style={[styles.cardIconCircle, { backgroundColor: colors.iconBgGreen }]}>
          <Text style={styles.cardIcon}>{typeIcon}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text numberOfLines={1} style={styles.cardTitle}>{plan.name}</Text>
          <Text style={styles.cardMeta}>{typeLabel}  •  {batch}  •  {amountText}</Text>
          {plan.startDate && plan.endDate ? (
            <Text style={styles.cardDates}>
              {new Date(plan.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              {' → '}
              {new Date(plan.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
            </Text>
          ) : null}
        </View>
        <View style={[styles.badge, !plan.isActive && styles.badgeInactive]}>
          <Text style={[styles.badgeText, !plan.isActive && styles.badgeTextInactive]}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable onPress={onEdit} style={styles.actionBtn}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
        <Pressable onPress={onViewRecords} style={[styles.actionBtn, styles.recordsBtn]}>
          <Text style={styles.recordsBtnText}>View Records →</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={styles.actionBtn}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function FeePlanListScreen({ navigation }) {
  const [isActive, setIsActive] = useState(undefined);
  const query = useFeePlans({ isActive });
  const deleteMutation = useDeleteFeePlan();

  const plans = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  function confirmDelete(plan) {
    Alert.alert('Delete fee plan?', `"${plan.name}" will be soft-deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try { await deleteMutation.mutateAsync(plan._id); }
          catch (err) { Alert.alert('Delete failed', err.message); }
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* ── GREEN HEADER ── */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerTop}>
            <Pressable onPress={navigation.goBack} style={styles.backBtn}>
              <Text style={styles.backText}>‹ Back</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('FeePlanForm', {})}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>+ Add Plan</Text>
            </Pressable>
          </View>
          <View style={styles.headerIconRow}>
            <View style={styles.headerIconCircle}>
              <Text style={styles.headerIcon}>💳</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>Fee Plans</Text>
              <Text style={styles.headerSub}>Manage fee plans for your batches</Text>
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.waveBump} pointerEvents="none" />
      </View>

      {/* ── BODY ── */}
      <View style={styles.body}>
        {/* Status filter */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => {
            const selected = isActive === f.value;
            return (
              <Pressable
                key={f.label}
                onPress={() => setIsActive(f.value)}
                style={[styles.filterPill, selected && styles.filterPillSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {query.isPending ? (
          <Loader message="Loading fee plans…" />
        ) : query.error ? (
          <ErrorState message={query.error.message} onRetry={query.refetch} retrying={query.isFetching} />
        ) : (
          <FlashList
            data={plans}
            keyExtractor={(item) => item._id}
            estimatedItemSize={130}
            contentContainerStyle={styles.listContent}
            onEndReached={() => {
              if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
            }}
            onEndReachedThreshold={0.4}
            refreshing={query.isFetching && !query.isFetchingNextPage}
            onRefresh={query.refetch}
            ListEmptyComponent={
              <EmptyState title="No fee plans found" message="Create the first fee plan for a batch." />
            }
            ListFooterComponent={
              query.isFetchingNextPage
                ? <ActivityIndicator color={colors.dashGreen} style={styles.footerLoader} />
                : null
            }
            renderItem={({ item }) => (
              <PlanCard
                plan={item}
                onEdit={() => navigation.navigate('FeePlanForm', { id: item._id })}
                onDelete={() => confirmDelete(item)}
                onViewRecords={() =>
                  navigation.navigate('FeeRecordList', { planId: item._id, planName: item.name })
                }
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },

  // Header
  header: { backgroundColor: colors.dashGreen, paddingBottom: 24 },
  headerSafe: { paddingHorizontal: 18 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  backBtn: { paddingVertical: 6, paddingRight: 12 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '700' },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  headerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  headerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 24 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  waveBump: {
    position: 'absolute',
    bottom: -20,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Body
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 14 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterPill: {
    borderWidth: 1,
    borderColor: colors.dashBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.dashCard,
  },
  filterPillSelected: { backgroundColor: colors.dashGreen, borderColor: colors.dashGreen },
  filterText: { fontSize: 13, fontWeight: '700', color: colors.dashSubText },
  filterTextSelected: { color: '#fff' },

  listContent: { paddingBottom: 32 },
  footerLoader: { paddingVertical: 20 },

  // Card
  card: {
    backgroundColor: colors.dashCard,
    borderColor: colors.dashBorder,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 20 },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.dashText },
  cardMeta: { fontSize: 12, color: colors.dashSubText },
  cardDates: { fontSize: 11, color: colors.dashSubText },
  badge: {
    backgroundColor: colors.iconBgGreen,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeInactive: { backgroundColor: colors.warningSurface },
  badgeText: { fontSize: 11, fontWeight: '800', color: colors.iconGreen },
  badgeTextInactive: { color: colors.warning },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.dashBorder,
    paddingTop: 12,
  },
  actionBtn: { paddingVertical: 3 },
  editText: { fontSize: 13, fontWeight: '800', color: colors.dashGreenAccent },
  recordsBtn: {
    flex: 1,
    backgroundColor: colors.dashGreenLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignItems: 'center',
  },
  recordsBtnText: { fontSize: 13, fontWeight: '800', color: colors.dashGreen },
  deleteText: { fontSize: 13, fontWeight: '800', color: colors.error },
});
