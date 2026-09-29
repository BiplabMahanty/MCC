import { StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';
import AppButton from './AppButton';

export default function ErrorState({ message, onRetry, retrying = false }) {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>!</Text>
      </View>
      <Text style={styles.title}>Backend unavailable</Text>
      <Text style={styles.message}>{message}</Text>
      <AppButton
        disabled={retrying}
        label={retrying ? 'Checking…' : 'Try again'}
        onPress={onRetry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 24,
  },
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.errorSurface,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  badgeText: {
    color: colors.error,
    fontSize: 26,
    fontWeight: '800',
  },
  title: {
    color: colors.black,
    fontSize: 22,
    fontWeight: '800',
  },
  message: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
});
