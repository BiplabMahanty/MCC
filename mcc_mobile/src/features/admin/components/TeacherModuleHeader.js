import { Pressable, StyleSheet, Text, View } from 'react-native';

import useAuth from '../../../hooks/useAuth';
import colors from '../../../theme/colors';

export default function TeacherModuleHeader({ totalCount, onAdd }) {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'A';

  return (
    <View style={styles.header}>
      <View style={styles.headerSafe}>
        <View style={styles.headerTop}>
          <Text style={styles.menuIcon}>☰</Text>
          <View style={styles.headerBrand}>
            <View style={styles.brandIconCircle}><Text style={styles.brandIcon}>🎓</Text></View>
            <View><Text style={styles.brandName} numberOfLines={1}>{user?.instituteName ?? 'Coaching'}</Text><Text style={styles.brandSub}>Management System</Text></View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.avatarCircle}><Text style={styles.avatarText}>{initial}</Text></View>
            <Text style={styles.adminLabel}>{firstName} ▾</Text>
          </View>
        </View>
        <View style={styles.greetingRow}>
          <View style={styles.titleLine}>
            <View style={styles.teacherIconCircle}><Text style={styles.teacherIcon}>👨</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Teachers</Text>
              <Text style={styles.greetingSub}>Manage your teaching staff</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={onAdd} style={styles.addButton}>
              <Text style={styles.addIcon}>＋</Text>
              <Text style={styles.addText}>Add Teacher</Text>
            </Pressable>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryValue}>{totalCount ?? '—'}</Text>
            <Text style={styles.summaryLabel}> total teachers</Text>
          </View>
        </View>
      </View>
      <View style={styles.waveBump} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.dashGreen, marginHorizontal: -20, marginTop: -24, paddingBottom: 24 },
  headerSafe: { paddingHorizontal: 18 },
  headerTop: { alignItems: 'center', flexDirection: 'row', gap: 10, marginTop: 8 },
  menuIcon: { color: colors.white, fontSize: 20, marginRight: 2 },
  headerBrand: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 10 },
  brandIconCircle: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 22, height: 44, justifyContent: 'center', width: 44 },
  brandIcon: { fontSize: 22 },
  brandName: { color: colors.white, fontSize: 16, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  headerRight: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  avatarCircle: { alignItems: 'center', backgroundColor: colors.dashGreenAccent, borderRadius: 17, height: 34, justifyContent: 'center', width: 34 },
  avatarText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  adminLabel: { color: colors.white, fontSize: 13, fontWeight: '700' },
  greetingRow: { gap: 8, marginTop: 18, zIndex: 1 },
  titleLine: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  teacherIconCircle: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  teacherIcon: { fontSize: 21 },
  greeting: { color: colors.white, fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  greetingSub: { color: 'rgba(255,255,255,0.78)', fontSize: 12, lineHeight: 17, marginTop: 1 },
  summaryRow: { alignItems: 'baseline', flexDirection: 'row', marginLeft: 50 },
  summaryValue: { color: colors.white, fontSize: 18, fontWeight: '900' },
  summaryLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 12, fontWeight: '600' },
  addButton: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderColor: 'rgba(255,255,255,0.35)', borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 4, paddingHorizontal: 10, paddingVertical: 7 },
  addIcon: { color: colors.white, fontSize: 13, fontWeight: '900', lineHeight: 15 },
  addText: { color: colors.white, fontSize: 12, fontWeight: '800' },
  waveBump: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 80, bottom: -20, height: 160, position: 'absolute', right: -30, width: 160 },
});
