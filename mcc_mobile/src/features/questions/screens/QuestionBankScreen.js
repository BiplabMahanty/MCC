import { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import FilterBar from '../../admin/components/FilterBar';
import RelationSelectField from '../../admin/components/RelationSelectField';
import { useAdminOptions } from '../../admin/hooks/useAdminEntities';
import usePortalQuery from '../../portal/hooks/usePortalQuery';
import { useDeleteQuestion, useQuestions } from '../hooks/useQuestions';
import useDebouncedValue from '../../admin/hooks/useDebouncedValue';

const difficulties = [
  { label: 'Any difficulty', value: undefined },
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
];

function QuestionItem({ item, admin, onPreview, onEdit, onDelete }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPreview}
      style={styles.card}
    >
      <View style={styles.meta}>
        <Text style={styles.subject}>{item.subjectId?.name || 'Subject'}</Text>
        <Text style={styles.difficulty}>{item.difficulty}</Text>
      </View>
      <Text numberOfLines={3} style={styles.preview}>
        {item.preview}
      </Text>
      <Text style={styles.topic}>{item.topic}</Text>
      {admin ? (
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onEdit}>
            <Text style={styles.edit}>Edit</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onDelete}>
            <Text style={styles.delete}>Delete</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function QuestionBankScreen({ navigation, route }) {
  const { role } = route.params;
  const admin = role === 'admin';
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState(admin ? undefined : true);
  const [subjectId, setSubjectId] = useState('');
  const [difficulty, setDifficulty] = useState(undefined);
  const debouncedSearch = useDebouncedValue(search.trim());
  const query = useQuestions(role, {
    search: debouncedSearch,
    isActive: admin ? isActive : undefined,
    subjectId: subjectId || undefined,
    difficulty,
  });
  const deleteMutation = useDeleteQuestion();
  const adminSubjects = useAdminOptions('subjects', admin);
  const teacherSubjects = usePortalQuery('teacher', 'subjects', !admin);
  const subjects = admin
    ? adminSubjects.data?.data || []
    : teacherSubjects.data?.data || [];
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) || [],
    [query.data],
  );

  function confirmDelete(item) {
    Alert.alert('Delete question?', 'The question will be soft-deleted.', [
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
    ]);
  }

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading question bank..." />
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
        <AdminHeader
          actionLabel="Add question"
          onAction={
            admin
              ? () => navigation.navigate('QuestionForm', { role: 'admin' })
              : undefined
          }
          onBack={navigation.goBack}
          subtitle={
            admin
              ? 'Create and manage structured MCQs.'
              : 'Preview questions assigned to your subjects.'
          }
          title="Question bank"
        />
        <FilterBar
          isActive={isActive}
          onActiveChange={setIsActive}
          onSearchChange={setSearch}
          search={search}
          showStatus={admin}
        />
        <RelationSelectField
          allowClear
          label="Subject filter"
          onChange={setSubjectId}
          options={subjects}
          value={subjectId}
        />
        <View style={styles.filterRow}>
          {difficulties.map((item) => {
            const selected = difficulty === item.value;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={item.label}
                onPress={() => setDifficulty(item.value)}
                style={[styles.filter, selected && styles.filterSelected]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <FlashList
          data={items}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <EmptyState
              message="Adjust the filters or create the first question."
              title="No questions found"
            />
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
            <QuestionItem
              admin={admin}
              item={item}
              onDelete={() => confirmDelete(item)}
              onEdit={() =>
                navigation.navigate('QuestionForm', {
                  role: 'admin',
                  id: item._id,
                })
              }
              onPreview={() =>
                navigation.navigate('QuestionPreview', { role, id: item._id })
              }
            />
          )}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  filter: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  filterSelected: { backgroundColor: colors.black, borderColor: colors.black },
  filterText: { color: colors.mutedText, fontSize: 11, fontWeight: '800' },
  filterTextSelected: { color: colors.white },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 9,
    marginBottom: 12,
    padding: 16,
  },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  subject: { color: colors.primary, fontSize: 12, fontWeight: '900' },
  difficulty: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  preview: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  topic: { color: colors.mutedText, fontSize: 12 },
  actions: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 20,
    paddingTop: 10,
  },
  edit: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  delete: { color: colors.error, fontSize: 13, fontWeight: '800' },
  footer: { paddingVertical: 20 },
});
