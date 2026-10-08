import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import EmptyState from '../../../components/common/EmptyState';
import FeeStatusBadge from '../components/FeeStatusBadge';
import RecordPaymentModal from '../components/RecordPaymentModal';
import colors from '../../../theme/colors';
import { useStudentFees, useRecordPayment, useWaiveFeeRecord } from '../hooks/useFees';

const STATUS_FILTERS = [
  { label: 'All',     value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Paid',    value: 'paid' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Partial', value: 'partial' },
];

const SUMMARY_ITEMS = [
  { key: 'totalDue',  label: 'Total Due',  icon: '📄', iconBg: colors.iconBgPurple, prefix: '₹' },
  { key: 'totalPaid', label: 'Paid',       icon: '✅', iconBg: colors.iconBgGreen,  prefix: '₹' },
  { key: 'balance',   label: 'Balance',    icon: '⚠️', iconBg: colors.iconBgOrange, prefix: '₹' },
  { key: 'overdueCount', label: 'Overdue', icon: '🔴', iconBg: colors.iconBgPink,   prefix: '' },
];

function SummaryGrid({ summary }) {
  return (
    <View style={styles.summaryGrid}>
      {SUMMARY_ITEMS.map((item) => {
        const raw = summary?.[item.key] ?? 0;
        const display = item.prefix === '₹'
          ? `₹${Number(raw).toLocaleString('en-IN')}`
          : String(raw) + (item.key === 'overdueCount' ? ' records' : '');
        const isAlert = (item.key === 'balance' || item.key === 'overdueCount') && raw > 0;
        return (
          <View key={item.key} style={styles.summaryCard}>
            <View style={[styles.summaryIconCircle, { backgroundColor: item.iconBg }]}>
              <Text style={styles.summaryIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.summaryLabel}>{item.label}</Text>
            <Text style={[styles.summaryValue, isAlert && styles.summaryValueAlert]}>
              {display}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function RecordCard({ record, onPayment, onWaive }) {
  const canPay = ['pending', 'partial', 'overdue'].includes(record.status);
  const canWaive = record.status !== 'paid' && record.status !== 'waived';
  const planName = record.feePlanId?.name ?? '—';
  const dueDate = new Date(record.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const remaining = record.amount - record.paidAmount;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.cardIconCircle, { backgroundColor: colors.iconBgPurple }]}>
          <Text style={styles.cardIcon}>💳</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{record.label}</Text>
          <Text style={styles.cardMeta}>{planName}  •  Due: {dueDate}</Text>
        </View>
        <FeeStatusBadge status={record.status} />
      </View>

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

export default function StudentFeeScreen({ navigation, route }) {
  const { studentId, studentName } = route.params;
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [paymentRecord, setPaymentRecord] = useState(null);

  const feesQuery = useStudentFees(studentId);
  const paymentMutation = useRecordPayment(null);
  const waiveMutation = useWaiveFeeRecord(null);

  const allRecords = feesQuery.data?.records ?? [];
  const filteredRecords = useMemo(() => {
    if (!statusFilter) return allRecords;
    return allRecords.filter((r) => r.status === statusFilter);
  }, [allRecords, statusFilter]);

  function confirmWaive(record) {
    Alert.alert('Waive fee record?', `Waive "${record.label}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Waive',
        style: 'destructive',
        onPress: async () => {
          try {
            await waiveMutation.mutateAsync({ recordId: record._id, note: '' });
            feesQuery.refetch();
          } catch (err) { Alert.alert('Waive failed', err.message); }
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
          </View>
          <View style={styles.headerIconRow}>
            <View style={styles.headerIconCircle}>
              <Text style={styles.headerIcon}>💰</Text>
            </View>
            <View style={styles.headerTextCol}>
              <Text numberOfLines={1} style={styles.headerTitle}>
                {studentName ?? 'Student'} — Fees
              </Text>
              <Text style={styles.headerSub}>Full fee history and payment records</Text>
            </View>
          </View>
        </SafeAreaView>
        <View style={styles.waveBump} />
      </View>

      {/* ── BODY ── */}
      {feesQuery.isPending ? (
        <View style={styles.centerBody}>
          <Loader message="Loading fees…" />
        </View>
      ) : feesQuery.error ? (
        <View style={styles.centerBody}>
          <ErrorState message={feesQuery.error.message} onRetry={feesQuery.refetch} retrying={feesQuery.isFetching} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={feesQuery.isFetching} onRefresh={feesQuery.refetch} />
          }
        >
          {/* Summary grid */}
          <SummaryGrid summary={feesQuery.data?.summary} />

          {/* Section title + filter */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fee Records</Text>
          </View>

          <View style={styles.filterRow}>
            {STATUS_FILTERS.map((f) => {
              const selected = statusFilter === f.value;
              return (
                <Pressable
                  key={f.label}
                  onPress={() => setStatusFilter(f.value)}
                  style={[styles.filterPill, selected && styles.filterPillSelected]}
                >
                  <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {filteredRecords.length === 0 ? (
            <EmptyState title="No records" message="No fee records match this filter." />
          ) : (
            filteredRecords.map((record) => (
              <RecordCard
                key={record._id}
                record={record}
                onPayment={setPaymentRecord}
                onWaive={confirmWaive}
              />
            ))
          )}
        </ScrollView>
      )}

      <RecordPaymentModal
        visible={Boolean(paymentRecord)}
        record={paymentRecord}
        loading={paymentMutation.isPending}
        onClose={() => setPaymentRecord(null)}
        onSubmit={async (input) => {
          await paymentMutation.mutateAsync(input);
          setPaymentRecord(null);
          feesQuery.refetch();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },
  centerBody: { flex: 1, justifyContent: 'center' },

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

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },

  // Summary grid (2×2)
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: {
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 14,
    width: '47.5%',
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  summaryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: { fontSize: 18 },
  summaryLabel: { fontSize: 12, color: colors.dashSubText, fontWeight: '500' },
  summaryValue: { fontSize: 18, fontWeight: '900', color: colors.dashText, letterSpacing: -0.3 },
  summaryValueAlert: { color: colors.dashDown },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.dashText },

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
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.dashText },
  cardMeta: { fontSize: 12, color: colors.dashSubText, marginTop: 2 },

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
