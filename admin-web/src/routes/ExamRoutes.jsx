import { Route } from 'react-router-dom';
import QuestionListPage from '../pages/questions/QuestionListPage';
import QuestionFormPage from '../pages/questions/QuestionFormPage';
import QuestionSetListPage from '../pages/questionSets/QuestionSetListPage';
import QuestionSetFormPage from '../pages/questionSets/QuestionSetFormPage';
import ExamListPage from '../pages/exams/ExamListPage';
import ExamFormPage from '../pages/exams/ExamFormPage';
import ExamDetailPage from '../pages/exams/ExamDetailPage';

export default function ExamRoutes() {
  return (
    <>
      <Route path="/exams" element={<ExamListPage />} />
      <Route path="/exams/new" element={<ExamFormPage />} />
      <Route path="/exams/:id" element={<ExamDetailPage />} />
      <Route path="/exams/:id/edit" element={<ExamFormPage />} />
      <Route path="/questions" element={<QuestionListPage />} />
      <Route path="/questions/new" element={<QuestionFormPage />} />
      <Route path="/questions/:id" element={<QuestionFormPage />} />
      <Route path="/questions/:id/edit" element={<QuestionFormPage />} />
      <Route path="/question-sets" element={<QuestionSetListPage />} />
      <Route path="/question-sets/new" element={<QuestionSetFormPage />} />
      <Route path="/question-sets/:id" element={<QuestionSetFormPage />} />
    </>
  );
}
