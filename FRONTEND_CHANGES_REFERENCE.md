# Frontend Changes - Quick Reference

## Mobile App Changes

### 1. ExamDraftContext.js
**File**: `mcc_mobile/src/features/exams/context/ExamDraftContext.js`

**Current**:
```javascript
const DEFAULTS = {
  // ... other fields
  questionIds: [],  // ← CHANGE THIS
};
```

**New**:
```javascript
const DEFAULTS = {
  // ... other fields
  questionSetId: '',  // ← CHANGED
};
```

**Also update initDraft()**:
```javascript
// Current
questionIds: prefill.questionIds ?? [],

// New
questionSetId: prefill.questionSetId ?? '',
```

---

### 2. ExamFormScreen.js
**File**: `mcc_mobile/src/features/exams/screens/ExamFormScreen.js`

**Current** (around line 70):
```javascript
if (draft.questionIds.length === 0)
  e.questionIds = 'Select at least one question';
```

**New**:
```javascript
if (!draft.questionSetId)
  e.questionSetId = 'Select a question set';
```

**Current** (around line 100):
```javascript
const body = {
  // ... other fields
  questionIds: draft.questionIds,  // ← CHANGE THIS
  // ...
};
```

**New**:
```javascript
const body = {
  // ... other fields
  questionSetId: draft.questionSetId,  // ← CHANGED
  // ...
};
```

**Current** (around line 150):
```javascript
<View style={styles.questionSection}>
  <Text style={styles.sectionLabel}>
    Questions selected: {draft.questionIds.length}
  </Text>
  {errors.questionIds ? (
    <Text style={styles.fieldError}>{errors.questionIds}</Text>
  ) : null}
  <AppButton
    label="Pick questions from bank"
    onPress={() =>
      navigation.navigate('QuestionPicker', {
        subjectId: draft.subjectId,
      })
    }
  />
</View>
```

**New**:
```javascript
<View style={styles.questionSection}>
  <Text style={styles.sectionLabel}>
    Question Set: {draft.questionSetId ? 'Selected' : 'Not selected'}
  </Text>
  {errors.questionSetId ? (
    <Text style={styles.fieldError}>{errors.questionSetId}</Text>
  ) : null}
  <AppButton
    label="Select Question Set"
    onPress={() =>
      navigation.navigate('QuestionSetSelector', {
        subjectId: draft.subjectId,
      })
    }
  />
</View>
```

---

### 3. Create QuestionSetSelectorScreen.js
**File**: `mcc_mobile/src/features/exams/screens/QuestionSetSelectorScreen.js` (NEW)

```javascript
import { useMemo, useState } from 'react';
import { FlashList } from '@shopify/flash-list';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppButton from '../../../components/common/AppButton';
import EmptyState from '../../../components/common/EmptyState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../../admin/components/AdminHeader';
import { useExamDraft } from '../context/ExamDraftContext';
import { useQuestionSets } from '../hooks/useQuestionSets';

export default function QuestionSetSelectorScreen({ navigation, route }) {
  const { subjectId } = route.params ?? {};
  const { draft, setField } = useExamDraft();
  const [selected, setSelected] = useState(draft.questionSetId);

  const query = useQuestionSets({
    subjectId: subjectId || undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((p) => p.data) ?? [],
    [query.data],
  );

  function confirm() {
    if (selected) {
      setField('questionSetId', selected);
      navigation.goBack();
    }
  }

  if (query.isPending) {
    return (
      <Screen>
        <Loader message="Loading question sets…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <AdminHeader
          onBack={navigation.goBack}
          subtitle={selected ? 'Selected' : 'None selected'}
          title="Select Question Set"
        />

        <FlashList
          data={items}
          estimatedItemSize={100}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={
            <EmptyState
              message="No question sets found for this subject."
              title="No sets"
            />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator color={colors.primary} style={styles.footer} />
            ) : null
          }
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage)
              query.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          renderItem={({ item }) => {
            const sel = selected === item._id;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: sel }}
                onPress={() => setSelected(item._id)}
                style={[styles.card, sel && styles.cardSel]}
              >
                <View style={styles.cardLeft}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.description && (
                    <Text numberOfLines={2} style={styles.description}>
                      {item.description}
                    </Text>
                  )}
                  <Text style={styles.meta}>
                    {item.totalQuestions} questions
                  </Text>
                </View>
                <View style={[styles.radio, sel && styles.radioSel]}>
                  {sel && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          }}
        />

        <AppButton
          disabled={!selected}
          label="Confirm Selection"
          onPress={confirm}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16 },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
    padding: 14,
  },
  cardSel: { borderColor: colors.primary, backgroundColor: '#FFF7ED' },
  cardLeft: { flex: 1, gap: 4 },
  name: { color: colors.black, fontSize: 14, fontWeight: '700' },
  description: { color: colors.mutedText, fontSize: 12 },
  meta: { color: colors.mutedText, fontSize: 11 },
  radio: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioSel: { borderColor: colors.primary, backgroundColor: colors.primary },
  radioDot: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  footer: { paddingVertical: 20 },
});
```

