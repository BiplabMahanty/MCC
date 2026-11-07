# Frontend Flow - Question Selection in Exams

## Current Flow (Before QuestionSet)

### Mobile App Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ MOBILE APP - ADMIN EXAM CREATION                                │
└─────────────────────────────────────────────────────────────────┘

1. AdminHome Screen
   └─> Navigate to "ExamForm"
       │
       ├─ ExamFormScreen (mcc_mobile/src/features/exams/screens/ExamFormScreen.js)
       │  ├─ Uses: ExamDraftContext (stores draft state)
       │  │  └─ DEFAULTS: { questionIds: [] }  ← STORES ARRAY OF QUESTION IDs
       │  │
       │  ├─ Form Fields:
       │  │  ├─ name
       │  │  ├─ examType
       │  │  ├─ academicSession
       │  │  ├─ batchId
       │  │  ├─ subjectId
       │  │  ├─ durationMinutes
       │  │  ├─ startTime / endTime
       │  │  ├─ totalMarks
       │  │  ├─ marksPerQuestion
       │  │  ├─ negativeMarks
       │  │  ├─ instructions
       │  │  └─ questionIds ← BUTTON: "Pick questions from bank"
       │  │
       │  └─ On Button Click:
       │     └─> Navigate to "QuestionPicker"
       │        └─ Pass: { subjectId: draft.subjectId }
       │
       ├─ QuestionPickerScreen (mcc_mobile/src/features/exams/screens/QuestionPickerScreen.js)
       │  ├─ Receives: subjectId from route params
       │  ├─ State: selected = Set(draft.questionIds)
       │  │
       │  ├─ Fetches Questions:
       │  │  └─ useQuestions('admin', { isActive: true, subjectId })
       │  │     └─ API: GET /admin/questions?subjectId=...&isActive=true
       │  │
       │  ├─ UI: FlashList of Questions
       │  │  ├─ Each question shows:
       │  │  │  ├─ Subject name
       │  │  │  ├─ Question preview
       │  │  │  ├─ Topic & Difficulty
       │  │  │  └─ Checkbox (toggle selection)
       │  │  │
       │  │  └─ Pagination: onEndReached → fetchNextPage()
       │  │
       │  └─ Confirm Button:
       │     └─ setField('questionIds', [...selected])
       │        └─ Navigate back to ExamForm
       │
       └─ Back in ExamFormScreen:
          ├─ Shows: "Questions selected: {count}"
          └─ On Save:
             └─ POST /admin/exams
                {
                  name: "...",
                  questionIds: [Q1, Q2, Q3, ...],  ← SENDS ARRAY
                  ...other fields
                }
```

### Admin Web Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN WEB - EXAM CREATION                                       │
└─────────────────────────────────────────────────────────────────┘

1. ExamListPage
   └─> Click "Create Exam"
       │
       ├─ ExamFormPage (admin-web/src/pages/exams/ExamFormPage.jsx)
       │  ├─ Uses: react-hook-form
       │  ├─ State: questionIds = []  ← STORES ARRAY OF QUESTION IDs
       │  │
       │  ├─ Form Fields:
       │  │  ├─ name
       │  │  ├─ examType
       │  │  ├─ academicSession
       │  │  ├─ batchId
       │  │  ├─ subjectId
       │  │  ├─ durationMinutes
       │  │  ├─ startTime / endTime
       │  │  ├─ totalMarks
       │  │  ├─ marksPerQuestion
       │  │  ├─ negativeMarking
       │  │  ├─ negativeMarks
       │  │  ├─ instructions
       │  │  └─ Questions Section:
       │  │     └─ QuestionPicker Component (inline)
       │  │
       │  ├─ QuestionPicker Component:
       │  │  ├─ Search input
       │  │  ├─ Fetches: GET /admin/questions?page=...&limit=10&subjectId=...
       │  │  ├─ Displays: Paginated list of questions
       │  │  ├─ Each question:
       │  │  │  ├─ Checkbox
       │  │  │  ├─ Question text
       │  │  │  ├─ Topic & Difficulty badge
       │  │  │  └─ Toggle on click
       │  │  │
       │  │  └─ Pagination controls
       │  │
       │  └─ On Submit:
       │     └─ POST /admin/exams
       │        {
       │          name: "...",
       │          questionIds: [Q1, Q2, Q3, ...],  ← SENDS ARRAY
       │          ...other fields
       │        }
```

