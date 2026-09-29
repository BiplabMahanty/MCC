import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import usePortalQuery from '../hooks/usePortalQuery';

export default function StudentAttendanceScreen() {
  const query = usePortalQuery('student', 'attendance');
  const data = query.data?.data;

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MY ATTENDANCE</Text>
        <Text style={styles.title}>Attendance record</Text>
        {query.isPending ? <Loader message="Loading attendance…" /> : null}
        {query.error ? <ErrorState message={query.error.message} onRetry={query.refetch} /> : null}
        {data ? (
          <>
            <View style={styles.hero}>
              <Text style={styles.percent}>{data.summary.percentage}%</Text>
              <Text style={styles.heroText}>{data.summary.present} present of {data.summary.total} marked days</Text>
            </View>
            {data.records.map((record) => (
              <View key={record._id} style={styles.row}>
                <Text style={styles.date}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
                <Text style={styles.status}>{record.status || 'Not marked'}</Text>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 28 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.black, fontSize: 27, fontWeight: '900' },
  hero: { alignItems: 'center', backgroundColor: colors.black, borderRadius: 16, gap: 5, padding: 24 },
  percent: { color: colors.primary, fontSize: 36, fontWeight: '900' },
  heroText: { color: colors.white, fontSize: 13 },
  row: { alignItems: 'center', backgroundColor: colors.white, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 15 },
  date: { color: colors.black, fontWeight: '700' },
  status: { color: colors.primary, fontWeight: '800', textTransform: 'capitalize' },
});
