# Admin Web Application — Complete Codebase Analysis

Last updated: 2026-09-24
Analysed by: Amazon Q

---

## 1. Repository Structure

```
MCC/
├── backend/            Express API (Node.js + MongoDB + Redis)
├── mcc_mobile/         Expo React Native app (JavaScript only)
├── docker-compose.yml  Local MongoDB + Redis
├── PROGRESS.md         Backend/mobile phase status
├── README.md           Setup and API documentation
└── spce.md             Master product specification
```

---

## 2. Backend Technology Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js (^20.19.4 or ^22.13.0 or >=24.3.0) |
| Framework | Express.js ^4.22 |
| Database | MongoDB via Mongoose ^9.10 |
| Cache / Queue | Redis via ioredis ^6, BullMQ ^6 |
| Auth | JWT (jsonwebtoken ^9) + bcryptjs ^3 |
| Validation | Zod ^4 |
| Image storage | Cloudinary ^2 (signed upload, never proxied) |
| Logging | Pino ^10 + pino-http |
| Security | Helmet ^8, express-mongo-sanitize ^2, express-rate-limit ^8 |
| Testing | Jest ^30 + Supertest ^7 |

---

## 3. Mobile Technology Stack

| Concern | Technology |
|---|---|
| Framework | Expo SDK 57, React Native 0.86 |
| Language | JavaScript only (no TypeScript) |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| Server state | TanStack Query v5 |
| Token storage | expo-secure-store (refresh token only) |
| Formula render | KaTeX ^0.18.9 inside react-native-webview |
| Lists | @shopify/flash-list 2.0.2 |
| Image picker | expo-image-picker |

---

## 4. Design Tokens (from mcc_mobile/src/theme/colors.js)

### Primary Brand (Dashboard System)

| Token | Value | Usage |
|---|---|---|
| dashGreen | #1A5C38 | Primary brand, header background, buttons |
| dashGreenDark | #0D3D24 | Hover states, dark variant |
| dashGreenAccent | #1DB954 | Active states, highlights, links |
| dashGreenLight | #E8F5EE | Tinted backgrounds, selected states |
| dashBg | #F5F7F5 | Page background |
| dashCard | #FFFFFF | Card/panel background |
| dashText | #111827 | Primary text |
| dashSubText | #6B7280 | Secondary/muted text |
| dashBorder | #E5E7EB | Borders, dividers |
| dashUp | #16A34A | Positive/success indicators |
| dashDown | #EA580C | Negative/warning indicators |

### Legacy Tokens (still used in some screens)

| Token | Value |
|---|---|
| primary (orange) | #F97316 |
| error | #B91C1C |
| errorSurface | #FEF2F2 |
| success | #15803D |
| successSurface | #F0FDF4 |
| warning | #B45309 |
| warningSurface | #FFFBEB |

### Icon Palette

| Background | Foreground | Usage |
|---|---|---|
| iconBgGreen #DCFCE7 | iconGreen #16A34A | Students |
| iconBgBlue #DBEAFE | iconBlue #2563EB | Teachers / Classes |
| iconBgPurple #EDE9FE | iconPurple #7C3AED | Courses |
| iconBgOrange #FEF3C7 | iconOrange #D97706 | Batches |
| iconBgPink #FCE7F3 | iconPink #DB2777 | Pending / Fees |
| iconBgTeal #CCFBF1 | iconTeal #0D9488 | Subjects |

---

## 5. Authentication & Authorization (Verified)

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/login | None | Returns accessToken + refreshToken + user |
| POST | /api/auth/refresh | None | Rotates refresh token, returns new pair |
| POST | /api/auth/logout | None | Revokes refresh token |
| GET | /api/auth/me | Bearer | Returns current user (no sensitive fields) |

### Token Mechanics

- Access token: short-lived JWT (default 15m), sent as `Authorization: Bearer <token>`
- Refresh token: opaque random value, stored as SHA-256 hash in MongoDB only
- On 401 with code `ACCESS_TOKEN_EXPIRED`: call refresh, retry original request once
- On refresh failure: clear session, redirect to login
- Max 5 concurrent refresh sessions per user (configurable via env)
- Login rate limited: 20 requests per 15-minute window per IP

### Role System

