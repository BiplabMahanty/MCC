import { useQuery } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAuth from '../../../hooks/useAuth';
import { apiRequest } from '../../../services/apiClient';
import colors from '../../../theme/colors';
import TeacherSidebar from '../components/TeacherSidebar';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// ── Compact stat chip ────────────────────────────────────────────────────────
function StatChip({ label, value, iconBg, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed, hovered }) => [
        styles.chip,
        { borderTopColor: iconBg },
        hovered && styles.cardHovered,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.chipMarker, { backgroundColor: iconBg }]} />
      <Text style={styles.chipValue} numberOfLines={1}>
        {value ?? ' '}
      </Text>
      <Text style={styles.chipLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

// ── Quick action button ──────────────────────────────────────────────────────
function QuickAction({ label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed, hovered }) => [
        styles.qaCard,
        hovered && styles.cardHovered,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.qaLabel}>{label}</Text>
    </Pressable>
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onViewAll }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionMarker} />
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll && (
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>View All →</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Info card ────────────────────────────────────────────────────────────────
function InfoCard({ title, subtitle, icon, onPress }) {
  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.infoCard,
        hovered && styles.cardHovered,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.infoCardTop}>
        <View style={[styles.infoIconCircle, { backgroundColor: colors.iconBgBlue }]}>
          <Text style={{ fontSize: 20 }}>{icon}</Text>
        </View>
        <View style={styles.infoCardMeta}>
          <Text style={styles.infoCardTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.infoCardDesc} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      <Text style={styles.infoCardArrow}>→</Text>
    </Pressable>
  );
}

