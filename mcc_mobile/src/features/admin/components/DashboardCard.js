import { Pressable, StyleSheet, Text, View } from 'react-native';

const palette = {
  mint: '#5BE99E',
  text: '#0D2B20',
  secondary: '#3A6B55',
  accentLine: 'rgba(91, 233, 158, 0.85)',
};

const cardGradient = [
  {
    type: 'linear-gradient',
    direction: '145deg',
    colorStops: [
      { color: 'rgba(255, 255, 255, 0.97)', positions: ['0%'] },
      { color: 'rgba(232, 248, 241, 0.95)', positions: ['55%'] },
      { color: 'rgba(210, 242, 228, 0.92)', positions: ['100%'] },
    ],
  },
];

export default function DashboardCard({ label, count, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.accentBar} />
      <Text style={styles.count}>{count ?? '—'}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.action}>Manage →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(232, 248, 241, 0.95)',
    experimental_backgroundImage: cardGradient,
    borderColor: 'rgba(91, 233, 158, 0.25)',
    borderRadius: 13,
    borderWidth: 1,
    flexBasis: '44%',
    flexGrow: 1,
    minHeight: 82,
    overflow: 'hidden',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  accentBar: {
    backgroundColor: palette.accentLine,
    borderRadius: 2,
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  count: {
    color: '#0A7A45',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  label: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  action: {
    color: palette.secondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 'auto',
    paddingTop: 5,
  },
});
