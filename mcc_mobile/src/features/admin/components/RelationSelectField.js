import { useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

function optionLabel(option) {
  const code = option.code || option.employeeCode;
  return code ? `${option.name} (${code})` : option.name;
}

export default function RelationSelectField({
  label,
  value,
  options,
  error,
  multiple = false,
  allowClear = false,
  onChange,
}) {
  const [visible, setVisible] = useState(false);
  const selectedIds = multiple ? value : value ? [value] : [];
  const selected = options.filter((option) => selectedIds.includes(option._id));
  const displayValue = selected.length
    ? selected.map(optionLabel).join(', ')
    : `Select ${label.toLowerCase()}`;

  function select(optionId) {
    if (!multiple) {
      onChange(optionId);
      setVisible(false);
      return;
    }

    onChange(
      selectedIds.includes(optionId)
        ? selectedIds.filter((id) => id !== optionId)
        : [...selectedIds, optionId],
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setVisible(true)}
        style={[styles.selector, error && styles.selectorError]}
      >
        <Text
          numberOfLines={2}
          style={selected.length ? styles.value : styles.placeholder}
        >
          {displayValue}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal
        animationType="slide"
        onRequestClose={() => setVisible(false)}
        transparent
        visible={visible}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setVisible(false)}
              >
                <Text style={styles.close}>{multiple ? 'Done' : 'Close'}</Text>
              </Pressable>
            </View>
            {allowClear && !multiple && selectedIds.length ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onChange('');
                  setVisible(false);
                }}
                style={styles.clearRow}
              >
                <Text style={styles.clearText}>Clear selection</Text>
              </Pressable>
            ) : null}
            <FlashList
              data={options}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              keyExtractor={(item) => item._id}
              ListEmptyComponent={
                <Text style={styles.empty}>No active options available.</Text>
              }
              renderItem={({ item }) => {
                const isSelected = selectedIds.includes(item._id);
                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => select(item._id)}
                    style={styles.optionRow}
                  >
                    <Text style={styles.optionName}>{optionLabel(item)}</Text>
                    {multiple ? (
                      <Text
                        style={[
                          styles.selection,
                          isSelected && styles.selectionSelected,
                        ]}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 7 },
  label: { color: colors.darkNeutral, fontSize: 14, fontWeight: '700' },
  selector: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 14,
  },
  selectorError: { borderColor: colors.error },
  value: { color: colors.black, fontSize: 15 },
  placeholder: { color: colors.mutedText, fontSize: 15 },
  error: { color: colors.error, fontSize: 12 },
  backdrop: {
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    height: '60%',
    padding: 20,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sheetTitle: { color: colors.black, fontSize: 20, fontWeight: '900' },
  close: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  separator: { backgroundColor: colors.border, height: 1 },
  clearRow: { paddingBottom: 14 },
  clearText: { color: colors.error, fontSize: 14, fontWeight: '700' },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  optionName: { color: colors.black, flex: 1, fontSize: 15, fontWeight: '700' },
  selection: { color: colors.mutedText, fontSize: 12, fontWeight: '700' },
  selectionSelected: { color: colors.primary },
  empty: { color: colors.mutedText, paddingVertical: 24, textAlign: 'center' },
});
