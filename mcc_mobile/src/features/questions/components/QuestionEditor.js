import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import AppInput from '../../../components/common/AppInput';
import RelationSelectField from '../../admin/components/RelationSelectField';
import colors from '../../../theme/colors';
import BlockCollectionEditor from './BlockCollectionEditor';
import OptionEditor from './OptionEditor';
import QuestionPreview from './QuestionPreview';

const difficulties = ['easy', 'medium', 'hard'];

export default function QuestionEditor({
  question,
  subjects,
  onChange,
  errors,
}) {
  function update(field, value) {
    onChange({ ...question, [field]: value });
  }

  function updateOption(index, option) {
    update(
      'options',
      question.options.map((current, currentIndex) =>
        currentIndex === index ? option : current,
      ),
    );
  }

  function removeOption(index) {
    const options = question.options.filter(
      (_, currentIndex) => currentIndex !== index,
    );
    let correctOptionIndex = question.correctOptionIndex;
    if (index === correctOptionIndex) correctOptionIndex = 0;
    if (index < correctOptionIndex) correctOptionIndex -= 1;
    onChange({ ...question, options, correctOptionIndex });
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Question details</Text>
        <RelationSelectField
          error={errors.subjectId}
          label="Subject"
          onChange={(value) => update('subjectId', value)}
          options={subjects}
          value={question.subjectId}
        />
        <AppInput
          error={errors.topic}
          label="Topic"
          onChangeText={(value) => update('topic', value)}
          placeholder="For example: Quadratic equations"
          value={question.topic}
        />
        <View style={styles.field}>
          <Text style={styles.label}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {difficulties.map((difficulty) => {
              const selected = question.difficulty === difficulty;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  key={difficulty}
                  onPress={() => update('difficulty', difficulty)}
                  style={[
                    styles.difficulty,
                    selected && styles.difficultySelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      selected && styles.difficultyTextSelected,
                    ]}
                  >
                    {difficulty}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Question content</Text>
        {errors.content ? (
          <Text style={styles.error}>{errors.content}</Text>
        ) : null}
        <BlockCollectionEditor
          blocks={question.content}
          onChange={(value) => update('content', value)}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Answer options</Text>
        {errors.options ? (
          <Text style={styles.error}>{errors.options}</Text>
        ) : null}
        {question.options.map((option, index) => (
          <OptionEditor
            canRemove={question.options.length > 2}
            correct={question.correctOptionIndex === index}
            index={index}
            key={option._id || `option-${index}`}
            onChange={(value) => updateOption(index, value)}
            onCorrect={() => update('correctOptionIndex', index)}
            onRemove={() => removeOption(index)}
            option={option}
          />
        ))}
        {question.options.length < 8 ? (
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              update('options', [
                ...question.options,
                { content: [{ type: 'text', value: '' }] },
              ])
            }
            style={styles.addOption}
          >
            <Text style={styles.addOptionText}>+ Add option</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.activeRow}>
        <View style={styles.activeCopy}>
          <Text style={styles.label}>Active</Text>
          <Text style={styles.hint}>
            Only active questions are visible to Teachers.
          </Text>
        </View>
        <Switch
          onValueChange={(value) => update('isActive', value)}
          thumbColor={colors.white}
          trackColor={{ false: colors.border, true: colors.primary }}
          value={question.isActive}
        />
      </View>

      {question.content.length > 0 &&
      question.options.every((option) => option.content.length) ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Live preview</Text>
          <QuestionPreview question={question} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24 },
  section: { gap: 14 },
  sectionTitle: { color: colors.black, fontSize: 19, fontWeight: '900' },
  field: { gap: 8 },
  label: { color: colors.darkNeutral, fontSize: 14, fontWeight: '700' },
  difficultyRow: { flexDirection: 'row', gap: 8 },
  difficulty: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  difficultySelected: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  },
  difficultyText: { color: colors.mutedText, fontSize: 13, fontWeight: '800' },
  difficultyTextSelected: { color: colors.white },
  error: { color: colors.error, fontSize: 12 },
  addOption: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: 13,
  },
  addOptionText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  activeRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  activeCopy: { flex: 1, gap: 4 },
  hint: { color: colors.mutedText, fontSize: 12 },
});
