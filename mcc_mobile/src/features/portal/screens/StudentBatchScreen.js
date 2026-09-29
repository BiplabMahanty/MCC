import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import InfoRow from '../components/InfoRow';
import PortalHeader from '../components/PortalHeader';
import usePortalQuery from '../hooks/usePortalQuery';

function dateValue(value) {
  return value ? String(value).slice(0, 10) : '';
}

export default function StudentBatchScreen({ navigation }) {
  const query = usePortalQuery('student', 'batch');
  const batch = query.data?.data;

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading batch..." />
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
          subtitle="Your current course and batch assignment"
          title="My batch"
        />
        {batch ? (
          <View>
            <InfoRow label="Batch" value={batch.name} />
            <InfoRow label="Batch code" value={batch.code} />
            <InfoRow label="Course" value={batch.courseId?.name} />
            <InfoRow label="Course code" value={batch.courseId?.code} />
            <InfoRow label="Academic session" value={batch.academicSession} />
            <InfoRow label="Start date" value={dateValue(batch.startDate)} />
            <InfoRow label="End date" value={dateValue(batch.endDate)} />
            <InfoRow label="Capacity" value={String(batch.capacity)} />
          </View>
        ) : (
          <EmptyState
            message="Ask your institute administrator to assign your account to a batch."
            title="No batch assigned"
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 24 },
});
