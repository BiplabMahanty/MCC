import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import PortalHeader from '../../portal/components/PortalHeader';
import { usePortalSchedule } from '../hooks/useSchedule';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SLOT_COLORS = [
  colors.iconBgBlue,
  colors.iconBgPurple,
  colors.iconBgOrange,
  colors.iconBgGreen,
  colors.iconBgPink,
  colors.iconBgTeal,
];

function slotColor(index) {
  return SLOT_COLORS[index % SLOT_COLORS.length];
}

function DayPill({ label, selected, isToday, onPress }) {
  return (
    <Pressable
      style={[
        styles.dayPill,
        selected && styles.dayPillSelected,
        isToday && !selected && styles.dayPillToday,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.dayPillText,
          selected && styles.dayPillTextSelected,
          isToday && !selected && styles.dayPillTextToday,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SlotCard({ item, index }) {
  const subject = item.subjectId?.name ?? '—';
  const batch = item.batchId?.name ?? null;
  const teacher = item.teacherId?.name ?? null;

  return (
    <View style={styles.slotCard}>
      <View style={[styles.slotAccent, { backgroundColor: slotColor(index) }]} />
      <View style={styles.slotBody}>
        <Text style={styles.slotTime}>{item.startTime} – {item.endTime}</Text>
        <Text style={styles.slotSubject}>{subject}</Text>
        <View style={styles.slotMetaRow}>
          {batch ? <Text style={styles.slotMeta}>{batch}</Text> : null}
          {batch && item.room ? <Text style={styles.slotDot}>·</Text> : null}
          {item.room ? <Text style={styles.slotMeta}>{item.room}</Text> : null}
        </View>
        {teacher ? <Text style={styles.slotTeacher}>👨🏫 {teacher}</Text> : null}
      </View>
    </View>
  );
}

function DaySection({ dayIndex, slots }) {
  if (!slots.length) return null;
  return (
    <View style={styles.daySection}>
      <Text style={styles.daySectionTitle}>{DAYS[dayIndex]}</Text>
      {slots.map((slot, i) => (
        <SlotCard key={slot._id} item={slot} index={i} />
      ))}
    </View>
  );
}

export default function ScheduleScreen({ navigation, route }) {
  const role = route.params?.role ?? 'teacher';
  const todayIndex = new Date().getDay();
  const [selectedDay, setSelectedDay] = useState(todayIndex);

  const query = usePortalSchedule(role);
  const allSlots = query.data?.data ?? [];

  const slotsByDay = useMemo(() => {
    const map = {};
    allSlots.forEach((slot) => {
      const d = slot.dayOfWeek;
      if (!map[d]) map[d] = [];
      map[d].push(slot);
    });
    return map;
  }, [allSlots]);

  // Days that have at least one slot
  const activeDays = useMemo(
    () => Object.keys(slotsByDay).map(Number).sort((a, b) => a - b),
    [slotsByDay],
  );

  const visibleSlots = slotsByDay[selectedDay] ?? [];

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <PortalHeader
          title="My Schedule"
          subtitle="Your weekly class timetable."
          onBack={navigation.goBack}
        />

        {/* Day pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillRow}
        >
          {DAYS_SHORT.map((d, i) => (
            <DayPill
              key={d}
              label={d}
              selected={selectedDay === i}
              isToday={i === todayIndex}
              onPress={() => setSelectedDay(i)}
            />
          ))}
        </ScrollView>

        {/* Content */}
        {query.isPending ? (
          <Loader message="Loading schedule…" />
        ) : query.error ? (
          <ErrorState
            message={query.error.message}
            onRetry={query.refetch}
            retrying={query.isFetching}
          />
        ) : (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={query.isRefetching}
                onRefresh={query.refetch}
                colors={[colors.dashGreen]}
              />
            }
          >
            {visibleSlots.length === 0 ? (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayIcon}>📭</Text>
                <Text style={styles.emptyDayText}>No classes on {DAYS[selectedDay]}</Text>
              </View>
            ) : (
              <DaySection dayIndex={selectedDay} slots={visibleSlots} />
            )}

            {/* Week overview — other days with slots */}
            {activeDays.filter((d) => d !== selectedDay).length > 0 ? (
              <View style={styles.weekSection}>
                <Text style={styles.weekSectionTitle}>Rest of the week</Text>
                {activeDays
                  .filter((d) => d !== selectedDay)
                  .map((d) => (
                    <Pressable
                      key={d}
                      style={({ pressed }) => [styles.weekRow, pressed && { opacity: 0.6 }]}
                      onPress={() => setSelectedDay(d)}
                    >
                      <Text style={styles.weekRowDay}>{DAYS[d]}</Text>
                      <Text style={styles.weekRowCount}>
                        {slotsByDay[d].length} class{slotsByDay[d].length > 1 ? 'es' : ''}
                      </Text>
                      <Text style={styles.weekRowChevron}>›</Text>
                    </Pressable>
                  ))}
              </View>
            ) : null}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  scroll: { flex: 1 },
  scrollContent: { gap: 16, paddingBottom: 28 },

  pillRow: { gap: 8, paddingRight: 4 },
  dayPill: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  dayPillSelected: { backgroundColor: colors.dashGreen, borderColor: colors.dashGreen },
  dayPillToday: { borderColor: colors.dashGreen },
  dayPillText: { fontSize: 13, fontWeight: '700', color: colors.mutedText },
  dayPillTextSelected: { color: colors.white },
  dayPillTextToday: { color: colors.dashGreen },

  daySection: { gap: 10 },
  daySectionTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.dashText,
    letterSpacing: -0.3,
  },

  slotCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  slotAccent: { width: 5 },
  slotBody: { flex: 1, padding: 14, gap: 3 },
  slotTime: { fontSize: 13, fontWeight: '800', color: colors.dashGreen },
  slotSubject: { fontSize: 16, fontWeight: '900', color: colors.black },
  slotMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  slotMeta: { fontSize: 13, color: colors.mutedText },
  slotDot: { fontSize: 13, color: colors.mutedText },
  slotTeacher: { fontSize: 12, color: colors.mutedText, marginTop: 4 },

  emptyDay: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 40,
    gap: 10,
  },
  emptyDayIcon: { fontSize: 36 },
  emptyDayText: { fontSize: 15, color: colors.mutedText, fontWeight: '600' },

  weekSection: {
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  weekSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.mutedText,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  weekRowDay: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.black },
  weekRowCount: { fontSize: 13, color: colors.mutedText, marginRight: 8 },
  weekRowChevron: { fontSize: 20, color: colors.mutedText },
});
