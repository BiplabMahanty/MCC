# Coaching Management System

The project currently includes Phase 0 infrastructure, Phase 1 authentication, Phase 2 Admin management, Phase 3 Teacher/Student foundations, and the Phase 4 rich Question Bank. It is a JavaScript-only Expo development-build app backed by an Express API, MongoDB, and Redis. Exam creation and live-examination features remain outside the implemented scope.

## Prerequisites

- A React Native-supported Node.js release: 20.19.4+, 22.13.0+, or 24.3.0+ (Node.js 24 LTS recommended)
- npm
- Docker Desktop with Docker Compose
- Android Studio, an Android SDK, and either an emulator or USB-debuggable Android device
- Java/JDK as required by the current Expo Android build tooling

This repository uses Expo development builds with `expo-dev-client`. Do not run it in Expo Go.

On Windows PowerShell, the commands below use `npm.cmd` and `npx.cmd` so they also work when PowerShell script execution blocks `npm.ps1`. On macOS/Linux, use `npm` and `npx` instead.

## 1. Configure local environment files

Run these commands from the repository root:

```powershell
Copy-Item .\backend\.env.example .\backend\.env
Copy-Item .\mobile\.env.example .\mobile\.env
```

The mobile example uses the Android Emulator host alias:

```dotenv
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000/api
```

For a physical Android device, replace `10.0.2.2` in `mobile/.env` with the development computer's LAN IPv4 address. The phone and computer must be on the same network, and the firewall must allow TCP port `4000`.

Expo embeds every `EXPO_PUBLIC_` variable in the app bundle. Never put secrets in these variables.

Before seeding an administrator, edit `backend/.env` and replace these example values:

```dotenv
JWT_ACCESS_SECRET=replace-with-at-least-32-random-characters
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=replace-with-a-strong-password
SEED_ADMIN_INSTITUTE_ID=000000000000000000000001
```

Generate a suitable JWT secret with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

`SEED_ADMIN_INSTITUTE_ID` must be a 24-character MongoDB ObjectId. The provided development ID is valid, but it should be replaced when a real Institute model is introduced.

Question images use Cloudflare R2 through its S3-compatible API. Set these values before testing image blocks:

```dotenv
OBJECT_STORAGE_ENDPOINT=https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
OBJECT_STORAGE_REGION=auto
OBJECT_STORAGE_BUCKET=coaching-management
OBJECT_STORAGE_ACCESS_KEY_ID=your-r2-access-key
OBJECT_STORAGE_SECRET_ACCESS_KEY=your-r2-secret-key
OBJECT_STORAGE_PUBLIC_BASE_URL=https://media.example.com
OBJECT_STORAGE_SIGNED_URL_TTL_SECONDS=300
```

Use a bucket-scoped token that can read object metadata and write objects, and expose public reads through a dedicated media domain without application cookies. Configure the bucket to permit `PUT` requests with `Content-Type` and `x-amz-meta-size` headers from the required clients. If storage is not configured, the rest of the API still starts, but image-signing requests return HTTP 503.

## 2. Install dependencies

Dependencies and lockfiles are already defined. To perform a clean install:

```powershell
Set-Location .\backend
npm.cmd ci
Set-Location ..\mobile
npm.cmd ci
Set-Location ..
```

## 3. Start MongoDB and Redis

From the repository root:

```powershell
docker compose up -d
docker compose ps
```

Wait until both services report `healthy`. Their local endpoints are:

- MongoDB: `mongodb://127.0.0.1:27017/coaching_management`
- Redis: `redis://127.0.0.1:6379`

To inspect their logs:

```powershell
docker compose logs mongodb redis
```

To stop the containers while retaining data:

```powershell
docker compose down
```

To also delete the local MongoDB and Redis volumes, use `docker compose down --volumes`. This permanently removes local development data.

## 4. Create the first administrator

With MongoDB running and the seed values configured:

```powershell
Set-Location .\backend
npm.cmd run seed:admin
```

The command is idempotent: if an active user already has the configured email address, it makes no changes. The password is hashed before MongoDB stores it.

## 5. Start the backend

Open a terminal from the repository root:

```powershell
Set-Location .\backend
npm.cmd run dev
```

