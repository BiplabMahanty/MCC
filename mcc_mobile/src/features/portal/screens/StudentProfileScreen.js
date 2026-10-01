import { ScrollView, StyleSheet, Text, View } from 'react-native';

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

function AvatarCircle({ name }) {
  return (
    <View style={styles.avatarWrap}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{name?.charAt(0).toUpperCase() ?? '?'}</Text>
      </View>
      <Text style={styles.avatarName}>{name}</Text>
    </View>
  );
}

export default function StudentProfileScreen({ navigation }) {
  const query = usePortalQuery('student', 'profile');
  const profile = query.data?.data;

  return (
    <View style={styles.root}>
      <StudentPageHeader
        title="My Profile"
        subtitle="Account and institute information"
        onBack={navigation.goBack}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {query.isPending ? <Loader message="Loading profile…" /> : null}
        {query.error ? (
          <ErrorState message={query.error.message} onRetry={query.refetch} retrying={query.isFetching} />
        ) : null}

        {profile ? (
          <>
            <AvatarCircle name={profile.name} />
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Personal Info</Text>
              <InfoRow label="Name" value={profile.name} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow label="Phone" value={profile.phone} />
              <InfoRow label="Date of Birth" value={dateValue(profile.dateOfBirth)} />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Academic Info</Text>
              <InfoRow label="Student Code" value={profile.studentCode} />
              <InfoRow label="Batch" value={profile.batchId?.name} />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Guardian Info</Text>
              <InfoRow label="Guardian Name" value={profile.guardianName} />
              <InfoRow label="Guardian Phone" value={profile.guardianPhone} />
            </View>
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

  avatarWrap: { alignItems: 'center', paddingVertical: 10, gap: 10 },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.dashGreen,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '900' },
  avatarName: { fontSize: 18, fontWeight: '800', color: colors.dashText },

  card: {
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 14,
    gap: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: colors.dashGreen, marginBottom: 6 },

  row: { borderBottomColor: colors.dashBorder, borderBottomWidth: 1, paddingVertical: 11, gap: 3 },
  rowLabel: { fontSize: 11, fontWeight: '700', color: colors.dashSubText },
  rowValue: { fontSize: 15, fontWeight: '600', color: colors.dashText },
});
