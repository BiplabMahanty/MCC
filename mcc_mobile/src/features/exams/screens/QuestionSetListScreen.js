import { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AdminHeader from '../../admin/components/AdminHeader';
import RelationSelectField from '../../admin/components/RelationSelectField';
import { useAdminOptions } from '../../admin/hooks/useAdminEntities';
import AppButton from '../../../components/common/AppButton';
import EmptyState from '../../../components/common/EmptyState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import {
  useQuestionSetsList,
  useDeleteQuestionSet,
} from '../hooks/useQuestionSetsList';

export default function QuestionSetListScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [chapterId, setChapterId] = useState('');
  const subjectsQuery = useAdminOptions('subjects');
  const chaptersQuery = useAdminOptions('chapters', true, {
    subjectId: subjectId || undefined,
  });
  const query = useQuestionSetsList({
    search: search || undefined,
    subjectId: subjectId || undefined,
    chapterId: chapterId || undefined,
  });
  const deleteSet = useDeleteQuestionSet();

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  function handleDelete(id, name) {
    Alert.alert('Delete Question Set', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSet.mutateAsync(id);
            query.refetch();
          } catch (err) {
            Alert.alert('Error', err.message || 'Failed to delete');
          }
        },
      },
    ]);
  }

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading question sets…" />
      </Screen>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AdminHeader title="Question Sets" subtitle={`${items.length} sets`} />

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search sets…"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor={colors.mutedText}
          />
        </View>

        <RelationSelectField
          allowClear
          label="Subject filter"
          onChange={(value) => {
            setSubjectId(value);
            setChapterId('');
          }}
          options={subjectsQuery.data?.data || []}
          value={subjectId}
        />
        <RelationSelectField
          allowClear
          label="Chapter filter"
          onChange={setChapterId}
          options={chaptersQuery.data?.data || []}
          value={chapterId}
        />

        <FlashList
          data={items}
          estimatedItemSize={100}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <EmptyState message="No question sets found." title="No sets" />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={styles.footer} />
            ) : null
          }
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage)
              query.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
              onPress={() =>
                navigation.navigate('QuestionSetForm', { id: item._id })
              }
            >
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
                <View style={styles.cardMeta}>
                  <Text style={styles.metaText}>
                    {item.totalQuestions} questions
                  </Text>
                  {item.subjectId?.name && (
                    <Text style={styles.metaText}>• {item.subjectId.name}</Text>
                  )}
                </View>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.deleteBtn,
                  pressed && styles.deleteBtnPressed,
                ]}
                onPress={() => handleDelete(item._id, item.name)}
              >
                <Text style={styles.deleteIcon}>🗑️</Text>
              </Pressable>
            </Pressable>
          )}
        />

        <AppButton
          label="Create Question Set"
          onPress={() => navigation.navigate('QuestionSetForm')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardPressed: { opacity: 0.7 },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  cardDesc: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: colors.mutedText,
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 8,
  },
  deleteBtnPressed: { opacity: 0.6 },
  deleteIcon: { fontSize: 16 },
  footer: { paddingVertical: 20 },
});
