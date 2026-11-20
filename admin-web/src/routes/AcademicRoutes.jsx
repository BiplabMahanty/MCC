import { Route } from 'react-router-dom';
import CoursesPage from '../pages/courses/CoursesPage';
import BatchesPage from '../pages/batches/BatchesPage';
import SubjectsPage from '../pages/subjects/SubjectsPage';
import ChaptersPage from '../pages/chapters/ChaptersPage';

export default function AcademicRoutes() {
  return (
    <>
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/batches" element={<BatchesPage />} />
      <Route path="/subjects" element={<SubjectsPage />} />
      <Route path="/chapters" element={<ChaptersPage />} />
    </>
  );
}
