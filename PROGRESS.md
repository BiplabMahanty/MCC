# Development Progress

Last updated: 2026-09-24

## Phase 0 — Project Foundation

Status: Implemented; local infrastructure runtime verification pending

### Done

- Created an Expo SDK 57 JavaScript app configured for `expo-dev-client`.
- Added React Navigation and a single Phase 0 health screen.
- Added TanStack Query with loading, error, retry, and refresh behavior.
- Added the Orange + Black design tokens from the specification.
- Created a modular Express JavaScript backend.
- Added MongoDB/Mongoose and Redis clients with connection lifecycle handling.
- Added `GET /api/health` with API, MongoDB, and Redis status reporting.
- Added environment examples and safe defaults for local development.
- Added Pino logging with sensitive-field redaction.
- Added Helmet, CORS allow-list support, rate limiting, and MongoDB query sanitization.
- Added JSON 404 handling and a global error handler.
- Added graceful process shutdown.
- Added Jest and Supertest health-route tests.
- Added ESLint and Prettier configuration for both projects.
- Added Docker Compose definitions with persistent volumes and health checks.
- Added exact setup, run, validation, and manual testing instructions to `README.md`.

### Verification completed

- Backend automated tests.
- Backend and mobile linting.
- Backend and mobile formatting checks.
- Expo public configuration resolution.
- Expo JavaScript bundle/export validation.
- npm dependency audit review.
- Live API startup and degraded health response when MongoDB and Redis are unavailable.

### Pending environment verification

- Start the Docker Compose services and confirm live MongoDB and Redis connectivity.
- Compile/install the Android development client and visually verify the health screen on an emulator or device.

Docker and the Android toolchain are not available in the current execution environment, so these two runtime checks must be completed on a development machine using the README steps.

### Known bugs

- None identified in the implemented Phase 0 code.

### Known development limitations

- The Phase 0 API rate limiter uses a process-local store. A shared Redis-backed limiter should be introduced when horizontal API scaling is configured.
- Mobile npm audit findings are inherited from the current Expo development toolchain; review them when Expo publishes compatible patched packages rather than forcing incompatible upgrades.

## Phase 1 — Authentication & Roles

Status: Implemented; connected-database and Android runtime verification pending

### Done

- Added an institute-scoped User model with Admin, Teacher, and Student roles.
- Added bcrypt password hashing and sensitive-field removal from JSON responses.
- Added short-lived JWT access tokens.
- Added cryptographically random refresh tokens stored only as hashes in MongoDB.
- Added atomic refresh-token rotation so an older token cannot overwrite or reuse a rotated session.
- Added expired-session pruning and a configurable per-user session limit.
- Added login, refresh, logout, and current-user endpoints.
- Added Zod request validation and generic invalid-credential errors.
- Added reusable authentication and role-authorization middleware.
- Added stricter per-IP login rate limiting.
- Added soft-delete fields and institute indexes to the User model.
- Added an idempotent first-administrator seed command.
- Added Expo SecureStore persistence for refresh tokens; access tokens remain in memory.
- Added automatic session restoration and single-flight access-token refresh on HTTP 401.
- Added Login and session-restoring Splash screens.
- Added protected Admin, Teacher, and Student dashboard routing.
- Added backend authentication, validation, refresh-rotation, and authorization tests.
- Added Phase 1 setup, API examples, and manual testing instructions to `README.md`.

### Verification completed

- Backend authentication and authorization test suite.
- Backend and mobile linting and formatting checks.
- Expo Doctor dependency/configuration checks.
- Android JavaScript bundle/export validation.
- Backend production dependency audit.

### Pending environment verification

- Run the seed command against a live MongoDB instance.
- Exercise login, refresh rotation, `/me`, and logout against live MongoDB.
- Rebuild the Android development client with `expo-secure-store` and verify session restoration and all three role routes on a device/emulator.

Docker, MongoDB, Redis, and Android ADB remain unavailable in the current execution environment.

### Known bugs

- None identified in the implemented Phase 1 code.

### Known development limitations

- The process-local rate-limit store should be replaced by a shared Redis-backed store when multiple API instances are deployed.
- The current Expo toolchain continues to inherit the documented moderate `uuid` advisory through Expo CLI dependencies; npm's forced remediation would install an incompatible Expo version.

