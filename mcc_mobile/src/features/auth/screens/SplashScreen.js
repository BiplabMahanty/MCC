import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import Screen from '../../../components/common/Screen';
import colors from '../../../theme/colors';
import env from '../../../config/env';

export default function SplashScreen() {
  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.mark}>
          <Text style={styles.markText}>CSM</Text>
        </View>
        <Text style={styles.title}>{env.instituteName}</Text>
        <Text style={styles.subtitle}>Restoring your secure session…</Text>
        <ActivityIndicator color={colors.primary} size="small" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.black,
    borderRadius: 22,
    height: 76,
    justifyContent: 'center',
    marginBottom: 8,
    width: 76,
  },
  markText: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: '900',
  },
  title: {
    color: colors.black,
    fontSize: 22,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 14,
    marginBottom: 8,
  },
});