---

### 4. Create useQuestionSets hook
**File**: `mcc_mobile/src/features/exams/hooks/useQuestionSets.js` (NEW)

```javascript
import { useInfiniteQuery } from '@tanstack/react-query';
import { listQuestionSets } from '../services/examsApi';

export function useQuestionSets(params = {}) {
  return useInfiniteQuery({
    queryKey: ['question-sets', params],
    queryFn: ({ pageParam = 1 }) =>
      listQuestionSets({ ...params, page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination || {};
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });
}
```

---

### 5. Update examsApi.js
**File**: `mcc_mobile/src/features/exams/services/examsApi.js`

**Add this function**:
```javascript
export function listQuestionSets(params) {
  return apiRequest(`/admin/question-sets${qs(params)}`, { auth: true });
}
```

---

### 6. Update RootNavigator.js
**File**: `mcc_mobile/src/navigation/RootNavigator.js`

**Current** (around line 30):
```javascript
import QuestionPickerScreen from '../features/exams/screens/QuestionPickerScreen';
```

**New**:
```javascript
import QuestionSetSelectorScreen from '../features/exams/screens/QuestionSetSelectorScreen';
```

**Current** (around line 100):
```javascript
<Stack.Screen name="QuestionPicker" component={QuestionPickerScreen} />
```

**New**:
```javascript
<Stack.Screen name="QuestionSetSelector" component={QuestionSetSelectorScreen} />
```

---

## Admin Web Changes

### 1. Update ExamFormPage.jsx
**File**: `admin-web/src/pages/exams/ExamFormPage.jsx`

**Current** (around line 30):
```javascript
const [questionIds, setQuestionIds] = useState([]);
```

**New**:
```javascript
const [questionSetId, setQuestionSetId] = useState('');
```

**Current** (around line 50):
```javascript
setQuestionIds(exam.questionIds?.map((q) => q._id ?? q) ?? []);
```

**New**:
```javascript
setQuestionSetId(exam.questionSetId?._id ?? exam.questionSetId ?? '');
```

**Current** (around line 80):
```javascript
if (questionIds.length === 0) {
  toast.error('Add at least one question.');
  return;
}
```

**New**:
```javascript
if (!questionSetId) {
  toast.error('Select a question set.');
  return;
}
```

**Current** (around line 90):
```javascript
const payload = {
  ...values,
  // ...
  questionIds,
  // ...
};
```

**New**:
```javascript
const payload = {
  ...values,
  // ...
  questionSetId,
  // ...
};
```

**Current** (around line 150 - Questions section):
```javascript
{/* Questions */}
<div className="bg-card border border-border rounded-xl p-5 space-y-4">
  <div className="flex items-center justify-between">
    <h2 className="text-sm font-semibold text-text-primary">Questions</h2>
    <span className="text-xs text-text-muted">{questionIds.length} selected</span>
  </div>
  <QuestionPicker selectedIds={questionIds} onChange={setQuestionIds} subjectId={watchedSubjectId} />
  {questionIds.length === 0 && (
    <p className="text-xs text-error">At least one question is required to save.</p>
  )}
</div>
```

**New**:
```javascript
{/* Question Set */}
<div className="bg-card border border-border rounded-xl p-5 space-y-4">
  <h2 className="text-sm font-semibold text-text-primary">Question Set</h2>
  <QuestionSetSelector value={questionSetId} onChange={setQuestionSetId} subjectId={watchedSubjectId} />
  {!questionSetId && (
    <p className="text-xs text-error">A question set is required to save.</p>
  )}
</div>
```

---

### 2. Create QuestionSetSelector component
**File**: `admin-web/src/components/ui/QuestionSetSelector.jsx` (NEW)

