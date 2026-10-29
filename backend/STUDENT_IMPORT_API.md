# Student Bulk Import API

## Overview

`POST /api/admin/students/import` allows an Admin to import multiple students at once.
- Email is **auto-generated** from name + last 4 digits of phone: `ravi.kumar.3210@import.local`
- Rows are processed individually — failures do not block other rows
- Response always shows which rows succeeded and which failed with reasons

---

## Files Added / Modified

| File | Change |
|---|---|
| `src/services/admin/students.import.service.js` | New — bulk import logic |
| `src/routes/admin/students.routes.js` | Modified — added `POST /import` route |

---

## Endpoint

```
POST /api/admin/students/import
```

**Headers:**
```
Authorization: Bearer <admin_access_token>
Content-Type: application/json
```

---

## Request Body

```json
{
  "students": [
    {
      "name": "Ravi Kumar",
      "phone": "9876543210",
      "studentCode": "STU001",
      "password": "password123",
      "batchId": "6650a1b2c3d4e5f6a7b8c9d0"
    },
    {
      "name": "Priya Sharma",
      "phone": "9123456789",
      "studentCode": "STU002",
      "password": "password123",
      "guardianName": "Ramesh Sharma",
      "guardianPhone": "9000000001"
    }
  ]
}
```

### Fields

| Field | Required | Notes |
|---|---|---|
| `name` | ✅ | min 2 chars, max 100 |
| `phone` | ✅ | any format |
| `studentCode` | ✅ | unique per institute, auto-uppercased |
| `password` | ✅ | min 8 chars |
| `batchId` | optional | must be active, non-deleted, same institute |
| `guardianName` | optional | max 100 chars |
| `guardianPhone` | optional | max 20 chars |

- Maximum **500 students** per request.

---

## Response

### HTTP Status Codes

| Status | Meaning |
|---|---|
| `201` | All rows imported successfully |
| `207` | Some succeeded, some failed |
| `400` | All rows failed, or request body is invalid |

### Response Body

```json
{
  "message": "2 imported, 1 failed out of 3",
  "succeeded": [
    {
      "row": 1,
      "name": "Ravi Kumar",
      "email": "ravi.kumar.3210@import.local",
      "studentCode": "STU001"
    }
  ],
  "failed": [
    {
      "row": 2,
      "name": "Priya Sharma",
      "error": "studentCode \"STU002\" already exists"
    }
  ]
}
```

---

## cURL Examples

### Step 1 — Login to get access token

```bash
curl -X POST http://127.0.0.1:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"MyStrongPassword123!"}'
```

Copy the `accessToken` from the response.

### Step 2 — Import students

```bash
curl -X POST http://127.0.0.1:4000/api/admin/students/import \
  -H "Authorization: Bearer <paste_accessToken_here>" \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      {
        "name": "Ravi Kumar",
        "phone": "9876543210",
        "studentCode": "STU001",
        "password": "password123",
        "batchId": "6650a1b2c3d4e5f6a7b8c9d0"
      },
      {
        "name": "Priya Sharma",
        "phone": "9123456789",
        "studentCode": "STU002",
        "password": "password123"
      }
    ]
  }'
```

---

## Error Examples

| Scenario | Error Message |
|---|---|
| Missing name | `name is required (min 2 chars)` |
| Missing phone | `phone is required` |
| Missing studentCode | `studentCode is required` |
| Password too short | `password is required (min 8 chars)` |
| Duplicate studentCode | `studentCode "STU001" already exists` |
| Duplicate name+phone | `email "ravi.kumar.3210@import.local" already exists (duplicate name+phone)` |
| Invalid batchId | `batchId "6650..." is not a valid active batch` |
