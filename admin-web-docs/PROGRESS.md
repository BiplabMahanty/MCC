# Admin Web Application — Development Progress

Last updated: 2026-10-28

---

## Phase 1 — Project Setup & Design System

Status: ✅ Completed

### Done
- React + Vite project scaffolded
- Tailwind CSS v3 configured with exact mobile design tokens (brand green, icon colors, surfaces, status colors)
- All dependencies installed (React 19, React Router, React Query, axios, lucide-react, recharts, katex, react-hook-form)
- Button (4 variants, 3 sizes, loading/disabled states)
- Input, Select, Textarea, Checkbox (all with label + error support, forwardRef on Input)
- Badge (12 variants: active, inactive, success, warning, error, info, draft, published, pending, paid, overdue, waived)
- Card / CardHeader / CardBody
- Table (loading skeleton rows, empty state, custom cell renderers)
- Pagination (ellipsis, prev/next, active page highlight)
- Modal (standard + confirm-dialog variant, Escape key close)
- Toast / ToastProvider / useToast (success, error, warning, info, auto-dismiss)
- Skeleton / SkeletonText
- Spinner / PageLoader
- EmptyState / ErrorState
- Avatar (initials fallback, deterministic color from name, image support)
- Breadcrumb
- SearchInput (with clear button)
- StatCard (trend up/down with icons)

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 2 — Authentication & Protected Routing

Status: ✅ Completed

### Done
- AuthContext, AuthProvider, useAuth hook
- Axios client with request interceptor (attaches access token from memory) and response interceptor (silent refresh on 401 ACCESS_TOKEN_EXPIRED, queues concurrent requests during refresh)
- Access token stored in window.__accessToken (memory only), refresh token in localStorage
- Session restored on mount via refresh token rotation
- LoginPage with react-hook-form validation, server error display, role rejection message
- ProtectedRoute (redirects to /login if unauthenticated)
- SplashScreen shown during session restore
- React Router with public (/login) and protected route groups
- Non-admin role rejected with clear message at login
- Logout calls /api/auth/logout, clears all tokens

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 3 — Admin Layout, Sidebar & Navigation

Status: ✅ Completed

### Done
- AdminLayout (sidebar + topbar + scrollable content area)
- Sidebar with expand (240px) / collapse (64px), 200ms CSS transition
- Collapsed state persisted in localStorage across navigation
- Active route visually distinct (white/15 background, white text)
- Grouped nav sections: Dashboard, People, Academic, Exams, Operations, Reports
- Collapsed mode: icon only + tooltip on hover
- Mobile overlay drawer triggered by hamburger button in Topbar
- Topbar with dynamic page title and breadcrumbs derived from current route
- UserMenu dropdown with user name, email, role, and sign-out
- All protected routes wrapped in AdminLayout
- Placeholder "coming soon" pages for all unbuilt routes
- nav.js centralises all route metadata (label, path, icon)

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 4 — Dashboard

Status: ✅ Completed

### Done
- Dashboard Overview page (/dashboard) with real backend data
- 6 stat cards: Students, Teachers, Courses, Batches, Subjects, Questions
- Fee summary card: total fees, collected, pending, progress bar, pending student count
- Today's classes list with Ongoing/Upcoming badges derived from current time
- Upcoming exam card with name, subject, batch, start time, exam type badge
- Unread notifications count card with link to /notifications
- Analytics page (/dashboard/analytics) with date range filter (from/to)
- Summary metrics grid: students, teachers, batches, exams, submissions, avg score
- Batch performance bar chart (Recharts) — avg % per batch
- Teacher workload bar chart (Recharts) — assigned exams per teacher
- Exam performance table — name, type, date, submissions, avg %, highest marks
- "Cached" badge when analytics data is served from Redis
- Skeleton loaders on all sections during loading
- ErrorState with retry on fetch failure
- Routes restructured: all routes moved out of App.jsx into src/routes/ (DashboardRoutes, PeopleRoutes, AcademicRoutes, ExamRoutes, OperationsRoutes)
- Soon placeholder component for unbuilt pages

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 5 — Student Management

Status: ✅ Completed

### Done
- Student list page with search, isActive filter, paginated table
- Student create/edit form (modal) with all fields
- Cloudinary profile image upload flow (fixed `filename` → `fileName` field name)
- Delete confirmation dialog (soft delete: sets isDeleted + isActive false, revokes sessions)
- useDebounce hook
- PeopleRoutes wired to StudentListPage
- Fixed stale form data when switching from edit to create
- Fixed browser autofill on email and password fields

### Pending
- Nothing.

### Known bugs
- None.

### Known bugs
- None.

---

## Phase 6 — Teacher Management

Status: ✅ Completed

### Done
- Teacher list page with search, isActive filter, paginated table
- Teacher create/edit form (modal) with all fields including experienceYears validation
- Profile image upload (same Cloudinary flow as students)
- Delete confirmation dialog
- PeopleRoutes wired to TeacherListPage

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 7 — Academic Structure (Courses, Batches, Subjects)

Status: ✅ Completed

