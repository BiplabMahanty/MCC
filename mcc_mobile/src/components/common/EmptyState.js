import { StyleSheet, Text, View } from 'react-native';

import colors from '../../theme/colors';

export default function EmptyState({ title = 'Nothing here yet', message }) {
  return (
    <View style={styles.container}>
      <View style={styles.mark} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  mark: {
    backgroundColor: colors.primary,
    borderRadius: 4,
    height: 8,
    marginBottom: 6,
    width: 36,
  },
  title: {
    color: colors.black,
    fontSize: 18,
    fontWeight: '800',
  },
  message: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
