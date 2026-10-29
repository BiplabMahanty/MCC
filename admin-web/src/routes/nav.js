import {
  LayoutDashboard,
  BarChart2,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  BookMarked,
  ClipboardCheck,
  FileText,
  DollarSign,
  CalendarDays,
  ClipboardList,
  Bell,
  FileBarChart,
} from 'lucide-react';

export const NAV = [
  {
    section: 'Dashboard',
    items: [
      { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
    ],
  },
  {
    section: 'People',
    items: [
      { label: 'Students', path: '/students', icon: Users },
      { label: 'Teachers', path: '/teachers', icon: GraduationCap },
    ],
  },
  {
    section: 'Academic',
    items: [
      { label: 'Courses', path: '/courses', icon: BookOpen },
      { label: 'Batches', path: '/batches', icon: Layers },
      { label: 'Subjects', path: '/subjects', icon: BookMarked },
    ],
  },
  {
    section: 'Exams',
    items: [
      { label: 'Exams', path: '/exams', icon: ClipboardCheck },
      { label: 'Questions', path: '/questions', icon: FileText },
    ],
  },
  {
    section: 'Operations',
    items: [
      { label: 'Fees', path: '/fees', icon: DollarSign },
      { label: 'Schedule', path: '/schedule', icon: CalendarDays },
      { label: 'Attendance', path: '/attendance', icon: ClipboardList },
      { label: 'Notifications', path: '/notifications', icon: Bell },
    ],
  },
  {
    section: 'Reports',
    items: [{ label: 'Reports', path: '/reports', icon: FileBarChart }],
  },
];
