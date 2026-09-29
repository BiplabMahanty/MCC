import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAuth from '../../../hooks/useAuth';
import AuthBackground from '../../auth/components/AuthBackground';
import DashboardCard from '../components/DashboardCard';
import useAdminDashboard from '../hooks/useAdminDashboard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const palette = {
  mint: '#5BE99E',
  text: '#F9FBFA',
  secondary: '#C3D3D0',
  link: '#4CEFA4',
  errorBg: 'rgba(169, 18, 36, 0.22)',
  errorBorder: 'rgba(255, 185, 192, 0.35)',
  errorText: '#FFD4D8',
  sectionDivider: 'rgba(255,255,255,0.08)',
  actionBg: 'rgba(91, 233, 158, 0.13)',
  actionBorder: 'rgba(91, 233, 158, 0.28)',
};

const SLIDES = [
  {
    title: 'Welcome back!',
    body: 'Ready to manage your institute today.',
    accent: '#5BE99E',
  },
  {
    title: 'Everything in one place.',
    body: 'Students · Teachers · Courses · Batches',
    accent: '#3DD68C',
  },
  {
    title: 'Learn · Grow · Succeed',
    body: 'Mahapatra Coaching Center',
    accent: '#2BC97A',
  },
];

const CARD_SECTIONS = [
  { key: 'students', label: 'Students' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'courses', label: 'Courses' },
  { key: 'batches', label: 'Batches' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'questions', label: 'Questions', route: 'AdminQuestionBank' },
];

function GraduationCap() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={styles.cap}
    >
      <View style={styles.capTop} />
      <View style={styles.capBand} />
      <View style={styles.tasselStem} />
      <View style={styles.tassel} />
    </View>
  );
}

function SliderDots({ count, active }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[styles.dot, i === active && styles.dotActive]}
        />
      ))}
    </View>
  );
}

function ActionButton({ label, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]}
    >
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

