import { StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

export default function RecordListItem({ title, subtitle, active }) {
  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {active !== undefined ? (
        <Text style={[styles.status, !active && styles.inactive]}>
          {active ? 'Active' : 'Inactive'}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  copy: { flex: 1, gap: 6 },
  title: { color: colors.black, fontSize: 16, fontWeight: '800' },
  subtitle: { color: colors.mutedText, fontSize: 13, lineHeight: 18 },
  status: { color: colors.success, fontSize: 11, fontWeight: '800' },
  inactive: { color: colors.warning },
});
