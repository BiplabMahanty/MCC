# Coaching Management System — Master Development Prompt

You are a senior full-stack architect and React Native + Node.js developer.

I want to build a production-ready **Coaching Management System** for coaching institutes.

The application must be developed in **phases**. Do NOT try to build the entire application at once.

After completing each phase, stop and wait for my instruction before starting the next phase.

---

# 1. TECHNOLOGY STACK

## Mobile App

* React Native
* JavaScript only
* JSX
* Do NOT use TypeScript
* React Navigation
* Reusable components
* Feature/module-based architecture
* TanStack Query for server state
* MMKV for fast local storage where appropriate
* Proper loading, error and empty states
* Responsive layouts for different Android screen sizes

## Backend

* Node.js
* Express.js
* JavaScript only
* REST API
* MongoDB
* Mongoose
* Redis
* BullMQ for background jobs
* JWT authentication
* Refresh token system
* bcrypt/bcryptjs for password hashing
* Zod or Joi for validation
* Helmet
* CORS
* Rate limiting
* Pino or another structured logger

## Database

MongoDB is the permanent database.

Redis must NOT replace MongoDB.

Use Redis for:

* caching
* temporary exam state
* rate limiting
* frequently accessed data
* background-job queues
* temporary session information

Use BullMQ + Redis for:

* notifications
* PDF generation
* heavy reports
* background processing
* scheduled jobs

---

# 2. IMPORTANT DEVELOPMENT RULES

## JavaScript Only

The entire project must use:

* `.js`
* `.jsx`

Do NOT create:

* `.ts`
* `.tsx`
* TypeScript interfaces
* TypeScript types

---

# 3. MOBILE UI DESIGN

The application must have a premium, modern, simple and professional mobile-app design.

## COLOR THEME — ORANGE + BLACK

The primary visual theme is:

Orange + Black
White / neutral surfaces

Use the following color palette:

Primary Orange:
#F97316

Orange Gradient:
#FB923C → #F59E0B

Black:
#0A0A0A

Dark Neutral:
#171717

White:
#FFFFFF

Light Neutral:
#F7F7F7

Border:
#E5E5E5

Muted Text:
#737373

## Color Usage

Use orange for:

Primary buttons
Active navigation
Important actions
Progress indicators
Selected tabs
Exam actions
Important highlights
Active status where appropriate

Use black for:

Main headings
Navigation text
Important UI elements
Login branding
Premium/dark sections

Use white/light neutral for:

Cards
Backgrounds
Forms
Lists
Content areas

Use orange gradient only for important visual areas such as:

Login screen branding
Primary CTA areas
Dashboard highlights
Important cards

Do NOT use gradients everywhere.

## Important Color Rules

Do NOT use:

Green as the primary UI color
Purple as the primary UI color
Blue as the primary UI color
Too many colors
Multiple competing gradients
Very bright neon orange
Excessive orange backgrounds

Keep the interface mostly:

White / Neutral + Black + Orange

Orange should be an accent color, not cover the entire screen.

## Status Colors

Status colors can be used only when necessary:

Success → subtle green
Warning → subtle amber
Error → subtle red
Information → subtle blue

Do not use these colors as part of the main branding.

## Visual Style

The application should look:

Premium
Modern
Clean
Professional
Minimal
Educational
Mobile-first

Use:

Rounded cards
Clean spacing
Subtle shadows
Consistent typography
Simple icons
Clear hierarchy
Smooth but minimal animations

Do not make the UI overly colorful.

## Icons

Use icons where they improve usability.

Examples:

Home
Students
Teachers
Courses
Exams
Questions
Results
Attendance
Assignments
Fees
Reports
Settings
Profile
Notifications

Use one consistent icon family throughout the application.

Do not add icons unnecessarily.

## Role-specific UI

Admin, Teacher and Student must use the SAME overall Orange + Black design system.

Only the available features/navigation should change by role.

Do NOT create completely different visual themes for each role.
---

# 4. USER ROLES

