export { TeacherAssignmentsScreen, TeacherAssignmentFormScreen, TeacherAssignmentDetailScreen } from './TeacherAssignmentsScreen';

import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import colors from '../../../theme/colors';

function ScreenHeader({ title, subtitle, onBack }) {
  return (
    <View style={styles.header}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerTop}>
          <Pressable
            onPress={onBack}
            style={({ pressed, hovered }) => [
              styles.backButton,
              hovered && styles.backButtonHovered,
              pressed && styles.backButtonPressed,
            ]}
          >
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
          <View style={styles.headerBrand}>
            <Text style={styles.brandName}>{title}</Text>
            {subtitle && <Text style={styles.brandSub}>{subtitle}</Text>}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

export function TeacherMaterialsScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ScreenHeader
        title="Study Materials"
        subtitle="Upload and manage materials"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>Materials Coming Soon</Text>
          <Text style={styles.emptyText}>
            Upload study materials for your students. This feature will be available soon.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.dashBg },
  header: { backgroundColor: colors.dashGreen, paddingBottom: 20 },
  headerSafe: { paddingHorizontal: 18 },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 10,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  backButtonHovered: { backgroundColor: 'rgba(255,255,255,0.14)' },
  backButtonPressed: {
    backgroundColor: 'rgba(255,255,255,0.24)',
    transform: [{ scale: 0.95 }],
  },
  backIcon: { fontSize: 21, color: '#fff', fontWeight: '700' },
  headerBrand: { flex: 1 },
  brandName: { color: '#fff', fontSize: 18, fontWeight: '800' },
  brandSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: colors.dashCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dashBorder,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.dashText,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.dashSubText,
    textAlign: 'center',
    lineHeight: 20,
  },
});
