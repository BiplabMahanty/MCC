import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';

import AdminHeader from '../../admin/components/AdminHeader';
import AppButton from '../../../components/common/AppButton';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import { apiRequest } from '../../../services/apiClient';
import {
  useQuestionSet,
  useCreateQuestionSet,
  useUpdateQuestionSet,
} from '../hooks/useQuestionSetsList';

function useSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiRequest('/admin/subjects?isActive=true&limit=100', {
      auth: true,
    })
      .then((res) => {
        setSubjects(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch subjects:', err);
        setSubjects([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return { subjects, loading };
}

function useQuestions(subjectId, chapterId) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subjectId) {
      setQuestions([]);
      return;
    }

    setLoading(true);
    apiRequest(`/admin/questions?subjectId=${subjectId}&${chapterId ? `chapterId=${chapterId}&` : ''}isActive=true&limit=100`, {
      auth: true,
    })
      .then((res) => {
        setQuestions(res.data || []);
      })
      .catch((err) => {
        console.error('Failed to fetch questions:', err);
        setQuestions([]);
      })
      .finally(() => setLoading(false));
  }, [subjectId, chapterId]);

  return { questions, loading };
}

function QuestionPreviewModal({ visible, question, onClose }) {
  if (!question) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Question Preview</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Question */}
            <View style={styles.questionSection}>
              <Text style={styles.questionText}>{question.preview}</Text>
            </View>

            {/* Meta */}
            <View style={styles.metaSection}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Topic:</Text>
                <Text style={styles.metaValue}>{question.topic}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Difficulty:</Text>
                <Text style={[styles.metaValue, styles.difficultyBadge]}>
                  {question.difficulty}
                </Text>
              </View>
            </View>

            {/* Options */}
            {question.options && question.options.length > 0 && (
              <View style={styles.optionsSection}>
                <Text style={styles.optionsTitle}>Options:</Text>
                {question.options.map((option, index) => {
                  const isCorrect = index === question.correctOptionIndex;
                  const optionText = option.content?.[0]?.value || 'Option';
                  return (
                    <View
                      key={index}
                      style={[
                        styles.optionRow,
                        isCorrect && styles.optionRowCorrect,
                      ]}
                    >
                      <Text style={styles.optionLetter}>
                        {String.fromCharCode(65 + index)}.
                      </Text>
                      <Text style={styles.optionText} numberOfLines={2}>
                        {optionText}
                      </Text>
                      {isCorrect && (
                        <Text style={styles.correctMark}>✓</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function QuestionSetFormScreen({ navigation, route }) {
  const { id } = route.params ?? {};
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useQuestionSet(isEdit ? id : null);
  const { subjects, loading: loadingSubjects } = useSubjects();
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const { questions, loading: loadingQuestions } = useQuestions(selectedSubjectId, selectedChapterId);
  const [chapters, setChapters] = useState([]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [questionIds, setQuestionIds] = useState([]);
  const [isActive, setIsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const create = useCreateQuestionSet();
  const update = useUpdateQuestionSet();

  useEffect(() => {
    if (!existing) return;
    setName(existing.name ?? '');
    setDescription(existing.description ?? '');
    setSubjectId(existing.subjectId?._id ?? existing.subjectId ?? '');
    setSelectedSubjectId(existing.subjectId?._id ?? existing.subjectId ?? '');
    setQuestionIds(
      existing.questionIds?.map((q) => (typeof q === 'string' ? q : q._id)) ?? []
    );
    setIsActive(existing.isActive ?? true);
  }, [existing]);

  useEffect(() => {
    if (!selectedSubjectId) { setChapters([]); setSelectedChapterId(''); return; }
    apiRequest(`/admin/chapters?subjectId=${selectedSubjectId}&isActive=true&limit=100`, { auth: true })
      .then((res) => setChapters(res.data || []))
      .catch(() => setChapters([]));
  }, [selectedSubjectId]);

  const handleSubmit = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required.');
    if (!subjectId) return Alert.alert('Error', 'Subject is required.');
    if (questionIds.length === 0)
      return Alert.alert('Error', 'Select at least one question.');

    const payload = {
      name: name.trim(),
      description: description.trim(),
      subjectId,
      questionIds,
      isActive,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await update.mutateAsync({ id, data: payload });
        Alert.alert('Success', 'Question set updated.');
      } else {
        await create.mutateAsync(payload);
        Alert.alert('Success', 'Question set created.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleQuestion = (qId) => {
    setQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const filteredQuestions = questions.filter((q) => {
    const preview = (q.preview ?? '').toLowerCase();
    const topic = (q.topic ?? '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return preview.includes(query) || topic.includes(query);
  });

  if (isEdit && loadingExisting) {
    return (
      <Screen>
        <Loader message="Loading question set…" />
      </Screen>
    );
  }

  const headerComponent = (
    <>
      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          placeholder="e.g., Algebra Basics"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={colors.mutedText}
        />
      </View>

      {/* Description */}
      <View style={styles.field}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Optional description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textarea]}
          placeholderTextColor={colors.mutedText}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Subject */}
      <View style={styles.field}>
        <Text style={styles.label}>Subject *</Text>
        {loadingSubjects ? (
          <ActivityIndicator color={colors.primary} />
        ) : subjects.length === 0 ? (
          <Text style={styles.emptyText}>No subjects available</Text>
        ) : (
          <View style={styles.subjectList}>
            {subjects.map((s) => (
              <Pressable
                key={s._id}
                style={[
                  styles.subjectChip,
                  subjectId === s._id && styles.subjectChipActive,
                ]}
                onPress={() => {
                  setSubjectId(s._id);
                  setSelectedSubjectId(s._id);
                  setSelectedChapterId('');
                  setQuestionIds([]);
                }}
              >
                <Text
                  style={[
                    styles.subjectChipText,
                    subjectId === s._id && styles.subjectChipTextActive,
                  ]}
                >
                  {s.name}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {selectedSubjectId && chapters.length > 0 && (
        <View style={styles.field}>
          <Text style={styles.label}>Chapter filter</Text>
          <View style={styles.subjectList}>
            <Pressable style={[styles.subjectChip, !selectedChapterId && styles.subjectChipActive]} onPress={() => { setSelectedChapterId(''); setQuestionIds([]); }}>
              <Text style={[styles.subjectChipText, !selectedChapterId && styles.subjectChipTextActive]}>All chapters</Text>
            </Pressable>
            {chapters.map((chapter) => (
              <Pressable key={chapter._id} style={[styles.subjectChip, selectedChapterId === chapter._id && styles.subjectChipActive]} onPress={() => { setSelectedChapterId(chapter._id); setQuestionIds([]); }}>
                <Text style={[styles.subjectChipText, selectedChapterId === chapter._id && styles.subjectChipTextActive]}>{chapter.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Active toggle */}
      <View style={styles.field}>
        <Pressable
          style={styles.checkbox}
          onPress={() => setIsActive(!isActive)}
        >
          <Text style={styles.checkboxBox}>
            {isActive ? '✓' : ''}
          </Text>
          <Text style={styles.checkboxLabel}>Active</Text>
        </Pressable>
      </View>

      {/* Questions Header */}
      <View style={styles.field}>
        <View style={styles.questionHeader}>
          <Text style={styles.label}>
            Questions ({questionIds.length})
          </Text>
          {loadingQuestions && selectedSubjectId && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>

        {selectedSubjectId && (
          <TextInput
            placeholder="Search questions…"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.input}
            placeholderTextColor={colors.mutedText}
          />
        )}

        {!selectedSubjectId && (
          <Text style={styles.emptyText}>
            Select a subject to view questions
          </Text>
        )}
      </View>
    </>
  );

  const footerComponent = (
    <View style={styles.footer}>
      <AppButton
        label={isEdit ? 'Save Changes' : 'Create Set'}
        onPress={handleSubmit}
        loading={submitting}
      />
    </View>
  );

  if (!selectedSubjectId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <AdminHeader
            onBack={navigation.goBack}
            title={isEdit ? 'Edit Question Set' : 'Create Question Set'}
          />
          <View style={styles.formContainer}>
            {headerComponent}
          </View>
          {footerComponent}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AdminHeader
          onBack={navigation.goBack}
          title={isEdit ? 'Edit Question Set' : 'Create Question Set'}
        />

        <FlashList
          data={filteredQuestions.length > 0 ? filteredQuestions : []}
          estimatedItemSize={80}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={headerComponent}
          ListFooterComponent={footerComponent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {questions.length === 0
                ? 'No questions available.'
                : 'No questions match your search.'}
            </Text>
          }
          renderItem={({ item }) => {
            const selected = questionIds.includes(item._id);
            return (
              <Pressable
                style={[
                  styles.questionItem,
                  selected && styles.questionItemSelected,
                ]}
                onPress={() => toggleQuestion(item._id)}
              >
                <View style={styles.checkbox}>
                  <Text style={styles.checkboxBox}>
                    {selected ? '✓' : ''}
                  </Text>
                </View>
                <View style={styles.questionContent}>
                  <Text
                    style={styles.questionPreview}
                    numberOfLines={2}
                  >
                    {item.preview || 'Question'}
                  </Text>
                  <View style={styles.questionMeta}>
                    <Text style={styles.questionTopic}>
                      {item.topic}
                    </Text>
                    <Text style={[styles.questionDifficulty, styles.difficultyBadge]}>
                      {item.difficulty}
                    </Text>
                    <Pressable
                      style={styles.viewBtn}
                      onPress={() => {
                        setPreviewQuestion(item);
                        setShowPreview(true);
                      }}
                    >
                      <Text style={styles.viewBtnText}>View</Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />

        <QuestionPreviewModal
          visible={showPreview}
          question={previewQuestion}
          onClose={() => setShowPreview(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  formContainer: {
    paddingBottom: 16,
    gap: 16,
  },
  field: { gap: 8 },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.black,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
  },
  textarea: {
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  subjectList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  subjectChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subjectChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  subjectChipTextActive: {
    color: colors.white,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 4,
    textAlign: 'center',
    lineHeight: 16,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  questionItemSelected: {
    backgroundColor: '#FFF7ED',
  },
  questionContent: {
    flex: 1,
    gap: 6,
  },
  questionPreview: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.black,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  questionTopic: {
    fontSize: 11,
    backgroundColor: colors.surface,
    color: colors.mutedText,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyBadge: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  questionDifficulty: {
    fontSize: 11,
    color: colors.mutedText,
  },
  viewBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  viewBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 13,
    color: colors.mutedText,
  },
  footer: {
    paddingHorizontal: 0,
    paddingVertical: 16,
    gap: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: colors.white,
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  questionSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  questionText: {
    fontSize: 13,
    color: colors.black,
    lineHeight: 20,
    fontWeight: '500',
  },
  metaSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 11,
    color: colors.mutedText,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '600',
  },
  optionsSection: {
    marginBottom: 8,
  },
  optionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionRowCorrect: {
    backgroundColor: '#FEF3C7',
    borderColor: colors.primary,
  },
  optionLetter: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.black,
    minWidth: 20,
  },
  optionText: {
    fontSize: 12,
    color: colors.black,
    flex: 1,
    fontWeight: '500',
  },
  correctMark: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