There are three main roles:

## Admin

Admin controls the entire coaching system.

Admin can manage:

* students
* teachers
* batches
* courses
* subjects
* exams
* question bank
* results
* attendance
* fees
* assignments
* notifications
* reports
* settings

## Teacher

Teacher can manage/view:

* assigned batches
* assigned subjects
* exams
* students
* attendance
* assignments
* exam monitoring
* student performance
* question analysis
* results

Teachers should NOT have unrestricted admin permissions.

## Student

Student can access:

* dashboard
* profile
* batch
* classes
* attendance
* assignments
* exams
* MCQ tests
* results
* performance analytics
* notifications
* study materials

Permissions must be role-based.

---

# 5. PROJECT ARCHITECTURE

Do NOT create a separate file for every tiny UI element.

Use reusable components and modules.

## Mobile structure

Use a feature/module-based structure similar to:

mobile/

src/

components/

common/
Button/
Input/
Modal/
Card/
Header/
Loader/
EmptyState/
ErrorState/

navigation/

auth/
dashboard/
students/
teachers/
exams/
questions/
results/
attendance/
assignments/
fees/
notifications/
profile/

Each feature can contain:

* screens
* components
* hooks
* services
* utils

Do not duplicate components.

For example, don't create:

StudentButton.js
TeacherButton.js
AdminButton.js

Use one reusable Button component.

---

# 6. BACKEND ARCHITECTURE

Use a clean modular architecture.

backend/

src/

config/

models/

controllers/

routes/

services/

middleware/

validators/

utils/

queues/

workers/

cache/

constants/

logs/

Each feature should have a clear responsibility.

Use:

Route
→ Controller
→ Service
→ Model

Do not put all business logic inside controllers.

---

# 7. SECURITY

Implement:

* JWT access tokens
* Refresh tokens
* Password hashing
* Role-based authorization
* Helmet
* CORS
* Rate limiting
* Request validation
* MongoDB query sanitization
* Proper error handling
* Secure HTTP-only refresh token strategy where appropriate
* Never expose password hashes
* Never expose sensitive fields unnecessarily

Never send exam correct answers to the student application.

---

# 8. PERFORMANCE REQUIREMENTS

The application must be designed for future growth.

Use:

### MongoDB

Proper indexes for frequently searched fields.

Use pagination for:

* students
* teachers
* exams
* questions
* results
* attendance
* payments
* assignments

Never load thousands of records unnecessarily.

### Redis

Use Redis for:

* cache
* exam attempt temporary state
* rate limiting
* frequently requested data

### BullMQ

Use background workers for:

* PDF generation
* notifications
* large reports
* other expensive tasks

### React Native

Use TanStack Query for:

* caching
* refetching
* pagination
* server state

Use MMKV for suitable local data.

Avoid unnecessary re-renders.

Use FlatList/FlashList for large lists.

---

# 9. EXAM MODULE IS THE MOST IMPORTANT MODULE

The exam system is primarily an **MCQ online examination system**.

It must support:

* single-correct MCQ
* multiple options
* marks
* negative marking
* exam duration
* fixed exam schedule
* automatic submission
* server-controlled timing
* question palette
* direct question navigation
* mark for review
* auto-save
* temporary offline support
* result calculation
* performance analytics

---

# 10. EXAM TIMER

The exam timer must NOT depend only on React Native's local timer.

When a student starts an exam:

Backend creates:

* attemptId
* startedAt
* expiresAt

Example:

Exam duration:

3 hours

Student starts:

10:00 AM

Server creates:

expiresAt = 1:00 PM

The mobile application displays the countdown using the server expiration time.

If the student:

* closes the application
* reopens it
* backgrounds the application
* restarts the phone

the timer must continue correctly.

Changing the phone's local time must not give additional exam time.

The backend must always validate:

current server time < expiresAt

When the time expires:

1. Automatically submit the attempt.
2. Save answers.
3. Evaluate answers.
4. Generate result.
5. Mark attempt as submitted.
6. Prevent further answers.

