# Admin Web Application — Phase-by-Phase Development Roadmap

---

## Phase 1 — Project Setup & Design System

### Objective
Scaffold the React project with Vite, configure Tailwind CSS with the exact design tokens from the mobile app, and build all reusable base UI components.

### Tasks
- Create React app with Vite
- Install and configure Tailwind CSS v3 with custom color tokens from `mcc_mobile/src/theme/colors.js`
- Install all dependencies
- Configure `.env.example` with `VITE_API_URL`
- Build all reusable base components

### Dependencies to Install
```json
{
  "react": "^19",
  "react-dom": "^19",
  "react-router-dom": "^6",
  "@tanstack/react-query": "^5",
  "react-hook-form": "^7",
  "axios": "^1",
  "lucide-react": "latest",
  "recharts": "^2",
  "katex": "^0.18.9",
  "clsx": "^2",
  "tailwind-merge": "^2",
  "@tanstack/react-table": "^8"
}
```

### Tailwind Custom Colors (from colors.js)
```js
brand: { DEFAULT: '#1A5C38', dark: '#0D3D24', accent: '#1DB954', light: '#E8F5EE' }
surface: '#F5F7F5'
card: '#FFFFFF'
text: { primary: '#111827', muted: '#6B7280' }
border: '#E5E7EB'
up: '#16A34A'
down: '#EA580C'
```

### Components to Build
- Button (primary / secondary / danger / ghost variants, loading state)
- Input, Select, Textarea, Checkbox
- Badge (active / inactive / status color variants)
- Card, CardHeader, CardBody
- Table (sort headers, empty state, loading skeleton rows)
- Pagination
- Modal with confirm-dialog variant
- Toast (success / error / warning / info)
- Skeleton loader
- Spinner / PageLoader
- EmptyState, ErrorState
- Avatar (initials fallback)
- Breadcrumb
- SearchInput with debounce hook
- StatCard (matches mobile dashboard cards)

### Files to Create
```
admin-web/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── src/
│   ├── main.jsx
│   ├── App.js
│   ├── components/ui/
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Select.js
│   │   ├── Textarea.js
│   │   ├── Checkbox.js
│   │   ├── Badge.js
│   │   ├── Card.js
│   │   ├── Table.js
│   │   ├── Pagination.js
│   │   ├── Modal.js
│   │   ├── Toast.js
│   │   ├── Skeleton.js
│   │   ├── Spinner.js
│   │   ├── EmptyState.js
│   │   ├── ErrorState.js
│   │   ├── Avatar.js
│   │   ├── Breadcrumb.js
│   │   ├── SearchInput.js
│   │   └── StatCard.js
│   └── utils/
│       ├── formatters.js
│       └── constants.js
```

### Acceptance Criteria
- [ ] Vite dev server starts without errors
- [ ] Tailwind colors match mobile app tokens exactly
- [ ] All base components render correctly
- [ ] No TypeScript, no external component library imposing its own theme
- [ ] `npm run build` produces a clean production bundle

---

## Phase 2 — Authentication & Protected Routing

### Objective
Implement the complete auth flow using the existing backend, protect all admin routes, and handle token refresh silently without user interruption.

### Tasks
- Create AuthContext and AuthProvider
- Store refresh token in localStorage, access token in React state only
- Create axios instance with request/response interceptors
- Build LoginPage with validation and error display
- Build ProtectedRoute component
- Build SplashScreen for initialization
- Configure React Router with public and protected route groups
- Handle 403 FORBIDDEN globally

### API Endpoints Used
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- GET /api/auth/me

### Auth Flow
1. On app load: read refreshToken from localStorage, call /api/auth/refresh
2. On success: store accessToken in memory, set user in context
3. On failure: clear localStorage, show LoginPage
4. On any 401 ACCESS_TOKEN_EXPIRED: call refresh once, retry original request
5. On refresh failure: clear session, redirect to /login
6. On logout: call /api/auth/logout, clear localStorage, redirect to /login

### Security Rules
- Access token: React state only, never localStorage
- Refresh token: localStorage only
- Role check: if user.role !== 'admin', reject and show error
- No sensitive data logged to console

### Files to Create
```
src/
├── auth/
│   ├── AuthContext.js
│   ├── AuthProvider.js
│   └── useAuth.js
├── api/
│   ├── client.js
│   └── auth.js
├── pages/
│   └── LoginPage.js
└── components/
    ├── ProtectedRoute.js
    └── SplashScreen.js
```

