import { ScrollView, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import colors from '../../../theme/colors';
import StudentPageHeader from '../components/StudentPageHeader';
import usePortalQuery from '../hooks/usePortalQuery';

function dateValue(value) {
  return value ? String(value).slice(0, 10) : '';
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text selectable style={styles.rowValue}>{value || 'Not provided'}</Text>
    </View>
  );
}

function DetailCard({ icon, iconBg, title, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconCircle, { backgroundColor: iconBg }]}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function StudentBatchScreen({ navigation }) {
  const query = usePortalQuery('student', 'batch');
  const batch = query.data?.data;

  return (
    <View style={styles.root}>
      <StudentPageHeader
        title="My Batch"
        subtitle="Your current course and batch assignment"
        onBack={navigation.goBack}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {query.isPending ? <Loader message="Loading batch…" /> : null}
        {query.error ? (
          <ErrorState message={query.error.message} onRetry={query.refetch} retrying={query.isFetching} />
        ) : null}

        {query.data && !batch ? (
          <View style={styles.emptyWrap}>
            <EmptyState
              title="No batch assigned"
              message="Ask your institute administrator to assign your account to a batch."
            />
          </View>
        ) : null}

        {batch ? (
          <>
            {/* Hero banner */}
            <View style={styles.heroBanner}>
              <View style={[styles.heroIconCircle, { backgroundColor: colors.iconBgGreen }]}>
                <Text style={{ fontSize: 28 }}>📅</Text>
              </View>
              <View style={styles.heroInfo}>
                <Text style={styles.heroName}>{batch.name}</Text>
                <Text style={styles.heroCode}>{batch.code}</Text>
                <View style={[styles.activeBadge, !batch.isActive && styles.inactiveBadge]}>
                  <Text style={[styles.activeBadgeText, !batch.isActive && styles.inactiveBadgeText]}>
                    {batch.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>
            </View>

            <DetailCard icon="📚" iconBg={colors.iconBgPurple} title="Course Details">
              <InfoRow label="Course Name" value={batch.courseId?.name} />
              <InfoRow label="Course Code" value={batch.courseId?.code} />
              {batch.courseId?.description ? (
                <InfoRow label="Description" value={batch.courseId.description} />
              ) : null}
            </DetailCard>

            <DetailCard icon="📋" iconBg={colors.iconBgBlue} title="Batch Details">
              <InfoRow label="Academic Session" value={batch.academicSession} />
              <InfoRow label="Start Date" value={dateValue(batch.startDate)} />
              <InfoRow label="End Date" value={dateValue(batch.endDate)} />
              <InfoRow label="Capacity" value={batch.capacity ? String(batch.capacity) : null} />
            </DetailCard>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 36 },

  emptyWrap: { marginTop: 40 },

  heroBanner: {
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  heroIconCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1, gap: 4 },
  heroName: { fontSize: 18, fontWeight: '900', color: colors.dashText },
  heroCode: { fontSize: 13, color: colors.dashSubText },
  activeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 2,
  },
  inactiveBadge: { backgroundColor: '#FEE2E2' },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: colors.dashUp },
  inactiveBadgeText: { color: '#DC2626' },

  card: {
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardIconCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '800', color: colors.dashText },

  row: { borderBottomColor: colors.dashBorder, borderBottomWidth: 1, paddingVertical: 10, gap: 3 },
  rowLabel: { fontSize: 11, fontWeight: '700', color: colors.dashSubText },
  rowValue: { fontSize: 14, fontWeight: '600', color: colors.dashText },
});
