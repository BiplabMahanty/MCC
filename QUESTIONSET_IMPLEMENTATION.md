# QuestionSet Implementation - Backend

## Overview
Implemented a new QuestionSet schema to optimize database storage by allowing admins to create reusable question collections that multiple exams can reference, instead of storing individual question IDs in each exam.

## Files Created

### 1. Models
- **`backend/src/models/QuestionSet.js`**
  - New schema for storing question collections
  - Fields: name, description, subjectId, questionIds[], totalQuestions, instituteId, createdBy, updatedBy, timestamps, soft delete
  - Indexes on instituteId, subjectId for efficient queries

### 2. Validators
- **`backend/src/validators/questionSet.validators.js`**
  - `questionSetCreateSchema`: Validates name, description, subjectId, questionIds (min 1, max 200)
  - `questionSetUpdateSchema`: Partial validation for updates
  - `questionSetListQuerySchema`: Supports pagination, subjectId filter, search by name

### 3. Services
- **`backend/src/services/admin/questionSets.service.js`**
  - `list()`: Paginated list with optional subject and search filters
  - `getById()`: Fetch single question set with populated references
  - `create()`: Create new set with validation of subject and questions
  - `update()`: Update set details and question list
  - `remove()`: Soft delete question set

### 4. Controllers
- **`backend/src/controllers/admin/questionSets.controller.js`**
  - HTTP handlers for all CRUD operations
  - Middleware for validation and error handling

### 5. Routes
- **`backend/src/routes/admin/questionSets.routes.js`**
  - `GET /admin/question-sets` - List all sets
  - `POST /admin/question-sets` - Create new set
  - `GET /admin/question-sets/:id` - Get single set
  - `PATCH /admin/question-sets/:id` - Update set
  - `DELETE /admin/question-sets/:id` - Soft delete set

## Files Modified

### 1. Exam Model (`backend/src/models/Exam.js`)
- **Removed**: `questionIds` array field
- **Added**: `questionSetId` single reference to QuestionSet
- Maintains `questions` snapshot array for published exams (unchanged)

### 2. Exam Validators (`backend/src/validators/exam.validators.js`)
- **Removed**: `questionIds: z.array(objectId).min(1).max(200)`
- **Added**: `questionSetId: objectId` (required)

### 3. Exam Service (`backend/src/services/admin/exams.service.js`)
- **Updated imports**: Added QuestionSet model
- **Updated populateRefs**: Changed from `teacherIds` to include `questionSetId`
- **Updated validateRelations()**: 
  - Removed questionIds validation
  - Added questionSetId validation
- **Updated list()**: Changed select to exclude `questionSetId` instead of `questionIds`
- **Updated publish()**:
  - Fetch QuestionSet instead of individual questionIds
  - Validate QuestionSet exists and has questions
  - Snapshot questions from the set
- **Updated duplicate()**: Reference `questionSetId` instead of `questionIds`

### 4. Admin Routes (`backend/src/routes/admin/index.js`)
- Added import for questionSetsRoutes
- Added route: `router.use('/question-sets', questionSetsRoutes)`

## API Endpoints

### Question Set Management
```
GET    /api/admin/question-sets
POST   /api/admin/question-sets
GET    /api/admin/question-sets/:id
PATCH  /api/admin/question-sets/:id
DELETE /api/admin/question-sets/:id
```

### Query Parameters (List)
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `subjectId` (optional filter)
- `search` (optional, searches by name)

## Database Benefits

### Before
- Exam 1: `questionIds: [Q1, Q2, Q3, Q4, Q5]`
- Exam 2: `questionIds: [Q1, Q2, Q3, Q4, Q5]` (duplicate storage)
- Exam 3: `questionIds: [Q1, Q2, Q3, Q4, Q5]` (duplicate storage)
- **Total**: 15 question ID references stored

### After
- QuestionSet 1: `questionIds: [Q1, Q2, Q3, Q4, Q5]`
- Exam 1: `questionSetId: QS1`
- Exam 2: `questionSetId: QS1`
- Exam 3: `questionSetId: QS1`
- **Total**: 5 question ID references stored (66% reduction)

## Workflow

1. **Admin creates a QuestionSet**
   ```
   POST /api/admin/question-sets
   {
     "name": "Unit 1 - Algebra",
     "description": "20 questions covering algebra basics",
     "subjectId": "...",
     "questionIds": ["Q1", "Q2", ..., "Q20"]
   }
   ```

2. **Admin creates an Exam referencing the QuestionSet**
   ```
   POST /api/admin/exams
   {
     "name": "Unit Test 1",
     "questionSetId": "QS1",
     ...other exam fields
   }
   ```

3. **Multiple exams can reuse the same QuestionSet**
   - Exam 1 → QuestionSet 1
   - Exam 2 → QuestionSet 1
   - Exam 3 → QuestionSet 1

4. **On exam publish**
   - Fetch QuestionSet
   - Snapshot all questions from the set
   - Store snapshot in exam.questions array

## Next Steps (Frontend)

1. **Admin Web** (`admin-web/`)
   - Add QuestionSet CRUD pages
   - Update ExamFormPage to select QuestionSet instead of picking individual questions

2. **Mobile App** (`mcc_mobile/`)
   - Update ExamFormScreen to reference QuestionSet
   - Replace QuestionPickerScreen with QuestionSetSelector
   - Update ExamDraftContext to use `questionSetId`

## Testing Checklist

- [ ] Create a QuestionSet with valid questions
- [ ] List QuestionSets with pagination and filters
- [ ] Update QuestionSet (add/remove questions)
- [ ] Soft delete QuestionSet
- [ ] Create exam with QuestionSet reference
- [ ] Publish exam (should snapshot questions from set)
- [ ] Verify exam snapshot contains all questions from set
- [ ] Duplicate exam (should reference same QuestionSet)
- [ ] Attempt to create exam without QuestionSet (should fail)
- [ ] Attempt to reference deleted QuestionSet (should fail)