export default function AdminHomeScreen({ navigation }) {
  const { logout, user } = useAuth();
  const { data, error, isFetching, isPending, refetch } = useAdminDashboard();
  const stats = data?.data;

  const [slideIndex, setSlideIndex] = useState(0);
  const sliderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSlideIndex((prev) => {
        const next = (prev + 1) % SLIDES.length;
        sliderRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(timerRef.current);
  }, []);

  function handleSliderScroll(e) {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== slideIndex) {
      setSlideIndex(index);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSlideIndex((prev) => {
          const next = (prev + 1) % SLIDES.length;
          sliderRef.current?.scrollTo({ x: next * SCREEN_WIDTH, animated: true });
          return next;
        });
      }, 3000);
    }
  }

  function confirmLogout() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout },
      ],
    );
  }

  return (
    <AuthBackground>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <SafeAreaView edges={['top', 'right', 'bottom', 'left']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── HEADER ── */}
          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Sign out"
              accessibilityRole="button"
              onPress={confirmLogout}
              style={({ pressed }) => [styles.logoBtn, pressed && styles.logoBtnPressed]}
            >
              <GraduationCap />
            </Pressable>
            <View style={styles.headerCenter}>
              <Text style={styles.headerName}>{user?.name}</Text>
              <Text style={styles.headerRole}>Admin · Mahapatra Coaching</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* ── SLIDER ── */}
          <View style={styles.sliderWrapper}>
            <ScrollView
              ref={sliderRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleSliderScroll}
              scrollEventThrottle={16}
            >
              {SLIDES.map((slide, i) => (
                <View key={i} style={styles.slide}>
                  <View style={[styles.slideAccent, { backgroundColor: slide.accent }]} />
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideBody}>{slide.body}</Text>
                </View>
              ))}
            </ScrollView>
            <SliderDots count={SLIDES.length} active={slideIndex} />
          </View>

          {/* ── OVERVIEW ── */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.sectionMeta}>
              {isPending ? 'Loading…' : isFetching ? 'Refreshing…' : 'Live totals'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error.message}</Text>
              <Pressable onPress={refetch} style={styles.retryBtn}>
                <Text style={styles.retryText}>Try again</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.grid}>
            {CARD_SECTIONS.map((section) => (
              <DashboardCard
                key={section.key}
                count={stats?.[section.key]}
                label={section.label}
                onPress={() =>
                  section.route
                    ? navigation.navigate(section.route)
                    : navigation.navigate('AdminEntityList', { entityType: section.key })
                }
              />
            ))}
          </View>

          {/* ── QUICK ACTIONS ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              label="Analytics"
              onPress={() => navigation.navigate('AdminAnalytics')}
            />
            <ActionButton
              label="Question Bank"
              onPress={() => navigation.navigate('AdminQuestionBank')}
            />
            <ActionButton
              label="Exams"
              onPress={() => navigation.navigate('AdminExamList', { role: 'admin' })}
            />
            <ActionButton
              label="Refresh"
              onPress={refetch}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    gap: 20,
    paddingBottom: 36,
    paddingHorizontal: 20,
    paddingTop: 14,
  },

  // Header
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  logoBtn: {
    padding: 4,
  },
  logoBtnPressed: {
    opacity: 0.6,
  },
  cap: {
    height: 46,
    position: 'relative',
    width: 56,
  },
  capTop: {
    backgroundColor: palette.mint,
    borderRadius: 3,
    height: 30,
    left: 13,
    position: 'absolute',
    top: 0,
    transform: [{ rotate: '45deg' }, { scaleY: 0.54 }],
    width: 30,
  },
  capBand: {
    backgroundColor: palette.mint,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    height: 12,
    left: 14,
    position: 'absolute',
    top: 24,
    width: 28,
  },
  tasselStem: {
    backgroundColor: palette.mint,
    borderRadius: 2,
    height: 18,
    position: 'absolute',
    right: 7,
    top: 15,
    transform: [{ rotate: '-8deg' }],
    width: 2.5,
  },
  tassel: {
    backgroundColor: palette.mint,
    borderRadius: 4,
    height: 6,
    position: 'absolute',
    right: 5,
    top: 31,
    width: 5,
  },
  headerCenter: { flex: 1 },
  headerName: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerRole: {
    color: palette.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: 'rgba(91,233,158,0.18)',
    borderColor: 'rgba(91,233,158,0.35)',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: palette.mint,
    fontSize: 18,
    fontWeight: '900',
  },

  // Slider
  sliderWrapper: {
    borderColor: 'rgba(91, 233, 158, 0.22)',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  slide: {
    experimental_backgroundImage: [
      {
        type: 'linear-gradient',
        direction: '145deg',
        colorStops: [
          { color: 'rgba(255, 255, 255, 0.97)', positions: ['0%'] },
          { color: 'rgba(232, 248, 241, 0.95)', positions: ['55%'] },
          { color: 'rgba(210, 242, 228, 0.92)', positions: ['100%'] },
        ],
      },
    ],
    backgroundColor: 'rgba(232, 248, 241, 0.95)',
    paddingBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    width: SCREEN_WIDTH - 40,
  },
  slideAccent: {
    borderRadius: 2,
    height: 3,
    marginBottom: 10,
    opacity: 0.9,
    width: 24,
  },
  slideTitle: {
    color: '#0D2B20',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  slideBody: {
    color: '#3A6B55',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  dotsRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(232, 248, 241, 0.88)',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 9,
  },
  dot: {
    backgroundColor: 'rgba(10, 122, 69, 0.25)',
    borderRadius: 4,
    height: 6,
    width: 6,
  },
  dotActive: {
    backgroundColor: '#0A7A45',
    width: 18,
  },

  // Section
  sectionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sectionMeta: {
    color: palette.secondary,
    fontSize: 12,
  },

  // Error
  errorBox: {
    backgroundColor: palette.errorBg,
    borderColor: palette.errorBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    padding: 14,
  },
  errorText: {
    color: palette.errorText,
    fontSize: 13,
    lineHeight: 18,
  },
  retryBtn: { alignSelf: 'flex-start' },
  retryText: {
    color: palette.link,
    fontSize: 13,
    fontWeight: '700',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  // Divider
  divider: {
    backgroundColor: palette.sectionDivider,
    height: 1,
  },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    experimental_backgroundImage: [
      {
        type: 'linear-gradient',
        direction: '145deg',
        colorStops: [
          { color: 'rgba(255, 255, 255, 0.97)', positions: ['0%'] },
          { color: 'rgba(232, 248, 241, 0.95)', positions: ['55%'] },
          { color: 'rgba(210, 242, 228, 0.92)', positions: ['100%'] },
        ],
      },
    ],
    backgroundColor: 'rgba(232, 248, 241, 0.95)',
    borderColor: 'rgba(91, 233, 158, 0.25)',
    borderRadius: 13,
    borderWidth: 1,
    flexBasis: '44%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnPressed: {
    opacity: 0.65,
  },
  actionBtnText: {
    color: '#0A7A45',
    fontSize: 13,
    fontWeight: '700',
  },
});