---

# 11. QUESTION PALETTE

During an exam, provide a Question Palette.

It must open as a popup/bottom sheet.

Example:

Question Palette

1  2  3  4  5
6  7  8  9  10
11 12 13 14 15
16 17 18 19 20
...

Question states:

* Green = Answered
* White/neutral = Not Visited
* Yellow = Visited but unanswered
* Blue = Current
* Purple = Marked for Review

When the student taps a question number:

1. Close the palette.
2. Navigate directly to that question.
3. Display the selected question.

Do NOT force the student to use only Previous/Next.

---

# 12. MARK FOR REVIEW

Students should be able to mark a question for review.

Example:

[ Mark for Review ]

The question should then appear as purple in the question palette.

A student can:

* answer it
* mark it for review
* return to it
* change the answer
* remove the review mark

---

# 13. AUTO-SAVE ANSWERS

When a student selects an answer:

* update UI immediately
* save locally
* synchronize with backend

Do not wait until the final Submit button to save every answer.

If internet temporarily disconnects:

* keep answers locally
* continue the exam where possible
* synchronize when internet returns

However, the server remains authoritative for:

* exam time
* submission
* scoring
* final result

---

# 14. QUESTION BUILDER

The Admin question builder must support rich MCQ content.

A question cannot be only plain text.

It must support:

* text
* mathematical formulas
* images
* tables

Both the question and options can contain rich content.

Example:

Question:

Find the value of:

x² + 5x + 6 = 0

Options:

A. x = -2
B. x = -3
C. x = 2
D. x = 3

---

# 15. MATHEMATICS FORMULAS

Support mathematical formulas using a structured formula format such as LaTeX.

Examples:

x^2 + 5x + 6 = 0

\frac{-b \pm \sqrt{b^2-4ac}}{2a}

\sqrt{x}

\frac{a}{b}

x_1

\sum_{i=1}^{n} i

\int_0^1 x^2 dx

\sin(x)

\theta

\pi

The mobile application must render formulas properly.

Do not display raw LaTeX to students.

---

# 16. QUESTION IMAGES AND DIAGRAMS

Questions can contain:

* diagrams
* graphs
* geometry figures
* physics diagrams
* chemistry diagrams
* charts
* images

Support:

* PNG
* JPG
* WEBP
* SVG where practical

Do not store large files directly inside MongoDB.

Store files in object/file storage and save metadata/URL in MongoDB.

---

# 17. QUESTION CONTENT SHOULD BE STRUCTURED

Do not store the entire question as one large HTML string.

Use structured content blocks.

Example:

{
type: "text",
value: "Find the area of the triangle."
}

{
type: "formula",
value: "\frac{1}{2}bh"
}

{
type: "image",
url: "..."
}

The same renderer should work for:

* Admin preview
* Teacher preview
* Student exam
* Result review
* Question bank

---

# 18. QUESTION OPTIONS

Options must also support rich content.

For example:

Option A:
Text

Option B:
Formula

Option C:
Image

Option D:
Formula + text

The database must support this structure.

---

# 19. QUESTION TYPES

Phase 1:

* Single Correct MCQ

Later:

* Multiple Correct MCQ
* True/False
* Assertion & Reason
* Match the Following
* Numerical Answer
* Fill in the Blank

Do not implement every type in Phase 1.

---

# 20. EXAM MARKING

Support:

Correct answer:
+2

Wrong answer:
-0.5

Unanswered:
0

The marking system must be configurable per exam.

Do not hard-code the marks.

---

# 21. RESULT CALCULATION

After submission automatically calculate:

* total questions
* attempted questions
* correct answers
* wrong answers
* unanswered
* total marks
* obtained marks
* percentage
* grade
* rank if enabled

Example:

50 questions

Correct = 40
Wrong = 7
Unanswered = 3

Correct marks:
40 × 2 = 80

Negative:
7 × 0.5 = 3.5

Final:
76.5 / 100

---

