import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';
import FormulaRenderer from './FormulaRenderer';
import ImageBlock from './ImageBlock';
import TableBlock from './TableBlock';

export function ContentRenderer({ blocks }) {
  return (
    <View style={styles.blocks}>
      {(Array.isArray(blocks) ? blocks : []).map((block, index) => {
        if (block.type === 'formula') {
          return (
            <FormulaRenderer key={`formula-${index}`} value={block.value} />
          );
        }
        if (block.type === 'image') {
          return <ImageBlock block={block} key={`image-${index}`} />;
        }
        if (block.type === 'table') {
          return <TableBlock block={block} key={`table-${index}`} />;
        }
        return (
          <Text key={`text-${index}`} style={styles.text}>
            {block.value}
          </Text>
        );
      })}
    </View>
  );
}

export default function QuestionRenderer({
  question,
  showAnswer = false,
  selectedOptionIndex = null,
  onSelectOption,
}) {
  if (!question) return null;

  const options = Array.isArray(question.options) ? question.options : [];

  return (
    <View style={styles.container}>
      <ContentRenderer blocks={question.content} />
      <View style={styles.options}>
        {options.map((option, index) => {
          const correct = showAnswer && question.correctOptionIndex === index;
          const selected = selectedOptionIndex === index;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={option?._id || `option-${index}`}
              onPress={() => onSelectOption?.(index)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.selected,
                correct && styles.correct,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optionLabel, selected && styles.selectedLabel]}>
                {String.fromCharCode(65 + index)}
              </Text>
              <View style={styles.optionContent}>
                <ContentRenderer blocks={option?.content} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20 },
  blocks: { gap: 12 },
  text: { color: colors.black, fontSize: 16, lineHeight: 24 },
  options: { gap: 10 },
  option: {
    alignItems: 'flex-start',
    borderColor: colors.border,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 13,
  },
  correct: {
    backgroundColor: colors.successSurface,
    borderColor: colors.success,
  },
  selected: {
    backgroundColor: '#FFF7ED',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  selectedLabel: { color: colors.primary },
  pressed: { opacity: 0.75 },
  optionLabel: { color: colors.primary, fontSize: 15, fontWeight: '900' },
  optionContent: { flex: 1 },
});
