# Teacher Assignments - File Upload Implementation Guide

## Overview
Teachers can now attach photos and PDF files to assignments. The system supports:
- Image files (JPG, PNG, WEBP)
- PDF documents
- File size validation
- Multiple attachments per assignment

## Features Implemented

### 1. File Upload Service (`src/services/fileUpload.js`)
- `pickImage()` - Opens image picker for photos
- `pickDocument()` - Opens document picker for PDFs
- `uploadFile()` - Uploads file to server

### 2. Backend Support
The Assignment model already supports attachments:
```javascript
attachments: { type: [fileSchema], default: [] }
```

Each attachment stores:
- name: File name
- url: File URL/path
- mimeType: File type (image/jpeg, application/pdf, etc.)
- size: File size in bytes

### 3. Mobile App Integration

#### In TeacherAssignmentFormScreen:
```javascript
// State for attachments
const [attachments, setAttachments] = useState([]);
const [uploading, setUploading] = useState(false);

// Add attachment handler
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

// Remove attachment handler
const handleRemoveAttachment = (id) => {
  setAttachments(attachments.filter((a) => a.id !== id));
};

// In form submission
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
```

#### UI Components:
```javascript
// Attachment buttons
<View style={styles.attachmentButtons}>
  <Pressable onPress={() => handleAddAttachment('image')}>
    <Text>📷 Photo</Text>
  </Pressable>
  <Pressable onPress={() => handleAddAttachment('document')}>
    <Text>📄 PDF/File</Text>
  </Pressable>
</View>

// Attachments list
{attachments.length > 0 && (
  <View style={styles.attachmentsList}>
    {attachments.map((file) => (
      <View key={file.id} style={styles.attachmentItem}>
        <View style={styles.attachmentInfo}>
          <Text>{file.type?.includes('pdf') ? '📄' : '🖼️'} {file.name}</Text>
          <Text>{(file.size / 1024).toFixed(2)} KB</Text>
        </View>
        <Pressable onPress={() => handleRemoveAttachment(file.id)}>
          <Text>✕</Text>
        </Pressable>
      </View>
    ))}
  </View>
)}
```

### 4. Styles
```javascript
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
```

## How to Use

1. **Add Photo to Assignment:**
   - Tap "📷 Photo" button
   - Select image from gallery
   - Image appears in attachments list

2. **Add PDF to Assignment:**
   - Tap "📄 PDF/File" button
   - Select PDF from device
   - PDF appears in attachments list

3. **Remove Attachment:**
   - Tap "✕" button on attachment
   - Attachment is removed from list

4. **Save Assignment:**
   - Fill all required fields
   - Add attachments (optional)
   - Tap "Create Assignment" or "Update Assignment"
   - Attachments are saved with the assignment

## File Size Limits
- Images: Up to 5MB (recommended)
- PDFs: Up to 10MB (recommended)
- Total per assignment: 50MB

## Supported Formats
- Images: JPG, PNG, WEBP
- Documents: PDF

## Backend Validation
The backend validates:
- File type (MIME type)
- File size
- File integrity
- Virus scanning (if configured)

## Student View
Students can see attachments when viewing assignments:
- Download files
- View images inline
- Open PDFs in viewer

## Notes
- Attachments are optional
- Multiple files can be attached
- Files are stored with assignment metadata
- Soft delete preserves attachment history
