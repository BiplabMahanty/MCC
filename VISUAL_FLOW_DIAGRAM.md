# Visual Flow Diagram - Question Selection

## Current Flow (Before QuestionSet)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP - CURRENT                             │
└──────────────────────────────────────────────────────────────────────────┘

    AdminHome
        │
        ├─ Click "Create Exam"
        │
        ▼
    ┌─────────────────────────────────────────┐
    │      ExamFormScreen                     │
    │  ┌─────────────────────────────────────┐│
    │  │ Form Fields:                        ││
    │  │ • name                              ││
    │  │ • examType                          ││
    │  │ • batchId                           ││
    │  │ • subjectId                         ││
    │  │ • durationMinutes                   ││
    │  │ • startTime / endTime               ││
    │  │ • totalMarks                        ││
    │  │ • marksPerQuestion                  ││
    │  │ • negativeMarks                     ││
    │  │ • instructions                      ││
    │  │ • questionIds: []  ◄─── STORES HERE ││
    │  └─────────────────────────────────────┘│
    │                                         │
    │  ┌─────────────────────────────────────┐│
    │  │ Button: "Pick questions from bank" ││
    │  └─────────────────────────────────────┘│
    └─────────────────────────────────────────┘
        │
        ├─ Click Button
        │
        ▼
    ┌─────────────────────────────────────────┐
    │    QuestionPickerScreen                 │
    │  ┌─────────────────────────────────────┐│
    │  │ Receives: subjectId                 ││
    │  │                                     ││
    │  │ Fetches:                            ││
    │  │ GET /admin/questions                ││
    │  │   ?subjectId=...                    ││
    │  │   &isActive=true                    ││
    │  │                                     ││
    │  │ Shows: List of Questions            ││
    │  │ ┌─────────────────────────────────┐ ││
    │  │ │ ☐ Question 1 (Topic, Diff)    │ ││
    │  │ │ ☐ Question 2 (Topic, Diff)    │ ││
    │  │ │ ☑ Question 3 (Topic, Diff)    │ ││
    │  │ │ ☐ Question 4 (Topic, Diff)    │ ││
    │  │ │ ☑ Question 5 (Topic, Diff)    │ ││
    │  │ │ ... (pagination)               │ ││
    │  │ └─────────────────────────────────┘ ││
    │  │                                     ││
    │  │ Selected: 2 questions               ││
    │  │ [Confirm 2 questions]               ││
    │  └─────────────────────────────────────┘│
    └─────────────────────────────────────────┘
        │
        ├─ Click Confirm
        │
        ▼
    setField('questionIds', [Q3, Q5])
        │
        ▼
    Back to ExamFormScreen
    questionIds = [Q3, Q5]
        │
        ├─ Click "Create exam"
        │
        ▼
    POST /admin/exams
    {
      name: "Unit Test 1",
      examType: "unit_test",
      batchId: "B1",
      subjectId: "S1",
      durationMinutes: 60,
      startTime: "2025-01-15T10:00:00Z",
      endTime: "2025-01-15T11:00:00Z",
      totalMarks: 100,
      marksPerQuestion: 2,
      negativeMarks: 0,
      instructions: "...",
      questionIds: [Q3, Q5]  ◄─── SENDS ARRAY
    }
        │
        ▼
    Backend creates Exam
    Exam.questionIds = [Q3, Q5]