## Phase 2 - Admin Foundation

Status: Implemented; connected-database and Android runtime verification pending

### Done

- Added an institute-scoped Admin dashboard with Student, Teacher, Course, Batch, and Subject totals.
- Added Student and Teacher management on the existing User model, including role-specific profile data and active/inactive account control.
- Added Course, Batch, and Subject models with timestamps, status, soft-delete metadata, and compound indexes.
- Added Admin-only CRUD APIs for all five resources.
- Added strict Zod validation for bodies, identifiers, pagination, filters, dates, and cross-field Batch date ranges.
- Added server-owned institute scoping to all Admin reads and writes; client-supplied `instituteId` values are rejected.
- Added case-insensitive search, active-status filters, Course filters for Batch/Subject APIs, and paginated responses.
- Added Course reference validation and protection against deleting a Course that is still used by a non-deleted Batch or Subject.
- Added student/teacher code uniqueness within an institute while allowing reuse after soft deletion.
- Added reusable backend CRUD factories and mobile Admin list/form components.
- Added a FlashList-based mobile management flow with infinite pagination, search debounce, status filters, create/edit forms, and delete confirmation.
- Added active-Course selection for Batch and Subject forms.
- Added Phase 2 authorization, validation, dashboard-isolation, query-filter, and normalization tests.
- Added Phase 2 API notes and manual testing instructions to `README.md`.

### Verification completed

- All backend tests (9 suites, 36 tests).
- Backend and mobile linting.
- Backend and mobile formatting checks.
- Static Android Expo export validation.
- Expo Doctor dependency/configuration checks.
- Dependency audit review.

### Pending environment verification

- Exercise all Admin CRUD flows against live MongoDB and Redis.
- Confirm institute isolation using two real Admin accounts and datasets.
- Rebuild the Android development client and visually verify the Admin dashboard, FlashList pagination, filters, forms, and soft-delete behavior.

Docker, MongoDB, Redis, and Android ADB remain unavailable in the current execution environment.

### Known bugs

- None identified in the implemented Phase 2 code.

### Known development limitations

- Course deletion is blocked while a non-deleted Batch or Subject references it; dependent records must be removed first.
- The process-local rate-limit store and current Expo CLI advisory remain as documented in earlier phases.

## Phase 3 - Teacher & Student Foundation

Status: Implemented; connected-database and Android runtime verification pending

### Done

- Added Admin-controlled Student-to-Batch assignments.
- Added Admin-controlled Teacher assignments for Batches and Subjects.
- Added institute-, role-, active-status-, and soft-delete validation for every assignment.
- Added multikey assignment indexes for Teacher batch/subject lookups and a Student batch lookup index.
- Added Teacher dashboard, profile, assigned Batch, assigned Subject, and assigned Student APIs.
- Added Student dashboard, profile, Batch information, Subject, and Teacher APIs.
- Added strict role authorization so Teacher and Student portal routes cannot be accessed across roles.
- Added Teacher and Student mobile navigation stacks using the shared Orange + Black design system.
- Added reusable portal headers, summary cards, profile rows, list items, query hooks, loading states, retry states, pull-to-refresh, and empty states.
- Extended reusable Admin forms with single- and multi-record assignment selectors.
- Removed the Phase 1 placeholder dashboards after replacing them with the full Phase 3 foundations.
- Added portal authorization tests and institute-scoped assignment validation tests.
- Added Phase 3 API documentation and manual testing instructions to `README.md`.

### Verification completed

- All backend tests (11 suites, 44 tests).
- Backend and mobile linting and formatting checks.
- Expo Doctor dependency/configuration checks.
- Static Android Expo export validation.
- Dependency audit review.

### Pending environment verification

- Exercise the assignment and portal flows against live MongoDB and Redis.
- Verify Teacher/Student institute isolation with multiple real institutes.
- Visually verify all Teacher and Student screens in an Android development build.

Docker, MongoDB, Redis, and Android ADB remain unavailable in the current execution environment.

### Known bugs

- None identified in the implemented Phase 3 code.

### Known development limitations

