import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet } from 'react-native';

import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import AdminHeader from '../../admin/components/AdminHeader';
import QuestionPreview from '../components/QuestionPreview';
import { useQuestion } from '../hooks/useQuestions';

export default function QuestionPreviewScreen({ navigation, route }) {
  const { role, id } = route.params;
  const query = useQuestion(role, id);

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading question preview..." />
      </Screen>
    );
  }

  if (query.error) {
    return (
      <Screen>
        <ErrorState
          message={query.error.message}
          onRetry={query.refetch}
          retrying={query.isFetching}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <AdminHeader
          onBack={navigation.goBack}
          subtitle={`${query.data.data.subjectId?.name || 'Subject'} - correct answer highlighted`}
          title="Question preview"
        />
        <QuestionPreview question={query.data.data} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, paddingBottom: 26 },
});
