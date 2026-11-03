// IMPLEMENTATION STEPS FOR FILE UPLOAD IN ASSIGNMENTS

// Step 1: Add imports at the top of TeacherAssignmentsScreen.js
// import { pickImage, pickDocument } from '../../../services/fileUpload';

// Step 2: Add state in TeacherAssignmentFormScreen
// const [attachments, setAttachments] = useState([]);
// const [uploading, setUploading] = useState(false);

// Step 3: Add these handler functions
/*
const handleAddAttachment = async (type) => {
  try {
    setUploading(true);
    let file;
    if (type === 'image') {
      file = await pickImage();
    } else {
      file = await pickDocument();
    }
    
    if (file) {
      setAttachments([...attachments, { ...file, id: Date.now() }]);
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to pick file');
  } finally {
    setUploading(false);
  }
};

const handleRemoveAttachment = (id) => {
  setAttachments(attachments.filter((a) => a.id !== id));
};
*/

// Step 4: Update handleSave to include attachments
/*
attachments: attachments.map((a) => ({
  name: a.name,
  url: a.uri,
  mimeType: a.type,
  size: a.size,
})),
*/

// Step 5: Add UI after Due Date field in form
/*
<View style={styles.formGroup}>
  <Text style={styles.label}>Attachments</Text>
  <View style={styles.attachmentButtons}>
    <Pressable
      style={({ pressed, hovered }) => [
        styles.attachButton,
        hovered && styles.attachButtonHovered,
        pressed && styles.attachButtonPressed,
        uploading && styles.attachButtonDisabled,
      ]}
      onPress={() => handleAddAttachment('image')}
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
      onPress={() => handleAddAttachment('document')}
      disabled={uploading}
    >
      <Text style={styles.attachButtonText}>📄 PDF/File</Text>
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
*/

// Step 6: Add these styles to StyleSheet.create()
/*
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
*/

// Step 7: Update backend service to handle attachments
// In teacherAssignments.service.js, the attachments are already supported
// Just ensure the API accepts the attachments array in the request body

// Step 8: Test the feature
// 1. Create new assignment
// 2. Tap "📷 Photo" to add image
// 3. Tap "📄 PDF/File" to add PDF
// 4. Remove attachments with ✕ button
// 5. Save assignment with attachments
// 6. View assignment to see attachments
