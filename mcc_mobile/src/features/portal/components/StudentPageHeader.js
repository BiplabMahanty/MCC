import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import colors from '../../../theme/colors';

export default function StudentPageHeader({ title, subtitle, onBack }) {
  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <SafeAreaView edges={['top']} style={styles.safe}>
          {onBack ? (
            <Pressable onPress={onBack} style={styles.backRow}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
          ) : null}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </SafeAreaView>
        <View style={styles.waveBump} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.dashGreen,
    paddingBottom: 20,
  },
  safe: { paddingHorizontal: 18, paddingTop: 8, gap: 4 },
  backRow: { alignSelf: 'flex-start', marginBottom: 6 },
  backText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '700' },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: -0.3 },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 },
  waveBump: {
    position: 'absolute',
    bottom: -18,
    right: -28,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
