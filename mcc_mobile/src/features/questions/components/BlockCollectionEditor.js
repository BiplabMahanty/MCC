import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';
import ContentBlockEditor from './ContentBlockEditor';

const defaults = {
  text: { type: 'text', value: '' },
  formula: { type: 'formula', value: '' },
  image: {
    type: 'image',
    url: '',
    storageKey: '',
    alt: '',
    mimeType: 'image/jpeg',
  },
  table: { type: 'table', caption: '', headers: [''], rows: [['']] },
};

export default function BlockCollectionEditor({
  blocks,
  onChange,
  allowTable = true,
}) {
  const blockTypes = allowTable
    ? ['text', 'formula', 'image', 'table']
    : ['text', 'formula', 'image'];

  function updateBlock(index, block) {
    onChange(
      blocks.map((current, currentIndex) =>
        currentIndex === index ? block : current,
      ),
    );
  }

  return (
    <View style={styles.container}>
      {blocks.map((block, index) => (
        <ContentBlockEditor
          block={block}
          key={`${block.type}-${index}`}
          onChange={(next) => updateBlock(index, next)}
          onRemove={() =>
            onChange(blocks.filter((_, currentIndex) => currentIndex !== index))
          }
        />
      ))}
      <View style={styles.actions}>
        {blockTypes.map((type) => (
          <Pressable
            accessibilityRole="button"
            key={type}
            onPress={() => onChange([...blocks, { ...defaults[type] }])}
            style={styles.addButton}
          >
            <Text style={styles.addText}>+ {type}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addButton: {
    backgroundColor: colors.darkNeutral,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addText: { color: colors.white, fontSize: 12, fontWeight: '800' },
});
