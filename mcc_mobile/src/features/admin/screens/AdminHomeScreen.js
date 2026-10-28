import { ScrollView, StyleSheet, Text, View, Pressable, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import useAuth from '../../../hooks/useAuth';
import { useAdminDashboardHome } from '../hooks/useAdminDashboard';
import colors from '../../../theme/colors';

const { width: SW } = Dimensions.get('window');

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatTime(hhmm) {
  if (!hhmm) return '';
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '—';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatExamDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    '  •  ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  );
}

const STAT_CARDS = [
  { key: 'students', label: 'Total Students', iconBg: colors.iconBgGreen, icon: '👥' },
  { key: 'teachers', label: 'Total Teachers', iconBg: colors.iconBgBlue, icon: '👨🏫' },
  { key: 'courses',  label: 'Total Courses',  iconBg: colors.iconBgPurple, icon: '📚' },
  { key: 'batches',  label: 'Total Batches',  iconBg: colors.iconBgOrange, icon: '📅' },
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
    </Pressable>
  );
}

function FeeCard({ icon, iconBg, label, value, valueStyle }) {
  return (
    <View style={styles.feeCard}>
      <View style={[styles.feeIconCircle, { backgroundColor: iconBg }]}>
        <Text style={styles.feeIcon}>{icon}</Text>
      </View>
      <Text style={styles.feeLabel}>{label}</Text>
      <Text style={[styles.feeValue, valueStyle]}>{value}</Text>
    </View>
  );
}

function ClassRow({ item }) {
  const now = new Date();
  const [sh, sm] = item.startTime.split(':').map(Number);
  const [eh, em] = item.endTime.split(':').map(Number);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isOngoing = nowMin >= sh * 60 + sm && nowMin < eh * 60 + em;

  return (
    <View style={styles.classRow}>
      <View style={[styles.classIconCircle, { backgroundColor: colors.iconBgBlue }]}>
        <Text style={styles.classIcon}>📖</Text>
      </View>
      <View style={styles.classInfo}>
        <Text style={styles.classSubject}>{item.subject}</Text>
        <Text style={styles.classTime}>{formatTime(item.startTime)} – {formatTime(item.endTime)}</Text>
        <Text style={styles.classMeta}>{item.batch}{item.room ? `  •  ${item.room}` : ''}</Text>
      </View>
      <View style={[styles.statusBadge, isOngoing ? styles.badgeOngoing : styles.badgeUpcoming]}>
        <Text style={[styles.statusText, isOngoing ? styles.statusOngoing : styles.statusUpcoming]}>
          {isOngoing ? 'Ongoing' : 'Upcoming'}
        </Text>
      </View>
    </View>
  );
}

export default function AdminHomeScreen({ navigation }) {
  const { user } = useAuth();
  const { data, isFetching, error, refetch } = useAdminDashboardHome();
  const home = data?.data;
  const stats = home?.stats;
  const fee = home?.feeSummary;
  const classes = home?.todayClasses ?? [];
  const exam = home?.upcomingExam;
  const unread = home?.unreadNotifications ?? 0;

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerTop}>
            <View style={styles.headerBrand}>
              <View style={styles.brandIconCircle} />
              <View>
                <Text style={styles.brandName} numberOfLines={1}>{user?.instituteName ?? 'Coaching'}</Text>
                <Text style={styles.brandSub}>Administration Panel</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              {unread > 0 && (
                <View style={styles.bellWrap}>
                  <View style={styles.bellBadge}>
                    <Text style={styles.bellBadgeText}>{unread > 99 ? '99+' : unread}</Text>
                  </View>
                </View>
              )}
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
        <View style={styles.waveBump} />
      </View>

      {/* ── SCROLL BODY ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} />
        }
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
                <Text style={styles.monthText}>📅 {currentMonth}</Text>
              </View>
            </View>
            <View style={styles.feeGrid}>
              <FeeCard icon="💰" iconBg={colors.iconBgGreen}  label="Total Collected"  value={formatCurrency(fee?.totalCollected)} />
              <FeeCard icon="⏳" iconBg={colors.iconBgOrange} label="Pending Amount"   value={formatCurrency(fee?.pendingAmount)}  valueStyle={styles.feeValueOrange} />
              <FeeCard icon="📄" iconBg={colors.iconBgPurple} label="Total Fees"       value={formatCurrency(fee?.totalFees)} />
              <FeeCard icon="👤" iconBg={colors.iconBgPink}   label="Pending Students" value={fee?.pendingStudents ?? '—'}          valueStyle={styles.feeValueOrange} />
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
            {exam ? (
              <View style={styles.examCard}>
                <View style={styles.examCardIconCircle}>
                  <Text style={styles.examCardIcon}>📋</Text>
                </View>
                <View style={styles.examCardInfo}>
                  <Text style={styles.examCardSubject}>{exam.subject}</Text>
                  <Text style={styles.examCardMeta}>{exam.name}  •  {exam.batch}</Text>
                  <Text style={styles.examCardDate}>📅  {formatExamDate(exam.startTime)}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.emptyText}>No upcoming exams.</Text>
            )}
            <Pressable
              style={({ pressed }) => [styles.viewExamBtn, pressed && styles.pressed]}
              onPress={() => navigation.navigate('AdminExamList', { role: 'admin' })}
            >
              <Text style={styles.viewExamText}>View Exams  →</Text>
            </Pressable>
          </View>
        </View>

        {/* Today's Classes */}
        <View style={styles.classesSection}>
          <View style={styles.classesSectionHeader}>
            <Text style={styles.classesSectionIcon}>📅</Text>
            <Text style={styles.classesSectionTitle}>Today's Classes</Text>
          </View>
          {classes.length === 0 ? (
            <Text style={styles.emptyText}>No classes scheduled for today.</Text>
          ) : (
            classes.map((item, i) => <ClassRow key={i} item={item} />)
          )}
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
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { color: '#fff', fontSize: 12, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bellWrap: { position: 'relative' },
  bellBadge: {
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

  emptyText: { fontSize: 12, color: colors.dashSubText, fontStyle: 'italic' },

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