# 22. TEACHER EXAM FEATURES

Teacher should be able to:

* view assigned exams
* view exam schedule
* monitor students
* see started students
* see not-started students
* see submitted students
* see students currently taking exam
* view results
* view batch performance
* view question-wise performance
* view topic-wise performance

Teacher should NOT manually enter marks for MCQ exams.

The system evaluates them automatically.

---

# 23. ADMIN EXAM FEATURES

Admin should be able to:

* create exam
* edit exam
* delete draft exam
* publish exam
* unpublish where appropriate
* create questions
* edit questions
* create question bank
* assign questions
* configure duration
* configure marking
* configure negative marking
* configure exam schedule
* assign batch
* assign subject
* assign teacher
* monitor exam
* review results
* publish results
* unlock/re-evaluate results
* view analytics

---

# 24. STUDENT EXAM FEATURES

Student should be able to:

* see upcoming exams
* see exam instructions
* start exam
* answer MCQs
* navigate using Previous/Next
* open Question Palette
* jump directly to a question
* mark for review
* change answers
* see remaining time
* resume after app restart
* submit manually
* get automatically submitted when time expires
* see result after publication
* see performance analytics

---

# 25. EXAM ATTEMPT DATABASE

Create a separate ExamAttempt model.

Example:

{
examId,
studentId,
startedAt,
expiresAt,
submittedAt,
status,
answers,
score,
correctAnswers,
wrongAnswers,
unanswered
}

Statuses:

* not_started
* in_progress
* submitted
* auto_submitted
* expired

---

# 26. RESULT SYSTEM

Results should be separate from the exam attempt where appropriate.

Student should be able to view:

* score
* percentage
* grade
* correct/wrong/unanswered
* subject/topic performance
* previous exam performance
* improvement

Admin can control when results become visible.

---

# 27. EXAM ANALYTICS

Teacher/Admin should be able to see:

Class average

Highest score

Lowest score

Number of submissions

Question-wise accuracy

Example:

Question 1 → 92% correct
Question 2 → 81% correct
Question 3 → 43% correct

This helps teachers identify difficult topics.

---

# 28. PHASED DEVELOPMENT

Build the project in the following phases.

## PHASE 0 — Project Foundation

Create:

* React Native JavaScript project
* Node.js JavaScript backend
* MongoDB connection
* Redis connection
* environment configuration
* basic folder architecture
* ESLint/Prettier if appropriate
* API error handling
* logging
* basic security middleware

Do NOT build business features yet.

At the end:

* verify mobile app runs
* verify backend runs
* verify MongoDB connection
* verify Redis connection

STOP.

---

## PHASE 1 — Authentication & Roles

Build:

* Admin login
* Teacher login
* Student login
* JWT authentication
* Refresh token
* Password hashing
* Role-based authorization
* Logout
* Current-user API
* protected navigation

Mobile:

* Splash
* Login
* Role-based dashboard routing

Backend:

* User model
* auth routes
* auth controller
* auth service
* auth middleware

STOP after testing.

---

## PHASE 2 — Admin Foundation

Build Admin features:

* dashboard
* student management
* teacher management
* batch management
* course management
* subject management

Use:

* pagination
* search
* filters
* reusable components
* proper MongoDB indexes

STOP.

---

## PHASE 3 — Teacher & Student Foundation

Teacher:

* dashboard
* profile
* assigned batches
* assigned subjects
* student list

Student:

* dashboard
* profile
* batch information
* subjects
* teacher information

STOP.

---

# PHASE 4 — QUESTION BANK

This is a major phase.

Build:

* question bank
* subject
* topic
* difficulty
* question creation
* question editing
* question deletion
* question preview
* question search
* question filtering

Build the rich Question Builder:

* text
* formula
* image
* table

Options must also support:

* text
* formula
* image

Build reusable:

QuestionEditor
QuestionRenderer
FormulaRenderer
ImageBlock
TableBlock
OptionEditor
QuestionPreview

Do not yet build the complete live examination.

STOP.