### Acceptance Criteria
- [ ] Login with admin credentials works and redirects to dashboard
- [ ] Invalid credentials show error without revealing whether email exists
- [ ] Page refresh restores session via refresh token rotation
- [ ] Logout clears session and redirects to /login
- [ ] Expired access token is silently refreshed without user seeing an error
- [ ] Non-admin users (teacher/student) are rejected at role check
- [ ] 403 responses show a clear forbidden message

---

## Phase 3 — Admin Layout, Sidebar & Navigation

### Objective
Build the complete admin shell — sidebar, topbar, breadcrumbs, notification badge — that wraps all admin pages.

### Tasks
- Build AdminLayout (sidebar + topbar + content area)
- Build Sidebar with expand/collapse, active states, grouped sections
- Build Topbar with page title, breadcrumbs, notification bell, user menu
- Build NotificationDropdown (fetch + mark as read)
- Build UserMenu (profile info + logout)
- Implement mobile responsive drawer
- Persist sidebar state in localStorage
- Define all route metadata (title, breadcrumb path)

### API Endpoints Used
- GET /api/notifications (unread count + list)
- PATCH /api/notifications/:id/read

### Sidebar Sections
```
Dashboard     → /dashboard, /dashboard/analytics
People        → /students, /teachers
Academic      → /courses, /batches, /subjects
Exams         → /exams, /questions
Fees          → /fees
Operations    → /schedule, /attendance, /notifications
Reports       → /reports
```

