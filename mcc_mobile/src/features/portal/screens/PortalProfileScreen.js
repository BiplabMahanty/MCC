import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';

import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import InfoRow from '../components/InfoRow';
import PortalHeader from '../components/PortalHeader';
import usePortalQuery from '../hooks/usePortalQuery';

function dateValue(value) {
  return value ? String(value).slice(0, 10) : '';
}

export default function PortalProfileScreen({ navigation, route }) {
  const { role } = route.params;
  const query = usePortalQuery(role, 'profile');
  const profile = query.data?.data;
  const isTeacher = role === 'teacher';

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading profile..." />
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
      <ScrollView contentContainerStyle={styles.content}>
        <PortalHeader
          onBack={navigation.goBack}
          subtitle="Account and institute profile information"
          title="My profile"
        />
        <View style={styles.card}>
          <InfoRow label="Name" value={profile.name} />
          <InfoRow label="Email" value={profile.email} />
          <InfoRow label="Phone" value={profile.phone} />
          {isTeacher ? (
            <>
              <InfoRow label="Employee code" value={profile.employeeCode} />
              <InfoRow label="Qualification" value={profile.qualification} />
              <InfoRow
                label="Experience"
                value={`${profile.experienceYears || 0} years`}
              />
            </>
          ) : (
            <>
              <InfoRow label="Student code" value={profile.studentCode} />
              <InfoRow label="Batch" value={profile.batchId?.name} />
              <InfoRow
                label="Date of birth"
                value={dateValue(profile.dateOfBirth)}
              />
              <InfoRow label="Guardian" value={profile.guardianName} />
              <InfoRow label="Guardian phone" value={profile.guardianPhone} />
            </>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 24 },
  card: { gap: 2 },
});
