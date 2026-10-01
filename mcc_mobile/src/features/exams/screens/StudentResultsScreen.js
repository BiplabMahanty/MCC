import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import colors from '../../../theme/colors';
import StudentPageHeader from '../../portal/components/StudentPageHeader';
import { useStudentResults } from '../hooks/useExams';

function gradeColor(grade) {
  if (!grade) return colors.dashSubText;
  if (['A+', 'A'].includes(grade)) return colors.dashUp;
  if (['B+', 'B'].includes(grade)) return colors.iconBlue;
  if (['C', 'D'].includes(grade)) return '#D97706';
  return '#DC2626';
}

function ResultCard({ result, onPress }) {
  const pct = result.percentage ?? 0;
  const gc = gradeColor(result.grade);
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <View style={[styles.gradeCircle, { borderColor: gc }]}>
        <Text style={[styles.gradeText, { color: gc }]}>{result.grade ?? '—'}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.examName} numberOfLines={1}>{result.examId?.name ?? 'Exam'}</Text>
        <Text style={styles.examMeta}>
          {[result.examId?.examType, result.examId?.academicSession].filter(Boolean).join(' · ')}
        </Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: gc }]} />
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.marks}>{result.obtainedMarks}/{result.totalMarks}</Text>
        <Text style={styles.pct}>{pct}%</Text>
        {result.rank ? <Text style={styles.rank}>#{result.rank}</Text> : null}
      </View>
    </Pressable>
  );
}

export default function StudentResultsScreen({ navigation }) {
  const { data, isPending, error, refetch, isFetching, fetchNextPage, hasNextPage } = useStudentResults({});

  return (
    <View style={styles.root}>
      <StudentPageHeader
        title="My Results"
        subtitle="Exam scores and grades"
        onBack={navigation.goBack}
      />
      <View style={styles.body}>
        {isPending ? <Loader message="Loading results…" /> : null}
        {error ? <ErrorState message={error.message} onRetry={refetch} retrying={isFetching} /> : null}
        {data ? (
          <FlatList
            data={data.pages.flatMap((p) => p.data)}
            keyExtractor={(r) => r._id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyState title="No results yet" message="No published results found." />}
            onEndReached={() => hasNextPage && fetchNextPage()}
            onEndReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ResultCard
                result={item}
                onPress={() => navigation.navigate('StudentExamResult', { examId: item.examId?._id ?? item.examId })}
              />
            )}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },
  body: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  listContent: { gap: 10, paddingBottom: 36 },

  card: {
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  gradeCircle: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  gradeText: { fontSize: 15, fontWeight: '900' },
  cardBody: { flex: 1, gap: 4 },
  examName: { fontSize: 14, fontWeight: '800', color: colors.dashText },
  examMeta: { fontSize: 11, color: colors.dashSubText },
  progressBg: { height: 4, backgroundColor: colors.dashBorder, borderRadius: 2, marginTop: 4 },
  progressFill: { height: 4, borderRadius: 2 },
  cardRight: { alignItems: 'flex-end', gap: 2 },
  marks: { fontSize: 15, fontWeight: '900', color: colors.dashText },
  pct: { fontSize: 11, color: colors.dashSubText },
  rank: { fontSize: 11, color: colors.dashSubText },
});
