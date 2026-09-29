import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import { useStudentResults } from '../hooks/useExams';

function ResultCard({ result, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.examName} numberOfLines={1}>
          {result.examId?.name ?? 'Exam'}
        </Text>
        <Text style={styles.examMeta}>
          {result.examId?.examType ?? ''} ·{' '}
          {result.examId?.academicSession ?? ''}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.marks}>
          {result.obtainedMarks}/{result.totalMarks}
        </Text>
        <Text style={styles.pct}>{result.percentage}%</Text>
        <View style={styles.gradePill}>
          <Text style={styles.gradeText}>{result.grade}</Text>
        </View>
        {result.rank && <Text style={styles.rank}>#{result.rank}</Text>}
      </View>
    </Pressable>
  );
}

export default function StudentResultsScreen({ navigation }) {
  const {
    data,
    isPending,
    error,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
  } = useStudentResults({});

  if (isPending)
    return (
      <Screen>
        <Loader message="Loading results…" />
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

  const results = data.pages.flatMap((p) => p.data);

  return (
    <Screen>
      <StatusBar style="dark" />
      <Text style={styles.title}>My Results</Text>
      <FlatList
        data={results}
        keyExtractor={(r) => r._id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No published results yet." />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => (
          <ResultCard
            result={item}
            onPress={() =>
              navigation.navigate('StudentExamResult', {
                examId: item.examId?._id ?? item.examId,
              })
            }
          />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.black,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 16,
  },
  list: { gap: 12, paddingBottom: 32 },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  cardLeft: { flex: 1 },
  examName: { color: colors.black, fontSize: 15, fontWeight: '800' },
  examMeta: { color: colors.mutedText, fontSize: 12, marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 3 },
  marks: { color: colors.black, fontSize: 16, fontWeight: '900' },
  pct: { color: colors.mutedText, fontSize: 12 },
  gradePill: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  gradeText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  rank: { color: colors.mutedText, fontSize: 12 },
});
