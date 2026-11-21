import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import katex from 'katex';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import AppButton from '../../../components/common/AppButton';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import { useAdminOptions } from '../../admin/hooks/useAdminEntities';
import QuestionEditor from '../components/QuestionEditor';
import { useQuestion, useSaveQuestion } from '../hooks/useQuestions';

function normalizeBlock(block) {
  const hasTableData =
    block?.type === 'table' ||
    block?.headers?.length > 0 ||
    block?.rows?.length > 0;

  if (hasTableData) {
    return {
      type: 'table',
      caption: block.caption || '',
      headers: block.headers || [],
      rows: block.rows || [],
    };
  }

  if (block?.type === 'image') {
    return {
      type: 'image',
      url: block.url,
      storageKey: block.storageKey,
      alt: block.alt || '',
      mimeType: block.mimeType,
      ...(block.width > 0 && { width: block.width }),
      ...(block.height > 0 && { height: block.height }),
    };
  }

  return {
    type: block?.type === 'formula' ? 'formula' : 'text',
    value: block?.value || '',
  };
}

function initialQuestion(record, defaults = {}) {
  if (record) {
    return {
      subjectId:
        typeof record.subjectId === 'object'
          ? record.subjectId._id
          : record.subjectId,
      chapterId:
        typeof record.chapterId === 'object'
          ? record.chapterId?._id
          : record.chapterId || '',
      topic: record.topic,
      difficulty: record.difficulty,
      content: record.content.map(normalizeBlock),
      options: record.options.map((option) => ({
        content: option.content.map(normalizeBlock),
      })),
      correctOptionIndex: record.correctOptionIndex,
      isActive: record.isActive,
    };
  }

  return {
    subjectId: defaults.subjectId || '',
    chapterId: defaults.chapterId || '',
    topic: '',
    difficulty: 'medium',
    content: [{ type: 'text', value: '' }],
    options: Array.from({ length: 4 }, () => ({
      content: [{ type: 'text', value: '' }],
    })),
    correctOptionIndex: 0,
    isActive: true,
  };
}

function blockComplete(block) {
  if (block.type === 'image') {
    return Boolean(block.url && block.storageKey && block.alt);
  }
  if (block.type === 'table') {
    return Boolean(
      block.headers?.length &&
      block.headers.every((header) => header.trim()) &&
      block.rows?.length &&
      block.rows.every(
        (row) =>
          row.length === block.headers.length &&
          row.some((cell) => cell.trim()),
      ),
    );
  }
  if (block.type === 'formula') {
    try {
      katex.renderToString(block.value, {
        output: 'mathml',
        strict: 'error',
        throwOnError: true,
        trust: false,
      });
      return true;
    } catch {
      return false;
    }
  }
  return Boolean(block.value?.trim());
}

function validate(question) {
  const errors = {};
  if (!question.subjectId) errors.subjectId = 'Subject is required.';
  if (!question.topic.trim()) errors.topic = 'Topic is required.';
  if (!question.content.length || !question.content.every(blockComplete)) {
    errors.content = 'Complete every question content block.';
  }
  if (
    question.options.length < 2 ||
    question.options.some(
      (option) =>
        !option.content.length || !option.content.every(blockComplete),
    )
  ) {
    errors.options = 'Add at least two complete answer options.';
  }
  return errors;
}

function FormContent({
  navigation,
  id,
  record,
  subjects,
  chapters,
  initialSubjectId,
  initialChapterId,
}) {
  const [question, setQuestion] = useState(() =>
    initialQuestion(record, {
      subjectId: initialSubjectId,
      chapterId: initialChapterId,
    }),
  );
  const [errors, setErrors] = useState({});
  const saveMutation = useSaveQuestion(id);
  const chaptersQuery = useAdminOptions('chapters', !!question.subjectId, {
    subjectId: question.subjectId,
  });

  async function save() {
    const nextErrors = validate(question);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await saveMutation.mutateAsync(question);
      navigation.goBack();
    } catch (error) {
      if (Array.isArray(error.details)) {
        setErrors(
          Object.fromEntries(
            error.details.map((detail) => [
              detail.field.split('.')[0],
              detail.message,
            ]),
          ),
        );
      }
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <AdminHeader
          onBack={navigation.goBack}
          subtitle="Build structured content and preview it before saving."
          title={id ? 'Edit question' : 'Add question'}
        />
        <QuestionEditor
          errors={errors}
          onChange={setQuestion}
          question={question}
          subjects={subjects}
          chapters={chaptersQuery.data?.data || chapters || []}
        />
        {saveMutation.error ? (
          <Text accessibilityRole="alert" style={styles.submitError}>
            {saveMutation.error.message}
          </Text>
        ) : null}
        <AppButton
          disabled={saveMutation.isPending}
          label={saveMutation.isPending ? 'Saving...' : 'Save question'}
          onPress={save}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function QuestionFormScreen({ navigation, route }) {
  const { id, initialSubjectId, initialChapterId } = route.params ?? {};
  const questionQuery = useQuestion('admin', id);
  const subjectsQuery = useAdminOptions('subjects');
  const subjectId =
    questionQuery.data?.data?.subjectId?._id ||
    questionQuery.data?.data?.subjectId ||
    initialSubjectId ||
    '';
  const chaptersQuery = useAdminOptions('chapters', !!subjectId, { subjectId });

  if (
    (id && questionQuery.isPending) ||
    subjectsQuery.isPending ||
    (subjectId && chaptersQuery.isPending)
  ) {
    return (
      <Screen>
        <Loader message="Loading question editor..." />
      </Screen>
    );
  }

  const error =
    questionQuery.error || subjectsQuery.error || chaptersQuery.error;
  if (error) {
    return (
      <Screen>
        <ErrorState
          message={error.message}
          onRetry={() => {
            if (questionQuery.error) questionQuery.refetch();
            if (subjectsQuery.error) subjectsQuery.refetch();
            if (chaptersQuery.error) chaptersQuery.refetch();
          }}
          retrying={
            questionQuery.isFetching ||
            subjectsQuery.isFetching ||
            chaptersQuery.isFetching
          }
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <FormContent
        id={id}
        navigation={navigation}
        record={questionQuery.data?.data}
        subjects={subjectsQuery.data?.data || []}
        chapters={chaptersQuery.data?.data || []}
        initialSubjectId={initialSubjectId}
        initialChapterId={initialChapterId}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: 24, paddingBottom: 30 },
  submitError: {
    backgroundColor: colors.errorSurface,
    borderRadius: 10,
    color: colors.error,
    fontSize: 13,
    padding: 12,
  },
});
