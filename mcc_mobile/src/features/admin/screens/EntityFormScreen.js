import { useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import AppButton from '../../../components/common/AppButton';
import AppInput from '../../../components/common/AppInput';
import DateTimePickerField from '../../../components/common/DateTimePickerField';
import ErrorState from '../../../components/common/ErrorState';
import Loader from '../../../components/common/Loader';
import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import AdminHeader from '../components/AdminHeader';
import TeacherFormHeader from '../components/TeacherFormHeader';
import RelationSelectField from '../components/RelationSelectField';
import entityConfigs from '../config/entityConfigs';
import { uploadProfileImage } from '../services/adminApi';
import {
  useAdminEntity,
  useAdminOptions,
  useSaveAdminEntity,
} from '../hooks/useAdminEntities';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function initialValues(fields, record) {
  return Object.fromEntries(
    fields.map((field) => {
      let value = record?.[field.key];

      if (field.type === 'image') {
        return [field.key, value || null];
      }

      if (field.multiple) {
        value = (value || []).map((item) =>
          typeof item === 'object' ? item._id : item,
        );
      } else if (
        ['batch', 'course', 'teacher'].includes(field.type) &&
        value &&
        typeof value === 'object'
      ) {
        value = value._id;
      }

      if (field.type === 'date' && value) {
        value = String(value).slice(0, 10);
      }

      if (field.multiple) {
        value = value || [];
      } else if (field.type === 'boolean') {
        value = value ?? true;
      } else if (value === undefined || value === null) {
        value = field.defaultValue ?? '';
      } else {
        value = String(value);
      }

      return [field.key, value];
    }),
  );
}

function validateValues(fields, values, editing) {
  const errors = {};

  fields.forEach((field) => {
    const value = values[field.key];
    const text = typeof value === 'string' ? value.trim() : value;
    const required = field.required || (!editing && field.requiredOnCreate);

    if (field.type === 'image') return;

    if (required && !text) {
      errors[field.key] = `${field.label} is required.`;
    } else if (field.type === 'email' && text && !/^\S+@\S+\.\S+$/.test(text)) {
      errors[field.key] = 'Enter a valid email address.';
    } else if (field.type === 'password' && text && text.length < 8) {
      errors[field.key] = 'Password must be at least 8 characters.';
    } else if (field.type === 'date' && text && !DATE_PATTERN.test(text)) {
      errors[field.key] = 'Use the YYYY-MM-DD format.';
    } else if (
      field.type === 'number' &&
      text !== '' &&
      !Number.isFinite(Number(text))
    ) {
      errors[field.key] = 'Enter a valid number.';
    }
  });

  return errors;
}

function requestBody(fields, values, editing) {
  return Object.fromEntries(
    fields.flatMap((field) => {
      const value = values[field.key];

      if (field.type === 'image') {
        return value ? [[field.key, value]] : [];
      }

      if (field.type === 'password' && editing && !value.trim()) {
        return [];
      }

      if (field.type === 'boolean') {
        return [[field.key, value]];
      }

      if (field.multiple) {
        return [[field.key, value]];
      }

      const trimmed = value.trim();

      if (field.type === 'number') {
        return [[field.key, Number(trimmed)]];
      }

      if (field.type === 'date' && !trimmed) {
        return [[field.key, null]];
      }

      if (['batch', 'course', 'teacher'].includes(field.type) && !trimmed) {
        return [[field.key, null]];
      }

      return [[field.key, trimmed]];
    }),
  );
}

function ImagePickerField({ label, value, onChange }) {
  const [uploading, setUploading] = useState(false);

  async function pick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    try {
      setUploading(true);
      const uploaded = await uploadProfileImage(asset);
      onChange(uploaded);
    } catch (error) {
      Alert.alert('Upload failed', error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={imgStyles.container}>
      <Text style={imgStyles.label}>{label}</Text>
      <View style={imgStyles.row}>
        {value?.url ? (
          <Image
            accessibilityLabel="Profile photo"
            source={{ uri: value.url }}
            style={imgStyles.preview}
          />
        ) : (
          <View style={imgStyles.placeholder}>
            <Text style={imgStyles.placeholderText}>No photo</Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={uploading}
          onPress={pick}
          style={imgStyles.button}
        >
          <Text style={imgStyles.buttonText}>
            {uploading ? 'Uploading...' : value?.url ? 'Change photo' : 'Select photo'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const imgStyles = StyleSheet.create({
  container: { gap: 8 },
  label: { color: colors.darkNeutral, fontSize: 13, fontWeight: '700' },
  row: { alignItems: 'center', flexDirection: 'row', gap: 14 },
  preview: { borderRadius: 40, height: 80, width: 80 },
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.lightNeutral,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  placeholderText: { color: colors.mutedText, fontSize: 11 },
  button: {
    borderColor: colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: { color: colors.primary, fontSize: 13, fontWeight: '800' },
});

function EntityForm({
  config,
  editing,
  navigation,
  options,
  record,
  entityType,
  id,
}) {
  const [values, setValues] = useState(() =>
    initialValues(config.fields, record),
  );
  const [errors, setErrors] = useState({});
  const saveMutation = useSaveAdminEntity(entityType, id);
  const teacherForm = entityType === 'teachers';

  function updateValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit() {
    const nextErrors = validateValues(config.fields, values, editing);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      await saveMutation.mutateAsync(
        requestBody(config.fields, values, editing),
      );
      navigation.goBack();
    } catch (error) {
      if (Array.isArray(error.details)) {
        setErrors(
          Object.fromEntries(
            error.details.map((detail) => [detail.field, detail.message]),
          ),
        );
      }
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.flex, teacherForm && styles.edgeToEdge]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          teacherForm && styles.edgeContent,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {entityType === 'teachers' ? (
          <TeacherFormHeader editing={editing} onBack={navigation.goBack} />
        ) : (
          <AdminHeader
            onBack={navigation.goBack}
            subtitle="Required fields are validated before saving."
            title={`${editing ? 'Edit' : 'Add'} ${config.singular}`}
          />
        )}

        <View style={styles.form}>
          {config.fields.map((field) => {
            if (field.type === 'image') {
              return (
                <ImagePickerField
                  key={field.key}
                  label={field.label}
                  onChange={(value) => updateValue(field.key, value)}
                  value={values[field.key]}
                />
              );
            }

            if (field.type === 'date') {
              return (
                <DateTimePickerField
                  key={field.key}
                  dateOnly
                  label={field.label}
                  dateValue={values[field.key]}
                  onChangeDateStr={(v) => updateValue(field.key, v)}
                  error={errors[field.key]}
                />
              );
            }

            if (field.type === 'boolean') {
              return (
                <View key={field.key} style={styles.switchRow}>
                  <View style={styles.switchCopy}>
                    <Text style={styles.switchLabel}>{field.label}</Text>
                    <Text style={styles.switchHint}>
                      Inactive records cannot sign in or be selected for new
                      work.
                    </Text>
                  </View>
                  <Switch
                    onValueChange={(value) => updateValue(field.key, value)}
                    thumbColor={colors.white}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    value={values[field.key]}
                  />
                </View>
              );
            }

            if (['batch', 'course', 'teacher'].includes(field.type)) {
              return (
                <RelationSelectField
                  allowClear={!field.required}
                  error={errors[field.key]}
                  key={field.key}
                  label={field.label}
                  multiple={field.multiple}
                  onChange={(value) => updateValue(field.key, value)}
                  options={options[field.type]}
                  value={values[field.key]}
                />
              );
            }

            return (
              <View key={field.key} style={styles.fieldGroup}>
                <AppInput
                  autoCapitalize={
                    ['email', 'password'].includes(field.type)
                      ? 'none'
                      : 'sentences'
                  }
                  autoCorrect={false}
                  error={errors[field.key]}
                  inputMode={
                    field.type === 'email'
                      ? 'email'
                      : field.type === 'number'
                        ? 'numeric'
                        : 'text'
                  }
                  label={field.label}
                  multiline={field.multiline}
                  onChangeText={(value) => updateValue(field.key, value)}
                  placeholder={field.placeholder}
                  secureTextEntry={field.type === 'password'}
                  style={field.multiline ? styles.multilineInput : undefined}
                  value={values[field.key]}
                />
                {editing && field.editHint ? (
                  <Text style={styles.fieldHint}>{field.editHint}</Text>
                ) : null}
              </View>
            );
          })}
        </View>

        {saveMutation.error ? (
          <Text accessibilityRole="alert" style={styles.submitError}>
            {saveMutation.error.message}
          </Text>
        ) : null}

        <AppButton
          disabled={saveMutation.isPending}
          label={
            saveMutation.isPending ? 'Saving...' : `Save ${config.singular}`
          }
          onPress={submit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default function EntityFormScreen({ navigation, route }) {
  const { entityType, id } = route.params;
  const config = entityConfigs[entityType];
  const editing = Boolean(id);
  const entityQuery = useAdminEntity(entityType, id);
  const relationTypes = useMemo(
    () => new Set(config.fields.map((field) => field.type)),
    [config.fields],
  );
  const coursesQuery = useAdminOptions('courses', relationTypes.has('course'));
  const batchesQuery = useAdminOptions('batches', relationTypes.has('batch'));
  const teachersQuery = useAdminOptions(
    'teachers',
    relationTypes.has('teacher'),
  );
  const optionQueries = [
    { enabled: relationTypes.has('course'), query: coursesQuery },
    { enabled: relationTypes.has('batch'), query: batchesQuery },
    { enabled: relationTypes.has('teacher'), query: teachersQuery },
  ];
  const optionsPending = optionQueries.some(
    ({ enabled, query }) => enabled && query.isPending,
  );

  if ((editing && entityQuery.isPending) || optionsPending) {
    return (
      <Screen>
        <Loader message={`Loading ${config.singular.toLowerCase()} form...`} />
      </Screen>
    );
  }

  const optionError = optionQueries.find(({ query }) => query.error)?.query;
  const loadError = entityQuery.error || optionError?.error;
  if (loadError) {
    return (
      <Screen>
        <ErrorState
          message={loadError.message}
          onRetry={() => {
            if (entityQuery.error) entityQuery.refetch();
            if (optionError) optionError.refetch();
          }}
          retrying={
            entityQuery.isFetching ||
            optionQueries.some(({ query }) => query.isFetching)
          }
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <EntityForm
        config={config}
        editing={editing}
        entityType={entityType}
        id={id}
        navigation={navigation}
        options={{
          batch: batchesQuery.data?.data || [],
          course: coursesQuery.data?.data || [],
          teacher: teachersQuery.data?.data || [],
        }}
        record={entityQuery.data?.data}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  edgeToEdge: {
    marginBottom: -24,
    marginHorizontal: -20,
    marginTop: -24,
  },
  content: {
    gap: 22,
    paddingBottom: 28,
  },
  edgeContent: {
    paddingHorizontal: 20,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 5,
  },
  fieldHint: {
    color: colors.mutedText,
    fontSize: 12,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    padding: 14,
  },
  switchCopy: {
    flex: 1,
    gap: 4,
  },
  switchLabel: {
    color: colors.darkNeutral,
    fontSize: 14,
    fontWeight: '700',
  },
  switchHint: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
  },
  submitError: {
    backgroundColor: colors.errorSurface,
    borderRadius: 10,
    color: colors.error,
    fontSize: 13,
    padding: 12,
  },
});