export default function TeacherHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const dashQuery = useQuery({
    queryKey: ['portal', 'teacher', 'dashboard'],
    queryFn: ({ signal }) =>
      apiRequest('/teacher/dashboard', { auth: true, signal }),
    staleTime: 30_000,
  });

  const dash = dashQuery.data?.data;
  const isRefreshing = dashQuery.isRefetching;

  function onRefresh() {
    dashQuery.refetch();
  }

  const STAT_CHIPS = [
    {
      key: 'batches',
      label: 'Batches',
      value: dash?.batches ?? 0,
      iconBg: colors.iconBgOrange,
      route: 'TeacherBatches',
    },
    {
      key: 'subjects',
      label: 'Subjects',
      value: dash?.subjects ?? 0,
      iconBg: colors.iconBgPurple,
      route: 'TeacherSubjects',
    },
    {
      key: 'students',
      label: 'Students',
      value: dash?.students ?? 0,
      iconBg: colors.iconBgBlue,
      route: 'TeacherStudents',
    },
    {
      key: 'exams',
      label: 'Exams',
      value: 'View',
      iconBg: colors.iconBgGreen,
      route: 'TeacherExamList',
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <TeacherSidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        onLogout={logout}
        navigation={navigation}
        user={user}
        currentRoute="TeacherHome"
      />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.headerSafe}>
          <View style={styles.headerTop}>
            <Pressable
              accessibilityLabel="Open navigation menu"
              onPress={() => setSidebarVisible(true)}
              style={({ pressed, hovered }) => [
                styles.menuButton,
                hovered && styles.menuButtonHovered,
                pressed && styles.menuButtonPressed,
              ]}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </Pressable>
            <View style={styles.headerBrand}>
              <View>
                <Text style={styles.brandName} numberOfLines={1}>
                  {user?.instituteName ?? 'Coaching'}
                </Text>
                <Text style={styles.brandSub}>Teacher Portal</Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile menu"
              onPress={() => setSidebarVisible(true)}
              style={({ pressed, hovered }) => [
                styles.headerRight,
                hovered && styles.profileButtonHovered,
                pressed && styles.profileButtonPressed,
              ]}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.nameLabel}>
                {user?.name?.split(' ')[0] ?? 'Teacher'} ▾
              </Text>
            </Pressable>
          </View>
          <Text style={styles.greeting}>
            {getGreeting()}, {user?.name?.split(' ')[0] ?? 'Teacher'} 👋
          </Text>
          <Text style={styles.greetingSub}>
            Here's your teaching overview today.
          </Text>
        </SafeAreaView>
        <View style={styles.waveBump} />
      </View>

      {/* ── SCROLL BODY ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.dashGreen]}
          />
        }
      >
        {/* ── Stat chips horizontal scroll ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {STAT_CHIPS.map((chip) => (
            <StatChip
              key={chip.key}
              label={chip.label}
              value={chip.value}
              iconBg={chip.iconBg}
              onPress={() => navigation.navigate(chip.route)}
            />
          ))}
        </ScrollView>

        {/* ── Teaching Overview ── */}
        {dashQuery.isPending ? (
          <View style={styles.section}>
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : dash ? (
          <>
            {/* ── Assigned Batches ── */}
            <View style={styles.section}>
              <SectionHeader
                title="Assigned Batches"
                onViewAll={() => navigation.navigate('TeacherBatches')}
              />
              {dash.batches > 0 ? (
                <View style={styles.infoCardsContainer}>
                  <InfoCard
                    icon="📅"
                    title={`${dash.batches} Batch${dash.batches !== 1 ? 'es' : ''}`}
                    subtitle="View your assigned batches"
                    onPress={() => navigation.navigate('TeacherBatches')}
                  />
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No batches assigned yet</Text>
                </View>
              )}
            </View>

            {/* ── Assigned Subjects ── */}
            <View style={styles.section}>
              <SectionHeader
                title="Assigned Subjects"
                onViewAll={() => navigation.navigate('TeacherSubjects')}
              />
              {dash.subjects > 0 ? (
                <View style={styles.infoCardsContainer}>
                  <InfoCard
                    icon="📚"
                    title={`${dash.subjects} Subject${dash.subjects !== 1 ? 's' : ''}`}
                    subtitle="View your assigned subjects"
                    onPress={() => navigation.navigate('TeacherSubjects')}
                  />
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No subjects assigned yet</Text>
                </View>
              )}
            </View>

            {/* ── Students Overview ── */}
            <View style={styles.section}>
              <SectionHeader
                title="Students"
                onViewAll={() => navigation.navigate('TeacherStudents')}
              />
              {dash.students > 0 ? (
                <View style={styles.infoCardsContainer}>
                  <InfoCard
                    icon="👥"
                    title={`${dash.students} Student${dash.students !== 1 ? 's' : ''}`}
                    subtitle="View all your students"
                    onPress={() => navigation.navigate('TeacherStudents')}
                  />
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No students assigned yet</Text>
                </View>
              )}
            </View>
          </>
        ) : null}

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" />
          <View style={styles.qaRow}>
            <QuickAction
              label="My Batches"
              onPress={() => navigation.navigate('TeacherBatches')}
            />
            <QuickAction
              label="My Subjects"
              onPress={() => navigation.navigate('TeacherSubjects')}
            />
            <QuickAction
              label="Students"
              onPress={() => navigation.navigate('TeacherStudents')}
            />
            <QuickAction
              label="Assignments"
              onPress={() => navigation.navigate('TeacherAssignments')}
            />
            <QuickAction
              label="Materials"
              onPress={() => navigation.navigate('TeacherMaterials')}
            />
            <QuickAction
              label="Questions"
              onPress={() => navigation.navigate('TeacherQuestionBank')}
            />
            <QuickAction
              label="Exams"
              onPress={() => navigation.navigate('TeacherExamList')}
            />
            <QuickAction
              label="Schedule"
              onPress={() => navigation.navigate('TeacherSchedule')}
            />
          </View>
        </View>

        {/* ── Profile & More ── */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <View style={styles.infoCardsContainer}>
            <InfoCard
              icon="👤"
              title="My Profile"
              subtitle="View and edit your profile"
              onPress={() => navigation.navigate('TeacherProfile')}
            />
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  menuButtonHovered: { backgroundColor: 'rgba(255,255,255,0.14)' },
  menuButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    transform: [{ scale: 0.95 }],
  },
  menuIcon: { fontSize: 21, color: '#fff' },
  headerBrand: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  brandName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileButtonHovered: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 22,
  },
  profileButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    transform: [{ scale: 0.97 }],
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.dashGreenAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  nameLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  greeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 16,
  },
  greetingSub: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 4 },
  waveBump: {
    position: 'absolute',
    bottom: -18,
    right: -28,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 18, paddingBottom: 40 },

  // Stat chips
  chipsRow: { gap: 10, paddingRight: 4 },
  chip: {
    backgroundColor: colors.dashCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    borderTopWidth: 3,
    padding: 12,
    width: 124,
    alignItems: 'center',
    gap: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.dashText,
    textAlign: 'center',
  },
  chipLabel: {
    fontSize: 10,
    color: colors.dashSubText,
    fontWeight: '500',
    textAlign: 'center',
  },
  chipMarker: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },

  // Section
  section: {
    backgroundColor: colors.dashCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 16,
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionMarker: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.dashGreenAccent,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.dashText,
    flex: 1,
  },
  viewAll: { fontSize: 11, fontWeight: '700', color: colors.dashGreenAccent },

  // Empty
  emptyCard: {
    backgroundColor: colors.dashBg,
    borderRadius: 10,
    paddingVertical: 26,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dashBorder,
  },
  emptyText: { fontSize: 13, color: colors.dashSubText },
  loadingText: { fontSize: 13, color: colors.dashSubText, textAlign: 'center' },

  // Info cards
  infoCardsContainer: { gap: 10 },
  infoCard: {
    backgroundColor: colors.dashBg,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.dashBorder,
  },
  infoCardTop: { flexDirection: 'row', gap: 10, alignItems: 'center', flex: 1 },
  infoIconCircle: { display: 'none' },
  infoCardMeta: { flex: 1, gap: 2 },
  infoCardTitle: { fontSize: 14, fontWeight: '800', color: colors.dashText },
  infoCardDesc: { fontSize: 12, color: colors.dashSubText },
  infoCardArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.dashGreenAccent,
  },

  // Quick actions
  qaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  qaCard: {
    flexGrow: 1,
    flexBasis: 96,
    minWidth: 96,
    backgroundColor: colors.dashBg,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    minHeight: 56,
  },
  qaLabel: { fontSize: 11, fontWeight: '700', color: colors.dashText },
  cardHovered: {
    borderColor: colors.dashGreenAccent,
    backgroundColor: colors.dashGreenLight,
  },
  cardPressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
