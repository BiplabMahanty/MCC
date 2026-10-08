import { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../components/AdminHeader';
import EntityListItem from '../components/EntityListItem';
import FilterBar from '../components/FilterBar';
import TeacherListItem from '../components/TeacherListItem';
import TeacherModuleHeader from '../components/TeacherModuleHeader';
import entityConfigs from '../config/entityConfigs';
import {
  useAdminEntities,
  useDeleteAdminEntity,
} from '../hooks/useAdminEntities';
import useDebouncedValue from '../hooks/useDebouncedValue';

export default function EntityListScreen({ navigation, route }) {
  const { entityType } = route.params;
  const config = entityConfigs[entityType];
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState(undefined);
  const debouncedSearch = useDebouncedValue(search.trim());
  const query = useAdminEntities(entityType, {
    search: debouncedSearch,
    isActive,
  });
  const deleteMutation = useDeleteAdminEntity(entityType);
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) || [],
    [query.data],
  );
  const totalCount = query.data?.pages[0]?.pagination?.total;
  const isTeacherModule = entityType === 'teachers';

  function confirmDelete(item) {
    Alert.alert(
      `Delete ${config.singular.toLowerCase()}?`,
      `${item.name} will be disabled and soft-deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(item._id);
            } catch (error) {
              Alert.alert('Delete failed', error.message);
            }
          },
        },
      ],
    );
  }

  if (query.isPending) {
    return (
      <Screen>
        <Loader message={`Loading ${config.plural.toLowerCase()}…`} />
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
      <StatusBar style={isTeacherModule ? 'light' : 'dark'} />
      <View style={styles.container}>
        {isTeacherModule ? (
          <TeacherModuleHeader
            onAdd={() => navigation.navigate('AdminEntityForm', { entityType })}
            onBack={navigation.goBack}
            totalCount={totalCount}
          />
        ) : (
          <AdminHeader
            actionLabel={`Add ${config.singular}`}
            onAction={() => navigation.navigate('AdminEntityForm', { entityType })}
            onBack={navigation.goBack}
            subtitle="Search, filter, create, edit, or soft-delete records."
            title={config.plural}
          />
        )}
        <FilterBar
          isActive={isActive}
          onActiveChange={setIsActive}
          onSearchChange={setSearch}
          search={search}
        />
        <FlashList
          contentContainerStyle={styles.listContent}
          data={items}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <EmptyState
              message="Adjust the search or filter, or create the first record."
              title={`No ${config.plural.toLowerCase()} found`}
            />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator
                color={colors.primary}
                style={styles.footerLoader}
              />
            ) : null
          }
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) {
              query.fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          refreshing={query.isFetching && !query.isFetchingNextPage}
          onRefresh={query.refetch}
          renderItem={({ item }) => {
            const itemProps = {
              item,
              onDelete: () => confirmDelete(item),
              onEdit: () => navigation.navigate('AdminEntityForm', { entityType, id: item._id }),
            };
            return isTeacherModule ? (
              <TeacherListItem
                {...itemProps}
                onPress={() => navigation.navigate('TeacherDetail', { teacherId: item._id })}
              />
            ) : (
              <EntityListItem {...itemProps} subtitle={config.subtitle(item)} />
            );
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 18,
  },
  listContent: {
    paddingBottom: 24,
  },
  footerLoader: {
    paddingVertical: 20,
  },
});
