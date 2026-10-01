import { ScrollView, StyleSheet, Text, View, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import useAuth from '../../../hooks/useAuth';
import useAdminDashboard from '../hooks/useAdminDashboard';
import colors from '../../../theme/colors';

const { width: SW } = Dimensions.get('window');

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const STAT_CARDS = [
  { key: 'students', label: 'Total Students', iconBg: colors.iconBgGreen, iconColor: colors.iconGreen, icon: '👥', trend: '+12%' },
  { key: 'teachers', label: 'Total Teachers', iconBg: colors.iconBgBlue, iconColor: colors.iconBlue, icon: '👨‍🏫', trend: '+9%' },
  { key: 'courses', label: 'Total Courses', iconBg: colors.iconBgPurple, iconColor: colors.iconPurple, icon: '📚', trend: '+14%' },
  { key: 'batches', label: 'Total Batches', iconBg: colors.iconBgOrange, iconColor: colors.iconOrange, icon: '📅', trend: '+20%' },
];

const FEE_ITEMS = [
  { label: 'Total Collected', value: '₹2,48,500', trend: '+15%', up: true, iconBg: colors.iconBgGreen, icon: '💰' },
  { label: 'Pending Amount', value: '₹48,200', trend: '-8%', up: false, iconBg: colors.iconBgOrange, icon: '⏳' },
  { label: 'Total Fees', value: '₹2,96,700', trend: '+12%', up: true, iconBg: colors.iconBgPurple, icon: '📄' },
  { label: 'Pending Students', value: '18', trend: '-5%', up: false, iconBg: colors.iconBgPink, icon: '👤' },
];

const TODAY_CLASSES = [
  { subject: 'Mathematics', time: '09:00 AM – 10:00 AM', course: 'Class 10', batch: 'Batch A', status: 'Ongoing', iconBg: colors.iconBgBlue, icon: '🔢' },
  { subject: 'Physics', time: '11:15 AM – 12:15 PM', course: 'Class 10', batch: 'Batch B', status: 'Upcoming', iconBg: colors.iconBgPurple, icon: '⚛️' },
  { subject: 'Chemistry', time: '02:00 PM – 03:00 PM', course: 'Class 12', batch: 'Batch C', status: 'Upcoming', iconBg: colors.iconBgOrange, icon: '🧪' },
];

function StatCard({ item, count, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.statCard, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={[styles.statIconCircle, { backgroundColor: item.iconBg }]}>
        <Text style={styles.statIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.statLabel}>{item.label}</Text>
      <Text style={styles.statCount}>{count ?? '—'}</Text>
      <View style={styles.statTrendRow}>
        <Text style={styles.statTrendUp}>↑ {item.trend}</Text>
        <Text style={styles.statVs}> vs last month</Text>
      </View>
    </Pressable>
  );
}

function FeeCard({ item }) {
  return (
    <View style={styles.feeCard}>
      <View style={[styles.feeIconCircle, { backgroundColor: item.iconBg }]}>
        <Text style={styles.feeIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.feeLabel}>{item.label}</Text>
      <Text style={[styles.feeValue, !item.up && styles.feeValueOrange]}>{item.value}</Text>
      <View style={styles.feeTrendRow}>
        <Text style={[styles.feeTrend, item.up ? styles.trendUp : styles.trendDown]}>
          {item.up ? '↑' : '↓'} {item.trend}
        </Text>
        <Text style={styles.feeVs}> vs last month</Text>
      </View>
    </View>
  );
}

function ClassRow({ item }) {
  const isOngoing = item.status === 'Ongoing';
  return (
    <View style={styles.classRow}>
      <View style={[styles.classIconCircle, { backgroundColor: item.iconBg }]}>
        <Text style={styles.classIcon}>{item.icon}</Text>
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.classSubject}>{item.subject}</Text>
        <Text style={styles.classTime}>{item.time}</Text>
        <Text style={styles.classMeta}>{item.course} • {item.batch}</Text>
      </View>
      <View style={[styles.statusBadge, isOngoing ? styles.badgeOngoing : styles.badgeUpcoming]}>
        <Text style={[styles.statusText, isOngoing ? styles.statusOngoing : styles.statusUpcoming]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.classChevron}>›</Text>
    </View>
  );
}

