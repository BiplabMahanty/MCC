const activeField = {
  key: 'isActive',
  label: 'Active',
  type: 'boolean',
};

const entityConfigs = {
  students: {
    singular: 'Student',
    plural: 'Students',
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        requiredOnCreate: true,
        editHint: 'Leave blank to keep the current password',
      },
      { key: 'phone', label: 'Phone' },
      { key: 'studentCode', label: 'Student code', required: true },
      { key: 'batchId', label: 'Batch', type: 'batch' },
      {
        key: 'dateOfBirth',
        label: 'Date of birth',
        placeholder: 'YYYY-MM-DD',
        type: 'date',
      },
      { key: 'guardianName', label: 'Guardian name' },
      { key: 'guardianPhone', label: 'Guardian phone' },
      { key: 'profileImage', label: 'Profile photo', type: 'image' },
      activeField,
    ],
    subtitle(item) {
      return `${item.studentCode} · ${item.email}`;
    },
  },
  teachers: {
    singular: 'Teacher',
    plural: 'Teachers',
    fields: [
      { key: 'name', label: 'Full name', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      {
        key: 'password',
        label: 'Password',
        type: 'password',
        requiredOnCreate: true,
        editHint: 'Leave blank to keep the current password',
      },
      { key: 'phone', label: 'Phone' },
      { key: 'employeeCode', label: 'Employee code', required: true },
      { key: 'qualification', label: 'Qualification' },
      {
        key: 'experienceYears',
        label: 'Experience (years)',
        type: 'number',
        defaultValue: '0',
      },
      { key: 'profileImage', label: 'Profile photo', type: 'image' },
      activeField,
    ],
    subtitle(item) {
      return `${item.employeeCode} · ${item.email}`;
    },
  },
  courses: {
    singular: 'Course',
    plural: 'Courses',
    fields: [
      { key: 'name', label: 'Course name', required: true },
      { key: 'code', label: 'Course code', required: true },
      { key: 'description', label: 'Description', multiline: true },
      activeField,
    ],
    subtitle(item) {
      return item.code;
    },
  },
  batches: {
    singular: 'Batch',
    plural: 'Batches',
    fields: [
      { key: 'name', label: 'Batch name', required: true },
      { key: 'code', label: 'Batch code', required: true },
      { key: 'courseId', label: 'Course', type: 'course', required: true },
      {
        key: 'teacherIds',
        label: 'Assigned teachers',
        type: 'teacher',
        multiple: true,
      },
      {
        key: 'academicSession',
        label: 'Academic session',
        placeholder: '2026-2027',
        required: true,
      },
      {
        key: 'startDate',
        label: 'Start date',
        placeholder: 'YYYY-MM-DD',
        required: true,
        type: 'date',
      },
      {
        key: 'endDate',
        label: 'End date',
        placeholder: 'YYYY-MM-DD',
        required: true,
        type: 'date',
      },
      {
        key: 'capacity',
        label: 'Capacity',
        type: 'number',
        required: true,
        defaultValue: '100',
      },
      activeField,
    ],
    subtitle(item) {
      const course = item.courseId?.name || 'No course';
      return `${item.code} · ${course}`;
    },
  },
  subjects: {
    singular: 'Subject',
    plural: 'Subjects',
    fields: [
      { key: 'name', label: 'Subject name', required: true },
      { key: 'code', label: 'Subject code', required: true },
      { key: 'courseId', label: 'Course', type: 'course', required: true },
      {
        key: 'teacherIds',
        label: 'Assigned teachers',
        type: 'teacher',
        multiple: true,
      },
      { key: 'description', label: 'Description', multiline: true },
      activeField,
    ],
    subtitle(item) {
      const course = item.courseId?.name || 'No course';
      return `${item.code} · ${course}`;
    },
  },
};

export default entityConfigs;
