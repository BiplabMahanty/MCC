import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

export default function TeacherListItem({ item, onEdit, onDelete, onPress }) {
  const initials = item.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.identityRow}>
          {item.profileImage?.url ? (
            <Image
              accessibilityLabel={item.name}
              source={{ uri: item.profileImage.url }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>{initials || 'T'}</Text>
            </View>
          )}
          <View style={styles.identity}>
            <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
            <Text numberOfLines={1} style={styles.email}>{item.email}</Text>
          </View>
        </View>
        <View style={[styles.badge, !item.isActive && styles.badgeInactive]}>
          <Text style={[styles.badgeText, !item.isActive && styles.badgeTextInactive]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <Text style={styles.detail}><Text style={styles.detailLabel}>ID  </Text>{item.employeeCode || '—'}</Text>
        <Text style={styles.detail}><Text style={styles.detailLabel}>Experience  </Text>{item.experienceYears ?? 0} yrs</Text>
      </View>

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={onEdit} style={styles.actionButton}>
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onDelete} style={styles.actionButton}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
        <Text style={styles.viewText}>View Details →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.dashBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    marginBottom: 12,
    padding: 16,
  },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  identityRow: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 11 },
  avatar: {
    borderRadius: 22,
    height: 44,
    width: 44,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: colors.iconBgBlue,
    justifyContent: 'center',
  },
  avatarText: { color: colors.iconBlue, fontSize: 14, fontWeight: '900' },
  identity: { flex: 1, gap: 3 },
  name: { color: colors.dashText, fontSize: 16, fontWeight: '900' },
  email: { color: colors.dashSubText, fontSize: 12 },
  badge: { backgroundColor: colors.successSurface, borderRadius: 14, paddingHorizontal: 9, paddingVertical: 5 },
  badgeInactive: { backgroundColor: colors.warningSurface },
  badgeText: { color: colors.success, fontSize: 11, fontWeight: '800' },
  badgeTextInactive: { color: colors.warning },
  detailsRow: { backgroundColor: colors.dashBg, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 11, paddingVertical: 9 },
  detail: { color: colors.dashText, fontSize: 12, fontWeight: '700' },
  detailLabel: { color: colors.dashSubText, fontWeight: '600' },
  actions: { borderTopColor: colors.dashBorder, borderTopWidth: 1, flexDirection: 'row', gap: 18, paddingTop: 12 },
  actionButton: { paddingVertical: 3 },
  editText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
  deleteText: { color: colors.error, fontSize: 13, fontWeight: '800' },
  viewText: { color: colors.dashGreen, fontSize: 13, fontWeight: '800', marginLeft: 'auto' },
});