---

## New Flow (After QuestionSet Implementation)

### Mobile App Flow (Updated)

```
┌─────────────────────────────────────────────────────────────────┐
│ MOBILE APP - EXAM CREATION (WITH QUESTIONSET)                   │
└─────────────────────────────────────────────────────────────────┘

1. AdminHome Screen
   └─> Navigate to "ExamForm"
       │
       ├─ ExamFormScreen (UPDATED)
       │  ├─ Uses: ExamDraftContext (UPDATED)
       │  │  └─ DEFAULTS: { questionSetId: '' }  ← CHANGED: NOW STORES SINGLE ID
       │  │
       │  ├─ Form Fields:
       │  │  ├─ name
       │  │  ├─ examType
       │  │  ├─ academicSession
       │  │  ├─ batchId
       │  │  ├─ subjectId
       │  │  ├─ durationMinutes
       │  │  ├─ startTime / endTime
       │  │  ├─ totalMarks
       │  │  ├─ marksPerQuestion
       │  │  ├─ negativeMarks
       │  │  ├─ instructions
       │  │  └─ questionSetId ← BUTTON: "Select Question Set"  [NEW]
       │  │
       │  └─ On Button Click:
       │     └─> Navigate to "QuestionSetSelector"  [NEW SCREEN]
       │        └─ Pass: { subjectId: draft.subjectId }
       │
       ├─ QuestionSetSelectorScreen (NEW)
       │  ├─ Receives: subjectId from route params
       │  ├─ State: selectedSetId = draft.questionSetId
       │  │
       │  ├─ Fetches Question Sets:
       │  │  └─ useQuestionSets({ subjectId })
       │  │     └─ API: GET /admin/question-sets?subjectId=...
       │  │
       │  ├─ UI: List of Question Sets
       │  │  ├─ Each set shows:
       │  │  │  ├─ Set name
       │  │  │  ├─ Set description
       │  │  │  ├─ Total questions count
       │  │  │  ├─ Subject name
       │  │  │  └─ Radio button (select one)
       │  │  │
       │  │  └─ Pagination: onEndReached → fetchNextPage()
       │  │
       │  └─ Confirm Button:
       │     └─ setField('questionSetId', selectedSetId)
       │        └─ Navigate back to ExamForm
       │
       └─ Back in ExamFormScreen:
          ├─ Shows: "Question Set: {setName} ({totalQuestions} questions)"
          └─ On Save:
             └─ POST /admin/exams
                {
                  name: "...",
                  questionSetId: "QS123",  ← CHANGED: NOW SENDS SINGLE ID
                  ...other fields
                }
```

### Admin Web Flow (Updated)

```
┌─────────────────────────────────────────────────────────────────┐
│ ADMIN WEB - EXAM CREATION (WITH QUESTIONSET)                    │
└─────────────────────────────────────────────────────────────────┘

1. ExamListPage
   └─> Click "Create Exam"
       │
       ├─ ExamFormPage (UPDATED)
       │  ├─ Uses: react-hook-form
       │  ├─ State: questionSetId = ''  ← CHANGED: NOW STORES SINGLE ID
       │  │
       │  ├─ Form Fields:
       │  │  ├─ name
       │  │  ├─ examType
       │  │  ├─ academicSession
       │  │  ├─ batchId
       │  │  ├─ subjectId
       │  │  ├─ durationMinutes
       │  │  ├─ startTime / endTime
       │  │  ├─ totalMarks
       │  │  ├─ marksPerQuestion
       │  │  ├─ negativeMarking
       │  │  ├─ negativeMarks
       │  │  ├─ instructions
       │  │  └─ Question Set Section:  [CHANGED]
       │  │     └─ QuestionSetSelector Component (NEW)
       │  │
       │  ├─ QuestionSetSelector Component (NEW):
       │  │  ├─ Dropdown/Select showing available sets
       │  │  ├─ Fetches: GET /admin/question-sets?subjectId=...
       │  │  ├─ Displays: List of question sets
       │  │  ├─ Each set shows:
       │  │  │  ├─ Set name
       │  │  │  ├─ Total questions
       │  │  │  └─ Description
       │  │  │
       │  │  └─ On select: setQuestionSetId(selectedId)
       │  │
       │  └─ On Submit:
       │     └─ POST /admin/exams
       │        {
       │          name: "...",
       │          questionSetId: "QS123",  ← CHANGED: NOW SENDS SINGLE ID
       │          ...other fields
       │        }
```

