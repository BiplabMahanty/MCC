# Screen-by-Screen Flow - Where Users See Changes

## Mobile App - Admin Creating an Exam

### Screen 1: Admin Home
```
┌─────────────────────────────────────┐
│ 🏠 Dashboard                        │
├─────────────────────────────────────┤
│                                     │
│ Dashboard Stats:                    │
│ • Students: 45                      │
│ • Teachers: 12                      │
│ • Courses: 8                        │
│ • Exams: 23                         │
│                                     │
│ Quick Actions:                      │
│ [+ Create Student]                  │
│ [+ Create Teacher]                  │
│ [+ Create Exam] ◄─── CLICK HERE    │
│ [+ Create Course]                   │
│                                     │
└─────────────────────────────────────┘
```

### Screen 2: Exam Form (UPDATED)
```
┌─────────────────────────────────────┐
│ ← Create exam                       │
│ Fill in the exam details.           │
├─────────────────────────────────────┤
│                                     │
│ Exam name                           │
│ [Unit Test 1_____________]          │
│                                     │
│ Exam type                           │
│ [Unit Test ▼]                       │
│                                     │
│ Academic session                    │
│ [2025-26_____________]              │
│                                     │
│ Batch                               │
│ [Class 10-A ▼]                      │
│                                     │
│ Subject                             │
│ [Mathematics ▼]                     │
│                                     │
│ Duration (minutes)                  │
│ [60_____________]                   │
│                                     │
│ Start date & time (UTC)             │
│ [2025-01-15] [10:00]                │
│                                     │
│ End date & time (UTC)               │
│ [2025-01-15] [11:00]                │
│                                     │
│ Total marks                         │
│ [100_____________]                  │
│                                     │
│ Marks / question                    │
│ [2_____________]                    │
│                                     │
│ Negative marks (0 = disabled)       │
│ [0_____________]                    │
│                                     │
│ Instructions (optional)             │
│ [Read all questions carefully...    │
│  Do not use calculator...           │
│  ________________]                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Question Set: Not selected      │ │ ◄─── CHANGED
│ │ [Select Question Set] ◄─ NEW    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Create exam]                       │
│                                     │
└─────────────────────────────────────┘
```

### Screen 3: Question Set Selector (NEW)
```
┌─────────────────────────────────────┐
│ ← Select Question Set               │
│ None selected                       │
├─────────────────────────────────────┤
│                                     │
│ [Search question sets...]           │
│                                     │
│ ○ Set 1: Algebra Basics             │
│   Foundation algebra concepts       │
│   20 questions                      │
│                                     │
│ ○ Set 2: Geometry Fundamentals      │
│   Basic geometry and shapes         │
│   15 questions                      │
│                                     │
│ ◉ Set 3: Calculus Intro             │ ◄─── SELECTED
│   Introduction to calculus          │
│   25 questions                      │
│                                     │
│ ○ Set 4: Trigonometry               │
│   Trigonometric functions           │
│   18 questions                      │
│                                     │
│ [Prev] Page 1/2 [Next]              │
│                                     │
│ [Confirm Selection]                 │
│                                     │
└─────────────────────────────────────┘
```

### Screen 4: Back to Exam Form (After Selection)
```
┌─────────────────────────────────────┐
│ ← Create exam                       │
│ Fill in the exam details.           │
├─────────────────────────────────────┤
│                                     │
│ [All previous fields...]            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Question Set: Selected          │ │ ◄─── UPDATED
│ │ Set 3: Calculus Intro (25 Q)    │ │
│ │ [Select Question Set]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Create exam]                       │
│                                     │
└─────────────────────────────────────┘
```

### Screen 5: Exam Created Successfully
```
┌─────────────────────────────────────┐
│ ← Exam List                         │
│ Exams                               │
├─────────────────────────────────────┤
│                                     │
│ ✓ Unit Test 1                       │
│   Mathematics • Class 10-A          │
│   Jan 15, 2025 • 10:00 - 11:00      │
│   Status: Draft                     │
│   Question Set: Calculus Intro      │ ◄─── SHOWS SET
│                                     │
│ [Edit] [Publish] [Delete]           │
│                                     │
└─────────────────────────────────────┘
```

---

## Admin Web - Admin Creating an Exam

