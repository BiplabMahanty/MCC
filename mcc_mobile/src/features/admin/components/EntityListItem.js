import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

function Avatar({ name, profileImage }) {
  const initials = name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (profileImage?.url) {
    return (
      <Image
        accessibilityLabel={name}
        source={{ uri: profileImage.url }}
        style={styles.avatar}
      />
    );
  }

  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarText}>{initials || '?'}</Text>
    </View>
  );
}

export default function EntityListItem({ item, subtitle, onEdit, onDelete }) {
  const showAvatar = Boolean(item.profileImage || item.studentCode || item.employeeCode);

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          {showAvatar ? (
            <Avatar name={item.name} profileImage={item.profileImage} />
          ) : null}
          <View style={styles.titleBlock}>
            <Text numberOfLines={1} style={styles.title}>
              {item.name}
            </Text>
            <Text numberOfLines={2} style={styles.subtitle}>
              {subtitle}
            </Text>
          </View>
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
  },
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: colors.lightNeutral,
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '800',
  },
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: colors.black,
    fontSize: 16,
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
