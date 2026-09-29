import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import colors from '../../../theme/colors';

// State colours per spec
const STATE = {
  notVisited: {
    bg: colors.white,
    border: colors.border,
    text: colors.mutedText,
  },
  visited: { bg: '#FFFBEB', border: '#F59E0B', text: '#B45309' },
  answered: { bg: '#F0FDF4', border: '#16A34A', text: '#15803D' },
  markedForReview: { bg: '#F5F3FF', border: '#7C3AED', text: '#6D28D9' },
  current: { bg: colors.primary, border: colors.primary, text: colors.white },
};

function questionState(answer, isCurrent) {
  if (isCurrent) return STATE.current;
  if (!answer || !answer.visited) return STATE.notVisited;
  if (answer.markedForReview) return STATE.markedForReview;
  if (
    answer.selectedOptionIndex !== null &&
    answer.selectedOptionIndex !== undefined
  )
    return STATE.answered;
  return STATE.visited;
}

export default function QuestionPalette({
  visible,
  onClose,
  totalQuestions,
  answers,
  currentIndex,
  onNavigate,
}) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Question palette</Text>
            <Pressable accessibilityRole="button" onPress={onClose}>
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          <View style={styles.legend}>
            {Object.entries(STATE)
              .filter(([k]) => k !== 'current')
              .map(([key, s]) => (
                <View key={key} style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: s.bg, borderColor: s.border },
                    ]}
                  />
                  <Text style={styles.legendLabel}>
                    {key === 'notVisited'
                      ? 'Not visited'
                      : key === 'markedForReview'
                        ? 'Marked'
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                  </Text>
                </View>
              ))}
          </View>

          <ScrollView contentContainerStyle={styles.grid}>
            {Array.from({ length: totalQuestions }, (_, i) => {
              const answer = answers.find((a) => a.questionIndex === i);
              const s = questionState(answer, i === currentIndex);
              return (
                <Pressable
                  accessibilityRole="button"
                  key={i}
                  onPress={() => {
                    onNavigate(i);
                    onClose();
                  }}
                  style={[
                    styles.cell,
                    { backgroundColor: s.bg, borderColor: s.border },
                  ]}
                >
                  <Text style={[styles.cellText, { color: s.text }]}>
                    {i + 1}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(10,10,10,0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: { color: colors.black, fontSize: 20, fontWeight: '900' },
  close: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  legendItem: { alignItems: 'center', flexDirection: 'row', gap: 5 },
  legendDot: {
    borderRadius: 6,
    borderWidth: 2,
    height: 12,
    width: 12,
  },
  legendLabel: { color: colors.mutedText, fontSize: 11 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  cell: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  cellText: { fontSize: 14, fontWeight: '800' },
});
