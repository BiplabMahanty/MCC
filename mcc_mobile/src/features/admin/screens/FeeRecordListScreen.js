import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
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
import FeeStatusBadge from '../components/FeeStatusBadge';
import RecordPaymentModal from '../components/RecordPaymentModal';
import colors from '../../../theme/colors';
import { useFeePlan, useFeeRecords, useRecordPayment, useWaiveFeeRecord } from '../hooks/useFees';

const STATUS_FILTERS = [
  { label: 'All',     value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid',    value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Partial', value: 'partial' },
  { label: 'Waived',  value: 'waived' },
];

function SummaryStrip({ summary }) {
  if (!summary) return null;
  const items = [
    { label: 'Total',   value: summary.totalRecords,   iconBg: colors.iconBgBlue,   icon: '📋' },
    { label: 'Paid',    value: summary.paidRecords,    iconBg: colors.iconBgGreen,  icon: '✅' },
    { label: 'Pending', value: summary.pendingRecords, iconBg: colors.iconBgOrange, icon: '⏳' },
    { label: 'Overdue', value: summary.overdueRecords, iconBg: colors.iconBgPink,   icon: '🔴' },
  ];
  return (
    <View style={styles.summaryStrip}>
      {items.map((item) => (
        <View key={item.label} style={styles.summaryItem}>
          <View style={[styles.summaryIconCircle, { backgroundColor: item.iconBg }]}>
            <Text style={styles.summaryIcon}>{item.icon}</Text>
          </View>
          <Text style={styles.summaryValue}>{item.value ?? 0}</Text>
          <Text style={styles.summaryLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function RecordCard({ record, onPayment, onWaive }) {
  const studentName = record.studentId?.name ?? '—';
  const canPay = ['pending', 'partial', 'overdue'].includes(record.status);
  const canWaive = record.status !== 'paid' && record.status !== 'waived';
  const dueDate = new Date(record.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const remaining = record.amount - record.paidAmount;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.cardIconCircle, { backgroundColor: colors.iconBgBlue }]}>
          <Text style={styles.cardIcon}>👤</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text numberOfLines={1} style={styles.cardName}>{studentName}</Text>
          <Text style={styles.cardLabel}>{record.label}  •  Due: {dueDate}</Text>
        </View>
        <FeeStatusBadge status={record.status} />
      </View>

      {/* Amount bar */}
      <View style={styles.amountRow}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Due</Text>
          <Text style={styles.amountValue}>₹{record.amount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.amountDivider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Paid</Text>
          <Text style={[styles.amountValue, styles.amountPaid]}>
            ₹{record.paidAmount.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.amountDivider} />
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Remaining</Text>
          <Text style={[styles.amountValue, remaining > 0 && styles.amountDue]}>
            ₹{remaining.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {(canPay || canWaive) ? (
        <View style={styles.actions}>
          {canPay ? (
            <Pressable onPress={() => onPayment(record)} style={styles.payBtn}>
              <Text style={styles.payBtnText}>💰 Record Payment</Text>
            </Pressable>
          ) : null}
          {canWaive ? (
            <Pressable onPress={() => onWaive(record)} style={styles.waiveBtn}>
              <Text style={styles.waiveBtnText}>Waive</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export default function FeeRecordListScreen({ navigation, route }) {
  const { planId, planName } = route.params;
  const [status, setStatus] = useState(undefined);
  const [paymentRecord, setPaymentRecord] = useState(null);

  const planQuery = useFeePlan(planId);
  const recordsQuery = useFeeRecords(planId, { status });
  const paymentMutation = useRecordPayment(planId);
  const waiveMutation = useWaiveFeeRecord(planId);

  const records = useMemo(
    () => recordsQuery.data?.pages.flatMap((p) => p.records) ?? [],
    [recordsQuery.data],
  );

  function confirmWaive(record) {
    Alert.alert('Waive fee record?', `Waive "${record.label}" for ${record.studentId?.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Waive',
        style: 'destructive',
        onPress: async () => {
          try { await waiveMutation.mutateAsync({ recordId: record._id, note: '' }); }
          catch (err) { Alert.alert('Waive failed', err.message); }
        },
      },
    ]);
  }

  const summary = planQuery.data?.data?.summary;

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
          </View>
          <View style={styles.headerIconRow}>
            <View style={styles.headerIconCircle}>
              <Text style={styles.headerIcon}>📋</Text>
            </View>
            <View style={styles.headerTextCol}>
              <Text numberOfLines={1} style={styles.headerTitle}>{planName ?? 'Fee Records'}</Text>
              <Text style={styles.headerSub}>Student fee records for this plan</Text>
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.waveBump} />
      </View>

      {/* ── BODY ── */}
      <View style={styles.body}>
        <SummaryStrip summary={summary} />

        {/* Status filter pills */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map((f) => {
            const selected = status === f.value;
            return (
              <Pressable
                key={f.label}
                onPress={() => setStatus(f.value)}
                style={[styles.filterPill, selected && styles.filterPillSelected]}
              >
                <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {recordsQuery.isPending ? (
          <Loader message="Loading records…" />
        ) : recordsQuery.error ? (
          <ErrorState message={recordsQuery.error.message} onRetry={recordsQuery.refetch} retrying={recordsQuery.isFetching} />
        ) : (
          <FlashList
            data={records}
            keyExtractor={(item) => item._id}
            estimatedItemSize={140}
            contentContainerStyle={styles.listContent}
            onEndReached={() => {
              if (recordsQuery.hasNextPage && !recordsQuery.isFetchingNextPage)
                recordsQuery.fetchNextPage();
            }}
            onEndReachedThreshold={0.4}
            refreshing={recordsQuery.isFetching && !recordsQuery.isFetchingNextPage}
            onRefresh={() => { planQuery.refetch(); recordsQuery.refetch(); }}
            ListEmptyComponent={
              <EmptyState title="No records found" message="Try a different status filter." />
            }
            ListFooterComponent={
              recordsQuery.isFetchingNextPage
                ? <ActivityIndicator color={colors.dashGreen} style={styles.footerLoader} />
                : null
            }
            renderItem={({ item }) => (
              <RecordCard record={item} onPayment={setPaymentRecord} onWaive={confirmWaive} />
            )}
          />
        )}
      </View>

      <RecordPaymentModal
        visible={Boolean(paymentRecord)}
        record={paymentRecord}
        loading={paymentMutation.isPending}
        onClose={() => setPaymentRecord(null)}
        onSubmit={async (input) => {
          await paymentMutation.mutateAsync(input);
          setPaymentRecord(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },

  // Header
  header: { backgroundColor: colors.dashGreen, paddingBottom: 24 },
  headerSafe: { paddingHorizontal: 18 },
  headerTop: { marginTop: 8 },
  backBtn: { paddingVertical: 6, alignSelf: 'flex-start' },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '700' },
  headerIconRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 14 },
  headerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 24 },
  headerTextCol: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -0.3 },
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
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  listContent: { paddingBottom: 32 },
  footerLoader: { paddingVertical: 20 },

  // Summary strip
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.dashCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 14,
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  summaryItem: { alignItems: 'center', gap: 4 },
  summaryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: { fontSize: 16 },
  summaryValue: { fontSize: 18, fontWeight: '900', color: colors.dashText },
  summaryLabel: { fontSize: 11, color: colors.dashSubText, fontWeight: '600' },

  // Filter
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterPill: {
    borderWidth: 1,
    borderColor: colors.dashBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: colors.dashCard,
  },
  filterPillSelected: { backgroundColor: colors.dashGreen, borderColor: colors.dashGreen },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.dashSubText },
  filterTextSelected: { color: '#fff' },

  // Card
  card: {
    backgroundColor: colors.dashCard,
    borderColor: colors.dashBorder,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: { fontSize: 18 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '800', color: colors.dashText },
  cardLabel: { fontSize: 12, color: colors.dashSubText, marginTop: 2 },

  // Amount row
  amountRow: {
    flexDirection: 'row',
    backgroundColor: colors.dashBg,
    borderRadius: 10,
    padding: 10,
    justifyContent: 'space-around',
  },
  amountItem: { alignItems: 'center', gap: 2 },
  amountDivider: { width: 1, backgroundColor: colors.dashBorder },
  amountLabel: { fontSize: 11, color: colors.dashSubText },
  amountValue: { fontSize: 14, fontWeight: '800', color: colors.dashText },
  amountPaid: { color: colors.dashUp },
  amountDue: { color: colors.dashDown },

  // Actions
  actions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  payBtn: {
    flex: 1,
    backgroundColor: colors.dashGreen,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  waiveBtn: {
    borderWidth: 1,
    borderColor: colors.dashBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  waiveBtnText: { fontSize: 13, fontWeight: '700', color: colors.dashSubText },
});