### UI Specifications
- Sidebar expanded width: 240px
- Sidebar collapsed width: 64px
- Transition: 200ms ease CSS transition
- Active item: brand green (#1A5C38) background, white text
- Hover: dashGreenLight (#E8F5EE) background
- Section labels: visible in expanded mode only
- Collapsed mode: icon only + tooltip on hover
- Mobile: overlay drawer triggered by hamburger button

### Files to Create
```
src/
├── layouts/
│   ├── AdminLayout.js
│   ├── Sidebar.js
│   ├── Topbar.js
│   ├── NotificationDropdown.js
│   └── UserMenu.js
├── api/
│   └── notifications.js
└── routes/
    └── index.js
```

### Acceptance Criteria
- [ ] Sidebar collapses and expands with smooth animation
- [ ] Collapsed state persists across page navigation
- [ ] Active route is visually distinct in sidebar
- [ ] Mobile drawer opens and closes correctly
- [ ] Notification bell shows unread count badge
- [ ] Marking a notification as read updates the count
- [ ] User name and avatar initial display correctly
- [ ] Breadcrumbs reflect the current route

---

## Phase 4 — Dashboard

### Objective
Build the admin dashboard overview and analytics pages with real data from the backend.

### Tasks
- Build Dashboard Overview page (/dashboard)
- Build Analytics page (/dashboard/analytics)
- Integrate all dashboard API endpoints
- Build stat cards, fee summary, today's classes, upcoming exam sections
- Build analytics charts with Recharts
- Add date range filter for analytics
- Add skeleton loaders and error states

### API Endpoints Used
- GET /api/admin/dashboard-home
- GET /api/admin/analytics?from=&to=

### Dashboard Overview Sections
- 6 stat cards: Students, Teachers, Courses, Batches, Subjects, Questions
- Fee Collection: Total Collected, Pending Amount, Total Fees, Pending Students
- Today's Classes: up to 5, with ongoing/upcoming badge
- Upcoming Exam card
- Unread notifications count

### Analytics Page Sections
- Date range filter (from / to)
- Summary metrics grid: students, exams, submissions, avg%, highest marks, teachers
- Batch performance bar chart (Recharts BarChart)
- Teacher workload bar chart
- Exam performance table
- Cache indicator badge when data is served from Redis

### Files to Create
```
src/
├── pages/dashboard/
│   ├── DashboardPage.js
│   └── AnalyticsPage.js
├── api/
│   ├── dashboard.js
│   └── analytics.js
└── hooks/
    └── useDashboard.js
```

### Acceptance Criteria
- [ ] All stat counts match backend data
- [ ] Fee summary shows correct month totals
- [ ] Today's classes show ongoing/upcoming badge correctly
- [ ] Charts render with real data
- [ ] Date range filter on analytics works
- [ ] Skeleton shows during loading
- [ ] Error state with retry button shows on failure
- [ ] "Cached" badge appears when analytics data is from Redis

---

## Phase 5 — Student Management

### Objective
Full student CRUD with search, filters, pagination, profile image upload, and batch assignment.

### Tasks
- Build Student list page with search, isActive filter, paginated table
- Build Student create/edit form (modal or page)
- Implement Cloudinary profile image upload flow
- Build delete confirmation dialog
- Link to student fee summary

### API Endpoints Used
- GET /api/admin/students
- POST /api/admin/students
- GET /api/admin/students/:id
- PATCH /api/admin/students/:id
- DELETE /api/admin/students/:id
- POST /api/admin/uploads/profile-image
- GET /api/admin/batches?isActive=true&limit=100 (for batch selector)

### Form Fields
- name (required), email (required), phone
- password (required on create, optional on edit)
- studentCode (required, auto-uppercased)
- batchId (select from active batches, nullable)
- dateOfBirth, guardianName, guardianPhone
- profileImage (Cloudinary upload)
- isActive toggle

### Table Columns
- Avatar + Name, Email, Student Code, Batch, Status badge, Actions (edit / delete)

### Files to Create
```
src/
├── pages/students/
│   ├── StudentListPage.js
│   └── StudentForm.js
├── api/
│   ├── students.js
│   └── uploads.js
└── hooks/
    └── useStudents.js
```

### Acceptance Criteria
- [ ] Search debounces at 300ms
- [ ] isActive filter (All / Active / Inactive) works
- [ ] Pagination loads correct pages
- [ ] Create form validates all fields before submit
- [ ] Profile image uploads directly to Cloudinary (not through API)
- [ ] Edit form pre-fills existing data
- [ ] Soft delete removes student from list without page reload
- [ ] Toast shows success/error for every action

---

## Phase 6 — Teacher Management

### Objective
Full teacher CRUD mirroring student management with teacher-specific profile fields.

### Tasks
- Build Teacher list page (same pattern as students)
- Build Teacher create/edit form with teacher-specific fields
- Implement profile image upload (same Cloudinary flow)
- Build delete confirmation dialog

### API Endpoints Used
- GET /api/admin/teachers
- POST /api/admin/teachers
- GET /api/admin/teachers/:id
- PATCH /api/admin/teachers/:id
- DELETE /api/admin/teachers/:id
- POST /api/admin/uploads/profile-image

### Form Fields
- name, email, phone, password (optional on edit)
- employeeCode (required, auto-uppercased)
- qualification (max 150 chars)
- experienceYears (0–80)
- profileImage (Cloudinary upload)
- isActive toggle

### Table Columns
- Avatar + Name, Email, Employee Code, Qualification, Status badge, Actions

### Files to Create
```
src/
├── pages/teachers/
│   ├── TeacherListPage.js
│   └── TeacherForm.js
├── api/
│   └── teachers.js
└── hooks/
    └── useTeachers.js
```

### Acceptance Criteria
- [ ] Same criteria as Phase 5 applied to teachers
- [ ] employeeCode uniqueness error from backend shown clearly
- [ ] experienceYears validates 0–80 range

---

## Phase 7 — Academic Structure (Courses, Batches, Subjects)

### Objective
Manage the three-tier academic hierarchy with cross-entity relationships and assignment selectors.

### Tasks
- Build Courses page (list + create/edit form + delete)
- Build Batches page (list with courseId filter + create/edit form + delete)
- Build Subjects page (list with courseId filter + create/edit form + delete)
- Build reusable MultiSelect component for teacher assignment
- Build reusable CourseSelect component
- Handle 409 conflict error on course deletion

### API Endpoints Used
- GET/POST/PATCH/DELETE /api/admin/courses
- GET/POST/PATCH/DELETE /api/admin/batches
- GET/POST/PATCH/DELETE /api/admin/subjects
- GET /api/admin/teachers?isActive=true&limit=100 (for teacher multi-select)
- GET /api/admin/courses?isActive=true&limit=100 (for course selector)

### Batch Form Fields
- name, code, courseId (required), teacherIds (multi-select, max 50)
- academicSession, startDate, endDate (endDate >= startDate)
- capacity (1–10000), isActive

### Subject Form Fields
- name, code, courseId (required), teacherIds (multi-select, max 50)
- description, isActive

### Files to Create
```
src/
├── pages/
│   ├── courses/CoursesPage.js
│   ├── batches/BatchesPage.js
│   └── subjects/SubjectsPage.js
├── components/ui/
│   └── MultiSelect.js
├── api/
│   ├── courses.js
│   ├── batches.js
│   └── subjects.js
└── hooks/
    └── useAcademic.js
```

### Acceptance Criteria
- [ ] Course deletion blocked with clear 409 error when batches/subjects exist
- [ ] Teacher multi-select enforces 50-item limit
- [ ] Batch date validation: endDate >= startDate
- [ ] courseId filter on batch/subject lists works
- [ ] Code uniqueness errors from backend shown clearly

---

## Phase 8 — Question Bank

### Objective
Full question CRUD with rich content blocks (text, formula, image, table), live preview, and Cloudinary image upload.

### Tasks
- Build Question list page with search and filters
- Build Question form page with block editor
- Build formula block with live KaTeX preview
- Build image block with Cloudinary upload
- Build table block with dynamic rows/columns
- Build options editor (2–8 options, each with blocks)
- Build question preview panel
- Implement soft delete with confirmation

### API Endpoints Used
- GET /api/admin/questions
- POST /api/admin/questions
- GET /api/admin/questions/:id
- PATCH /api/admin/questions/:id
- DELETE /api/admin/questions/:id
- POST /api/admin/uploads/question-image
- GET /api/admin/subjects?isActive=true&limit=100 (for subject selector)

### Question List Filters
- search (text), subjectId, topic, difficulty (easy/medium/hard), isActive

### Block Types
- text: plain text input, max 5000 chars
- formula: LaTeX input + live KaTeX render preview
- image: file picker + Cloudinary upload + preview
- table: dynamic header/row editor with column count validation

### Formula Rendering
- Use `katex.renderToString(latex, { throwOnError: false })`
- Render output via `dangerouslySetInnerHTML` in a span
- Show validation error if KaTeX throws

### Files to Create
```
src/
├── pages/questions/
│   ├── QuestionListPage.js
│   ├── QuestionFormPage.js
│   └── QuestionPreviewPage.js
├── components/questions/
│   ├── BlockEditor.js
│   ├── FormulaBlock.js
│   ├── ImageBlock.js
│   ├── TableBlock.js
│   ├── OptionEditor.js
│   └── QuestionRenderer.js
├── api/
│   └── questions.js
└── hooks/
    └── useQuestions.js
```

### Acceptance Criteria
- [ ] All four block types render correctly in preview
- [ ] LaTeX renders via KaTeX, not as raw string
- [ ] Invalid LaTeX shows validation error before submit
- [ ] Image uploads directly to Cloudinary, MongoDB stores only metadata
- [ ] Table row count must match header count (validated before submit)
- [ ] correctOptionIndex validated against options.length
- [ ] Soft delete removes question from list

---

## Phase 9 — Exam Management

### Objective
Full exam lifecycle — create, edit, publish, unpublish, delete — with question picker and result management.

### Tasks
- Build Exam list page with status/batch/subject filters
- Build Exam form page with question picker
- Build Exam detail page with publish/unpublish controls
- Build Results tab per exam with publish/unpublish results
- Enforce read-only state for published exams

### API Endpoints Used
- GET/POST/PATCH/DELETE /api/admin/exams
- POST /api/admin/exams/:id/publish
- POST /api/admin/exams/:id/unpublish
- GET /api/admin/exams/:id/results
- POST /api/admin/exams/:id/results/publish
- POST /api/admin/exams/:id/results/unpublish
- GET /api/admin/questions (for question picker)
- GET /api/admin/batches?isActive=true&limit=100
- GET /api/admin/subjects?isActive=true&limit=100
- GET /api/admin/teachers?isActive=true&limit=100

### Exam Form Fields
- name, examType (practice/unit_test/mid_term/final/mock)
- academicSession, batchId, subjectId, teacherIds (max 10)
- questionIds (via question picker)
- durationMinutes (1–600)
- startTime, endTime (ISO 8601, endTime > startTime)
- totalMarks, marksPerQuestion
- negativeMarking toggle, negativeMarks
- instructions (max 3000 chars)

### Exam Status Rules
- draft: editable, publishable, deletable
- published: read-only, unpublishable only, not deletable
- cancelled: read-only

### Results Table Columns
- Student Name, Score, Total Marks, Percentage, Grade, Rank, Published status

### Files to Create
```
src/
├── pages/exams/
│   ├── ExamListPage.js
│   ├── ExamFormPage.js
│   ├── ExamDetailPage.js
│   └── ExamResultsTab.js
├── components/exams/
│   └── QuestionPicker.js
├── api/
│   ├── exams.js
│   └── results.js
└── hooks/
    └── useExams.js
```

### Acceptance Criteria
- [ ] Published exams show read-only form with clear indicator
- [ ] Publish fails with clear error if no questions added
- [ ] Question picker filters by subject/topic/difficulty
- [ ] Unpublish clears snapshot and returns to draft
- [ ] Results table shows all students who attempted
- [ ] Publish/unpublish results updates student visibility
- [ ] Delete blocked for published exams with clear error

---

## Phase 10 — Fee Management

### Objective
Complete fee plan lifecycle, payment recording, waiving, and per-student fee views.

### Tasks
- Build Fee Plans list page
- Build Fee Plan create form (type-conditional fields)
- Build Fee Plan detail page with records table
- Build Record Payment modal
- Build Waive Record modal
- Build Payment history modal
- Build Student fee view (accessible from student detail)
- Add Mark Overdue button

### API Endpoints Used
- GET/POST/PATCH/DELETE /api/admin/fees
- GET /api/admin/fees/:id/records
- POST /api/admin/fees/payments
- POST /api/admin/fees/mark-overdue
- GET /api/admin/fees/students/:studentId/fees
- PATCH /api/admin/fees/records/:recordId/waive
- GET /api/admin/fees/records/:recordId/payments
- GET /api/admin/batches?isActive=true&limit=100

### Fee Plan Form (type-conditional)
- name, batchId, type (one_time/monthly/quarterly/yearly/custom)
- If one_time: amount only
- If monthly/quarterly/yearly: amount + startDate + endDate
- If custom: installments[] (label, amount, dueDate per row)
- description, isActive

### Fee Record Status Colors
- pending: yellow/warning
- paid: green/success
- partial: blue
- overdue: red/error
- waived: gray/muted

### Payment Methods
- cash, upi, card, bank_transfer, other

### Files to Create
```
src/
├── pages/fees/
│   ├── FeePlansPage.js
│   ├── FeePlanDetailPage.js
│   └── StudentFeePage.js
├── components/fees/
│   ├── RecordPaymentModal.js
│   ├── WaiveRecordModal.js
│   └── PaymentHistoryModal.js
├── api/
│   └── fees.js
└── hooks/
    └── useFees.js
```

### Acceptance Criteria
- [ ] Fee plan type changes show/hide correct form fields
- [ ] Custom installments can be added/removed dynamically
- [ ] Fee records table filters by status and student
- [ ] Payment amount cannot exceed remaining balance (validated client-side + server enforces)
- [ ] Waived records cannot receive payments
- [ ] Mark Overdue updates statuses and refreshes table
- [ ] Student fee summary shows correct totals

---

## Phase 11 — Schedule Management

### Objective
Manage weekly class schedules with overlap detection and visual timetable view.

### Tasks
- Build Schedule list page with batchId and dayOfWeek filters
- Build Schedule create/edit form
- Build weekly timetable view (optional visual grid)
- Handle 409 overlap conflict errors clearly

### API Endpoints Used
- GET/POST/PATCH/DELETE /api/admin/schedules
- GET /api/admin/batches?isActive=true&limit=100
- GET /api/admin/subjects?isActive=true&limit=100
- GET /api/admin/teachers?isActive=true&limit=100

### Form Fields
- batchId, subjectId, teacherId (all required)
- dayOfWeek (0=Sunday to 6=Saturday, select)
- startTime, endTime (HH:MM, endTime > startTime)
- room (max 60 chars), isActive

### Day Names
- 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

### Files to Create
```
src/
├── pages/schedule/
│   └── SchedulePage.js
├── api/
│   └── schedules.js
└── hooks/
    └── useSchedules.js
```

### Acceptance Criteria
- [ ] Schedule list filters by batch and day of week
- [ ] Overlap conflict (409) shows clear error message identifying the conflict
- [ ] Time validation: endTime > startTime
- [ ] Day of week displays as name (Monday) not number (1)

---

## Phase 12 — Attendance Management

### Objective
View and mark attendance for batches with date/month filtering.

### Tasks
- Build Attendance list page with batchId, date, month filters
- Build Mark Attendance form (batch + date + per-student status)
- Show attendance summary per batch

### API Endpoints Used
- GET /api/admin/attendance?batchId&date&month
- PUT /api/admin/attendance
- GET /api/admin/batches?isActive=true&limit=100
- GET /api/admin/students?batchId=&isActive=true (to get batch students)

### Attendance Entry Fields
- studentId, status (present/absent/late/excused), note (optional)

### Status Colors
- present: green
- absent: red
- late: yellow/warning
- excused: blue/info

### Files to Create
```
src/
├── pages/attendance/
│   └── AttendancePage.js
├── api/
│   └── attendance.js
└── hooks/
    └── useAttendance.js
```

### Acceptance Criteria
- [ ] Batch selector loads active batches
- [ ] Date picker selects specific date
- [ ] Month filter shows all records for that month
- [ ] Mark attendance form loads all students in selected batch
- [ ] Upsert behavior: re-marking same batch+date updates existing record
- [ ] Each student can only be marked once per submission

---

## Phase 13 — Notifications

### Objective
View admin notifications and send announcements to selected roles.

### Tasks
- Build Notifications page with full notification list
- Build Send Announcement form
- Mark all as read functionality

### API Endpoints Used
- GET /api/notifications
- PATCH /api/notifications/:id/read
- POST /api/notifications/announcement

### Announcement Form Fields
- title (2–160 chars)
- body (1–2000 chars)
- type (announcement/exam/assignment/fee/result)
- roles (multi-select: admin/teacher/student, min 1)

### Files to Create
```
src/
├── pages/notifications/
│   └── NotificationsPage.js
├── api/
│   └── notifications.js (extend existing)
└── hooks/
    └── useNotifications.js
```

### Acceptance Criteria
- [ ] Notification list shows all 100 most recent
- [ ] Unread notifications visually distinct
- [ ] Clicking a notification marks it as read
- [ ] Announcement form validates all fields
- [ ] Success toast shows count of recipients after announcement
- [ ] Error shown if no active users match selected roles

---

## Phase 14 — Reports

### Objective
Request async reports and track their status with download links.

### Tasks
- Build Reports page with report request list
- Build Request Report form
- Poll report status until completed or failed
- Show download link when report is completed

### API Endpoints Used
- GET /api/reports
- GET /api/reports/:id
- POST /api/reports

### Report Types
- exam, fees, attendance, performance

### Report Statuses
- queued: spinner
- processing: spinner
- completed: download link (fileUrl)
- failed: error message

### Files to Create
```
src/
├── pages/reports/
│   └── ReportsPage.js
├── api/
│   └── reports.js
└── hooks/
    └── useReports.js
```

### Acceptance Criteria
- [ ] Report request form submits with type and optional filters
- [ ] 503 error (Redis down) shown with clear message
- [ ] Report list shows status with appropriate visual indicator
- [ ] Completed reports show clickable download link
- [ ] Failed reports show error message
- [ ] Status polling stops when report reaches completed or failed

---

## Phase 15 — Responsive Design & Polish

### Objective
Ensure the entire application is fully responsive, accessible, and visually polished across desktop, tablet, and mobile.

### Tasks
- Audit all pages for mobile/tablet breakpoints
- Fix table overflow on small screens (horizontal scroll or card view)
- Ensure all modals are usable on mobile
- Add keyboard navigation support
- Add proper ARIA labels to interactive elements
- Verify color contrast ratios
- Add page transition animations (subtle)
- Polish loading states and empty states across all pages
- Verify toast notifications position correctly on all screen sizes
- Test sidebar drawer on mobile for all pages

### Breakpoints (Tailwind defaults)
- sm: 640px, md: 768px, lg: 1024px, xl: 1280px

### Acceptance Criteria
- [ ] All pages usable on 375px mobile width
- [ ] Tables scroll horizontally on small screens
- [ ] Sidebar drawer works on all pages on mobile
- [ ] All interactive elements have visible focus states
- [ ] No horizontal overflow on any page
- [ ] All images have alt text
- [ ] Form error messages are associated with their inputs

---

## Phase 16 — Production Build & Deployment Preparation

### Objective
Prepare the application for production deployment with environment configuration, security hardening, and build optimization.

### Tasks
- Configure production environment variables
- Set CORS_ORIGIN in backend .env to include web app domain
- Configure Content Security Policy headers
- Verify all API URLs use environment variables (no hardcoded URLs)
- Run production build and verify bundle size
- Add 404 page for unknown routes
- Add error boundary for unexpected React errors
- Document deployment steps in README

### Environment Variables
```
VITE_API_URL=https://your-api-domain.com/api
```

### Files to Create/Modify
```
src/
├── pages/NotFoundPage.js
└── components/ErrorBoundary.js
admin-web/
└── README.md
```

### Acceptance Criteria
- [ ] `npm run build` completes without errors or warnings
- [ ] No hardcoded API URLs in source code
- [ ] 404 page shows for unknown routes
- [ ] Error boundary catches unexpected errors gracefully
- [ ] CORS configured correctly for production domain
- [ ] All environment variables documented in .env.example
