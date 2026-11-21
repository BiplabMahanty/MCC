import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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

import AppButton from '../../../components/common/AppButton';
import EmptyState from '../../../components/common/EmptyState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import { useAdminOptions } from '../../admin/hooks/useAdminEntities';
import { useQuestions } from '../../questions/hooks/useQuestions';
import { useExamDraft } from '../context/ExamDraftContext';
import { useQuestionSets } from '../hooks/useQuestionSets';
import {
  useQuestionSet,
  useUpdateQuestionSet,
} from '../hooks/useQuestionSetsList';

export default function QuestionSetSelectorScreen({ navigation, route }) {
  const { subjectId } = route.params ?? {};
  const { draft, setField } = useExamDraft();
  const [selectedSetId, setSelectedSetId] = useState(draft.questionSetId || '');
  const [questionIds, setQuestionIds] = useState([]);
  const [chapterId, setChapterId] = useState('');
  const [search, setSearch] = useState('');

  const setsQuery = useQuestionSets({ subjectId: subjectId || undefined });
  const setQuery = useQuestionSet(selectedSetId);
  const updateSet = useUpdateQuestionSet();
  const chaptersQuery = useAdminOptions('chapters', !!subjectId, { subjectId });
  const questionsQuery = useQuestions('admin', {
    isActive: true,
    subjectId: subjectId || undefined,
    chapterId: chapterId || undefined,
  });

  const sets = useMemo(
    () => setsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [setsQuery.data],
  );
  const questions = useMemo(
    () => questionsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [questionsQuery.data],
  );
  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? questions.filter((question) =>
          `${question.preview} ${question.topic}`.toLowerCase().includes(term),
        )
      : questions;
  }, [questions, search]);

  useEffect(() => {
    const record = setQuery.data?.data ?? setQuery.data;
    if (record && record._id === selectedSetId) {
      setQuestionIds(
        (record.questionIds || []).map((question) =>
          typeof question === 'string' ? question : question._id,
        ),
      );
    }
  }, [setQuery.data, selectedSetId]);

  useFocusEffect(
    useCallback(() => {
      questionsQuery.refetch();
    }, [chapterId, subjectId]),
  );

  function selectSet(id) {
    if (id === selectedSetId) return;
    setSelectedSetId(id);
    setQuestionIds([]);
  }

  function toggleQuestion(id) {
    setQuestionIds((previous) =>
      previous.includes(id)
        ? previous.filter((questionId) => questionId !== id)
        : [...previous, id],
    );
  }

  async function confirm() {
    if (!selectedSetId) return;
    try {
      await updateSet.mutateAsync({ id: selectedSetId, data: { questionIds } });
      setField('questionSetId', selectedSetId);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not save question set', error.message);
    }
  }

  if (setsQuery.isPending) {
    return (
      <Screen>
        <Loader message="Loading question sets..." />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AdminHeader
          onBack={navigation.goBack}
          subtitle={
            selectedSetId
              ? `${questionIds.length} questions selected`
              : 'Choose a question set'
          }
          title="Pick questions"
        />

        <Text style={styles.sectionLabel}>Question set</Text>
        <FlashList
          data={sets}
          horizontal
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={170}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <EmptyState
              message="No question sets found for this subject."
              title="No sets"
            />
          }
          renderItem={({ item }) => {
            const selected = selectedSetId === item._id;
            return (
              <Pressable
                onPress={() => selectSet(item._id)}
                style={[styles.setCard, selected && styles.setCardSelected]}
              >
                <Text numberOfLines={1} style={styles.setName}>
                  {item.name}
                </Text>
                <Text style={styles.setMeta}>
                  {item.totalQuestions} questions
                </Text>
              </Pressable>
            );
          }}
        />

        {!selectedSetId ? (
          <EmptyState
            message="Select a question set to manage its questions."
            title="Choose a set"
          />
        ) : (
          <>
            <View style={styles.filterHeader}>
              <Text style={styles.sectionLabel}>Questions</Text>
              <Pressable
                onPress={() =>
                  navigation.navigate('QuestionForm', {
                    initialSubjectId: subjectId,
                    initialChapterId: chapterId,
                  })
                }
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>+ Add question</Text>
              </Pressable>
            </View>

            <View style={styles.chapterRow}>
              <Pressable
                onPress={() => setChapterId('')}
                style={[styles.chip, !chapterId && styles.chipSelected]}
              >
                <Text
                  style={[
                    styles.chipText,
                    !chapterId && styles.chipTextSelected,
                  ]}
                >
                  All chapters
                </Text>
              </Pressable>
              {(chaptersQuery.data?.data || []).map((chapter) => (
                <Pressable
                  key={chapter._id}
                  onPress={() => setChapterId(chapter._id)}
                  style={[
                    styles.chip,
                    chapterId === chapter._id && styles.chipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      chapterId === chapter._id && styles.chipTextSelected,
                    ]}
                  >
                    {chapter.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              placeholder="Search questions..."
              placeholderTextColor={colors.mutedText}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />

            <FlashList
              data={filteredQuestions}
              estimatedItemSize={86}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                <EmptyState
                  message="No active questions match this filter."
                  title="No questions"
                />
              }
              ListFooterComponent={
                questionsQuery.isFetchingNextPage ? (
                  <ActivityIndicator
                    color={colors.primary}
                    style={styles.footer}
                  />
                ) : null
              }
              onEndReached={() => {
                if (
                  questionsQuery.hasNextPage &&
                  !questionsQuery.isFetchingNextPage
                )
                  questionsQuery.fetchNextPage();
              }}
              onEndReachedThreshold={0.4}
              renderItem={({ item }) => {
                const included = questionIds.includes(item._id);
                return (
                  <Pressable
                    onPress={() => toggleQuestion(item._id)}
                    style={[
                      styles.questionCard,
                      included && styles.questionCardSelected,
                    ]}
                  >
                    <View style={styles.questionContent}>
                      <Text numberOfLines={2} style={styles.preview}>
                        {item.preview}
                      </Text>
                      <Text style={styles.meta}>
                        {item.chapterId?.name || 'No chapter'} · {item.topic} ·{' '}
                        {item.difficulty}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('QuestionForm', { id: item._id })
                      }
                      style={styles.editButton}
                    >
                      <Text style={styles.editButtonText}>Edit</Text>
                    </Pressable>
                    <View
                      style={[
                        styles.checkbox,
                        included && styles.checkboxSelected,
                      ]}
                    >
                      {included && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </Pressable>
                );
              }}
            />
          </>
        )}

        <AppButton
          disabled={!selectedSetId || updateSet.isPending}
          label={
            updateSet.isPending
              ? 'Saving...'
              : `Save and select (${questionIds.length})`
          }
          onPress={confirm}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  sectionLabel: { color: colors.black, fontSize: 14, fontWeight: '800' },
  setCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    padding: 12,
    width: 170,
  },
  setCardSelected: { backgroundColor: '#FFF7ED', borderColor: colors.primary },
  setName: { color: colors.black, fontSize: 13, fontWeight: '800' },
  setMeta: { color: colors.mutedText, fontSize: 11, marginTop: 5 },
  filterHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  addButtonText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  chapterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: {
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { color: colors.mutedText, fontSize: 11, fontWeight: '700' },
  chipTextSelected: { color: colors.white },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    color: colors.black,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  questionCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    marginBottom: 9,
    padding: 12,
  },
  questionCardSelected: {
    backgroundColor: '#FFF7ED',
    borderColor: colors.primary,
  },
  questionContent: { flex: 1, gap: 4 },
  preview: { color: colors.black, fontSize: 13, fontWeight: '700' },
  meta: { color: colors.mutedText, fontSize: 11 },
  editButton: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editButtonText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkMark: { color: colors.white, fontSize: 13, fontWeight: '900' },
  footer: { paddingVertical: 18 },
});
