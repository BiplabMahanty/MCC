# Schedule Feature — Backend Implementation

## Overview

A Schedule entry represents a class time slot:
**Batch + Subject + Teacher + Day + Start time + End time + Room (optional)**

---

## Files Created / Modified

### New Files

| File | Purpose |
|------|---------|
| `backend/src/models/Schedule.js` | Mongoose model |
| `backend/src/validators/admin/schedule.validators.js` | Zod validators |
| `backend/src/services/admin/schedule.service.js` | Admin CRUD + overlap detection |
| `backend/src/controllers/admin/schedule.controller.js` | Admin controller |
| `backend/src/routes/admin/schedules.routes.js` | Admin CRUD routes |

### Modified Files

| File | Change |
|------|--------|
| `backend/src/routes/admin/index.js` | Registered `/schedules` route |
| `backend/src/services/portal/teacher.service.js` | Added `getSchedule()` |
| `backend/src/services/portal/student.service.js` | Added `getSchedule()` |
| `backend/src/controllers/portal/teacher.controller.js` | Exposed `getSchedule` |
| `backend/src/controllers/portal/student.controller.js` | Exposed `getSchedule` |
| `backend/src/routes/portal/teacher.routes.js` | Registered `GET /schedule` |
| `backend/src/routes/portal/student.routes.js` | Registered `GET /schedule` |

---

## API Endpoints

### Admin (requires Admin Bearer token)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/admin/schedules` | List schedules (paginated) |
| `POST` | `/api/admin/schedules` | Create a schedule slot |
| `GET` | `/api/admin/schedules/:id` | Get a single schedule |
| `PATCH` | `/api/admin/schedules/:id` | Update a schedule |
| `DELETE` | `/api/admin/schedules/:id` | Soft-delete a schedule |

#### List query params

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Default `1` |
| `limit` | number | Default `20`, max `100` |
| `batchId` | ObjectId | Filter by batch |
| `dayOfWeek` | 0–6 | Filter by day |
| `isActive` | boolean | Filter by active status |

#### POST / PATCH body

```json
{
  "batchId": "<objectId>",
  "subjectId": "<objectId>",
  "teacherId": "<objectId>",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "10:30",
  "room": "Room 101",
  "isActive": true
}
```

- `dayOfWeek`: `0` = Sunday, `1` = Monday, ..., `6` = Saturday
- `startTime` / `endTime`: `HH:MM` 24-hour format
- `endTime` must be after `startTime`

---

### Teacher Portal (requires Teacher Bearer token)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/teacher/schedule` | All schedule slots for the teacher's assigned batches and their own teaching slots |

---

### Student Portal (requires Student Bearer token)

| Method | URL | Description |
|--------|-----|-------------|
| `GET` | `/api/student/schedule` | All schedule slots for the student's assigned batch |

---

## Validation Rules

1. `batchId` must be an active, non-deleted batch in the same institute.
2. `subjectId` must be an active, non-deleted subject in the same institute.
3. `teacherId` must be an active, non-deleted teacher in the same institute.
4. No two schedule entries for the **same batch** can overlap on the same day.
5. No two schedule entries for the **same teacher** can overlap on the same day.
6. Overlap returns HTTP `409` with code `SCHEDULE_OVERLAP`.

---

## Schedule Model Fields

| Field | Type | Notes |
|-------|------|-------|
| `instituteId` | ObjectId | From admin token |
| `batchId` | ObjectId | ref Batch |
| `subjectId` | ObjectId | ref Subject |
| `teacherId` | ObjectId | ref User (Teacher) |
| `dayOfWeek` | Number | 0–6 |
| `startTime` | String | HH:MM |
| `endTime` | String | HH:MM |
| `room` | String | Optional, max 60 chars |
| `isActive` | Boolean | Default `true` |
| `isDeleted` | Boolean | Soft delete flag |
| `deletedAt` | Date | Set on soft delete |

---

## PowerShell Test Examples

```powershell
# Create a schedule slot
$body = @{
  batchId   = "<batchId>"
  subjectId = "<subjectId>"
  teacherId = "<teacherId>"
  dayOfWeek = 1
  startTime = "09:00"
  endTime   = "10:30"
  room      = "Room 101"
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri http://127.0.0.1:4000/api/admin/schedules `
  -Headers $authHeaders `
  -ContentType "application/json" `
  -Body $body

# List schedules for a batch
Invoke-RestMethod `
  -Uri "http://127.0.0.1:4000/api/admin/schedules?batchId=<batchId>" `
  -Headers $authHeaders

# Teacher views their schedule
Invoke-RestMethod `
  -Uri http://127.0.0.1:4000/api/teacher/schedule `
  -Headers $teacherAuthHeaders

# Student views their schedule
Invoke-RestMethod `
  -Uri http://127.0.0.1:4000/api/student/schedule `
  -Headers $studentAuthHeaders
```

---

## Testing Checklist

1. Create a Schedule slot as Admin and confirm HTTP 201 with populated batch, subject, and teacher.
2. Try creating an overlapping slot for the same batch on the same day — confirm HTTP 409.
3. Try creating an overlapping slot for the same teacher on the same day — confirm HTTP 409.
4. List schedules filtered by `batchId` and `dayOfWeek` — confirm correct results.
5. Update a slot's time and confirm the overlap check runs against the new values.
6. Soft-delete a slot and confirm it disappears from list without being physically removed.
7. Sign in as Teacher and call `GET /api/teacher/schedule` — confirm only their slots appear.
8. Sign in as Student and call `GET /api/student/schedule` — confirm only their batch's slots appear.
9. Unassigned student (no batch) should receive an empty array, not an error.
10. Use a Student token against `/api/admin/schedules` — confirm HTTP 403.