```

---

## New Flow (After QuestionSet)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP - NEW                                 │
└──────────────────────────────────────────────────────────────────────────┘

    AdminHome
        │
        ├─ Click "Create Exam"
        │
        ▼
    ┌─────────────────────────────────────────┐
    │      ExamFormScreen (UPDATED)           │
    │  ┌─────────────────────────────────────┐│
    │  │ Form Fields:                        ││
    │  │ • name                              ││
    │  │ • examType                          ││
    │  │ • batchId                           ││
    │  │ • subjectId                         ││
    │  │ • durationMinutes                   ││
    │  │ • startTime / endTime               ││
    │  │ • totalMarks                        ││
    │  │ • marksPerQuestion                  ││
    │  │ • negativeMarks                     ││
    │  │ • instructions                      ││
    │  │ • questionSetId: ''  ◄─── STORES HERE (CHANGED) ││
    │  └─────────────────────────────────────┘│
    │                                         │
    │  ┌─────────────────────────────────────┐│
    │  │ Button: "Select Question Set" (NEW) ││
    │  └─────────────────────────────────────┘│
    └─────────────────────────────────────────┘
        │
        ├─ Click Button
        │
        ▼
    ┌─────────────────────────────────────────┐
    │  QuestionSetSelectorScreen (NEW)        │
    │  ┌─────────────────────────────────────┐│
    │  │ Receives: subjectId                 ││
    │  │                                     ││
    │  │ Fetches:                            ││
    │  │ GET /admin/question-sets            ││
    │  │   ?subjectId=...                    ││
    │  │                                     ││
    │  │ Shows: List of Question Sets        ││
    │  │ ┌─────────────────────────────────┐ ││
    │  │ │ ○ Set 1: Algebra (20 Q)        │ ││
    │  │ │ ○ Set 2: Geometry (15 Q)       │ ││
    │  │ │ ◉ Set 3: Calculus (25 Q)       │ ││
    │  │ │ ○ Set 4: Trigonometry (18 Q)   │ ││
    │  │ │ ... (pagination)                │ ││
    │  │ └─────────────────────────────────┘ ││
    │  │                                     ││
    │  │ Selected: Set 3                     ││
    │  │ [Confirm Selection]                 ││
    │  └─────────────────────────────────────┘│
    └─────────────────────────────────────────┘
        │
        ├─ Click Confirm
        │
        ▼
    setField('questionSetId', 'QS3')
        │
        ▼
    Back to ExamFormScreen
    questionSetId = 'QS3'
        │
        ├─ Click "Create exam"
        │
        ▼
    POST /admin/exams
    {
      name: "Unit Test 1",
      examType: "unit_test",
      batchId: "B1",
      subjectId: "S1",
      durationMinutes: 60,
      startTime: "2025-01-15T10:00:00Z",
      endTime: "2025-01-15T11:00:00Z",
      totalMarks: 100,
      marksPerQuestion: 2,
      negativeMarks: 0,
      instructions: "...",
      questionSetId: 'QS3'  ◄─── SENDS SINGLE ID (CHANGED)
    }
        │
        ▼
    Backend creates Exam
    Exam.questionSetId = 'QS3'
    Exam.questionIds = undefined (removed)
```

---

## Admin Web - Current vs New

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    ADMIN WEB - CURRENT                                   │
└──────────────────────────────────────────────────────────────────────────┘

ExamListPage
    │
    ├─ Click "Create Exam"
    │
    ▼
ExamFormPage
    │
    ├─ Form with inline QuestionPicker
    │
    │  ┌─────────────────────────────────────┐
    │  │ Questions Section                   │
    │  │ ┌─────────────────────────────────┐ │
    │  │ │ Search: [_________]             │ │
    │  │ │                                 │ │
    │  │ │ ☐ Question 1 (Topic, Diff)    │ │
    │  │ │ ☐ Question 2 (Topic, Diff)    │ │
    │  │ │ ☑ Question 3 (Topic, Diff)    │ │
    │  │ │ ☑ Question 4 (Topic, Diff)    │ │
    │  │ │ ☐ Question 5 (Topic, Diff)    │ │
    │  │ │                                 │ │
    │  │ │ [Prev] Page 1/5 [Next]         │ │
    │  │ └─────────────────────────────────┘ │
    │  │ Selected: 2 questions               │
    │  └─────────────────────────────────────┘
    │
    ├─ Select questions
    │
    ├─ Click "Create Exam"
    │
    ▼
POST /admin/exams
{
  name: "...",
  questionIds: [Q3, Q4],  ◄─── ARRAY
  ...
}


┌──────────────────────────────────────────────────────────────────────────┐
│                    ADMIN WEB - NEW                                       │
└──────────────────────────────────────────────────────────────────────────┘

ExamListPage
    │
    ├─ Click "Create Exam"
    │
    ▼
ExamFormPage (UPDATED)
    │
    ├─ Form with QuestionSetSelector (NEW)
    │
    │  ┌─────────────────────────────────────┐
    │  │ Question Set Section (NEW)          │
    │  │ ┌─────────────────────────────────┐ │
    │  │ │ Search: [_________]             │ │
    │  │ │                                 │ │
    │  │ │ ○ Set 1: Algebra (20 Q)        │ │
    │  │ │ ○ Set 2: Geometry (15 Q)       │ │
    │  │ │ ◉ Set 3: Calculus (25 Q)       │ │
    │  │ │ ○ Set 4: Trigonometry (18 Q)   │ │
    │  │ │                                 │ │
    │  │ │ [Prev] Page 1/2 [Next]         │ │
    │  │ └─────────────────────────────────┘ │
    │  │ Selected: Set 3                     │
    │  └─────────────────────────────────────┘
    │
    ├─ Select question set
    │
    ├─ Click "Create Exam"
    │
    ▼
