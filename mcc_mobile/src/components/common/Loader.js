import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';

export default function Loader({ message = 'Checking backend services…' }) {
  return (
    <View accessibilityRole="progressbar" style={styles.container}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 32,
  },
  message: {
    color: colors.mutedText,
    fontSize: 15,
  },
});
