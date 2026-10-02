import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAuth from '../../../hooks/useAuth';
import { apiRequest } from '../../../services/apiClient';
import colors from '../../../theme/colors';

const { width: SW } = Dimensions.get('window');
const SLIDER_W = SW - 32;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDue(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isPastDue(dateStr) {
  return dateStr && new Date(dateStr) < new Date();
}

// ── Compact stat chip ────────────────────────────────────────────────────────
function StatChip({ icon, label, value, iconBg, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.chip, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <View style={[styles.chipIcon, { backgroundColor: iconBg }]}>
        <Text style={styles.chipIconText}>{icon}</Text>
      </View>
      <Text style={styles.chipValue} numberOfLines={1}>{value ?? '—'}</Text>
      <Text style={styles.chipLabel} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

// ── Assignment slide card ────────────────────────────────────────────────────
function AssignmentCard({ item }) {
  const submitted = !!item.submission;
  const overdue = !submitted && isPastDue(item.dueAt);
  return (
    <View style={[styles.slideCard, { width: SLIDER_W }]}>
      <View style={styles.slideCardTop}>
        <View style={[styles.slideIconCircle, { backgroundColor: colors.iconBgOrange }]}>
          <Text style={{ fontSize: 18 }}>📝</Text>
        </View>
        <View style={styles.slideCardMeta}>
          <Text style={styles.slideCardTitle} numberOfLines={2}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.slideCardDesc} numberOfLines={1}>{item.description}</Text>
          ) : null}
        </View>
        <View style={[styles.statusBadge, submitted ? styles.badgeDone : overdue ? styles.badgeOverdue : styles.badgePending]}>
          <Text style={[styles.statusText, submitted ? styles.statusDone : overdue ? styles.statusOverdue : styles.statusPending]}>
            {submitted ? 'Submitted' : overdue ? 'Overdue' : 'Pending'}
          </Text>
        </View>
      </View>
      <View style={styles.slideCardFooter}>
        <Text style={styles.dueText}>📅 Due: {formatDue(item.dueAt)}</Text>
        {item.attachments?.length > 0 && (
          <Text style={styles.attachText}>📎 {item.attachments.length} file{item.attachments.length > 1 ? 's' : ''}</Text>
        )}
      </View>
    </View>
  );
}

// ── Material slide card ──────────────────────────────────────────────────────
function MaterialCard({ item }) {
  const mime = item.file?.mimeType ?? '';
  const icon = mime.includes('pdf') ? '📄' : mime.includes('image') ? '🖼️' : mime.includes('video') ? '🎬' : '📁';
  return (
    <Pressable
      style={({ pressed }) => [styles.matCard, pressed && { opacity: 0.7 }]}
      onPress={() => item.file?.url && Linking.openURL(item.file.url)}
    >
      <View style={[styles.matIconCircle, { backgroundColor: colors.iconBgBlue }]}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={styles.matTitle} numberOfLines={2}>{item.title}</Text>
      {item.description ? (
        <Text style={styles.matDesc} numberOfLines={1}>{item.description}</Text>
      ) : null}
      <Text style={styles.matOpen}>Open →</Text>
    </Pressable>
  );
}

// ── Quick action button ──────────────────────────────────────────────────────
function QuickAction({ icon, label, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.qaCard, pressed && { opacity: 0.7 }]} onPress={onPress}>
      <Text style={styles.qaIcon}>{icon}</Text>
      <Text style={styles.qaLabel}>{label}</Text>
    </Pressable>
  );
}

