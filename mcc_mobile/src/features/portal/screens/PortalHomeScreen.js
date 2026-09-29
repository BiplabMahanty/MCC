import { StatusBar } from 'expo-status-bar';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppButton from '../../../components/common/AppButton';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import useAuth from '../../../hooks/useAuth';
import colors from '../../../theme/colors';
import PortalHeader from '../components/PortalHeader';
import SummaryCard from '../components/SummaryCard';
import usePortalQuery from '../hooks/usePortalQuery';

const teacherSections = [
  { key: 'batches', label: 'Assigned batches', route: 'TeacherBatches' },
  { key: 'subjects', label: 'Assigned subjects', route: 'TeacherSubjects' },
  { key: 'students', label: 'Students', route: 'TeacherStudents' },
  { key: 'questions', label: 'Question bank', route: 'TeacherQuestionBank' },
  { key: 'exams', label: 'Exams', route: 'TeacherExamList' },
];

const studentSections = [
  { key: 'batch', label: 'My batch', route: 'StudentBatch' },
  { key: 'subjects', label: 'Subjects', route: 'StudentSubjects' },
  { key: 'teachers', label: 'Teachers', route: 'StudentTeachers' },
  { key: 'exams', label: 'Exams', route: 'StudentExamList' },
  { key: 'attendance', label: 'Attendance', route: 'StudentAttendance' },
];

export default function PortalHomeScreen({ navigation, route }) {
  const { role } = route.params;
  const { logout, user } = useAuth();
  const query = usePortalQuery(role, 'dashboard');
  const data = query.data?.data;
  const isTeacher = role === 'teacher';
  const sections = isTeacher ? teacherSections : studentSections;

  function valueFor(key) {
    if (key === 'batch') {
      return data?.batch?.name || 'Unassigned';
    }
    return data?.[key] ?? 0;
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={query.refetch}
            refreshing={query.isRefetching}
          />
        }
      >
        <PortalHeader
          subtitle={`Your ${isTeacher ? 'teaching' : 'learning'} workspace`}
          title={`Hello, ${user?.name}`}
        />

        {query.isPending ? <Loader message="Loading dashboard..." /> : null}
        {query.error ? (
          <ErrorState
            message={query.error.message}
            onRetry={query.refetch}
            retrying={query.isFetching}
          />
        ) : null}

        {data ? (
          <>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.grid}>
              {sections.map((section) => (
                <SummaryCard
                  key={section.key}
                  label={section.label}
                  onPress={() => navigation.navigate(section.route)}
                  value={valueFor(section.key)}
                />
              ))}
              <SummaryCard
                label="My profile"
                onPress={() =>
                  navigation.navigate(
                    isTeacher ? 'TeacherProfile' : 'StudentProfile',
                  )
                }
                value={user?.name?.charAt(0).toUpperCase() || 'Me'}
              />
              {!isTeacher ? (
                <SummaryCard
                  label="My results"
                  onPress={() => navigation.navigate('StudentResults')}
                  value="View"
                />
              ) : null}
            </View>
          </>
        ) : null}

        <AppButton label="Sign out" onPress={logout} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 22, paddingBottom: 20 },
  sectionTitle: { color: colors.black, fontSize: 20, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
});
