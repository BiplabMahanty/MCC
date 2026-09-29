import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import AppInput from '../../../components/common/AppInput';
import colors from '../../../theme/colors';
import { uploadQuestionImage } from '../services/questionsApi';
import ImageBlock from './ImageBlock';

function tableText(rows) {
  return (rows || []).map((row) => row.join(' | ')).join('\n');
}

function parseTableRows(value) {
  return value
    .split('\n')
    .filter((row) => row.trim())
    .map((row) => row.split('|').map((cell) => cell.trim()));
}

export default function ContentBlockEditor({ block, onChange, onRemove }) {
  const [uploading, setUploading] = useState(false);

  async function selectImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
      Alert.alert(
        'Image too large',
        'Question images must be 5 MB or smaller.',
      );
      return;
    }

    try {
      setUploading(true);
      onChange(await uploadQuestionImage(asset));
    } catch (error) {
      Alert.alert('Upload failed', error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.type}>{block.type.toUpperCase()}</Text>
        <Pressable accessibilityRole="button" onPress={onRemove}>
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      </View>

      {block.type === 'text' || block.type === 'formula' ? (
        <AppInput
          autoCapitalize="none"
          label={block.type === 'formula' ? 'LaTeX formula' : 'Text'}
          multiline
          onChangeText={(value) => onChange({ ...block, value })}
          placeholder={
            block.type === 'formula' ? String.raw`\frac{a}{b}` : 'Enter content'
          }
          style={styles.multiline}
          value={block.value}
        />
      ) : null}

      {block.type === 'image' ? (
        <View style={styles.imageFields}>
          {block.url ? <ImageBlock block={block} /> : null}
          <AppInput
            label="Alternative text"
            onChangeText={(alt) => onChange({ ...block, alt })}
            placeholder="Describe the diagram or image"
            value={block.alt || ''}
          />
          <Pressable
            accessibilityRole="button"
            disabled={uploading}
            onPress={selectImage}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryText}>
              {uploading
                ? 'Uploading...'
                : block.url
                  ? 'Replace image'
                  : 'Select image'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {block.type === 'table' ? (
        <View style={styles.tableFields}>
          <AppInput
            label="Caption"
            onChangeText={(caption) => onChange({ ...block, caption })}
            value={block.caption || ''}
          />
          <AppInput
            label="Headers (separate with |)"
            onChangeText={(value) =>
              onChange({
                ...block,
                headers: value.split('|').map((cell) => cell.trim()),
              })
            }
            placeholder="Column 1 | Column 2"
            value={(block.headers || []).join(' | ')}
          />
          <AppInput
            label="Rows (one row per line, separate cells with |)"
            multiline
            onChangeText={(value) =>
              onChange({ ...block, rows: parseTableRows(value) })
            }
            placeholder={'A | B\nC | D'}
            style={styles.multiline}
            value={tableText(block.rows)}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  type: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  remove: { color: colors.error, fontSize: 12, fontWeight: '800' },
  multiline: { minHeight: 86, textAlignVertical: 'top' },
  imageFields: { gap: 12 },
  tableFields: { gap: 12 },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    padding: 11,
  },
  secondaryText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
});