- Three roles: `admin`, `teacher`, `student`
- All `/api/admin/*` routes: `authenticate` + `authorize('admin')` middleware
- 401 AUTHENTICATION_REQUIRED: no token or invalid token
- 401 ACCESS_TOKEN_EXPIRED: token expired — trigger silent refresh
- 403 FORBIDDEN: wrong role

---

## 6. Complete API Endpoint Inventory

### Auth Routes (/api/auth)

- POST /login
- POST /refresh
- POST /logout
- GET /me

### Admin Routes (/api/admin) — all require admin role

#### Dashboard
- GET /dashboard — counts: students, teachers, batches, courses, subjects, questions
- GET /dashboard-home — enriched: stats + fee summary + today's classes + upcoming exam + unread notifications
- GET /analytics?from=&to= — result summary, batch/teacher/exam performance (Redis-cached 60s)

#### Students
- GET /students?page&limit&search&isActive
- POST /students
- GET /students/:id
- PATCH /students/:id
- DELETE /students/:id (soft delete, HTTP 204)

#### Teachers
- GET /teachers?page&limit&search&isActive
- POST /teachers
- GET /teachers/:id
- PATCH /teachers/:id
- DELETE /teachers/:id (soft delete, HTTP 204)

#### Courses
- GET /courses?page&limit&search&isActive
- POST /courses
- GET /courses/:id
- PATCH /courses/:id
- DELETE /courses/:id (soft delete; blocked if batches/subjects exist — HTTP 409)

#### Batches
- GET /batches?page&limit&search&isActive&courseId
- POST /batches
- GET /batches/:id
- PATCH /batches/:id
- DELETE /batches/:id (soft delete)

#### Subjects
- GET /subjects?page&limit&search&isActive&courseId
- POST /subjects
- GET /subjects/:id
- PATCH /subjects/:id
- DELETE /subjects/:id (soft delete)

#### Exams
- GET /exams?page&limit&status&batchId&subjectId
- POST /exams
- GET /exams/:id
- PATCH /exams/:id (draft only)
- DELETE /exams/:id (unpublished only, soft delete)
- POST /exams/:id/publish
- POST /exams/:id/unpublish

#### Exam Results
- GET /exams/:id/results?page&limit
- POST /exams/:id/results/publish
- POST /exams/:id/results/unpublish (HTTP 204)

#### Questions
- GET /questions?page&limit&search&subjectId&topic&difficulty&isActive
- POST /questions
- GET /questions/:id
- PATCH /questions/:id
- DELETE /questions/:id (soft delete)

#### Uploads
- POST /uploads/question-image — Cloudinary signed upload params
- POST /uploads/profile-image — Cloudinary signed upload params

#### Fee Plans
- GET /fees?page&limit&batchId&isActive
- POST /fees (auto-generates FeeRecords for all batch students)
- GET /fees/:id (with summary counts)
- PATCH /fees/:id (name/description/isActive only)
- DELETE /fees/:id (soft delete)
- GET /fees/:id/records?page&limit&status&studentId
- POST /fees/payments
- POST /fees/mark-overdue
- GET /fees/students/:studentId/fees
- PATCH /fees/records/:recordId/waive
- GET /fees/records/:recordId/payments

#### Schedules
- GET /schedules?page&limit&batchId&dayOfWeek
- POST /schedules (overlap detection enforced)
- GET /schedules/:id
- PATCH /schedules/:id
- DELETE /schedules/:id (soft delete)

#### Attendance
- GET /attendance?batchId&date&month
- PUT /attendance (mark/update for batch + date, upsert)

### Notifications (/api/notifications) — authenticated, any role

- GET / — own notifications (last 100)
- PATCH /:id/read — mark as read
- POST /announcement — admin only, broadcast to selected roles

### Reports (/api/reports) — admin only

- GET / — list own report requests (last 50)
- GET /:id — get report status + file URL
- POST / — request async report (types: exam/fees/attendance/performance)

---

## 7. Database Models & Relationships

