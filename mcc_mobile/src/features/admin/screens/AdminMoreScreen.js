import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import useAuth from '../../../hooks/useAuth';
import colors from '../../../theme/colors';

const ITEMS = [
  { label: 'Courses', icon: '📚', route: 'AdminEntityList', params: { entityType: 'courses' } },
  { label: 'Batches', icon: '📅', route: 'AdminEntityList', params: { entityType: 'batches' } },
  { label: 'Subjects', icon: '📖', route: 'AdminEntityList', params: { entityType: 'subjects' } },
  { label: 'Question Bank', icon: '❓', route: 'AdminQuestionBank', params: { role: 'admin' } },
  { label: 'Exams', icon: '📝', route: 'AdminExamList', params: { role: 'admin' } },
  { label: 'Schedule', icon: '🗓️', route: 'ScheduleList', params: {} },
  { label: 'Fee Plans', icon: '💳', route: 'FeePlanList', params: {} },
  { label: 'Analytics', icon: '📊', route: 'AdminAnalytics', params: {} },
];

export default function AdminMoreScreen({ navigation }) {
  const { logout, user } = useAuth();

  function confirmLogout() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>More</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileRole}>Administrator</Text>
          </View>
        </View>

        <View style={styles.list}>
          {ITEMS.map((item) => (
            <Pressable
              key={item.label}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => navigation.navigate(item.route, item.params)}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>{item.icon}</Text>
                <Text style={styles.rowLabel}>{item.label}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOutBtn, pressed && styles.rowPressed]}
          onPress={confirmLogout}
        >
          <Text style={styles.signOutIcon}>🚪</Text>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dashBg },
  content: { padding: 20, gap: 20, paddingBottom: 36 },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.dashText,
    letterSpacing: -0.5,
  },
  profileCard: {
    backgroundColor: colors.dashCard,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.dashGreenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '900', color: colors.dashGreen },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '800', color: colors.dashText },
  profileRole: { fontSize: 13, color: colors.dashSubText, marginTop: 2 },
  list: {
    backgroundColor: colors.dashCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.dashBorder,
  },
  rowPressed: { opacity: 0.6 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { fontSize: 20 },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.dashText },
  chevron: { fontSize: 22, color: colors.dashSubText, fontWeight: '300' },
  signOutBtn: {
    backgroundColor: colors.dashCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  signOutIcon: { fontSize: 20 },
  signOutText: { fontSize: 15, fontWeight: '700', color: '#DC2626' },
});