### Done
- Courses page (list + create/edit modal + delete with 409 conflict handling)
- Batches page (list with courseId filter + create/edit modal + teacher multi-select)
- Subjects page (list with courseId filter + create/edit modal + teacher multi-select)
- Reusable MultiSelect component (max limit, checkbox style, click-outside close)
- AcademicRoutes wired to all three pages
- api/courses.js, api/batches.js, api/subjects.js
- hooks/useAcademic.js with all CRUD hooks

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 8 — Question Bank

Status: ✅ Completed

### Done
- Question list page with search, subject filter, difficulty filter, isActive filter
- Question form page (create + edit) with block editor
- BlockEditor component — text, formula, image, table blocks with add/remove
- FormulaBlock — live KaTeX preview, validation before submit
- ImageBlock — direct Cloudinary upload, alt text input
- TableBlock — dynamic rows/columns editor with column count validation
- OptionEditor — 2–8 options, each with block editor (text/formula/image), radio for correct answer
- QuestionRenderer — preview panel with correct answer highlighted
- Live split preview (editor + preview side by side)
- Soft delete with confirmation dialog
- ExamRoutes wired: /questions, /questions/new, /questions/:id/edit
- subjects-select invalidated on subject mutations
- api/questions.js + hooks/useQuestions.js

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 9 — Exam Management

Status: ✅ Completed

Last updated: 2026-10-28

### Done
- `src/api/exams.js` — list, get, create, update, delete, publish, unpublish, listResults, publishResults, unpublishResults
- `src/hooks/useExams.js` — all React Query hooks
- Exam list page (`/exams`) with batch/subject/status filters, paginated table, publish/unpublish/delete actions with confirmation modals
- Exam form page (`/exams/new`, `/exams/:id/edit`) — full-page form with basic info, schedule, marking scheme, instructions, and inline question picker filtered by selected subject
- Exam detail page (`/exams/:id`) — overview tab with all exam metadata + results tab with publish/unpublish results controls
- Read-only enforcement: edit and delete actions hidden for published exams
- ExamRoutes wired to all three pages (replaced Soon placeholder)
- nav.js updated: Exams uses ClipboardCheck icon

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 10 — Fee Management

Status: ✅ Completed

Last updated: 2026-10-28

### Done
- `src/api/fees.js` — listFeePlans, getFeePlan, createFeePlan, updateFeePlan, deleteFeePlan, listFeeRecords, recordPayment, waiveRecord, recordPayments, studentFeeAdmin, markOverdue
- `src/hooks/useFees.js` — all React Query hooks
- Fee Plans list page (`/fees`) with batch/status filters, paginated table, create/edit modal with type-conditional fields (amount, dates, custom installments via useFieldArray)
- Fee Plan detail page (`/fees/:id`) — summary stat cards + records table with status filter + Record Payment modal + Waive modal + Payment History modal + Mark Overdue button
- Student fee summary page (`/fees/students/:studentId`) — summary cards, all fee records, full payment history
- OperationsRoutes wired to all three fee pages

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 11 — Schedule Management

Status: ✅ Completed

Last updated: 2026-10-28

### Done
- `src/api/schedules.js` — list, create, update, delete
- `src/hooks/useSchedules.js` — React Query hooks
- Schedule page (`/schedule`) with batch, day-of-week, and active/inactive filters
- Create/edit modal with batch, subject, teacher, day, start/end time, room fields
- 409 overlap conflict surfaced as a clear toast error (batch or teacher already has a class in that slot)
- Soft delete with confirmation dialog
- OperationsRoutes wired to SchedulePage
- Fixed fee route ordering: `/fees/students/:studentId` declared before `/fees/:id`

### Pending
- Nothing.

### Known bugs
- None.

---

## Phase 12 — Attendance Management

Status: Not started

### Done
- Nothing yet.

### Pending
- Attendance list page with batchId, date, month filters
- Mark Attendance form (batch + date + per-student status)
- Attendance summary per batch

### Known bugs
- None.

---

## Phase 13 — Notifications

Status: Not started

### Done
- Nothing yet.

### Pending
- Notifications page with full notification list
- Send Announcement form
- Mark all as read functionality

### Known bugs
- None.

---

## Phase 14 — Reports

Status: Not started

### Done
- Nothing yet.

### Pending
- Reports page with report request list
- Request Report form
- Status polling until completed or failed
- Download link for completed reports
- 503 (Redis down) error handling

### Known bugs
- None.

---

## Phase 15 — Responsive Design & Polish

Status: Not started

### Done
- Nothing yet.

### Pending
- Audit all pages for mobile/tablet breakpoints
- Fix table overflow on small screens
- Keyboard navigation and ARIA labels
- Page transition animations
- Polish loading and empty states across all pages

### Known bugs
- None.

---

## Phase 16 — Production Build & Deployment Preparation

Status: Not started

### Done
- Nothing yet.

### Pending
- Configure production environment variables
- Set CORS_ORIGIN in backend .env to include web app domain
- 404 page and ErrorBoundary
- Production build verification
- Deployment documentation

### Known bugs
- None.