The API listens on all local interfaces at port `4000`. Check it from PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:4000/api/health | ConvertTo-Json -Depth 5
```

A ready environment returns HTTP 200 with this shape:

```json
{
  "status": "healthy",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "uptimeSeconds": 10,
  "services": {
    "api": { "status": "connected" },
    "mongodb": { "status": "connected" },
    "redis": { "status": "connected" }
  }
}
```

If MongoDB or Redis is unavailable, the API remains reachable and returns HTTP 503 with `status: "degraded"` and the disconnected dependency identified.

## 6. Build and run the Android app

The first run must compile and install a development build. Start an emulator or connect an Android device, then open a second terminal:

```powershell
Set-Location .\mobile
npm.cmd run android:dev-build
```

Expo generates native projects locally through Continuous Native Generation. The generated `mobile/android` and `mobile/ios` directories are ignored because `app.json` is their source of truth.

After the development build is installed, normal JavaScript-only development sessions use:

```powershell
Set-Location .\mobile
npm.cmd start
```

Open the installed **Coaching Management System** development client and connect it to the Metro server. Sign in with the seeded administrator credentials. The app restores valid sessions at launch and routes authenticated users by role. Administrators can then manage the Phase 2 foundation records from their dashboard.

Phase 1 added `expo-secure-store`, Phase 2 added FlashList, and Phase 4 added Image Picker and WebView. Rebuild an older development client before testing these phases; a JavaScript reload alone cannot add a native dependency.

If an app-config or native dependency change requires a fresh build, rerun:

```powershell
npm.cmd run android:dev-build
```

## Quality checks

Backend:

```powershell
Set-Location .\backend
npm.cmd run lint
npm.cmd run format:check
npm.cmd test
```

Mobile:

```powershell
Set-Location .\mobile
npm.cmd run lint
npm.cmd run format:check
npm.cmd run doctor
npx.cmd expo export --platform android
```

Run all checks before beginning another phase.

## Authentication API

The API exposes:

- `POST /api/auth/login` — accepts `email` and `password`
- `POST /api/auth/refresh` — rotates the supplied refresh token
- `POST /api/auth/logout` — revokes the supplied refresh token
- `GET /api/auth/me` — requires an access-token Bearer header

Access tokens are short-lived JWTs. Refresh tokens are opaque random values returned in the JSON response, stored by the app only in SecureStore, and stored by the backend only as SHA-256 hashes.

PowerShell example:

```powershell
$loginBody = @{
  email = "admin@example.com"
  password = "your-configured-admin-password"
} | ConvertTo-Json

$authSession = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:4000/api/auth/login `
  -ContentType "application/json" `
  -Body $loginBody

$authHeaders = @{ Authorization = "Bearer $($authSession.accessToken)" }
Invoke-RestMethod `
  -Method Get `
  -Uri http://127.0.0.1:4000/api/auth/me `
  -Headers $authHeaders
```

Rotate the refresh token:

```powershell
$refreshBody = @{ refreshToken = $authSession.refreshToken } | ConvertTo-Json
$authSession = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:4000/api/auth/refresh `
  -ContentType "application/json" `
  -Body $refreshBody
```

The previous refresh token becomes invalid immediately after successful rotation.

## Admin API

Every Admin endpoint requires an Admin access-token Bearer header. The server derives `instituteId` from that authenticated user; clients cannot choose or override it.

- `GET /api/admin/dashboard` returns non-deleted Student, Teacher, Course, Batch, and Subject totals.
- `/api/admin/students`
- `/api/admin/teachers`
- `/api/admin/courses`
- `/api/admin/batches`
- `/api/admin/subjects`

Each resource path supports `GET` and `POST` on the collection plus `GET`, `PATCH`, and `DELETE` on `/:id`. `DELETE` is a soft delete and returns HTTP 204. List requests accept `page`, `limit`, `search`, and `isActive`; Batch and Subject lists also accept `courseId`. The default page size is 20 and the maximum is 100.

Phase 3 assignment fields are managed through the same Admin endpoints:

- A Student may have one optional `batchId`.
- A Batch may have up to 50 unique `teacherIds`.
- A Subject may have up to 50 unique `teacherIds`.

All referenced records must be active, non-deleted, and owned by the authenticated Admin's institute.

PowerShell list example using `$authHeaders` from the authentication example:

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://127.0.0.1:4000/api/admin/students?page=1&limit=20&search=alex&isActive=true" `
  -Headers $authHeaders
