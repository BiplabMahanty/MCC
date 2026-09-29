import { createNativeStackNavigator } from '@react-navigation/native-stack';

import roles from '../constants/roles';
import AdminWelcomeScreen from '../features/auth/screens/AdminWelcomeScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import SplashScreen from '../features/auth/screens/SplashScreen';
import UnsupportedRoleScreen from '../features/auth/screens/UnsupportedRoleScreen';
import AdminHomeScreen from '../features/admin/screens/AdminHomeScreen';
import AdminAnalyticsScreen from '../features/admin/screens/AdminAnalyticsScreen';
import EntityFormScreen from '../features/admin/screens/EntityFormScreen';
import EntityListScreen from '../features/admin/screens/EntityListScreen';
import PortalCollectionScreen from '../features/portal/screens/PortalCollectionScreen';
import PortalHomeScreen from '../features/portal/screens/PortalHomeScreen';
import PortalProfileScreen from '../features/portal/screens/PortalProfileScreen';
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
import useAuth from '../hooks/useAuth';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { initializing, user } = useAuth();

  if (initializing) {
    return <SplashScreen />;
  }

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
    return (
      <Stack.Navigator
        key={user.role}
        screenOptions={{ gestureEnabled: false, headerShown: false }}
      >
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
        <Stack.Screen name="AdminAnalytics" component={AdminAnalyticsScreen} />
        <Stack.Screen name="AdminEntityList" component={EntityListScreen} />
        <Stack.Screen name="AdminEntityForm" component={EntityFormScreen} />
        <Stack.Screen
          name="AdminQuestionBank"
          component={QuestionBankScreen}
          initialParams={{ role: 'admin' }}
        />
        <Stack.Screen name="QuestionForm" component={QuestionFormScreen} />
        <Stack.Screen
          name="QuestionPreview"
          component={QuestionPreviewScreen}
        />
        <Stack.Screen name="AdminExamList" component={ExamListScreen} />
        <Stack.Screen name="ExamForm" component={ExamFormScreen} />
        <Stack.Screen
          name="QuestionPicker"
          component={QuestionPickerScreen}
        />
        <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
      </Stack.Navigator>
    );
  }

  if (user.role === roles.teacher) {
    return (
      <Stack.Navigator key={user.role} screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="TeacherHome"
          component={PortalHomeScreen}
          initialParams={{ role: 'teacher' }}
        />
        <Stack.Screen
          name="TeacherProfile"
          component={PortalProfileScreen}
          initialParams={{ role: 'teacher' }}
        />
        <Stack.Screen
          name="TeacherBatches"
          component={PortalCollectionScreen}
          initialParams={{
            role: 'teacher',
            resource: 'batches',
            title: 'Assigned batches',
          }}
        />
        <Stack.Screen
          name="TeacherSubjects"
          component={PortalCollectionScreen}
          initialParams={{
            role: 'teacher',
            resource: 'subjects',
            title: 'Assigned subjects',
          }}
        />
        <Stack.Screen
          name="TeacherStudents"
          component={PortalCollectionScreen}
          initialParams={{
            role: 'teacher',
            resource: 'students',
            title: 'Students',
          }}
        />
        <Stack.Screen
          name="TeacherQuestionBank"
          component={QuestionBankScreen}
          initialParams={{ role: 'teacher' }}
        />
        <Stack.Screen
          name="QuestionPreview"
          component={QuestionPreviewScreen}
        />
        <Stack.Screen name="TeacherExamList" component={ExamListScreen} />
        <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
        <Stack.Screen
          name="TeacherExamAnalytics"
          component={TeacherExamAnalyticsScreen}
        />
      </Stack.Navigator>
    );
  }

  if (user.role === roles.student) {
    return (
      <Stack.Navigator key={user.role} screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="StudentHome"
          component={PortalHomeScreen}
          initialParams={{ role: 'student' }}
        />
        <Stack.Screen
          name="StudentProfile"
          component={PortalProfileScreen}
          initialParams={{ role: 'student' }}
        />
        <Stack.Screen name="StudentBatch" component={StudentBatchScreen} />
        <Stack.Screen
          name="StudentAttendance"
          component={StudentAttendanceScreen}
        />
        <Stack.Screen
          name="StudentSubjects"
          component={PortalCollectionScreen}
          initialParams={{
            role: 'student',
            resource: 'subjects',
            title: 'Subjects',
          }}
        />
        <Stack.Screen
          name="StudentTeachers"
          component={PortalCollectionScreen}
          initialParams={{
            role: 'student',
            resource: 'teachers',
            title: 'Teachers',
          }}
        />
        <Stack.Screen name="StudentExamList" component={ExamListScreen} />
        <Stack.Screen name="ExamDetail" component={ExamDetailScreen} />
        <Stack.Screen
          name="StudentExamInstructions"
          component={ExamInstructionsScreen}
        />
        <Stack.Screen name="StudentExamEngine" component={ExamEngineScreen} />
        <Stack.Screen name="StudentExamResult" component={ExamResultScreen} />
        <Stack.Screen
          name="ExamInstructions"
          component={ExamInstructionsScreen}
        />
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