POST /admin/exams
{
  name: "...",
  questionSetId: 'QS3',  ◄─── SINGLE ID (CHANGED)
  ...
}
```

---

## Data Storage Comparison

### Current (Before QuestionSet)

```
Database:
┌─────────────────────────────────────────────────────────────┐
│ Questions Collection                                        │
├─────────────────────────────────────────────────────────────┤
│ Q1: { content: "...", options: [...] }                     │
│ Q2: { content: "...", options: [...] }                     │
│ Q3: { content: "...", options: [...] }                     │
│ Q4: { content: "...", options: [...] }                     │
│ Q5: { content: "...", options: [...] }                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Exams Collection                                            │
├─────────────────────────────────────────────────────────────┤
│ Exam 1: { name: "Test 1", questionIds: [Q1, Q2, Q3] }     │
│ Exam 2: { name: "Test 2", questionIds: [Q1, Q2, Q3] }     │
│ Exam 3: { name: "Test 3", questionIds: [Q1, Q2, Q3] }     │
│ Exam 4: { name: "Test 4", questionIds: [Q4, Q5] }         │
└─────────────────────────────────────────────────────────────┘

Problem: Q1, Q2, Q3 IDs stored 3 times (redundant)
```

### New (After QuestionSet)

```
Database:
┌─────────────────────────────────────────────────────────────┐
│ Questions Collection                                        │
├─────────────────────────────────────────────────────────────┤
│ Q1: { content: "...", options: [...] }                     │
│ Q2: { content: "...", options: [...] }                     │
│ Q3: { content: "...", options: [...] }                     │
│ Q4: { content: "...", options: [...] }                     │
│ Q5: { content: "...", options: [...] }                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ QuestionSets Collection (NEW)                               │
├─────────────────────────────────────────────────────────────┤
│ QS1: { name: "Set A", questionIds: [Q1, Q2, Q3] }         │
│ QS2: { name: "Set B", questionIds: [Q4, Q5] }             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Exams Collection                                            │
├─────────────────────────────────────────────────────────────┤
│ Exam 1: { name: "Test 1", questionSetId: QS1 }            │
│ Exam 2: { name: "Test 2", questionSetId: QS1 }            │
│ Exam 3: { name: "Test 3", questionSetId: QS1 }            │
│ Exam 4: { name: "Test 4", questionSetId: QS2 }            │
└─────────────────────────────────────────────────────────────┘

Benefit: Q1, Q2, Q3 IDs stored only once in QS1
         All exams reference QS1 (no duplication)
```

---

## Component Hierarchy

### Mobile App

```
RootNavigator
├── AdminTabNavigator
│   ├── DashboardStack
│   │   ├── AdminHome
│   │   └── ADMIN_PUSH_SCREENS
│   │       ├── ExamForm
│   │       │   └── ExamFormScreen
│   │       │       ├── ExamDraftContext (UPDATED)
│   │       │       │   └── questionSetId: '' (CHANGED)
│   │       │       └── Button: "Select Question Set"
│   │       │           └── QuestionSetSelector (NEW)
│   │       │               └── QuestionSetSelectorScreen (NEW)
│   │       │                   └── useQuestionSets (NEW)
│   │       │                       └── listQuestionSets (NEW)
│   │       │
│   │       └── [Other screens...]
```

### Admin Web

```
App
├── Routes
│   ├── /exams
│   │   ├── ExamListPage
│   │   └── ExamFormPage (UPDATED)
│   │       └── QuestionSetSelector (NEW)
│   │           └── useQuestionSets (NEW)
│   │
│   ├── /question-sets (NEW)
│   │   ├── QuestionSetListPage (NEW)
│   │   └── QuestionSetFormPage (NEW)
│   │
│   └── [Other routes...]
```

---

## State Management Changes

### Mobile App - ExamDraftContext

```javascript
// BEFORE
const DEFAULTS = {
  name: '',
  examType: '',
  batchId: '',
  subjectId: '',
  questionIds: [],  // ← Array of IDs
  // ...
};

// AFTER
const DEFAULTS = {
  name: '',
  examType: '',
  batchId: '',
  subjectId: '',
  questionSetId: '',  // ← Single ID
  // ...
};
```

### Admin Web - ExamFormPage

```javascript
// BEFORE
const [questionIds, setQuestionIds] = useState([]);

// AFTER
const [questionSetId, setQuestionSetId] = useState('');
```

---

## API Endpoints Used

### Current
```
GET  /admin/questions?subjectId=...&isActive=true&page=...&limit=...
POST /admin/exams { questionIds: [...] }
```

### New
```
GET  /admin/question-sets?subjectId=...&page=...&limit=...
GET  /admin/question-sets/:id
POST /admin/question-sets { questionIds: [...] }
PATCH /admin/question-sets/:id { questionIds: [...] }
DELETE /admin/question-sets/:id

POST /admin/exams { questionSetId: '...' }
PATCH /admin/exams/:id { questionSetId: '...' }
```