// ── Dot indicators ───────────────────────────────────────────────────────────
function Dots({ count, active }) {
  if (count <= 1) return null;
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
      ))}
    </View>
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, onViewAll }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll && (
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>View All →</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function StudentHomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const dashQuery = useQuery({
    queryKey: ['portal', 'student', 'dashboard'],
    queryFn: ({ signal }) => apiRequest('/student/dashboard', { auth: true, signal }),
    staleTime: 30_000,
  });

  const learningQuery = useQuery({
    queryKey: ['portal', 'student', 'learning'],
    queryFn: ({ signal }) => apiRequest('/student/learning', { auth: true, signal }),
    staleTime: 30_000,
  });

  const dash = dashQuery.data?.data;
  const assignments = learningQuery.data?.data?.assignments ?? [];
  const materials = learningQuery.data?.data?.materials ?? [];

  const isRefreshing = dashQuery.isRefetching || learningQuery.isRefetching;

  function onRefresh() {
    dashQuery.refetch();
    learningQuery.refetch();
  }

  // Slider dot tracking
  const [assignIdx, setAssignIdx] = useState(0);
  const assignRef = useRef(null);

  const STAT_CHIPS = [
    {
      key: 'batch',
      icon: '📅',
      label: 'My Batch',
      value: dash?.batch?.name ?? 'None',
      iconBg: colors.iconBgOrange,
      route: 'StudentBatch',
    },
    {
      key: 'subjects',
      icon: '📚',
      label: 'Subjects',
      value: dash?.subjects ?? 0,
      iconBg: colors.iconBgPurple,
      route: 'StudentSubjects',
    },
    {
      key: 'teachers',
      icon: '👨🏫',
      label: 'Teachers',
      value: dash?.teachers ?? 0,
      iconBg: colors.iconBgBlue,
      route: 'StudentTeachers',
    },
    {
      key: 'exams',
      icon: '📋',
      label: 'Exams',
      value: 'View',
      iconBg: colors.iconBgGreen,
      route: 'StudentExamList',
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerTop}>
            <Text style={styles.menuIcon}>☰</Text>
            <View style={styles.headerBrand}>
              <View style={styles.brandIconCircle}>
                <Text style={{ fontSize: 22 }}>🎓</Text>
              </View>
              <View>
                <Text style={styles.brandName} numberOfLines={1}>{user?.instituteName ?? 'Coaching'}</Text>
                <Text style={styles.brandSub}>Student Portal</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.nameLabel}>{user?.name?.split(' ')[0] ?? 'Student'} ▾</Text>
            </View>
          </View>
          <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] ?? 'Student'} 👋</Text>
          <Text style={styles.greetingSub}>Here's your learning overview today.</Text>
        </SafeAreaView>
        <View style={styles.waveBump} />
      </View>

      {/* ── SCROLL BODY ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.dashGreen]} />}
      >
        {/* ── Stat chips horizontal scroll ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {STAT_CHIPS.map((chip) => (
            <StatChip
              key={chip.key}
              icon={chip.icon}
              label={chip.label}
              value={chip.value}
              iconBg={chip.iconBg}
              onPress={() => navigation.navigate(chip.route)}
            />
          ))}
        </ScrollView>

        {/* ── Active Assignments slider ── */}
        <View style={styles.section}>
          <SectionHeader icon="📝" title="Active Assignments" />
          {learningQuery.isPending ? (
            <View style={styles.emptyCard}><Text style={styles.emptyText}>Loading…</Text></View>
          ) : assignments.length === 0 ? (
            <View style={styles.emptyCard}><Text style={styles.emptyText}>No active assignments</Text></View>
          ) : (
            <>
              <ScrollView
                ref={assignRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / SLIDER_W);
                  setAssignIdx(idx);
                }}
                scrollEventThrottle={16}
              >
                {assignments.map((item) => (
                  <AssignmentCard key={item._id} item={item} />
                ))}
              </ScrollView>
              <Dots count={assignments.length} active={assignIdx} />
            </>
          )}
        </View>

        {/* ── Study Materials horizontal scroll ── */}
        <View style={styles.section}>
          <SectionHeader icon="📂" title="Study Materials" />
          {learningQuery.isPending ? (
            <View style={styles.emptyCard}><Text style={styles.emptyText}>Loading…</Text></View>
          ) : materials.length === 0 ? (
            <View style={styles.emptyCard}><Text style={styles.emptyText}>No materials uploaded yet</Text></View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matRow}>
              {materials.map((item) => (
                <MaterialCard key={item._id} item={item} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── My Batch info card ── */}
        {dash?.batch ? (
          <View style={styles.section}>
            <SectionHeader icon="🏫" title="My Batch" />
            <View style={styles.batchCard}>
              <View style={[styles.batchIconCircle, { backgroundColor: colors.iconBgGreen }]}>
                <Text style={{ fontSize: 20 }}>📅</Text>
              </View>
              <View style={styles.batchInfo}>
                <Text style={styles.batchName}>{dash.batch.name}</Text>
                <Text style={styles.batchCode}>{dash.batch.code}</Text>
              </View>
              <Pressable
                style={({ pressed }) => [styles.batchBtn, pressed && { opacity: 0.7 }]}
                onPress={() => navigation.navigate('StudentBatch')}
              >
                <Text style={styles.batchBtnText}>Details →</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <SectionHeader icon="⚡" title="Quick Actions" />
          <View style={styles.qaRow}>
            <QuickAction icon="👤" label="Profile" onPress={() => navigation.navigate('StudentProfile')} />
            <QuickAction icon="📊" label="Results" onPress={() => navigation.navigate('StudentResults')} />
            <QuickAction icon="📅" label="Schedule" onPress={() => navigation.navigate('StudentSchedule')} />
            <QuickAction icon="📋" label="Attendance" onPress={() => navigation.navigate('StudentAttendance')} />
            <QuickAction icon="🚪" label="Sign Out" onPress={logout} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },

  // Header
  header: { backgroundColor: colors.dashGreen, paddingBottom: 20 },
  headerSafe: { paddingHorizontal: 18 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  menuIcon: { fontSize: 20, color: '#fff', marginRight: 2 },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandIconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  brandName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.dashGreenAccent,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  nameLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: -0.3, marginTop: 16 },
  greetingSub: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 4 },
  waveBump: {
    position: 'absolute', bottom: -18, right: -28,
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 36 },

  // Stat chips
  chipsRow: { gap: 10, paddingRight: 4 },
  chip: {
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 10,
    width: 110,
    alignItems: 'center',
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  chipIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  chipIconText: { fontSize: 16 },
  chipValue: { fontSize: 13, fontWeight: '900', color: colors.dashText, textAlign: 'center' },
  chipLabel: { fontSize: 10, color: colors.dashSubText, fontWeight: '500', textAlign: 'center' },

  // Section
  section: {
    backgroundColor: colors.dashCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 14,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.dashText, flex: 1 },
  viewAll: { fontSize: 11, fontWeight: '700', color: colors.dashGreenAccent },

  // Empty
  emptyCard: {
    backgroundColor: colors.dashBg,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: { fontSize: 13, color: colors.dashSubText },

  // Assignment slide card
  slideCard: {
    backgroundColor: colors.dashBg,
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  slideCardTop: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  slideIconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  slideCardMeta: { flex: 1, gap: 2 },
  slideCardTitle: { fontSize: 14, fontWeight: '800', color: colors.dashText },
  slideCardDesc: { fontSize: 12, color: colors.dashSubText },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeDone: { backgroundColor: '#DCFCE7' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeOverdue: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusDone: { color: colors.dashUp },
  statusPending: { color: '#D97706' },
  statusOverdue: { color: '#DC2626' },
  slideCardFooter: { flexDirection: 'row', gap: 12 },
  dueText: { fontSize: 12, color: colors.dashSubText },
  attachText: { fontSize: 12, color: colors.dashSubText },

  // Dots
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dashBorder },
  dotActive: { backgroundColor: colors.dashGreen, width: 18 },

  // Material cards
  matRow: { gap: 10, paddingRight: 4 },
  matCard: {
    backgroundColor: colors.dashBg,
    borderRadius: 12,
    padding: 12,
    width: 130,
    gap: 6,
  },
  matIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  matTitle: { fontSize: 12, fontWeight: '800', color: colors.dashText },
  matDesc: { fontSize: 11, color: colors.dashSubText },
  matOpen: { fontSize: 11, fontWeight: '700', color: colors.dashGreenAccent, marginTop: 'auto' },

  // Batch card
  batchCard: {
    backgroundColor: colors.dashGreenLight,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  batchIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  batchInfo: { flex: 1, gap: 2 },
  batchName: { fontSize: 14, fontWeight: '800', color: colors.dashText },
  batchCode: { fontSize: 12, color: colors.dashSubText },
  batchBtn: {
    backgroundColor: colors.dashGreen,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  batchBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Quick actions
  qaRow: { flexDirection: 'row', gap: 8 },
  qaCard: {
    flex: 1,
    backgroundColor: colors.dashBg,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.dashBorder,
  },
  qaIcon: { fontSize: 22 },
  qaLabel: { fontSize: 11, fontWeight: '700', color: colors.dashText },
});