- Assignment selectors load up to 100 active records at once; server APIs remain paginated, but a searchable remote selector should be introduced for institutes exceeding that size.
- Teacher/Student profile editing is Admin-controlled in this phase.
- Exam, attendance, assignment, analytics, and related business features remain deferred to their specified phases.
- The process-local rate-limit store and current Expo CLI advisory remain as documented in earlier phases.

## Phase 4 - Question Bank

Status: Implemented; live object-storage and Android runtime verification pending

### Done

- Added an institute-scoped Question model with Subject, topic, difficulty, active status, audit users, timestamps, search text, and soft deletion.
- Added structured Question content blocks for text, LaTeX formula, image, and table content.
- Added structured Option content blocks for text, formula, and image content.
- Added correct-answer validation and two-to-eight Option limits.
- Added compound Subject/difficulty/status indexes and institute-prefixed full-text search.
- Added Admin Question Bank CRUD with pagination, search, Subject/topic/difficulty/status filters, strict validation, and soft deletion.
- Added read-only Teacher Question Bank APIs restricted to assigned active Subjects.
- Added Cloudflare R2/S3-compatible presigned image uploads with institute-owned object keys, constrained MIME types, short expiration, and a 5 MB request limit.
- Added Admin Question Bank counts and Teacher assigned-question counts to the existing dashboards.
- Added a reusable mobile Question Editor with dynamic blocks and options.
- Added reusable FormulaRenderer, ImageBlock, TableBlock, QuestionRenderer, OptionEditor, and QuestionPreview components.
- Added offline KaTeX-to-MathML rendering inside a constrained WebView so saved formulas are rendered rather than displayed as raw LaTeX.
- Added Image Picker selection and direct signed-URL uploads without routing image binaries through MongoDB or the API process.
- Added Question Bank search/filter/list, create, edit, delete, live-preview, saved-preview, and Teacher read-only preview screens.
- Added Question validation, model behavior, authorization, structured table, correct-answer, and upload request tests.
- Added object-storage configuration, API documentation, and Phase 4 manual testing instructions to `README.md`.

### Verification completed

- Backend automated test suite (14 suites, 55 tests).
- Backend and mobile linting and formatting checks.
- Expo dependency/configuration checks.
- Static Android Expo export validation with KaTeX, WebView, and Image Picker bundled.
- Backend production dependency audit.

### Pending environment verification

- Generate and use a real signed upload URL against a configured Cloudflare R2 bucket.
- Verify the R2 public media domain, bucket CORS policy, and mobile image rendering.
- Rebuild the Android development client and visually verify formula, image, table, editor, and preview behavior.
- Exercise Question CRUD, search, and Teacher Subject isolation against live MongoDB.

Cloudflare credentials, Docker, MongoDB, Redis, and Android ADB are unavailable in the current execution environment.

### Known bugs

- None identified in the implemented Phase 4 code.

### Known development limitations

- The mobile Subject selector loads up to 100 active Subjects at once; large institutes should receive a remote-search selector in a later performance phase.
- SVG uploads are supported by the API and renderer, but the mobile photo-library picker primarily exposes raster image formats.
- R2 presigned PUT URLs constrain object key, MIME type, metadata, and expiry; production deployments should additionally enforce isolated media-domain and bucket policies.
- The process-local rate-limit store and current Expo CLI advisory remain as documented in earlier phases.

## Phase 5 — Exam Creation

Status: Implemented; live database and Android runtime verification pending

### Done

- Added an institute-scoped Exam model with name, type, academicSession, batch, subject, snapshotted questions, duration, scheduling, marking scheme, negative marking, instructions, draft/published status, and soft deletion.
- Added Admin CRUD APIs for exams with pagination, search, status/batch/subject filters, and strict Zod validation.
- Added `POST /api/admin/exams/:id/publish` which snapshots questions from the bank, validates counts and correct-answer presence, and transitions status to published.
- Added read-only Teacher exam list and detail APIs restricted to assigned active Subjects.
- Added Student exam list API restricted to the student's active batch and assigned subjects.
- Added Admin exam list, create/edit form, question picker, and detail/preview screens.
- Added Teacher and Student read-only exam list screens.
- Added exam screens to Admin, Teacher, and Student navigation stacks.

## Phase 6 — Student Exam Engine

Status: Implemented; live database and Android runtime verification pending

### Done