### Page 1: Exam List
```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Exams                                          │
│                                                          │
│ Exams                                    [+ Create Exam] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Name              Type        Batch      Status          │
│ ─────────────────────────────────────────────────────    │
│ Unit Test 1       Unit Test   Class 10   Draft           │
│ Mid Term 1        Mid Term    Class 10   Published       │
│ Final Exam        Final       Class 10   Draft           │
│                                                          │
│ [Prev] Page 1/5 [Next]                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Page 2: Exam Form (UPDATED)
```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Exams                                          │
│                                                          │
│ Create Exam                                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─ Basic Information ──────────────────────────────────┐ │
│ │ Exam Name *          [Unit Test 1_____________]      │ │
│ │ Exam Type *          [Unit Test ▼]                  │ │
│ │ Academic Session *   [2025-26_____________]         │ │
│ │ Batch *              [Class 10-A ▼]                 │ │
│ │ Subject *            [Mathematics ▼]                │ │
│ │ Assign Teachers      [Select teachers...]           │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Schedule ───────────────────────────────────────────┐ │
│ │ Start Time *         [2025-01-15T10:00]             │ │
│ │ End Time *           [2025-01-15T11:00]             │ │
│ │ Duration (min) *     [60]                           │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Marking Scheme ─────────────────────────────────────┐ │
│ │ Total Marks *        [100]                          │ │
│ │ Marks per Question * [2]                            │ │
│ │ ☐ Enable negative marking                           │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Instructions ───────────────────────────────────────┐ │
│ │ [Read all questions carefully...                    │ │
│ │  Do not use calculator...                           │ │
│ │  ________________]                                  │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Question Set ───────────────────────────────────────┐ │ ◄─── CHANGED
│ │ [Search question sets...]                           │ │
│ │                                                     │ │
│ │ ○ Set 1: Algebra Basics (20 Q)                     │ │
│ │ ○ Set 2: Geometry Fundamentals (15 Q)              │ │
│ │ ◉ Set 3: Calculus Intro (25 Q)                     │ │ ◄─── SELECTED
│ │ ○ Set 4: Trigonometry (18 Q)                       │ │
│ │                                                     │ │
│ │ [Prev] Page 1/2 [Next]                             │ │
│ │                                                     │ │
│ │ Selected: Set 3                                     │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Cancel] [Create Exam]                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Page 3: Exam Created
```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Exams                                          │
│                                                          │
│ Unit Test 1                                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Status: Draft                                            │
│                                                          │
│ Basic Info:                                              │
│ • Type: Unit Test                                        │
│ • Batch: Class 10-A                                      │
│ • Subject: Mathematics                                   │
│ • Session: 2025-26                                       │
│                                                          │
│ Schedule:                                                │
│ • Start: Jan 15, 2025 10:00 AM                           │
│ • End: Jan 15, 2025 11:00 AM                             │
│ • Duration: 60 minutes                                   │
│                                                          │
│ Marking:                                                 │
│ • Total Marks: 100                                       │
│ • Per Question: 2                                        │
│ • Negative Marking: Disabled                             │
│                                                          │
│ Question Set:                                            │ ◄─── SHOWS SET
│ • Set 3: Calculus Intro                                  │
│ • Total Questions: 25                                    │
│                                                          │
│ [Edit] [Publish] [Delete]                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Admin Web - Managing Question Sets (NEW)

### Page 1: Question Sets List (NEW)
```
┌──────────────────────────────────────────────────────────┐
│ Question Sets                            [+ Create Set]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ [Search sets...]                                         │
│                                                          │
│ Name                    Questions  Subject               │
│ ─────────────────────────────────────────────────────    │
│ Algebra Basics          20         Mathematics           │
│ Geometry Fundamentals   15         Mathematics           │
│ Calculus Intro          25         Mathematics           │
│ Trigonometry            18         Mathematics           │
│ Physics Mechanics       30         Physics               │
│                                                          │
│ [Prev] Page 1/3 [Next]                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Page 2: Create Question Set (NEW)
```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Question Sets                                  │
│                                                          │
│ Create Question Set                                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌─ Basic Info ─────────────────────────────────────────┐ │
│ │ Name *               [Calculus Intro_____________]   │ │
│ │ Description          [Introduction to calculus...   │ │
│ │                      ________________]              │ │
│ │ Subject *            [Mathematics ▼]                │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─ Questions ──────────────────────────────────────────┐ │
│ │ [Search questions...]                               │ │
│ │                                                     │ │
│ │ ☑ Question 1: Limits (Calculus, Hard)              │ │
│ │ ☑ Question 2: Derivatives (Calculus, Medium)       │ │
│ │ ☑ Question 3: Integration (Calculus, Hard)         │ │
│ │ ☐ Question 4: Algebra (Algebra, Easy)              │ │
│ │ ☑ Question 5: Functions (Calculus, Medium)         │ │
│ │ ... (more questions)                               │ │
│ │                                                     │ │
│ │ [Prev] Page 1/5 [Next]                             │ │
│ │                                                     │ │
│ │ Selected: 25 questions                              │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ [Cancel] [Create Set]                                    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Page 3: Question Set Details (NEW)
```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Question Sets                                  │
│                                                          │
│ Calculus Intro                                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Name: Calculus Intro                                     │
│ Description: Introduction to calculus concepts          │
│ Subject: Mathematics                                     │
│ Total Questions: 25                                      │
│ Created: Jan 10, 2025                                    │
│ Updated: Jan 12, 2025                                    │
│                                                          │
│ Questions in this set:                                   │
│ 1. Limits (Calculus, Hard)                               │
│ 2. Derivatives (Calculus, Medium)                        │
│ 3. Integration (Calculus, Hard)                          │
│ 4. Functions (Calculus, Medium)                          │
│ ... (21 more)                                            │
│                                                          │
│ Used in Exams:                                           │
│ • Unit Test 1 (Jan 15, 2025)                             │
│ • Mid Term 1 (Feb 20, 2025)                              │
│ • Final Exam (Mar 30, 2025)                              │
│                                                          │
│ [Edit] [Delete]                                          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Key UI Changes Summary

