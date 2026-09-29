import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import colors from '../../../theme/colors';

const filters = [
  { label: 'All', value: undefined },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
];

export default function FilterBar({
  search,
  onSearchChange,
  isActive,
  onActiveChange,
  showStatus = true,
}) {
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Search records"
        autoCapitalize="none"
        onChangeText={onSearchChange}
        placeholder="Search…"
        placeholderTextColor={colors.mutedText}
        returnKeyType="search"
        style={styles.search}
        value={search}
      />
      {showStatus ? (
        <View style={styles.filters}>
          {filters.map((filter) => {
            const selected = isActive === filter.value;
            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={filter.label}
                onPress={() => onActiveChange(filter.value)}
                style={[styles.filter, selected && styles.filterSelected]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}
                >
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  search: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.black,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filter: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterSelected: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  filterText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  filterTextSelected: {
    color: colors.white,
  },
});
