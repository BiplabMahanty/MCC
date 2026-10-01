import { Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import roles from '../constants/roles';
import AdminWelcomeScreen from '../features/auth/screens/AdminWelcomeScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import SplashScreen from '../features/auth/screens/SplashScreen';
import UnsupportedRoleScreen from '../features/auth/screens/UnsupportedRoleScreen';
import AdminHomeScreen from '../features/admin/screens/AdminHomeScreen';
import AdminAnalyticsScreen from '../features/admin/screens/AdminAnalyticsScreen';
import AdminMoreScreen from '../features/admin/screens/AdminMoreScreen';
import EntityFormScreen from '../features/admin/screens/EntityFormScreen';
import EntityListScreen from '../features/admin/screens/EntityListScreen';
import PortalCollectionScreen from '../features/portal/screens/PortalCollectionScreen';
import PortalHomeScreen from '../features/portal/screens/PortalHomeScreen';
import StudentHomeScreen from '../features/portal/screens/StudentHomeScreen';
import PortalProfileScreen from '../features/portal/screens/PortalProfileScreen';
import StudentProfileScreen from '../features/portal/screens/StudentProfileScreen';
import StudentBatchScreen from '../features/portal/screens/StudentBatchScreen';
import StudentAttendanceScreen from '../features/portal/screens/StudentAttendanceScreen';
import QuestionBankScreen from '../features/questions/screens/QuestionBankScreen';
import QuestionFormScreen from '../features/questions/screens/QuestionFormScreen';
import QuestionPreviewScreen from '../features/questions/screens/QuestionPreviewScreen';
import ExamListScreen from '../features/exams/screens/ExamListScreen';
import ExamFormScreen from '../features/exams/screens/ExamFormScreen';
import QuestionPickerScreen from '../features/exams/screens/QuestionPickerScreen';
import ExamDetailScreen from '../features/exams/screens/ExamDetailScreen';
import ExamInstructionsScreen from '../features/exams/screens/ExamInstructionsScreen';
import ExamEngineScreen from '../features/exams/screens/ExamEngineScreen';
import ExamResultScreen from '../features/exams/screens/ExamResultScreen';
import StudentResultsScreen from '../features/exams/screens/StudentResultsScreen';
import TeacherExamAnalyticsScreen from '../features/exams/screens/TeacherExamAnalyticsScreen';
import TeacherDetailScreen from '../features/admin/screens/TeacherDetailScreen';
import FeePlanListScreen from '../features/admin/screens/FeePlanListScreen';
import FeePlanFormScreen from '../features/admin/screens/FeePlanFormScreen';
import FeeRecordListScreen from '../features/admin/screens/FeeRecordListScreen';
import StudentFeeScreen from '../features/admin/screens/StudentFeeScreen';
import useAuth from '../hooks/useAuth';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Tab icon component ──────────────────────────────────────────────────────
function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text
        style={{
          fontSize: 10,
          fontWeight: focused ? '800' : '500',
          color: focused ? colors.dashGreenAccent : colors.dashSubText,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ── Admin push screens shared across tabs ──────────────────────────────────
const ADMIN_PUSH_SCREENS = (
  <>
    <Stack.Screen name="AdminEntityList" component={EntityListScreen} />
    <Stack.Screen name="AdminEntityForm" component={EntityFormScreen} />
    <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
    <Stack.Screen name="AdminQuestionBank" component={QuestionBankScreen} initialParams={{ role: 'admin' }} />
    <Stack.Screen name="QuestionForm" component={QuestionFormScreen} />
    <Stack.Screen name="QuestionPreview" component={QuestionPreviewScreen} />
    <Stack.Screen name="AdminExamList" component={ExamListScreen} initialParams={{ role: 'admin' }} />
    <Stack.Screen name="ExamForm" component={ExamFormScreen} />
    <Stack.Screen name="QuestionPicker" component={QuestionPickerScreen} />
    <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
    <Stack.Screen name="TeacherDetail" component={TeacherDetailScreen} />
    <Stack.Screen name="FeePlanList" component={FeePlanListScreen} />
    <Stack.Screen name="FeePlanForm" component={FeePlanFormScreen} />
    <Stack.Screen name="FeeRecordList" component={FeeRecordListScreen} />
    <Stack.Screen name="StudentFee" component={StudentFeeScreen} />
  </>
);

// ── Per-tab stacks ──────────────────────────────────────────────────────────
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      {ADMIN_PUSH_SCREENS}
    </Stack.Navigator>
  );
}

function StudentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AdminStudentList"
        component={EntityListScreen}
        initialParams={{ entityType: 'students' }}
      />
      {ADMIN_PUSH_SCREENS}
    </Stack.Navigator>
  );
}

function TeachersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="AdminTeacherList"
        component={EntityListScreen}
        initialParams={{ entityType: 'teachers' }}
      />
      {ADMIN_PUSH_SCREENS}
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminMore" component={AdminMoreScreen} />
      {ADMIN_PUSH_SCREENS}
    </Stack.Navigator>
  );
}

// ── Admin bottom tab navigator ──────────────────────────────────────────────
function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.dashCard,
          borderTopColor: colors.dashBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
      }}
    >
      <Tab.Screen
        name="TabDashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Dashboard" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="TabStudents"
        component={StudentsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👥" label="Students" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="TabTeachers"
        component={TeachersStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="👨‍🏫" label="Teachers" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="TabMore"
        component={MoreStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="···" label="More" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Root navigator ──────────────────────────────────────────────────────────
export default function RootNavigator() {
  const { initializing, user } = useAuth();

  if (initializing) return <SplashScreen />;

  if (!user) {
    return (
      <Stack.Navigator
        initialRouteName="AdminWelcome"
        screenOptions={{ animation: 'fade', headerShown: false }}
      >
        <Stack.Screen name="AdminWelcome" component={AdminWelcomeScreen} />
        <Stack.Screen
          name="SignIn"
          component={LoginScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    );
  }

  if (user.role === roles.admin) {
    return <AdminTabNavigator />;
  }

  if (user.role === roles.teacher) {
    return (
      <Stack.Navigator key={user.role} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="TeacherHome" component={PortalHomeScreen} initialParams={{ role: 'teacher' }} />
        <Stack.Screen name="TeacherProfile" component={PortalProfileScreen} initialParams={{ role: 'teacher' }} />
        <Stack.Screen name="TeacherBatches" component={PortalCollectionScreen} initialParams={{ role: 'teacher', resource: 'batches', title: 'Assigned batches' }} />
        <Stack.Screen name="TeacherSubjects" component={PortalCollectionScreen} initialParams={{ role: 'teacher', resource: 'subjects', title: 'Assigned subjects' }} />
        <Stack.Screen name="TeacherStudents" component={PortalCollectionScreen} initialParams={{ role: 'teacher', resource: 'students', title: 'Students' }} />
        <Stack.Screen name="TeacherQuestionBank" component={QuestionBankScreen} initialParams={{ role: 'teacher' }} />
        <Stack.Screen name="QuestionPreview" component={QuestionPreviewScreen} />
        <Stack.Screen name="TeacherExamList" component={ExamListScreen} initialParams={{ role: 'teacher' }} />
        <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
        <Stack.Screen name="TeacherExamAnalytics" component={TeacherExamAnalyticsScreen} />
      </Stack.Navigator>
    );
  }

  if (user.role === roles.student) {
    return (
      <Stack.Navigator key={user.role} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
        <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
        <Stack.Screen name="StudentBatch" component={StudentBatchScreen} />
        <Stack.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
        <Stack.Screen name="StudentSubjects" component={PortalCollectionScreen} initialParams={{ role: 'student', resource: 'subjects', title: 'Subjects' }} />
        <Stack.Screen name="StudentTeachers" component={PortalCollectionScreen} initialParams={{ role: 'student', resource: 'teachers', title: 'Teachers' }} />
        <Stack.Screen name="StudentExamList" component={ExamListScreen} initialParams={{ role: 'student' }} />
        <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
        <Stack.Screen name="StudentExamInstructions" component={ExamInstructionsScreen} />
        <Stack.Screen name="StudentExamEngine" component={ExamEngineScreen} />
        <Stack.Screen name="StudentExamResult" component={ExamResultScreen} />
        <Stack.Screen name="ExamInstructions" component={ExamInstructionsScreen} />
        <Stack.Screen name="ExamEngine" component={ExamEngineScreen} />
        <Stack.Screen name="StudentResults" component={StudentResultsScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UnsupportedRole" component={UnsupportedRoleScreen} />
    </Stack.Navigator>
  );
}