```

Create a course:

```powershell
$courseBody = @{
  name = "Foundation Mathematics"
  code = "MATH-FDN"
  description = "Foundation course"
  isActive = $true
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:4000/api/admin/courses `
  -Headers $authHeaders `
  -ContentType "application/json" `
  -Body $courseBody
```

## Teacher and Student portal API

Teacher endpoints require a Teacher token:

- `GET /api/teacher/dashboard`
- `GET /api/teacher/profile`
- `GET /api/teacher/batches`
- `GET /api/teacher/subjects`
- `GET /api/teacher/students`

Student endpoints require a Student token:

- `GET /api/student/dashboard`
- `GET /api/student/profile`
- `GET /api/student/batch`
- `GET /api/student/subjects`
- `GET /api/student/teachers`

Portal responses are derived from Admin-controlled assignments and are restricted to active, non-deleted records in the authenticated user's institute. An unassigned Student receives `null` for the batch and empty Subject/Teacher collections.

## Question Bank API

Admin endpoints:

- `GET /api/admin/questions` - paginated search and filters.
- `POST /api/admin/questions` - create a structured question.
- `GET /api/admin/questions/:id` - retrieve a question for editing or preview.
- `PATCH /api/admin/questions/:id` - update a question.
- `DELETE /api/admin/questions/:id` - soft-delete a question.
- `POST /api/admin/uploads/question-image` - create a short-lived signed PUT URL.

Teacher endpoints are read-only and restricted to active questions belonging to assigned active Subjects:

- `GET /api/teacher/questions`
- `GET /api/teacher/questions/:id`

Question lists accept `page`, `limit`, `search`, `subjectId`, `topic`, `difficulty`, and `isActive` where the role permits it. Question content is stored as structured `text`, `formula`, `image`, and `table` blocks. Options contain structured `text`, `formula`, and `image` blocks. Formulas are stored as LaTeX strings and rendered through KaTeX; large image binaries are uploaded directly to R2 and never stored in MongoDB.

Image upload flow:

1. Send the filename, MIME type, and byte size to `/api/admin/uploads/question-image`.
2. PUT the binary to the returned `uploadUrl` with every returned header.
3. Store the returned `url`, `storageKey`, MIME type, dimensions, and accessible alternative text in an image block.

Uploads accept PNG, JPG, WEBP, and SVG up to 5 MB. Before saving a Question, the backend reads the uploaded object's metadata and verifies its actual size, declared size, and MIME type. Presigned URLs expire after the configured TTL and are restricted to the authenticated institute's question-image path.

## Phase 0 testing checklist

1. Run `docker compose up -d` and confirm MongoDB and Redis are healthy.
2. Run the backend and call `GET /api/health`; confirm HTTP 200 and three connected services.
3. Stop Redis with `docker compose stop redis`; confirm the endpoint returns HTTP 503 and Redis is disconnected.
4. Restart Redis with `docker compose start redis`; confirm the endpoint returns HTTP 200 again.
5. Open the Android development build; confirm it displays **Backend connected** and both dependencies as connected.
6. Stop the backend; refresh the app and confirm the backend-unavailable error and retry action appear.
7. Restart the backend; tap **Try again** and confirm the connected state returns.
8. Run both projects' lint and formatting checks plus the backend test suite.

## Phase 1 testing checklist

1. Start MongoDB and Redis, configure `backend/.env`, and run `npm.cmd run seed:admin`.
2. Start the backend and confirm an incorrect password returns HTTP 401 without identifying whether the email exists.
3. Sign in with the seeded administrator and confirm access and refresh tokens plus the public user are returned.
4. Call `GET /api/auth/me` with the access token and confirm no password hash or refresh-token data is exposed.
5. Call `POST /api/auth/refresh`; confirm it returns a new refresh token and the previous token can no longer be reused.
6. Rebuild and open the Android development client, sign in, and confirm the Admin dashboard appears.
7. Close and reopen the app; confirm the session is restored through SecureStore and refresh-token rotation.
8. Sign out and reopen the app; confirm the Login screen appears and the revoked refresh token cannot restore the session.
9. Run the backend test suite and both projects' lint, formatting, and Expo validation commands.

## Phase 2 testing checklist

1. Sign in as the seeded Admin and confirm the dashboard shows totals for Students, Teachers, Courses, Batches, and Subjects.
2. Create a Course, then create a Batch and Subject assigned to that Course.
3. Create one Student and one Teacher; sign out and confirm each active account can sign in and reaches its role dashboard.
4. Search each Admin list, switch among All/Active/Inactive filters, and create more than 20 records to verify pagination loads the next page.
5. Edit each resource and confirm the changed data appears after returning to its list.
6. Make a Student or Teacher inactive and confirm that account can no longer sign in.
7. Soft-delete a record and confirm it disappears from its list and dashboard total without being physically removed from MongoDB.
8. Attempt to delete a Course that still has a non-deleted Batch or Subject and confirm the API rejects it with HTTP 409.
9. Use a Teacher/Student token against `/api/admin/dashboard` and confirm HTTP 403; omit the token and confirm HTTP 401.
10. Create a second institute's data directly for test purposes and confirm the first institute's Admin cannot list, fetch, update, or delete it.
11. Run the backend test suite and both projects' lint, formatting, Expo Doctor, and Android export commands.

## Phase 3 testing checklist

1. As Admin, create an active Course, Batch, Teacher, Student, and Subject.
2. Edit the Batch and Subject to assign the Teacher, then edit the Student to assign the Batch.
3. Sign in as the Teacher and confirm dashboard totals match the assigned Batches, Subjects, and Students.
4. Open the Teacher profile, assigned Batch list, assigned Subject list, and Student list; confirm no unrelated institute data appears.
5. Sign in as the Student and confirm the dashboard identifies the assigned Batch and displays Subject/Teacher totals.
6. Open the Student profile, Batch information, Subject list, and Teacher list; confirm they reflect the Admin assignments.
7. Remove an assignment or make a related record inactive and confirm it no longer appears in the appropriate portal after refresh.
8. Confirm an unassigned Student receives an empty-state experience rather than an error.
9. Attempt to assign a Teacher or Batch from another institute through the API and confirm HTTP 400.
10. Use a Student token against `/api/teacher/*` and a Teacher token against `/api/student/*`; confirm HTTP 403.
11. Run the backend tests and both projects' lint, formatting, Expo Doctor, and Android export commands.

## Phase 4 testing checklist

1. Configure a Cloudflare R2 bucket, credentials, public media domain, and upload headers in `backend/.env`.
2. Rebuild the Expo development client because Phase 4 adds Image Picker and WebView native modules.
3. As Admin, open Question Bank and create a question containing text and at least two options.
4. Add valid LaTeX such as `\frac{-b \pm \sqrt{b^2-4ac}}{2a}` and confirm the live and saved previews render formatted mathematics rather than raw LaTeX.
5. Add a PNG, JPG, or WEBP image; confirm the client uploads directly through the signed URL and MongoDB stores only metadata and the object URL.
6. Add a table and confirm headers and every row render with matching columns.
7. Create options using text, formula, and image blocks; select the correct answer and confirm preview highlights it.
8. Search by question content and filter by Subject, topic through the API, difficulty, and active status.
9. Edit and soft-delete a question; confirm updates appear and the deleted question disappears without being physically removed from MongoDB.
10. Sign in as a Teacher and confirm only active questions for assigned active Subjects are visible and read-only.
11. Attempt cross-institute Subject or image metadata references through the API and confirm they are rejected.
12. Try invalid LaTeX, mismatched table rows, an unsupported image type, a file over 5 MB, and an out-of-range correct answer; confirm safe validation errors.
13. Run the backend tests and both projects' lint, formatting, Expo Doctor, and Android export commands.

## Project layout

```text
.
├── backend/            Express API, infrastructure connections, and tests
├── mobile/             Expo development-build application
├── docker-compose.yml  Local MongoDB and Redis
├── PROGRESS.md         Phase status and known limitations
└── spce.md             Master product specification
```

Phase 5 and later remain intentionally unimplemented. Follow `spce.md` and complete only one authorized phase at a time.