### Mobile App
| Before | After |
|--------|-------|
| "Pick questions from bank" button | "Select Question Set" button |
| QuestionPickerScreen (multi-select) | QuestionSetSelectorScreen (single-select) |
| Shows: "Questions selected: 5" | Shows: "Question Set: Calculus Intro (25 Q)" |
| Stores: `questionIds: [Q1, Q2, Q3, Q4, Q5]` | Stores: `questionSetId: 'QS3'` |

### Admin Web
| Before | After |
|--------|-------|
| Inline QuestionPicker component | QuestionSetSelector component |
| Multi-select checkboxes | Radio button selection |
| Shows: "5 selected" | Shows: "Set 3: Calculus Intro (25 Q)" |
| Stores: `questionIds: [Q1, Q2, Q3, Q4, Q5]` | Stores: `questionSetId: 'QS3'` |
| No question set management | New Question Sets page with CRUD |

---

## User Workflow Changes

### Before
```
1. Admin creates exam
2. Admin clicks "Pick questions"
3. Admin searches and selects individual questions (Q1, Q2, Q3, Q4, Q5)
4. Admin confirms selection
5. Exam created with 5 question IDs stored
```

### After
```
1. Admin creates question set (once)
   - Selects 25 questions for "Calculus Intro"
   - Saves as reusable set

2. Admin creates exam (multiple times)
   - Clicks "Select Question Set"
   - Selects "Calculus Intro" set
   - Exam created with single set reference

3. Multiple exams can reuse same set
   - Unit Test 1 → Calculus Intro
   - Mid Term 1 → Calculus Intro
   - Final Exam → Calculus Intro
```

---

## Benefits Visible to Users

### For Admins
- ✅ Faster exam creation (select one set instead of multiple questions)
- ✅ Consistency (same questions across multiple exams)
- ✅ Reusability (create once, use many times)
- ✅ Easy management (edit set once, affects all exams)

### For System
- ✅ Reduced database storage (66% reduction in typical scenarios)
- ✅ Better performance (fewer question IDs to store/retrieve)
- ✅ Cleaner data model (single reference instead of array)

---

## Navigation Changes

### Mobile App
```
AdminHome
  ↓
ExamForm
  ↓
[Select Question Set] ← NEW BUTTON
  ↓
QuestionSetSelector ← NEW SCREEN
  ↓
Back to ExamForm
  ↓
Create Exam
```

### Admin Web
```
Dashboard
  ↓
Question Sets ← NEW MENU ITEM
  ├─ List Question Sets ← NEW PAGE
  ├─ Create Question Set ← NEW PAGE
  └─ Edit Question Set ← NEW PAGE

Dashboard
  ↓
Exams
  ├─ List Exams
  └─ Create/Edit Exam ← UPDATED (uses QuestionSetSelector)
```