---

## Files That Need Updates

### Mobile App (`mcc_mobile/`)

| File | Change | Type |
|------|--------|------|
| `src/features/exams/context/ExamDraftContext.js` | Change `questionIds: []` to `questionSetId: ''` | Update |
| `src/features/exams/screens/ExamFormScreen.js` | Replace "Pick questions" button with "Select Question Set" | Update |
| `src/features/exams/screens/QuestionPickerScreen.js` | DELETE or repurpose | Delete |
| `src/features/exams/screens/QuestionSetSelectorScreen.js` | NEW - Select from question sets | Create |
| `src/features/exams/services/examsApi.js` | Add `listQuestionSets()` function | Update |
| `src/features/exams/hooks/useQuestionSets.js` | NEW - Hook to fetch question sets | Create |
| `src/navigation/RootNavigator.js` | Replace `QuestionPicker` with `QuestionSetSelector` | Update |

### Admin Web (`admin-web/`)

| File | Change | Type |
|------|--------|------|
| `src/pages/exams/ExamFormPage.jsx` | Replace QuestionPicker with QuestionSetSelector | Update |
| `src/api/exams.js` | Add `listQuestionSets()` function | Update |
| `src/hooks/useQuestionSets.js` | NEW - Hook to fetch question sets | Create |
| `src/pages/questionSets/QuestionSetListPage.jsx` | NEW - List all question sets | Create |
| `src/pages/questionSets/QuestionSetFormPage.jsx` | NEW - Create/Edit question sets | Create |
| `src/routes/QuestionSetRoutes.jsx` | NEW - Routes for question sets | Create |

---

## Data Flow Comparison

### Current (questionIds array)
```
ExamForm
  ↓
QuestionPicker (select multiple)
  ↓
setField('questionIds', [Q1, Q2, Q3, Q4, Q5])
  ↓
POST /admin/exams { questionIds: [Q1, Q2, Q3, Q4, Q5] }
  ↓
Exam stored with 5 question IDs
```

### New (questionSetId reference)
```
ExamForm
  ↓
QuestionSetSelector (select one)
  ↓
setField('questionSetId', 'QS123')
  ↓
POST /admin/exams { questionSetId: 'QS123' }
  ↓
Exam stored with 1 question set reference
  ↓
On publish: Fetch QuestionSet → Get all questionIds → Snapshot questions
```

---

## API Calls Comparison

### Current
```javascript
// Mobile
POST /admin/exams
{
  name: "Unit Test 1",
  questionIds: ["Q1", "Q2", "Q3"],  // Array of IDs
  ...
}

// Admin Web
POST /admin/exams
{
  name: "Unit Test 1",
  questionIds: ["Q1", "Q2", "Q3"],  // Array of IDs
  ...
}
```

### New
```javascript
// Mobile
POST /admin/exams
{
  name: "Unit Test 1",
  questionSetId: "QS123",  // Single ID
  ...
}

// Admin Web
POST /admin/exams
{
  name: "Unit Test 1",
  questionSetId: "QS123",  // Single ID
  ...
}

// New endpoints for QuestionSet management
GET /admin/question-sets
POST /admin/question-sets
GET /admin/question-sets/:id
PATCH /admin/question-sets/:id
DELETE /admin/question-sets/:id
```

---

## Summary of Changes

### What Changes:
1. ✅ Backend: QuestionSet model, service, controller, routes (DONE)
2. ⏳ Frontend: Replace individual question picker with question set selector
3. ⏳ Frontend: Add question set management pages
4. ⏳ Frontend: Update exam form to use questionSetId instead of questionIds

### What Stays the Same:
- Exam publish logic (still snapshots questions)
- Exam attempt/result logic
- Student exam experience
- Teacher analytics
- All other exam features
