import { Route } from 'react-router-dom';
import CoursesPage from '../pages/courses/CoursesPage';
import BatchesPage from '../pages/batches/BatchesPage';
import SubjectsPage from '../pages/subjects/SubjectsPage';

export default function AcademicRoutes() {
  return (
    <>
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/batches" element={<BatchesPage />} />
      <Route path="/subjects" element={<SubjectsPage />} />
    </>
  );
}