```
Institute
  └── User (admin / teacher / student, instituteId scoped)
        ├── studentProfile { batchId, studentCode, DOB, guardian, profileImage }
        └── teacherProfile { employeeCode, qualification, experienceYears, profileImage }

Course (instituteId)
  ├── Batch (courseId, teacherIds[], capacity, academicSession, dates)
  │     ├── Schedule (batchId, subjectId, teacherId, dayOfWeek, HH:MM times)
  │     ├── Attendance (batchId, date, entries[])
  │     ├── FeePlan (batchId) → FeeRecord[] → Payment[]
  │     └── Exam (batchId, subjectId, teacherIds[], questionIds[], snapshot[])
  │           ├── ExamAttempt (examId, studentId, answers[], scores)
  │           └── Result (examId, attemptId, studentId, grade, rank, isPublished)
  └── Subject (courseId, teacherIds[])
        └── Question (subjectId, content blocks[], options[], correctOptionIndex)

Notification (recipientId, type, readAt)
Assignment (batchId, subjectId, submissions[])   — no admin CRUD routes yet
StudyMaterial (batchId, subjectId, file)         — no admin CRUD routes yet
Report (requestedBy, type, status, fileUrl)
```

---

## 8. Key Validation Constraints (for Web Forms)

### Users (Students & Teachers)
- name: 2–100 chars
- email: valid, max 254, lowercased
- password: 8–128 chars (optional on update)
- phone: max 20 chars
- studentCode / employeeCode: 1–30 chars, uppercased, unique per institute
- batchId: valid ObjectId or null
- experienceYears: 0–80
- qualification: max 150 chars

### Courses
- name: 2–120 chars, unique per institute
- code: 1–30 chars, uppercased, unique per institute
- description: max 1000 chars

### Batches
- teacherIds: max 50, unique values
- academicSession: 2–30 chars
- endDate >= startDate
- capacity: 1–10000

### Exams
- examType: practice | unit_test | mid_term | final | mock
- durationMinutes: 1–600
- endTime > startTime (ISO 8601 UTC)
- totalMarks: min 1, marksPerQuestion: min 0.5
- questionIds: min 1, max 200
- teacherIds: max 10

### Questions
- content: 1–30 blocks
- options: 2–8
- correctOptionIndex: 0-based, must be < options.length
- Formula: valid KaTeX LaTeX
- Table: 1–12 headers, 1–30 rows, each row length must equal header count
- Image: max 5 MB, types: png/jpeg/webp/svg+xml

### Fee Plans
- type: one_time | monthly | quarterly | yearly | custom
- custom requires installments (1–60)
- recurring types require amount + startDate + endDate (endDate > startDate)
- payment method: cash | upi | card | bank_transfer | other

### Schedules
- dayOfWeek: 0–6 (0=Sunday, 6=Saturday)
- startTime / endTime: HH:MM, endTime > startTime
- Overlap detection: batch and teacher cannot have two classes in same slot on same day

### Attendance
- status per entry: present | absent | late | excused
- note: max 300 chars

---

## 9. Pagination & Error Response Formats

