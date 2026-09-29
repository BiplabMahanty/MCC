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

function initialQuestion(record) {
  if (record) {
    return {
      subjectId:
        typeof record.subjectId === 'object'
          ? record.subjectId._id
          : record.subjectId,
      topic: record.topic,
      difficulty: record.difficulty,
      content: record.content,
      options: record.options.map((option) => ({ content: option.content })),
      correctOptionIndex: record.correctOptionIndex,
      isActive: record.isActive,
    };
  }

  return {
    subjectId: '',
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

function FormContent({ navigation, id, record, subjects }) {
  const [question, setQuestion] = useState(() => initialQuestion(record));
  const [errors, setErrors] = useState({});
  const saveMutation = useSaveQuestion(id);

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
  const { id } = route.params;
  const questionQuery = useQuestion('admin', id);
  const subjectsQuery = useAdminOptions('subjects');

  if ((id && questionQuery.isPending) || subjectsQuery.isPending) {
    return (
      <Screen>
        <Loader message="Loading question editor..." />
      </Screen>
    );
  }

  const error = questionQuery.error || subjectsQuery.error;
  if (error) {
    return (
      <Screen>
        <ErrorState
          message={error.message}
          onRetry={() => {
            if (questionQuery.error) questionQuery.refetch();
            if (subjectsQuery.error) subjectsQuery.refetch();
          }}
          retrying={questionQuery.isFetching || subjectsQuery.isFetching}
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