```javascript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Spinner from './Spinner';
import client from '../../api/client';

export default function QuestionSetSelector({ value, onChange, subjectId }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['question-sets-select', search, subjectId, page],
    queryFn: () =>
      client.get('/admin/question-sets', {
        params: { page, limit: 10, ...(search && { search }), ...(subjectId && { subjectId }) },
      }).then((r) => r.data),
    keepPreviousData: true,
  });

  const sets = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="p-3 border-b border-border bg-surface flex items-center gap-2">
        <Search size={14} className="text-text-muted shrink-0" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search question sets..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
        />
      </div>
      <div className="divide-y divide-border max-h-72 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-6"><Spinner size="sm" /></div>
        )}
        {!isLoading && sets.length === 0 && (
          <p className="text-sm text-text-muted text-center py-6">No question sets found.</p>
        )}
        {sets.map((set) => (
          <label key={set._id} className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface transition-colors ${value === set._id ? 'bg-brand/5' : ''}`}>
            <input
              type="radio"
              name="questionSet"
              value={set._id}
              checked={value === set._id}
              onChange={() => onChange(set._id)}
              className="mt-0.5 accent-brand"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium">{set.name}</p>
              {set.description && (
                <p className="text-xs text-text-muted line-clamp-1">{set.description}</p>
              )}
              <p className="text-xs text-text-muted mt-1">{set.totalQuestions} questions</p>
            </div>
          </label>
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-xs text-brand disabled:opacity-40">← Prev</button>
          <span className="text-xs text-text-muted">Page {page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="text-xs text-brand disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Update exams API
**File**: `admin-web/src/api/exams.js`

**Add this function**:
```javascript
export const listQuestionSets = (params) =>
  client.get('/admin/question-sets', { params }).then((r) => r.data);
```

---

### 4. Create QuestionSetListPage.jsx
**File**: `admin-web/src/pages/questionSets/QuestionSetListPage.jsx` (NEW)

```javascript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';

export default function QuestionSetListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['question-sets', search, page],
    queryFn: () =>
      client.get('/admin/question-sets', {
        params: { page, limit: 20, ...(search && { search }) },
      }).then((r) => r.data),
  });

  const sets = data?.data ?? [];
  const pagination = data?.pagination ?? {};

  const handleDelete = async (id) => {
    if (!confirm('Delete this question set?')) return;
    try {
      await client.delete(`/admin/question-sets/${id}`);
      toast.success('Question set deleted.');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Delete failed.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Question Sets</h1>
        <Button onClick={() => navigate('/question-sets/create')}>
          <Plus size={16} /> Create Set
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} className="text-text-muted" />
          <Input
            placeholder="Search sets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Questions</th>
                <th className="text-left py-3 px-4 font-semibold text-text-primary">Subject</th>
                <th className="text-right py-3 px-4 font-semibold text-text-primary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sets.map((set) => (
                <tr key={set._id} className="border-b border-border hover:bg-surface">
                  <td className="py-3 px-4 text-text-primary">{set.name}</td>
                  <td className="py-3 px-4 text-text-muted">{set.totalQuestions}</td>
                  <td className="py-3 px-4 text-text-muted">{set.subjectId?.name}</td>
                  <td className="py-3 px-4 text-right flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/question-sets/${set._id}`)}
                      className="p-2 hover:bg-surface rounded transition-colors"
                    >
                      <Edit2 size={16} className="text-brand" />
                    </button>
                    <button
                      onClick={() => handleDelete(set._id)}
                      className="p-2 hover:bg-surface rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-error" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sets.length === 0 && (
          <p className="text-center py-8 text-text-muted">No question sets found.</p>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-sm text-brand disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-sm text-text-muted">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-brand disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Summary of Files to Change

### Mobile App
- ✅ `ExamDraftContext.js` - Change questionIds to questionSetId
- ✅ `ExamFormScreen.js` - Update form and validation
- ✅ `QuestionSetSelectorScreen.js` - NEW
- ✅ `useQuestionSets.js` - NEW hook
- ✅ `examsApi.js` - Add listQuestionSets
- ✅ `RootNavigator.js` - Replace QuestionPicker with QuestionSetSelector

### Admin Web
- ✅ `ExamFormPage.jsx` - Update form and validation
- ✅ `QuestionSetSelector.jsx` - NEW component
- ✅ `exams.js` - Add listQuestionSets
- ✅ `QuestionSetListPage.jsx` - NEW page
- ✅ `QuestionSetFormPage.jsx` - NEW page (similar to ExamFormPage)
- ✅ `QuestionSetRoutes.jsx` - NEW routes

**Total: 12 files to create/modify**
