import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

export default function EntityListItem({ item, subtitle, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.title}>
            {item.name}
          </Text>
          <View style={[styles.badge, !item.isActive && styles.badgeInactive]}>
            <Text
              style={[
                styles.badgeText,
                !item.isActive && styles.badgeTextInactive,
              ]}
            >
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.subtitle}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onEdit}
          style={styles.actionButton}
        >
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onDelete}
          style={styles.actionButton}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    marginBottom: 12,
    padding: 16,
  },
  content: {
    gap: 7,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.black,
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  badge: {
    backgroundColor: colors.successSurface,
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  badgeInactive: {
    backgroundColor: colors.warningSurface,
  },
  badgeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextInactive: {
    color: colors.warning,
  },
  actions: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 18,
    paddingTop: 12,
  },
  actionButton: {
    paddingVertical: 3,
  },
  editText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  deleteText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '800',
  },
});
