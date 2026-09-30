import { StyleSheet, Text, View } from 'react-native';
import colors from '../../../theme/colors';

const CONFIG = {
  paid:    { label: 'Paid',    bg: colors.successSurface, text: colors.success },
  pending: { label: 'Pending', bg: '#FEF3C7',             text: '#D97706' },
  partial: { label: 'Partial', bg: '#DBEAFE',             text: '#2563EB' },
  overdue: { label: 'Overdue', bg: colors.errorSurface,   text: colors.error },
  waived:  { label: 'Waived',  bg: '#F3F4F6',             text: colors.mutedText },
};

export default function FeeStatusBadge({ status }) {
  const cfg = CONFIG[status] ?? CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.text, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
  },
});