---

# PHASE 5 — EXAM CREATION

Build Admin exam creation.

Support:

* exam name
* exam type
* academic session
* batch
* subject
* teacher
* questions
* duration
* start date
* start time
* end time
* total marks
* marks per question
* negative marking
* negative marks
* instructions
* publish status

Allow Admin to select questions from the question bank.

STOP.

---

# PHASE 6 — STUDENT EXAM ENGINE

This is one of the most important phases.

Build:

* exam instructions
* start exam
* exam attempt
* server-controlled timer
* question navigation
* answer selection
* auto-save
* question palette popup
* direct question navigation
* marked for review
* answer states
* submit confirmation
* manual submit
* automatic submit

Implement Redis where appropriate.

Implement server-side expiration validation.

STOP.

---

# PHASE 7 — AUTO EVALUATION & RESULTS

Build:

* automatic answer evaluation
* positive marks
* negative marks
* unanswered calculation
* percentage
* grade
* rank
* result model
* result publication
* result locking/unlocking

Student result screen.

STOP.

---

# PHASE 8 — TEACHER ANALYTICS

Build:

* exam monitoring
* student participation
* batch results
* average marks
* highest/lowest marks
* question-wise analysis
* topic-wise analysis
* student performance

STOP.

---

# PHASE 9 — ADMIN ANALYTICS

Build:

* exam analytics
* student analytics
* batch analytics
* teacher analytics
* performance reports
* dashboard statistics

Use MongoDB aggregation where appropriate.

Use Redis caching for expensive/repeated dashboard data.

STOP.

---

# PHASE 10 — Attendance

Build:

* attendance creation
* student attendance
* teacher attendance where required
* daily attendance
* monthly attendance
* attendance percentage
* reports

STOP.

---

# PHASE 11 — Assignments & Study Materials

Build:

* assignments
* assignment submission
* study materials
* PDFs
* images
* documents
* teacher uploads
* student downloads/submissions

Use object/file storage for large files.

STOP.

---

# PHASE 12 — Fees

Build:

* fee plans
* payments
* pending fees
* payment history
* receipts
* fee reports
* reminders

Financial data must be handled carefully and must not rely only on cache.

STOP.

---

# PHASE 13 — Notifications

Build:

* announcements
* exam reminders
* assignment reminders
* fee reminders
* result notifications

Use BullMQ + Redis for background notification jobs.

STOP.

---

# PHASE 14 — PDF & Reports

Build:

* result PDF
* marksheet
* exam report
* attendance report
* fee receipt
* student performance report

Heavy PDF generation should run through BullMQ workers rather than blocking API requests.

STOP.

---

# PHASE 15 — PERFORMANCE & SECURITY

Optimize:

* MongoDB indexes
* Redis caching
* API pagination
* API response size
* React Native rendering
* FlatList/FlashList
* TanStack Query caching
* image optimization
* lazy loading
* background jobs
* rate limiting
* security headers
* validation
* logging

Test with realistic data.

Example:

* 5,000 students
* 500 teachers
* 200 batches
* 10,000 questions
* 1,000 exams
* hundreds of students taking an exam simultaneously

STOP.

---

# PHASE 16 — FINAL TESTING

Test:

* authentication
* role permissions
* exam timing
* auto-submit
* app restart during exam
* network disconnection
* answer synchronization
* duplicate submission
* expired exam
* negative marking
* result calculation
* question navigation
* question palette
* marked for review
* concurrent students
* Redis failure
* MongoDB failure handling
* API security

Fix all important issues before deployment.

---

# 29. VERY IMPORTANT CODING RULE

Do not generate huge amounts of code without testing.

For each phase:

1. Explain what you are going to build.
2. Show the proposed architecture/files.
3. Implement the phase.
4. Check for errors.
5. Tell me how to run it.
6. Give me testing steps.
7. STOP.

Do not automatically move to the next phase.

I will tell you:

"Continue Phase 2"

or

"Start Phase 3"

etc.

---

