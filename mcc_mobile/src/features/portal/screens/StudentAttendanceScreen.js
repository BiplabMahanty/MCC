import { FlatList, StyleSheet, Text, View } from 'react-native';

import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import colors from '../../../theme/colors';
import StudentPageHeader from '../components/StudentPageHeader';
import usePortalQuery from '../hooks/usePortalQuery';

function statusStyle(status) {
  if (status === 'present') return { bg: '#DCFCE7', text: colors.dashUp };
  if (status === 'absent') return { bg: '#FEE2E2', text: '#DC2626' };
  return { bg: '#F3F4F6', text: colors.dashSubText };
}

function AttendanceRow({ record }) {
  const s = statusStyle(record.status);
  return (
    <View style={styles.row}>
      <Text style={styles.rowDate}>
        {new Date(record.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </Text>
      <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
        <Text style={[styles.statusText, { color: s.text }]}>
          {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Not marked'}
        </Text>
      </View>
    </View>
  );
}

export default function StudentAttendanceScreen({ navigation }) {
  const query = usePortalQuery('student', 'attendance');
  const data = query.data?.data;

  return (
    <View style={styles.root}>
      <StudentPageHeader
        title="Attendance"
        subtitle="Your attendance record"
        onBack={navigation.goBack}
      />
      <View style={styles.body}>
        {query.isPending ? <Loader message="Loading attendance…" /> : null}
        {query.error ? (
          <ErrorState message={query.error.message} onRetry={query.refetch} retrying={query.isFetching} />
        ) : null}

        {data ? (
          <>
            {/* Summary cards */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: colors.dashGreenLight }]}>
                <Text style={styles.summaryValue}>{data.summary?.percentage ?? 0}%</Text>
                <Text style={styles.summaryLabel}>Overall</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.iconBgGreen }]}>
                <Text style={[styles.summaryValue, { color: colors.dashUp }]}>{data.summary?.present ?? 0}</Text>
                <Text style={styles.summaryLabel}>Present</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.summaryValue, { color: '#DC2626' }]}>
                  {(data.summary?.total ?? 0) - (data.summary?.present ?? 0)}
                </Text>
                <Text style={styles.summaryLabel}>Absent</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.iconBgBlue }]}>
                <Text style={[styles.summaryValue, { color: colors.iconBlue }]}>{data.summary?.total ?? 0}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
            </View>

            {/* Records list */}
            <View style={styles.listCard}>
              <Text style={styles.listTitle}>📋 Daily Records</Text>
              <FlatList
                data={data.records}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <AttendanceRow record={item} />}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No attendance records found.</Text>
                }
                showsVerticalScrollIndicator={false}
              />
            </View>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },
  body: { flex: 1, padding: 16, gap: 14 },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.dashBorder,
  },
  summaryValue: { fontSize: 20, fontWeight: '900', color: colors.dashGreen },
  summaryLabel: { fontSize: 10, fontWeight: '600', color: colors.dashSubText },

  listCard: {
    flex: 1,
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  listTitle: { fontSize: 14, fontWeight: '800', color: colors.dashText, marginBottom: 10 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.dashBorder,
  },
  rowDate: { fontSize: 13, fontWeight: '600', color: colors.dashText },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: colors.dashSubText, paddingVertical: 24, fontSize: 13 },
});