### Pagination (all list endpoints)
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```
Default page size: 20, maximum: 100

### Error Response
```json
{
  "message": "Human-readable error message.",
  "code": "MACHINE_READABLE_CODE",
  "details": { "fieldName": "error message" }
}
```

### Common Error Codes
| Code | HTTP | Meaning |
|---|---|---|
| AUTHENTICATION_REQUIRED | 401 | No token or invalid token |
| ACCESS_TOKEN_EXPIRED | 401 | Token expired — trigger silent refresh |
| INVALID_ACCESS_TOKEN | 401 | Malformed token |
| FORBIDDEN | 403 | Wrong role |
| NOT_FOUND | 404 | Resource not found |
| VALIDATION_ERROR | 400 | Field validation failed |
| CONFLICT | 409 | e.g. deleting course with active batches |
| EXAM_PUBLISHED | 409 | Cannot edit/delete published exam |
| ALREADY_PUBLISHED | 409 | Exam already published |
| NO_RECIPIENTS | 400 | No active users match announcement roles |
| REPORT_QUEUE_UNAVAILABLE | 503 | Redis/BullMQ down |

---

## 10. Analytics Data Available

### GET /api/admin/analytics
```json
{
  "cached": false,
  "generatedAt": "ISO timestamp",
  "summary": {
    "students", "teachers", "batches", "exams",
    "submissions", "averagePercentage", "averageMarks",
    "highestMarks", "lowestMarks"
  },
  "batchAnalytics": [{ "batchId", "batchName", "batchCode", "submissions", "averagePercentage" }],
  "teacherAnalytics": [{ "teacherId", "teacherName", "assignedExams" }],
  "performanceReports": [{ "examId", "examName", "examType", "startTime", "submissions", "averagePercentage", "highestMarks" }]
}
```

### GET /api/admin/dashboard-home
```json
{
  "stats": { "students", "teachers", "batches", "courses", "subjects", "questions" },
  "feeSummary": { "totalCollected", "pendingAmount", "totalFees", "pendingStudents" },
  "todayClasses": [{ "subject", "batch", "startTime", "endTime", "room" }],
  "upcomingExam": { "name", "subject", "batch", "startTime", "examType" },
  "unreadNotifications": 3
}
```

---

## 11. Cloudinary Image Upload Flow

1. Client sends `{ fileName, mimeType, size }` to `POST /api/admin/uploads/question-image` or `/profile-image`
2. Backend returns `{ uploadUrl, fields: { key, policy, signature, ... }, url, storageKey }`
3. Client POSTs binary as multipart form data to `uploadUrl` with all `fields` entries + `file` key
4. Client stores `{ url, storageKey, mimeType, width?, height?, alt }` in the record
5. MongoDB never stores image binary — only metadata and the Cloudinary CDN URL

Accepted types:
- Question images: image/png, image/jpeg, image/webp, image/svg+xml
- Profile images: image/jpeg, image/png, image/webp
- Max size: 5 MB

---

## 12. Feature Gaps & Out-of-Scope Items

### No backend changes required
All admin features have verified, working API endpoints.

### Configuration change required (not a code change)
- `CORS_ORIGIN` in `backend/.env` must include the web app's origin (e.g., `http://localhost:3000`)

### Models with no admin CRUD routes (intentionally deferred)
- Assignment — only student submission routes exist
- StudyMaterial — no admin routes exist
- These are excluded from the web app scope

### Institute management
- `/api/institutes` is protected by `x-api-key` header, not JWT
- Super-admin concern, excluded from the admin web app

### Report queue dependency
- `POST /api/reports` requires BullMQ + Redis running
- If Redis is down, returns HTTP 503
- Web app must handle this gracefully with a clear error message

---

## 13. Recommended Web App Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Build tool | Vite | Fast HMR, no CRA overhead |
| Language | JavaScript only | Matches existing codebase policy |
| Styling | Tailwind CSS v3 | Utility-first, matches design tokens exactly, no imposed theme |
| Routing | React Router v6 | Standard, nested routes |
| Server state | TanStack Query v5 | Same library as mobile, consistent patterns |
| Forms | React Hook Form v7 | Minimal re-renders, easy validation |
| HTTP client | Axios v1 | Interceptors for token inject + silent refresh |
| Icons | Lucide React | Clean, consistent, tree-shakeable |
| Charts | Recharts v2 | Lightweight, composable, Tailwind-compatible |
| Formula render | KaTeX ^0.18.9 | Same version as backend, renderToString for web |
| Tables | TanStack Table v8 | Headless, sortable, paginated |
| Utilities | clsx + tailwind-merge | Conditional class merging |

---

## 14. Proposed Sidebar Navigation

```
Dashboard
  ├── Overview          /dashboard
  └── Analytics         /dashboard/analytics

People
  ├── Students          /students
  └── Teachers          /teachers

Academic
  ├── Courses           /courses
  ├── Batches           /batches
  └── Subjects          /subjects

Exams
  ├── Exam List         /exams
  └── Question Bank     /questions

Fees
  ├── Fee Plans         /fees

Operations
  ├── Schedule          /schedule
  ├── Attendance        /attendance
  └── Notifications     /notifications

Reports                 /reports
```

---

## 15. Security Requirements for Web App

- Access token: React state only — never written to localStorage or sessionStorage
- Refresh token: localStorage (acceptable for admin-only SPA with proper CSP)
- All API calls through axios interceptor — no manual token handling in components
- Role check after login: reject non-admin users immediately with clear message
- No client-side permission bypasses — all enforcement is server-side
- Confirmation dialogs for all destructive actions (delete, unpublish, waive)
- Input validation via React Hook Form before submit
- 401 ACCESS_TOKEN_EXPIRED triggers silent refresh before showing any error to user
