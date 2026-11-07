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
import { useQuestionSets } from '../hooks/useQuestionSets';

export default function QuestionSetSelectorScreen({ navigation, route }) {
  const { subjectId } = route.params ?? {};
  const { draft, setField } = useExamDraft();
  const [selected, setSelected] = useState(draft.questionSetId);

  const query = useQuestionSets({
    subjectId: subjectId || undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  function confirm() {
    if (selected) {
      setField('questionSetId', selected);
      navigation.goBack();
    }
  }

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading question sets…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AdminHeader
          onBack={navigation.goBack}
          subtitle={selected ? 'Selected' : 'None selected'}
          title="Select Question Set"
        />

        <FlashList
          data={items}
          estimatedItemSize={100}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <EmptyState
              message="No question sets found for this subject."
              title="No sets"
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
            const sel = selected === item._id;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: sel }}
                onPress={() => setSelected(item._id)}
                style={[styles.card, sel && styles.cardSel]}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.description && (
                    <Text numberOfLines={2} style={styles.description}>
                      {item.description}
                    </Text>
                  )}
                  <Text style={styles.meta}>
                    {item.totalQuestions} questions
                  </Text>
                </View>
                <View style={[styles.radio, sel && styles.radioSel]}>
                  {sel && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          }}
        />

        <AppButton
          disabled={!selected}
          label="Confirm Selection"
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
  name: { color: colors.black, fontSize: 14, fontWeight: '700' },
  description: { color: colors.mutedText, fontSize: 12 },
  meta: { color: colors.mutedText, fontSize: 11 },
  radio: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioSel: { borderColor: colors.primary, backgroundColor: colors.primary },
  radioDot: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  footer: { paddingVertical: 20 },
});
