import { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppButton from '../../../components/common/AppButton';
import EmptyState from '../../../components/common/EmptyState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import { useExamDraft } from '../context/ExamDraftContext';
import { useQuestions } from '../../questions/hooks/useQuestions';

export default function QuestionPickerScreen({ navigation, route }) {
  const { subjectId } = route.params ?? {};
  const { draft, setField } = useExamDraft();
  const [selected, setSelected] = useState(new Set(draft.questionIds));

  const query = useQuestions('admin', {
    isActive: true,
    subjectId: subjectId || undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirm() {
    setField('questionIds', [...selected]);
    navigation.goBack();
  }

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading questions…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AdminHeader
          onBack={navigation.goBack}
          subtitle={`${selected.size} selected`}
          title="Pick questions"
        />

        <FlashList
          data={items}
          estimatedItemSize={90}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <EmptyState
              message="No active questions found for this subject."
              title="No questions"
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
          renderItem={({ item }) => {
            const sel = selected.has(item._id);
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: sel }}
                onPress={() => toggle(item._id)}
                style={[styles.card, sel && styles.cardSel]}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.subject}>{item.subjectId?.name}</Text>
                  <Text numberOfLines={2} style={styles.preview}>
                    {item.preview}
                  </Text>
                  <Text style={styles.meta}>
                    {item.topic} · {item.difficulty}
                  </Text>
                </View>
                <View style={[styles.check, sel && styles.checkSel]}>
                  {sel && <Text style={styles.checkMark}>✓</Text>}
                </View>
              </Pressable>
            );
          }}
        />

        <AppButton
          disabled={selected.size === 0}
          label={`Confirm ${selected.size} question${selected.size !== 1 ? 's' : ''}`}
          onPress={confirm}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 14,
  },
  cardSel: { borderColor: colors.primary, backgroundColor: '#FFF7ED' },
  cardLeft: { flex: 1, gap: 4 },
  subject: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  preview: { color: colors.black, fontSize: 14, fontWeight: '700' },
  meta: { color: colors.mutedText, fontSize: 12 },
  check: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkSel: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkMark: { color: colors.white, fontSize: 13, fontWeight: '900' },
  footer: { paddingVertical: 20 },
});