export default function AdminHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { data, isFetching, error, refetch } = useAdminDashboard();
  const stats = data?.data;

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerTop}>
            <View style={styles.headerBrand}>
              <View style={styles.brandIconCircle}>
              </View>
              <View>
                <Text style={styles.brandName} numberOfLines={1}>{user?.instituteName ?? 'Coaching'}</Text>
                <Text style={styles.brandSub}>Administration Panel</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.bellWrap}>
                <View style={styles.bellBadge}><Text style={styles.bellBadgeText}>3</Text></View>
              </View>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.adminLabel}>{user?.name?.split(' ')[0] ?? 'Admin'} ▾</Text>
            </View>
          </View>

          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] ?? 'Admin'} 👋</Text>
          </View>
          <Text style={styles.greetingSub}>Here's a quick overview of your institute today.</Text>
        </SafeAreaView>
        {/* decorative wave */}
        <View style={styles.waveBump} />
      </View>

      {/* ── SCROLL BODY ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat Cards 2×2 */}
        <View style={styles.statGrid}>
          {STAT_CARDS.map((item) => (
            <StatCard
              key={item.key}
              item={item}
              count={stats?.[item.key]}
              onPress={() => navigation.navigate('AdminEntityList', { entityType: item.key })}
            />
          ))}
        </View>

        {/* Fee Collection + Upcoming Exam */}
        <View style={styles.midRow}>
          {/* Fee Collection */}
          <View style={styles.feeSection}>
            <View style={styles.feeSectionHeader}>
              <Text style={styles.feeSectionIcon}>💳</Text>
              <Text style={styles.feeSectionTitle}>Fee Collection</Text>
              <View style={styles.monthPill}>
                <Text style={styles.monthText}>📅 August 2025 ▾</Text>
              </View>
            </View>
            <View style={styles.feeGrid}>
              {FEE_ITEMS.map((item) => (
                <FeeCard key={item.label} item={item} />
              ))}
            </View>
          </View>

          {/* Upcoming Exam */}
          <View style={styles.examSection}>
            <View style={styles.examSectionHeader}>
              <Text style={styles.examSectionIcon}>📅</Text>
              <Text style={styles.examSectionTitle}>Upcoming Exam</Text>
              <Pressable onPress={() => navigation.navigate('AdminExamList', { role: 'admin' })}>
                <Text style={styles.viewAll}>View All →</Text>
              </Pressable>
            </View>
            <View style={styles.examCard}>
              <View style={styles.examCardIconCircle}>
                <Text style={styles.examCardIcon}>📋</Text>
              </View>
              <View style={styles.examCardInfo}>
                <Text style={styles.examCardSubject}>Mathematics</Text>
                <Text style={styles.examCardMeta}>Class 10  •  Batch A</Text>
                <Text style={styles.examCardDate}>📅  26 Aug 2025  •  10:00 AM</Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.viewExamBtn, pressed && styles.pressed]}
              onPress={() => navigation.navigate('AdminExamList', { role: 'admin' })}
            >
              <Text style={styles.viewExamText}>View Exam  →</Text>
            </Pressable>
          </View>
        </View>

        {/* Today's Classes */}
        <View style={styles.classesSection}>
          <View style={styles.classesSectionHeader}>
            <Text style={styles.classesSectionIcon}>📅</Text>
            <Text style={styles.classesSectionTitle}>Today's Classes</Text>
            <Pressable>
              <Text style={styles.viewAll}>View All →</Text>
            </Pressable>
          </View>
          {TODAY_CLASSES.map((item) => (
            <ClassRow key={item.subject} item={item} />
          ))}
        </View>

        {error ? (
          <Pressable onPress={refetch} style={styles.retryBtn}>
            <Text style={styles.retryText}>{isFetching ? 'Refreshing…' : 'Tap to retry'}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const HEADER_H = 200;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },

  // Header
  header: {
    backgroundColor: colors.dashGreen,
    paddingBottom: 24,
  },
  headerSafe: { paddingHorizontal: 18 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  menuIcon: { fontSize: 20, color: '#fff', marginRight: 2 },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcon: { fontSize: 22 },
  brandName: { color: '#fff', fontSize: 12, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bellWrap: { position: 'relative' },
  bellIcon: { fontSize: 22 },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.dashGreenAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  adminLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  greetingRow: { marginTop: 18 },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  greetingSub: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 4, lineHeight: 18 },
  waveBump: {
    position: 'absolute',
    bottom: -20,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 32 },

  // Stat grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 12,
    width: (SW - 42) / 2,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  pressed: { opacity: 0.7 },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statIcon: { fontSize: 20 },
  statLabel: { fontSize: 12, color: colors.dashSubText, fontWeight: '500' },
  statCount: { fontSize: 26, fontWeight: '900', color: colors.dashText, letterSpacing: -0.5 },
  statTrendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statTrendUp: { fontSize: 12, fontWeight: '700', color: colors.dashUp },
  statVs: { fontSize: 11, color: colors.dashSubText },

  // Mid row
  midRow: { flexDirection: 'row', gap: 10 },

  // Fee section
  feeSection: {
    flex: 1.1,
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  feeSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  feeSectionIcon: { fontSize: 16 },
  feeSectionTitle: { fontSize: 13, fontWeight: '800', color: colors.dashText, flex: 1 },
  monthPill: {
    backgroundColor: colors.dashBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  monthText: { fontSize: 9, color: colors.dashSubText, fontWeight: '600' },
  feeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  feeCard: {
    width: '47%',
    backgroundColor: colors.dashBg,
    borderRadius: 10,
    padding: 8,
    gap: 2,
  },
  feeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  feeIcon: { fontSize: 14 },
  feeLabel: { fontSize: 10, color: colors.dashSubText },
  feeValue: { fontSize: 13, fontWeight: '900', color: colors.dashText },
  feeValueOrange: { color: colors.dashDown },
  feeTrendRow: { flexDirection: 'row', alignItems: 'center' },
  feeTrend: { fontSize: 10, fontWeight: '700' },
  trendUp: { color: colors.dashUp },
  trendDown: { color: colors.dashDown },
  feeVs: { fontSize: 9, color: colors.dashSubText },

  // Exam section
  examSection: {
    flex: 1,
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    gap: 10,
  },
  examSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  examSectionIcon: { fontSize: 14 },
  examSectionTitle: { fontSize: 12, fontWeight: '800', color: colors.dashText, flex: 1 },
  viewAll: { fontSize: 11, fontWeight: '700', color: colors.dashGreenAccent },
  examCard: {
    backgroundColor: colors.dashGreenLight,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  examCardIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.dashCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examCardIcon: { fontSize: 16 },
  examCardInfo: { flex: 1, gap: 2 },
  examCardSubject: { fontSize: 13, fontWeight: '800', color: colors.dashText },
  examCardMeta: { fontSize: 11, color: colors.dashSubText },
  examCardDate: { fontSize: 10, color: colors.dashSubText, marginTop: 4 },
  viewExamBtn: {
    backgroundColor: colors.dashGreen,
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewExamText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Today's Classes
  classesSection: {
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    gap: 12,
  },
  classesSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  classesSectionIcon: { fontSize: 16 },
  classesSectionTitle: { fontSize: 15, fontWeight: '800', color: colors.dashText, flex: 1 },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: colors.dashBorder,
  },
  classIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classIcon: { fontSize: 18 },
  classInfo: { flex: 1, gap: 1 },
  classSubject: { fontSize: 13, fontWeight: '800', color: colors.dashText },
  classTime: { fontSize: 11, color: colors.dashSubText },
  classMeta: { fontSize: 11, color: colors.dashSubText },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeOngoing: { backgroundColor: '#DCFCE7' },
  badgeUpcoming: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusOngoing: { color: colors.dashUp },
  statusUpcoming: { color: colors.dashSubText },
  classChevron: { fontSize: 20, color: colors.dashSubText },

  // Retry
  retryBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.dashGreenLight,
    borderRadius: 10,
  },
  retryText: { color: colors.dashGreen, fontWeight: '700', fontSize: 13 },
});
