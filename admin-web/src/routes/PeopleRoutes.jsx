import { Route } from 'react-router-dom';
import Soon from '../components/Soon';
import StudentListPage from '../pages/students/StudentListPage';
import TeacherListPage from '../pages/teachers/TeacherListPage';

export default function PeopleRoutes() {
  return (
    <>
      <Route path="/students" element={<StudentListPage />} />
      <Route path="/teachers" element={<TeacherListPage />} />
    </>
  );
}
