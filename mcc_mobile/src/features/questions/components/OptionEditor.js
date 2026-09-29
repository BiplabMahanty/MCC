import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';
import BlockCollectionEditor from './BlockCollectionEditor';

export default function OptionEditor({
  index,
  option,
  correct,
  canRemove,
  onChange,
  onCorrect,
  onRemove,
}) {
  return (
    <View style={[styles.card, correct && styles.cardCorrect]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Option {String.fromCharCode(65 + index)}
        </Text>
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="radio" onPress={onCorrect}>
            <Text style={[styles.correct, correct && styles.correctSelected]}>
              {correct ? 'Correct answer' : 'Mark correct'}
            </Text>
          </Pressable>
          {canRemove ? (
            <Pressable accessibilityRole="button" onPress={onRemove}>
              <Text style={styles.remove}>Remove</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <BlockCollectionEditor
        allowTable={false}
        blocks={option.content}
        onChange={(content) => onChange({ content })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 14,
  },
  cardCorrect: { borderColor: colors.success, borderWidth: 2 },
  header: { gap: 10 },
  title: { color: colors.black, fontSize: 16, fontWeight: '900' },
  headerActions: { flexDirection: 'row', gap: 18 },
  correct: { color: colors.mutedText, fontSize: 12, fontWeight: '800' },
  correctSelected: { color: colors.success },
  remove: { color: colors.error, fontSize: 12, fontWeight: '800' },
});
