import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import QuestionRenderer from '../../questions/components/QuestionRenderer';
import ExamTimer from '../components/ExamTimer';
import QuestionPalette from '../components/QuestionPalette';
import {
  useAttempt,
  useSubmitAttempt,
  useSyncAnswers,
} from '../hooks/useExamAttempt';

const SYNC_INTERVAL_MS = 8000;

export default function ExamEngineScreen({ navigation, route }) {
  const { examId } = route.params;
  const { data, isPending, error, refetch, isFetching } = useAttempt(examId);
  const syncMutation = useSyncAnswers();
  const submitMutation = useSubmitAttempt();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => data?.attempt?.answers ?? []);
  const [paletteVisible, setPaletteVisible] = useState(false);
  const pendingSyncRef = useRef([]);
  const syncTimerRef = useRef(null);

  // Re-seed answers when a different attempt loads (e.g. resume)
  const attemptId = data?.attempt?._id?.toString();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (attemptId) setAnswers(data.attempt.answers ?? []);
  }, [attemptId]); // re-seed only when a different attempt loads

  // Periodic background sync
  useEffect(() => {
    syncTimerRef.current = setInterval(() => {
      if (pendingSyncRef.current.length > 0) {
        const toSync = [...pendingSyncRef.current];
        pendingSyncRef.current = [];
        syncMutation.mutate({ examId, answers: toSync });
      }
    }, SYNC_INTERVAL_MS);
    return () => clearInterval(syncTimerRef.current);
    // syncMutation is a stable mutation object; examId is a primitive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  function updateAnswer(patch) {
    const now = Date.now();
    setAnswers((prev) => {
      const existing = prev.find(
        (a) => a.questionIndex === patch.questionIndex,
      );
      let next;
      if (!existing) {
        next = [...prev, { ...patch, clientTs: now }];
      } else if (now >= (existing.clientTs || 0)) {
        next = prev.map((a) =>
          a.questionIndex === patch.questionIndex
            ? { ...a, ...patch, clientTs: now }
            : a,
        );
      } else {
        next = prev;
      }
      // Queue for sync
      const updated = next.find((a) => a.questionIndex === patch.questionIndex);
      if (updated) {
        pendingSyncRef.current = [
          ...pendingSyncRef.current.filter(
            (a) => a.questionIndex !== patch.questionIndex,
          ),
          updated,
        ];
      }
      return next;
    });
  }

  function markVisited(index) {
    const existing = answers.find((a) => a.questionIndex === index);
    if (!existing?.visited) {
      updateAnswer({ questionIndex: index, visited: true });
    }
  }

  function handleNavigate(index) {
    markVisited(currentIndex);
    setCurrentIndex(index);
    markVisited(index);
  }

  function handleSelectOption(optionIndex) {
    updateAnswer({
      questionIndex: currentIndex,
      selectedOptionIndex: optionIndex,
      visited: true,
    });
  }

  function handleMarkForReview() {
    const existing = answers.find((a) => a.questionIndex === currentIndex);
    updateAnswer({
      questionIndex: currentIndex,
      markedForReview: !existing?.markedForReview,
      visited: true,
    });
  }

  const handleExpire = useCallback(async () => {
    // Flush pending answers then auto-submit
    if (pendingSyncRef.current.length > 0) {
      try {
        await syncMutation.mutateAsync({
          examId,
          answers: pendingSyncRef.current,
        });
      } catch {}
    }
    try {
      await submitMutation.mutateAsync(examId);
    } catch {}
    navigation.replace('StudentExamResult', { examId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, navigation, submitMutation, syncMutation]);

  function confirmSubmit() {
    const answered = answers.filter(
      (a) =>
        a.selectedOptionIndex !== null && a.selectedOptionIndex !== undefined,
    ).length;
    const total = data?.exam?.questions?.length ?? 0;
    Alert.alert(
      'Submit exam?',
      `Answered: ${answered} / ${total}\nUnanswered: ${total - answered}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          style: 'destructive',
          onPress: async () => {
            // Flush pending
            if (pendingSyncRef.current.length > 0) {
              try {
                await syncMutation.mutateAsync({
                  examId,
                  answers: pendingSyncRef.current,
                });
              } catch {}
            }
            try {
              await submitMutation.mutateAsync(examId);
              navigation.replace('StudentExamResult', { examId });
            } catch (e) {
              Alert.alert('Submit failed', e.message);
            }
          },
        },
      ],
    );
  }

  if (isPending)
    return (
      <Screen>
        <Loader message="Loading exam…" />
      </Screen>
    );
  if (error)
    return (
      <Screen>
        <ErrorState
          message={error.message}
          onRetry={refetch}
          retrying={isFetching}
        />
      </Screen>
    );

  const { exam, attempt } = data;
  const questions = exam.questions ?? [];
  const total = questions.length;
  const question = questions[currentIndex];
  const currentAnswer = answers.find((a) => a.questionIndex === currentIndex);
  const isMarked = currentAnswer?.markedForReview ?? false;
  const selectedOption = currentAnswer?.selectedOptionIndex ?? null;

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.examName} numberOfLines={1}>
            {exam.name}
          </Text>
          <ExamTimer expiresAt={attempt.expiresAt} onExpire={handleExpire} />
        </View>

        {/* Progress */}
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {total}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setPaletteVisible(true)}
            style={styles.paletteBtn}
          >
            <Text style={styles.paletteBtnText}>Palette</Text>
          </Pressable>
        </View>

        {/* Question */}
        <ScrollView
          contentContainerStyle={styles.questionArea}
          showsVerticalScrollIndicator={false}
        >
          {question ? (
            <QuestionRenderer
              question={question}
              selectedOptionIndex={selectedOption}
              onSelectOption={handleSelectOption}
            />
          ) : null}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={handleMarkForReview}
            style={[styles.reviewBtn, isMarked && styles.reviewBtnActive]}
          >
            <Text
              style={[
                styles.reviewBtnText,
                isMarked && styles.reviewBtnTextActive,
              ]}
            >
              {isMarked ? 'Marked ★' : 'Mark for review'}
            </Text>
          </Pressable>
        </View>

        {/* Navigation */}
        <View style={styles.nav}>
          <Pressable
            accessibilityRole="button"
            disabled={currentIndex === 0}
            onPress={() => handleNavigate(currentIndex - 1)}
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          >
            <Text style={styles.navBtnText}>← Prev</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={confirmSubmit}
            style={styles.submitBtn}
          >
            <Text style={styles.submitBtnText}>Submit</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={currentIndex === total - 1}
            onPress={() => handleNavigate(currentIndex + 1)}
            style={[
              styles.navBtn,
              currentIndex === total - 1 && styles.navBtnDisabled,
            ]}
          >
            <Text style={styles.navBtnText}>Next →</Text>
          </Pressable>
        </View>
      </View>

      <QuestionPalette
        answers={answers}
        currentIndex={currentIndex}
        onClose={() => setPaletteVisible(false)}
        onNavigate={handleNavigate}
        totalQuestions={total}
        visible={paletteVisible}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 12 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  examName: {
    color: colors.black,
    flex: 1,
    fontSize: 16,
    fontWeight: '900',
  },
  progress: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: { color: colors.mutedText, fontSize: 13 },
  paletteBtn: {
    backgroundColor: colors.black,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  paletteBtnText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  questionArea: { paddingBottom: 8 },
  actions: { alignItems: 'flex-start' },
  reviewBtn: {
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  reviewBtnActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  reviewBtnText: { color: colors.mutedText, fontSize: 13, fontWeight: '700' },
  reviewBtnTextActive: { color: '#6D28D9' },
  nav: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  navBtn: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
  },
  navBtnDisabled: { opacity: 0.35 },
  navBtnText: { color: colors.black, fontSize: 14, fontWeight: '800' },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
  },
  submitBtnText: { color: colors.white, fontSize: 14, fontWeight: '800' },
});
