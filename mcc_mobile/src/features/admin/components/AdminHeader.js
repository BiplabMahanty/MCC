import { Pressable, StyleSheet, Text, View } from 'react-native';

import colors from '../../../theme/colors';

export default function AdminHeader({
  title,
  subtitle,
  onBack,
  actionLabel,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={styles.backButton}
          >
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={styles.actionButton}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 34,
  },
  backButton: {
    paddingRight: 12,
    paddingVertical: 7,
  },
  backText: {
    color: colors.darkNeutral,
    fontSize: 14,
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  actionText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: colors.black,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
});
