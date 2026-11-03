import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { apiRequest } from '../../../services/apiClient';
import colors from '../../../theme/colors';

// ── Header Component ────────────────────────────────────────────────────────
function ScreenHeader({ title, subtitle, onBack, rightAction }) {
  return (
    <View style={styles.header}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={onBack}
            style={({ pressed, hovered }) => [
              styles.backButton,
              hovered && styles.backButtonHovered,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerBrand}>
            <Text style={styles.brandName}>{title}</Text>
            {subtitle && <Text style={styles.brandSub}>{subtitle}</Text>}
          </View>
          {rightAction && <View style={styles.headerRight}>{rightAction}</View>}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ── Assignment List Item ────────────────────────────────────────────────────
function AssignmentListItem({ item, onPress, onEdit, onDelete }) {
  let dueDate;
  try {
    dueDate = new Date(item.dueAt);
    if (isNaN(dueDate.getTime())) {
      dueDate = new Date();
    }
  } catch (e) {
    dueDate = new Date();
  }
  const today = new Date();
  const isOverdue = dueDate < today && !item.isDeleted;
  const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.listItem,
        hovered && styles.listItemHovered,
        pressed && styles.listItemPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.listItemContent}>
        <View style={styles.listItemHeader}>
          <Text style={styles.listItemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              isOverdue ? styles.badgeOverdue : styles.badgePending,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isOverdue ? styles.statusOverdue : styles.statusPending,
              ]}
            >
              {isOverdue ? 'Overdue' : `${daysLeft}d`}
            </Text>
          </View>
        </View>
        {item.description ? (
          <Text style={styles.listItemDesc} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.listItemFooter}>
          <Text style={styles.listItemMeta}>
            📅 {dueDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' })}
          </Text>
          <Text style={styles.listItemMeta}>
            👥 {item.submissions?.length ?? 0} submissions
          </Text>
        </View>
      </View>
      <View style={styles.listItemActions}>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          style={({ pressed, hovered }) => [
            styles.actionButton,
            hovered && styles.actionButtonHovered,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Text style={styles.actionIcon}>✎</Text>
        </Pressable>
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={({ pressed, hovered }) => [
            styles.actionButton,
            styles.actionButtonDelete,
            hovered && styles.actionButtonDeleteHovered,
            pressed && styles.actionButtonPressed,
          ]}
        >
          <Text style={styles.actionIconDelete}>🗑</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {actionLabel && (
        <Pressable
          style={({ pressed, hovered }) => [
            styles.emptyButton,
            hovered && styles.emptyButtonHovered,
            pressed && styles.emptyButtonPressed,
          ]}
          onPress={onAction}
        >
          <Text style={styles.emptyButtonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Assignments List Screen ─────────────────────────────────────────────────
export function TeacherAssignmentsScreen({ navigation }) {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const assignmentsQuery = useQuery({
    queryKey: ['teacher', 'assignments'],
    queryFn: ({ signal }) =>
      apiRequest('/teacher/assignments', { auth: true, signal }),
    staleTime: 0,
  });

  const deleteMutation = useMutation({
    mutationFn: (assignmentId) =>
      apiRequest(`/teacher/assignments/${assignmentId}`, {
        auth: true,
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      queryClient.refetchQueries({ queryKey: ['teacher', 'assignments'] });
    },
  });

  const assignments = assignmentsQuery.data?.data ?? [];

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'active') return !a.isDeleted;
    if (filter === 'deleted') return a.isDeleted;
    return true;
  });

  const handleDelete = (id, title) => {
    Alert.alert(
      'Delete Assignment',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScreenHeader
        title="Assignments"
        subtitle="Create and manage assignments"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable
            style={({ pressed, hovered }) => [
              styles.createButton,
              hovered && styles.createButtonHovered,
              pressed && styles.createButtonPressed,
            ]}
            onPress={() => navigation.navigate('TeacherAssignmentForm')}
          >
            <Text style={styles.createButtonText}>+ New</Text>
          </Pressable>
        }
      />

      <View style={styles.filterBar}>
        {['all', 'active', 'deleted'].map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive,
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {assignmentsQuery.isPending ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.dashGreen} />
        </View>
      ) : filteredAssignments.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={assignmentsQuery.isRefetching}
              onRefresh={() => assignmentsQuery.refetch()}
              colors={[colors.dashGreen]}
            />
          }
        >
          <EmptyState
            icon="📝"
            title="No Assignments"
            message={
              filter === 'all'
                ? 'Create your first assignment to get started.'
                : `No ${filter} assignments yet.`
            }
            actionLabel={filter === 'all' ? 'Create Assignment' : undefined}
            onAction={() => navigation.navigate('TeacherAssignmentForm')}
          />
        </ScrollView>
      ) : (
        <FlatList
          data={filteredAssignments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <AssignmentListItem
              item={item}
              onPress={() =>
                navigation.navigate('TeacherAssignmentDetail', { id: item._id })
              }
              onEdit={() =>
                navigation.navigate('TeacherAssignmentForm', { id: item._id })
              }
              onDelete={() => handleDelete(item._id, item.title)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={assignmentsQuery.isRefetching}
              onRefresh={() => assignmentsQuery.refetch()}
              colors={[colors.dashGreen]}
            />
          }
        />
      )}
    </View>
  );
}

// ── Assignment Form Screen ──────────────────────────────────────────────────
export function TeacherAssignmentFormScreen({ navigation, route }) {
  const assignmentId = route.params?.id;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [batchId, setBatchId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const assignmentQuery = useQuery({
    queryKey: ['teacher', 'assignment', assignmentId],
    queryFn: ({ signal }) =>
      apiRequest(`/teacher/assignments/${assignmentId}`, {
        auth: true,
        signal,
      }),
    enabled: !!assignmentId,
  });

  const batchesQuery = useQuery({
    queryKey: ['teacher', 'batches'],
    queryFn: ({ signal }) =>
      apiRequest('/teacher/batches', { auth: true, signal }),
  });

  const subjectsQuery = useQuery({
    queryKey: ['teacher', 'subjects'],
    queryFn: ({ signal }) =>
      apiRequest('/teacher/subjects', { auth: true, signal }),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      if (assignmentId) {
        return apiRequest(`/teacher/assignments/${assignmentId}`, {
          auth: true,
          method: 'PATCH',
          body: data,
        });
      }
      return apiRequest('/teacher/assignments', {
        auth: true,
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'assignments'] });
      navigation.goBack();
    },
  });

  useEffect(() => {
    if (assignmentQuery.data?.data) {
      const a = assignmentQuery.data.data;
      setTitle(a.title);
      setDescription(a.description);
      setBatchId(a.batchId);
      setSubjectId(a.subjectId);
      setDueDate(a.dueAt?.split('T')[0] || '');
      setAttachments(a.attachments || []);
    }
  }, [assignmentQuery.data]);

  useEffect(() => {
    if (batchesQuery.data?.data) {
      setBatches(batchesQuery.data.data);
    }
  }, [batchesQuery.data]);

  useEffect(() => {
    if (subjectsQuery.data?.data) {
      setSubjects(subjectsQuery.data.data);
    }
  }, [subjectsQuery.data]);

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    }
    setShowDatePicker(false);
  };
  
  const handleAddPhoto = async () => {
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setAttachments([...attachments, {
          id: Date.now(),
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddPDF = async () => {
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setAttachments([...attachments, {
          id: Date.now(),
          uri: asset.uri,
          name: asset.fileName || `document_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
        }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (id) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter assignment title');
      return;
    }
    if (!batchId) {
      Alert.alert('Error', 'Please select a batch');
      return;
    }
    if (!subjectId) {
      Alert.alert('Error', 'Please select a subject');
      return;
    }
    if (!dueDate) {
      Alert.alert('Error', 'Please select a due date');
      return;
    }

    try {
      const dateObj = new Date(`${dueDate}T00:00:00Z`);
      if (isNaN(dateObj.getTime())) {
        Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD');
        return;
      }

      saveMutation.mutate({
        title: title.trim(),
        description: description.trim(),
        batchId,
        subjectId,
        dueAt: dateObj.toISOString(),
        attachments: attachments.map((a) => ({
          name: a.name,
          url: a.uri,
          mimeType: a.type,
          size: a.size,
        })),
      });
    } catch (error) {
      Alert.alert('Error', 'Invalid date format. Use YYYY-MM-DD');
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScreenHeader
        title={assignmentId ? 'Edit Assignment' : 'New Assignment'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.formContent}
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Assignment title"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={colors.dashSubText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Assignment description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor={colors.dashSubText}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Batch *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectRow}
          >
            {batches.map((batch) => (
              <Pressable
                key={batch._id}
                style={[
                  styles.selectOption,
                  batchId === batch._id && styles.selectOptionActive,
                ]}
                onPress={() => setBatchId(batch._id)}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    batchId === batch._id && styles.selectOptionTextActive,
                  ]}
                >
                  {batch.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Subject *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectRow}
          >
            {subjects.map((subject) => (
              <Pressable
                key={subject._id}
                style={[
                  styles.selectOption,
                  subjectId === subject._id && styles.selectOptionActive,
                ]}
                onPress={() => setSubjectId(subject._id)}
              >
                <Text
                  style={[
                    styles.selectOptionText,
                    subjectId === subject._id && styles.selectOptionTextActive,
                  ]}
                >
                  {subject.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Due Date *</Text>
          <Pressable
            style={({ pressed, hovered }) => [
              styles.input,
              { justifyContent: 'center' },
              hovered && styles.inputHovered,
              pressed && styles.inputPressed,
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.inputText, !dueDate && styles.placeholderText]}>
              {dueDate || 'Select due date'}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={dueDate ? new Date(dueDate) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Attachments (Optional)</Text>
          <View style={styles.attachmentButtons}>
            <Pressable
              style={({ pressed, hovered }) => [
                styles.attachButton,
                hovered && styles.attachButtonHovered,
                pressed && styles.attachButtonPressed,
                uploading && styles.attachButtonDisabled,
              ]}
              onPress={handleAddPhoto}
              disabled={uploading}
            >
              <Text style={styles.attachButtonText}>📷 Photo</Text>
            </Pressable>
            <Pressable
              style={({ pressed, hovered }) => [
                styles.attachButton,
                hovered && styles.attachButtonHovered,
                pressed && styles.attachButtonPressed,
                uploading && styles.attachButtonDisabled,
              ]}
              onPress={handleAddPDF}
              disabled={uploading}
            >
              <Text style={styles.attachButtonText}>📄 PDF</Text>
            </Pressable>
          </View>

          {attachments.length > 0 && (
            <View style={styles.attachmentsList}>
              {attachments.map((file) => (
                <View key={file.id} style={styles.attachmentItem}>
                  <View style={styles.attachmentInfo}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {file.type?.includes('pdf') ? '📄' : '🖼️'} {file.name}
                    </Text>
                    <Text style={styles.attachmentSize}>
                      {(file.size / 1024).toFixed(2)} KB
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveAttachment(file.id)}
                    style={({ pressed }) => [
                      styles.removeButton,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed, hovered }) => [
            styles.submitButton,
            hovered && styles.submitButtonHovered,
            pressed && styles.submitButtonPressed,
            saveMutation.isPending && styles.submitButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {assignmentId ? 'Update Assignment' : 'Create Assignment'}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ── Assignment Detail Screen ────────────────────────────────────────────────
export function TeacherAssignmentDetailScreen({ navigation, route }) {
  const assignmentId = route.params?.id;

  const assignmentQuery = useQuery({
    queryKey: ['teacher', 'assignment', assignmentId],
    queryFn: ({ signal }) =>
      apiRequest(`/teacher/assignments/${assignmentId}`, {
        auth: true,
        signal,
      }),
  });

  const assignment = assignmentQuery.data?.data;

  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScreenHeader
        title="Assignment Details"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable
            style={({ pressed, hovered }) => [
              styles.editButton,
              hovered && styles.editButtonHovered,
              pressed && styles.editButtonPressed,
            ]}
            onPress={() =>
              navigation.navigate('TeacherAssignmentForm', { id: assignmentId })
            }
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        }
      />

      {assignmentQuery.isPending ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.dashGreen} />
        </View>
      ) : assignment ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.detailContent}
        >
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{assignment.title}</Text>
            {assignment.description && (
              <Text style={styles.detailDesc}>{assignment.description}</Text>
            )}

            <View style={styles.detailMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Due Date</Text>
                <Text style={styles.metaValue}>
                  {(() => {
                    try {
                      const d = new Date(assignment.dueAt);
                      return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
                    } catch (e) {
                      return 'N/A';
                    }
                  })()}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Submissions</Text>
                <Text style={styles.metaValue}>
                  {assignment.submissions?.length ?? 0}
                </Text>
              </View>
            </View>
          </View>

          {assignment.submissions && assignment.submissions.length > 0 && (
            <View style={styles.submissionsSection}>
              <Text style={styles.sectionTitle}>Submissions</Text>
              {assignment.submissions.map((submission, idx) => (
                <View key={idx} style={styles.submissionItem}>
                  <Text style={styles.submissionStudent}>
                    Student {idx + 1}
                  </Text>
                  <Text style={styles.submissionDate}>
                    {(() => {
                      try {
                        const d = new Date(submission.submittedAt);
                        return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-IN');
                      } catch (e) {
                        return 'N/A';
                      }
                    })()}
                  </Text>
                  {submission.note && (
                    <Text style={styles.submissionNote}>{submission.note}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },
  header: { backgroundColor: colors.dashGreen, paddingBottom: 16 },
  headerSafe: { paddingHorizontal: 18 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonHovered: { backgroundColor: 'rgba(255,255,255,0.14)' },
  backButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    transform: [{ scale: 0.95 }],
  },
  backIcon: { fontSize: 20, color: '#fff', fontWeight: '700' },
  headerBrand: { flex: 1 },
  brandName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8 },
  createButton: {
    backgroundColor: colors.dashGreenAccent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  createButtonHovered: { opacity: 0.9 },
  createButtonPressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  createButtonText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  editButton: {
    backgroundColor: colors.dashGreenAccent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  editButtonHovered: { opacity: 0.9 },
  editButtonPressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  editButtonText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: colors.dashCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.dashBorder,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.dashBg,
    borderWidth: 1,
    borderColor: colors.dashBorder,
  },
  filterButtonActive: {
    backgroundColor: colors.dashGreen,
    borderColor: colors.dashGreen,
  },
  filterButtonText: { fontSize: 12, fontWeight: '700', color: colors.dashText },
  filterButtonTextActive: { color: '#fff' },

  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },
  listContent: { padding: 16, gap: 12, paddingBottom: 40 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  listItem: {
    backgroundColor: colors.dashCard,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  listItemHovered: { backgroundColor: colors.dashGreenLight },
  listItemPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  listItemContent: { flex: 1, gap: 6 },
  listItemHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  listItemTitle: { fontSize: 14, fontWeight: '800', color: colors.dashText, flex: 1 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeOverdue: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10, fontWeight: '700' },
  statusPending: { color: '#D97706' },
  statusOverdue: { color: '#DC2626' },
  listItemDesc: { fontSize: 12, color: colors.dashSubText },
  listItemFooter: { flexDirection: 'row', gap: 12 },
  listItemMeta: { fontSize: 11, color: colors.dashSubText },
  listItemActions: { flexDirection: 'row', gap: 6 },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dashBg,
    borderWidth: 1,
    borderColor: colors.dashBorder,
  },
  actionButtonHovered: { backgroundColor: colors.dashGreenLight },
  actionButtonDelete: { borderColor: '#FEE2E2' },
  actionButtonDeleteHovered: { backgroundColor: '#FEE2E2' },
  actionButtonPressed: { transform: [{ scale: 0.9 }] },
  actionIcon: { fontSize: 16, color: colors.dashGreen },
  actionIconDelete: { fontSize: 16, color: '#DC2626' },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: colors.dashText },
  emptyMessage: {
    fontSize: 14,
    color: colors.dashSubText,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: colors.dashGreen,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  emptyButtonHovered: { opacity: 0.9 },
  emptyButtonPressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  emptyButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  formContent: { padding: 16, gap: 16, paddingBottom: 40 },
  formGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '800', color: colors.dashText },
  input: {
    backgroundColor: colors.dashCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.dashText,
  },
  inputHovered: { backgroundColor: colors.dashGreenLight },
  inputPressed: { opacity: 0.8 },
  inputText: { fontSize: 14, color: colors.dashText },
  placeholderText: { color: colors.dashSubText },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  selectRow: { flexDirection: 'row', gap: 8 },
  selectOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.dashCard,
    borderWidth: 1,
    borderColor: colors.dashBorder,
  },
  selectOptionActive: {
    backgroundColor: colors.dashGreen,
    borderColor: colors.dashGreen,
  },
  selectOptionText: { fontSize: 12, fontWeight: '700', color: colors.dashText },
  selectOptionTextActive: { color: '#fff' },
  submitButton: {
    backgroundColor: colors.dashGreen,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonHovered: { opacity: 0.9 },
  submitButtonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  attachmentButtons: { flexDirection: 'row', gap: 8 },
  attachButton: {
    flex: 1,
    backgroundColor: colors.dashCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    paddingVertical: 12,
    alignItems: 'center',
  },
  attachButtonHovered: { backgroundColor: colors.dashGreenLight },
  attachButtonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  attachButtonDisabled: { opacity: 0.5 },
  attachButtonText: { fontSize: 12, fontWeight: '700', color: colors.dashText },
  attachmentsList: { gap: 8, marginTop: 12 },
  attachmentItem: {
    backgroundColor: colors.dashBg,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.dashBorder,
  },
  attachmentInfo: { flex: 1, gap: 2 },
  attachmentName: { fontSize: 12, fontWeight: '700', color: colors.dashText },
  attachmentSize: { fontSize: 10, color: colors.dashSubText },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: { fontSize: 16, color: '#DC2626', fontWeight: '700' },
  detailContent: { padding: 16, gap: 16, paddingBottom: 40 },
  detailCard: {
    backgroundColor: colors.dashCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    gap: 12,
  },
  detailTitle: { fontSize: 18, fontWeight: '900', color: colors.dashText },
  detailDesc: { fontSize: 14, color: colors.dashSubText, lineHeight: 20 },
  detailMeta: { flexDirection: 'row', gap: 16, marginTop: 8 },
  metaItem: { flex: 1, gap: 4 },
  metaLabel: { fontSize: 12, fontWeight: '700', color: colors.dashSubText },
  metaValue: { fontSize: 14, fontWeight: '800', color: colors.dashText },
  submissionsSection: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: colors.dashText },
  submissionItem: {
    backgroundColor: colors.dashCard,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    gap: 6,
  },
  submissionStudent: { fontSize: 13, fontWeight: '800', color: colors.dashText },
  submissionDate: { fontSize: 11, color: colors.dashSubText },
  submissionNote: { fontSize: 12, color: colors.dashText, marginTop: 4 },
});
