import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

export default function PortalHeader({ title, subtitle, onBack }) {
  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          onPress={onBack}
          style={styles.back}
        >
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  back: { alignSelf: 'flex-start', paddingBottom: 5, paddingRight: 12 },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  title: {
    color: colors.black,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: { color: colors.mutedText, fontSize: 14, lineHeight: 20 },
});
