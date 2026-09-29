import { StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';
import QuestionRenderer from './QuestionRenderer';

export default function QuestionPreview({ question, showAnswer = true }) {
  return (
    <View style={styles.card}>
      <View style={styles.meta}>
        <Text style={styles.topic}>{question.topic || 'Untitled topic'}</Text>
        <Text style={styles.difficulty}>{question.difficulty}</Text>
      </View>
      <QuestionRenderer question={question} showAnswer={showAnswer} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 18,
    padding: 18,
  },
  meta: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  topic: {
    color: colors.darkNeutral,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  difficulty: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
