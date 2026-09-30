import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AuthBackground from '../components/AuthBackground';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import env from '../../../config/env';

const palette = {
  mint: '#5BE99E',
  white: '#F9FBFA',
  secondary: '#C3D3D0',
  link: '#4CEFA4',
};

function GraduationCap() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={styles.cap}
    >
      <View style={styles.capTop} />
      <View style={styles.capBand} />
      <View style={styles.tasselStem} />
      <View style={styles.tassel} />
    </View>
  );
}

export default function AdminWelcomeScreen({ navigation }) {
  function showContactInformation() {
    // TODO: Replace this notice when a support destination is available.
    Alert.alert(
      'Contact Support',
      'A support contact has not been configured yet.',
    );
  }

  return (
    <AuthBackground>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safeArea}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandArea}>
            <GraduationCap />
            <Text style={styles.title}>{env.instituteName.replace(' ', '\n')}</Text>
            <Text style={styles.tagline}>Learn · Grow · Succeed</Text>
          </View>

          <View style={styles.welcomeMessage}>
            <View style={styles.accentLine} />
            <Text style={styles.messageTitle}>Ready when you are.</Text>
            <Text style={styles.messageBody}>
              Sign in to continue your journey with us.
            </Text>
          </View>

          <View style={styles.actions}>
            <AuthPrimaryButton
              label="Login"
              onPress={() => navigation.navigate('SignIn')}
            />
            <Pressable
              accessibilityRole="button"
              hitSlop={12}
              onPress={showContactInformation}
              style={({ pressed }) => pressed && styles.linkPressed}
            >
              <Text style={styles.contactLink}>Need help? Contact Support</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingBottom: 28,
    paddingHorizontal: 23,
    paddingTop: 20,
  },
  brandArea: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 32,
    paddingTop: 16,
  },
  cap: {
    height: 72,
    marginBottom: 20,
    position: 'relative',
    width: 88,
  },
  capTop: {
    backgroundColor: palette.mint,
    borderRadius: 4,
    height: 47,
    left: 21,
    position: 'absolute',
    top: 0,
    transform: [{ rotate: '45deg' }, { scaleY: 0.56 }],
    width: 47,
  },
  capBand: {
    backgroundColor: palette.mint,
    borderBottomLeftRadius: 19,
    borderBottomRightRadius: 19,
    height: 19,
    left: 23,
    position: 'absolute',
    top: 38,
    width: 43,
  },
  tasselStem: {
    backgroundColor: palette.mint,
    borderRadius: 2,
    height: 30,
    position: 'absolute',
    right: 11,
    top: 25,
    transform: [{ rotate: '-8deg' }],
    width: 3,
  },
  tassel: {
    backgroundColor: palette.mint,
    borderRadius: 5,
    height: 9,
    position: 'absolute',
    right: 9,
    top: 52,
    width: 7,
  },
  title: {
    color: palette.white,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -0.7,
    lineHeight: 37,
    textAlign: 'center',
  },
  tagline: {
    color: palette.secondary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1.3,
    marginTop: 10,
    textAlign: 'center',
  },
  welcomeMessage: {
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 34,
    maxWidth: 310,
  },
  accentLine: {
    backgroundColor: palette.mint,
    borderRadius: 2,
    height: 3,
    marginBottom: 18,
    opacity: 0.85,
    width: 32,
  },
  messageTitle: {
    color: palette.white,
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.4,
    textAlign: 'center',
  },
  messageBody: {
    color: palette.secondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
    gap: 20,
  },
  linkPressed: {
    opacity: 0.65,
  },
  contactLink: {
    color: palette.link,
    fontSize: 14,
    fontWeight: '600',
  },
});
