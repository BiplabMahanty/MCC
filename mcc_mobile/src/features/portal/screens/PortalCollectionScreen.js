import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import PortalHeader from '../components/PortalHeader';
import RecordListItem from '../components/RecordListItem';
import usePortalQuery from '../hooks/usePortalQuery';

function subtitle(kind, item) {
  if (kind === 'batches') {
    return [item.code, item.courseId?.name, item.academicSession]
      .filter(Boolean)
      .join(' - ');
  }
  if (kind === 'subjects') {
    return [item.code, item.courseId?.name, item.description]
      .filter(Boolean)
      .join(' - ');
  }
  if (kind === 'students') {
    return [item.studentCode, item.batchId?.name, item.email]
      .filter(Boolean)
      .join(' - ');
  }
  return [item.employeeCode, item.qualification, item.email]
    .filter(Boolean)
    .join(' - ');
}

export default function PortalCollectionScreen({ navigation, route }) {
  const { role, resource, title } = route.params;
  const query = usePortalQuery(role, resource);
  const records = query.data?.data || [];

  if (query.isPending) {
    return (
      <Screen>
        <Loader message={`Loading ${title.toLowerCase()}...`} />
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
      <View style={styles.container}>
        <PortalHeader
          onBack={navigation.goBack}
          subtitle="Information assigned by your institute administrator"
          title={title}
        />
        <FlashList
          data={records}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <EmptyState
              message="Your administrator has not assigned any records yet."
              title={`No ${title.toLowerCase()}`}
            />
          }
          onRefresh={query.refetch}
          refreshing={query.isRefetching}
          renderItem={({ item }) => (
            <RecordListItem
              active={item.isActive}
              subtitle={subtitle(resource, item)}
              title={item.name}
            />
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 20 },
});
