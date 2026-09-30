import { Pressable, StyleSheet, Text, View } from 'react-native';

import useAuth from '../../../hooks/useAuth';
import colors from '../../../theme/colors';

export default function TeacherFormHeader({ editing, onBack }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A';

  return (
    <View style={styles.header}>
      <View style={styles.headerSafe}>
        <View style={styles.headerTop}>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={styles.backBtn}
          >
            <Text style={styles.menuIcon}>{'\u2190'}</Text>
          </Pressable>
          <View style={styles.headerBrand}>
            <View style={styles.brandIconCircle}>
              <Text style={styles.brandIcon}>{'\ud83c\udf93'}</Text>
            </View>
            <View style={styles.brandCopy}>
              <Text numberOfLines={1} style={styles.brandName}>
                {user?.instituteName ?? 'Coaching'}
              </Text>
              <Text numberOfLines={1} style={styles.brandSub}>
                Management System
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <Text numberOfLines={1} style={styles.adminLabel}>
              {firstName} {'\u25be'}
            </Text>
          </View>
        </View>
        <View style={styles.greetingRow}>
          <View style={styles.titleLine}>
            <View style={styles.teacherIconCircle}>
              <Text style={styles.teacherIcon}>
                {'\ud83d\udc68\u200d\ud83c\udfeb'}
              </Text>
            </View>
            <View style={styles.titleCopy}>
              <Text style={styles.greeting}>
                {editing ? 'Edit Teacher' : 'Add Teacher'}
              </Text>
              <Text style={styles.greetingSub}>
                {editing
                  ? 'Update teacher details'
                  : 'Fill in the details below'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.waveBump} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.dashGreen,
    overflow: 'hidden',
    paddingBottom: 24,
  },
  headerSafe: { paddingHorizontal: 18, width: '100%' },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  backBtn: { alignItems: 'flex-start', justifyContent: 'center', width: 28 },
  menuIcon: { color: colors.white, fontSize: 22, fontWeight: '700' },
  headerBrand: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  brandIconCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  brandIcon: { fontSize: 22 },
  brandCopy: { flex: 1, minWidth: 0 },
  brandName: { color: colors.white, fontSize: 15, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 10 },
  headerRight: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 6,
    maxWidth: 86,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: colors.dashGreenAccent,
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  avatarText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  adminLabel: {
    color: colors.white,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  greetingRow: { gap: 8, marginTop: 18, zIndex: 1 },
  titleLine: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  teacherIconCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  teacherIcon: { fontSize: 21 },
  titleCopy: { flex: 1, minWidth: 0 },
  greeting: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  greetingSub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 1,
  },
  waveBump: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 80,
    bottom: -20,
    height: 160,
    position: 'absolute',
    right: -30,
    width: 160,
  },
});
