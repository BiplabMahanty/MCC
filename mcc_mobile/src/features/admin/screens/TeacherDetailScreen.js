import { useQuery } from '@tanstack/react-query';
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import { getEntity, listEntities } from '../services/adminApi';

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

function BatchCard({ batch }) {
  return (
    <View style={styles.batchCard}>
      <View style={styles.batchTop}>
        <Text style={styles.batchName}>{batch.name}</Text>
        <View style={[styles.badge, !batch.isActive && styles.badgeInactive]}>
          <Text style={[styles.badgeText, !batch.isActive && styles.badgeTextInactive]}>
            {batch.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <Text style={styles.batchCode}>{batch.code}</Text>
      {batch.courseId?.name && (
        <Text style={styles.batchCourse}>📚 {batch.courseId.name}</Text>
      )}
      <View style={styles.batchMeta}>
        {batch.academicSession && <Text style={styles.batchMetaText}>🗓 {batch.academicSession}</Text>}
        {batch.capacity != null && <Text style={styles.batchMetaText}>👥 Capacity: {batch.capacity}</Text>}
      </View>
    </View>
  );
}

export default function TeacherDetailScreen({ navigation, route }) {
  const { teacherId } = route.params;

  const teacherQuery = useQuery({
    queryKey: ['admin', 'teachers', teacherId],
    queryFn: ({ signal }) => getEntity('teachers', teacherId, signal),
  });

  const batchesQuery = useQuery({
    queryKey: ['admin', 'batches', 'byTeacher', teacherId],
    queryFn: ({ signal }) =>
      listEntities('batches', { page: 1, limit: 100 }, signal),
    select: (data) => ({
      ...data,
      data: data.data.filter((b) =>
        b.teacherIds?.some((t) => (t._id || t) === teacherId),
      ),
    }),
    enabled: Boolean(teacherId),
  });

  const teacher = teacherQuery.data?.data ?? teacherQuery.data;
  const batches = batchesQuery.data?.data ?? [];

  const initials = teacher?.name
    ?.split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Screen>
      <StatusBar style="light" />
      <View style={styles.headerBar}>
        <Pressable onPress={navigation.goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Teacher Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {teacherQuery.isPending ? (
          <ActivityIndicator color={colors.dashGreen} style={{ marginTop: 40 }} />
        ) : teacher ? (
          <>
            {/* Profile card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLargeText}>{initials || 'T'}</Text>
              </View>
              <Text style={styles.teacherName}>{teacher.name}</Text>
              <Text style={styles.teacherEmail}>{teacher.email}</Text>
              <View style={[styles.badge, !teacher.isActive && styles.badgeInactive]}>
                <Text style={[styles.badgeText, !teacher.isActive && styles.badgeTextInactive]}>
                  {teacher.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Profile Info</Text>
              <InfoRow label="Employee ID" value={teacher.employeeCode} />
              <InfoRow label="Phone" value={teacher.phone} />
              <InfoRow label="Qualification" value={teacher.qualification} />
              <InfoRow label="Experience" value={teacher.experienceYears != null ? `${teacher.experienceYears} years` : null} />
            </View>

            {/* Assigned Batches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Assigned Batches{' '}
                {!batchesQuery.isPending && (
                  <Text style={styles.countBadge}>({batches.length})</Text>
                )}
              </Text>

              {batchesQuery.isPending ? (
                <ActivityIndicator color={colors.dashGreen} style={{ marginTop: 12 }} />
              ) : batches.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No batches assigned yet</Text>
                </View>
              ) : (
                batches.map((b) => <BatchCard key={b._id} batch={b} />)
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Teacher not found</Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    alignItems: 'center',
    backgroundColor: colors.dashGreen,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { paddingVertical: 4 },
  backText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  headerTitle: { color: colors.white, fontSize: 17, fontWeight: '900' },
  content: { gap: 16, padding: 16, paddingBottom: 32 },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.dashBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    padding: 24,
  },
  avatarLarge: {
    alignItems: 'center',
    backgroundColor: colors.iconBgBlue,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: 4,
    width: 72,
  },
  avatarLargeText: { color: colors.iconBlue, fontSize: 26, fontWeight: '900' },
  teacherName: { color: colors.dashText, fontSize: 20, fontWeight: '900' },
  teacherEmail: { color: colors.dashSubText, fontSize: 13 },
  badge: { backgroundColor: colors.successSurface, borderRadius: 14, marginTop: 4, paddingHorizontal: 10, paddingVertical: 5 },
  badgeInactive: { backgroundColor: colors.warningSurface },
  badgeText: { color: colors.success, fontSize: 11, fontWeight: '800' },
  badgeTextInactive: { color: colors.warning },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.dashBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 2,
    padding: 16,
  },
  sectionTitle: { color: colors.dashText, fontSize: 15, fontWeight: '900', marginBottom: 10 },
  countBadge: { color: colors.dashSubText, fontSize: 13, fontWeight: '600' },
  infoRow: {
    borderBottomColor: colors.dashBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  infoLabel: { color: colors.dashSubText, fontSize: 13, fontWeight: '600' },
  infoValue: { color: colors.dashText, fontSize: 13, fontWeight: '700', maxWidth: '60%', textAlign: 'right' },
  batchCard: {
    backgroundColor: colors.dashBg,
    borderColor: colors.dashBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginTop: 8,
    padding: 14,
  },
  batchTop: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  batchName: { color: colors.dashText, fontSize: 15, fontWeight: '800' },
  batchCode: { color: colors.dashSubText, fontSize: 12 },
  batchCourse: { color: colors.dashSubText, fontSize: 12, marginTop: 2 },
  batchMeta: { flexDirection: 'row', gap: 14, marginTop: 4 },
  batchMetaText: { color: colors.dashSubText, fontSize: 12 },
  emptyBox: {
    alignItems: 'center',
    backgroundColor: colors.dashBg,
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 24,
  },
  emptyText: { color: colors.dashSubText, fontSize: 13 },
});