# 30. DO NOT OVERENGINEER

Keep the first version maintainable.

Do not add unnecessary microservices.

Use:

React Native
+
Node.js/Express
+
MongoDB
+
Redis
+
BullMQ

as a modular monolith.

If the application grows significantly, the architecture can later be split.

---

# 31. FINAL GOAL

The final application should feel like a professional coaching institute platform.

The most important feature is:

## MCQ ONLINE EXAMINATION

It must provide:

Admin
→ Create Exam
→ Build Rich Questions
→ Schedule Exam
→ Publish

Teacher
→ Monitor Exam
→ Analyze Performance

Student
→ Start Exam
→ Answer MCQs
→ Use Question Palette
→ Mark for Review
→ Automatic Save
→ Server-controlled Timer
→ Automatic Submission
→ Automatic Evaluation
→ View Results

The system should be fast, secure, scalable and maintainable.

Remember:

**JavaScript only.**
**React Native, not web React.**
**MongoDB for permanent data.**
**Redis for cache/temporary high-speed operations.**
**BullMQ for background jobs.**
**Do not expose correct answers to students.**
**Server controls exam timing.**
**Build phase by phase and stop after each phase.**


---

# DECISIONS (these override anything above if there is a conflict)

## Mobile

Framework: Expo (managed workflow with a development build, NOT Expo Go). Use expo-dev-client.

JavaScript only, no TypeScript.

Platform: Android first (write iOS-compatible code where possible).

Secure storage: expo-secure-store for the refresh token. Do NOT store tokens in MMKV.

MMKV only for non-sensitive data (UI preferences, cached data, offline exam answers).

Navigation: React Navigation. Large lists: FlashList.

Formula rendering: KaTeX inside react-native-webview. Render one question at a time in the exam and cache the rendered formula/output where appropriate.

Push notifications: expo-notifications with FCM.

Colors:
  - Primary orange: #F97316
  - Orange gradient: #FB923C to #F59E0B
  - Black: #0A0A0A
  - Dark neutral: #171717
  - White: #FFFFFF
  - Light neutral: #F7F7F7
  - Border: #E5E5E5
  - Muted text: #737373

Orange is the primary brand color. Use it for primary buttons, active states, important highlights, progress indicators and selected states.

Use orange gradients selectively for branding, login screens, important dashboard sections and major CTA areas.

Do NOT use green as a primary UI/branding color.

Do NOT introduce additional primary colors or excessive gradients.

Question builder lives in the mobile Admin app, as described in the spec.

## Backend
- Node.js + Express, JavaScript only, modular monolith.
- Refresh tokens: rotate on every use and store them hashed in MongoDB. Return them in the JSON response body (no cookies, because this is a mobile app).
- Soft delete for main entities.
- Seed script to create the first admin user.
- Jest + Supertest for backend tests.
- Docker Compose for local MongoDB and Redis.

## Data and tenancy
- Single institute for now, but add an `instituteId` field to every model from the start.
- Store all dates in UTC. Display them in the device's local timezone.
- File storage: Cloudflare R2 or AWS S3 with signed-URL uploads (final choice in Phase 4).

## Exam rules
- Auto-submit must NOT depend on the app. Use a BullMQ delayed job at expiresAt, plus an expiry check on every exam request.
- expiresAt = min(startedAt + duration, exam end time).
- One active attempt per student per exam (unique index).
- Answer sync must be idempotent: each answer carries a version/timestamp, and older updates never overwrite newer ones.
- Snapshot the questions into the exam when it is published, so later edits to the question bank never change old exams or results.
- Store correct answers in a separate hidden field/collection. Never send them to student APIs.
- Redis holds in-progress answers and attempt state. MongoDB is the source of truth after submit.

## Workflow rules
- Work on ONE phase at a time. Stop after each phase and wait for my command.
- For big phases (4 and 6), split into sub-parts and stop after each part.
- Update PROGRESS.md after every phase (done, pending, known bugs).
- Never build anything from a later phase.