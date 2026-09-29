import { StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';
import FormulaRenderer from './FormulaRenderer';
import ImageBlock from './ImageBlock';
import TableBlock from './TableBlock';

export function ContentRenderer({ blocks }) {
  return (
    <View style={styles.blocks}>
      {blocks.map((block, index) => {
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

export default function QuestionRenderer({ question, showAnswer = false }) {
  return (
    <View style={styles.container}>
      <ContentRenderer blocks={question.content} />
      <View style={styles.options}>
        {question.options.map((option, index) => {
          const correct = showAnswer && question.correctOptionIndex === index;
          return (
            <View
              key={option._id || `option-${index}`}
              style={[styles.option, correct && styles.correct]}
            >
              <Text style={styles.optionLabel}>
                {String.fromCharCode(65 + index)}
              </Text>
              <View style={styles.optionContent}>
                <ContentRenderer blocks={option.content} />
              </View>
            </View>
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
  optionLabel: { color: colors.primary, fontSize: 15, fontWeight: '900' },
  optionContent: { flex: 1 },
});