- Added an ExamAttempt model with examId, studentId, startedAt, expiresAt, submittedAt, status (in_progress/submitted/auto_submitted), per-question answers with client timestamps, and evaluated score fields.
- Added BullMQ + ioredis delayed auto-submit job scheduled at exam expiry.
- Added `POST /api/student/exams/:id/start` — creates attempt, prevents duplicates, schedules auto-submit job.
- Added `GET /api/student/exams/:id/attempt` — returns attempt with questions (correct answers hidden), server time, and expiresAt for timer sync.
- Added `PUT /api/student/exams/:id/attempt/answers` — idempotent answer sync with client-timestamp conflict resolution.
- Added `POST /api/student/exams/:id/attempt/submit` — manual submit with evaluation.
- Added auto-submit BullMQ worker that evaluates and persists results.
- Added evaluation service computing obtained marks, percentage, correct/wrong/unanswered counts with optional negative marking.
- Added ExamInstructionsScreen, ExamEngineScreen, ExamResultScreen, ExamTimer, and QuestionPalette components.
- Added useExamAttempt hook covering start, resume, answer sync, and submit mutations.
- Added exam engine to Student navigation stack with instructions → engine → result flow.
- Added exam and evaluation backend test suites (10 tests).

### Verification completed

- Phase 5 and 6 backend tests: 10/10 passed.
- Backend lint: clean.
- Backend Prettier: clean.
- Mobile lint: clean (0 errors).
- Mobile Prettier: clean.
- Android Expo export: 999 modules, 0 errors.

### Pending environment verification

- Start Docker, run the backend, and exercise exam creation, publishing, and student attempt flows against live MongoDB and Redis.
- Verify BullMQ auto-submit fires correctly when exam duration expires with Redis running.
- Rebuild the Android development client and visually verify all exam screens on a device/emulator.

Docker, MongoDB, Redis, and Android ADB are unavailable in the current execution environment.

### Known bugs

- None identified in the implemented Phase 5 and 6 code.

### Known development limitations

- The question picker loads up to 100 questions per page; large banks should use server-side search (already supported by the API).
- BullMQ requires Redis to be running; if Redis is unavailable the auto-submit job is not scheduled and the exam will not be auto-submitted until the worker reconnects.
- The exam engine syncs answers every 8 seconds; network failures during sync are silently retried on the next interval.
- The process-local rate-limit store and current Expo CLI advisory remain as documented in earlier phases.

## Pending phases

## Phase 7 - Auto Evaluation & Results

Status: Implemented; live database and Android runtime verification pending

### Done

- Added a Result model with score breakdown, percentage, grade, rank, and publication controls.
- Persisted a result after manual or automatic attempt submission and recalculated exam ranks.
- Added Admin result listing and publish/unpublish endpoints.
- Added Student published-result history and detail endpoints.
- Added the mobile Student result detail and result-history screens.
- Added grade, negative-marking, and result persistence tests.

## Phase 8 - Teacher Analytics

Status: Implemented; live database and Android runtime verification pending

### Done

- Added teacher exam monitoring with total, not-started, in-progress, submitted, and auto-submitted counts.
- Added teacher result listings with student scores, grades, and ranks.
- Added average, highest, lowest, grade distribution, question-wise, and topic-wise analytics.
- Added the mobile Teacher analytics screen with Monitor, Results, and Analytics tabs.
- Registered role-specific result and analytics navigation entry points.
- Added analytics service tests and documented the new API surface in the project progress record.

### Verification completed

- Focused Phase 7/8 backend tests: 18/18 passed.
- Backend lint and Prettier checks passed before the final mobile wiring.

### Pending environment verification

- Exercise result publication, student visibility, and teacher analytics against live MongoDB.
- Verify automatic result creation with Redis/BullMQ running.
- Rebuild the Android development client and visually verify result and analytics screens.

Docker, MongoDB, Redis, and Android ADB are unavailable in the current execution environment.

- Phase 9 — Admin Analytics
- Phase 9 — Admin Analytics
- Phase 10 — Attendance
- Phase 11 — Assignments & Study Materials
- Phase 12 — Fees
- Phase 13 — Notifications
- Phase 14 — PDF & Reports
- Phase 15 — Performance & Security
- Phase 16 — Final Testing
