import { useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAuth from '../../../hooks/useAuth';
import AuthBackground from '../components/AuthBackground';
import AuthPrimaryButton from '../components/AuthPrimaryButton';
import env from '../../../config/env';

const colors = {
  mint: '#5BE99E',
  text: '#F9FBFA',
  secondaryText: '#C3D3D0',
  input: '#FAFCFC',
  inputLabel: '#526B79',
  placeholder: '#8297AA',
  iconTile: '#D2F8E4',
  link: '#4CEFA4',
  error: '#A91224',
};

function validate(email, password) {
  const nextErrors = {};
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    nextErrors.email = 'Email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    nextErrors.email = 'Enter a valid email address.';
  }

  if (!password) {
    nextErrors.password = 'Password is required.';
  }

  return nextErrors;
}

function GraduationCapIcon() {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={styles.cap}
    >
      <View style={styles.capTop} />
      <View style={styles.capBand} />
      <View style={styles.capTasselLine} />
      <View style={styles.capTasselEnd} />
    </View>
  );
}

function BackChevron() {
  return <View style={styles.backChevron} />;
}

function EnvelopeIcon() {
  return (
    <View style={styles.envelope}>
      <View style={[styles.envelopeFold, styles.envelopeFoldLeft]} />
      <View style={[styles.envelopeFold, styles.envelopeFoldRight]} />
    </View>
  );
}

function LockIcon() {
  return (
    <View style={styles.lockIcon}>
      <View style={styles.lockShackle} />
      <View style={styles.lockBody} />
    </View>
  );
}

function EyeIcon({ hidden }) {
  return (
    <View style={styles.eyeIcon}>
      <View style={styles.eyePupil} />
      {hidden ? <View style={styles.eyeSlash} /> : null}
    </View>
  );
}

function ShieldIcon() {
  return (
    <View style={styles.shieldIcon}>
      <View style={styles.shieldCheckLeft} />
      <View style={styles.shieldCheckRight} />
    </View>
  );
}

function FieldIcon({ type }) {
  return (
    <View style={styles.iconTile}>
      {type === 'email' ? <EnvelopeIcon /> : <LockIcon />}
    </View>
  );
}

function FormField({
  error,
  icon,
  inputRef,
  label,
  rightElement,
  ...inputProps
}) {
  return (
    <View>
      <View style={[styles.field, error && styles.fieldErrorBorder]}>
        <FieldIcon type={icon} />
        <View style={styles.fieldContent}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            placeholderTextColor={colors.placeholder}
            ref={inputRef}
            selectionColor="#06A963"
            style={styles.input}
            {...inputProps}
          />
        </View>
        {rightElement}
      </View>
      {error ? <Text style={styles.validationText}>{error}</Text> : null}
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const passwordInput = useRef(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [requestError, setRequestError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleEmailChange(value) {
    setEmail(value);
    if (errors.email) {
      setErrors((current) => ({ ...current, email: undefined }));
    }
  }

  function handlePasswordChange(value) {
    setPassword(value);
    if (errors.password) {
      setErrors((current) => ({ ...current, password: undefined }));
    }
  }

  function showPasswordHelp() {
    // TODO: Replace this notice when a password-recovery destination is available.
    Alert.alert(
      'Password help',
      'Password recovery is not available yet. Please contact support for help.',
    );
  }

  function showContactSupport() {
    // TODO: Replace this notice when a support destination is available.
    Alert.alert(
      'Contact Support',
      'A support contact has not been configured yet.',
    );
  }

  async function handleLogin() {
    const nextErrors = validate(email, password);
    setErrors(nextErrors);
    setRequestError('');

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      await login({ email: email.trim().toLowerCase(), password });
    } catch (error) {
      setRequestError(error.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthBackground>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safeArea}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={6}
              onPress={navigation.goBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.controlPressed,
              ]}
            >
              <BackChevron />
            </Pressable>

            <View style={styles.brand}>
              <GraduationCapIcon />
              <Text style={styles.brandName}>
                {env.instituteName.replace(' ', '\n')}
              </Text>
              <Text style={styles.tagline}>Learn · Grow · Succeed</Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.heading}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>

              <View style={styles.fields}>
                <FormField
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  icon="email"
                  inputMode="email"
                  label="Email address"
                  onChangeText={handleEmailChange}
                  onSubmitEditing={() => passwordInput.current?.focus()}
                  placeholder="Enter your email"
                  returnKeyType="next"
                  textContentType="emailAddress"
                  value={email}
                />
                <FormField
                  autoCapitalize="none"
                  autoComplete="current-password"
                  error={errors.password}
                  icon="password"
                  inputRef={passwordInput}
                  label="Password"
                  onChangeText={handlePasswordChange}
                  onSubmitEditing={handleLogin}
                  placeholder="Enter your password"
                  returnKeyType="done"
                  rightElement={
                    <Pressable
                      accessibilityLabel={
                        passwordVisible ? 'Hide password' : 'Show password'
                      }
                      accessibilityRole="button"
                      hitSlop={8}
                      onPress={() =>
                        setPasswordVisible((currentValue) => !currentValue)
                      }
                      style={({ pressed }) => [
                        styles.eyeButton,
                        pressed && styles.controlPressed,
                      ]}
                    >
                      <EyeIcon hidden={!passwordVisible} />
                    </Pressable>
                  }
                  secureTextEntry={!passwordVisible}
                  textContentType="password"
                  value={password}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={showPasswordHelp}
                style={({ pressed }) => [
                  styles.forgotButton,
                  pressed && styles.controlPressed,
                ]}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              {requestError ? (
                <View accessibilityRole="alert" style={styles.requestError}>
                  <Text style={styles.requestErrorText}>{requestError}</Text>
                </View>
              ) : null}

              <AuthPrimaryButton
                label="Sign In"
                loading={submitting}
                onPress={handleLogin}
                style={styles.signInButton}
              />

              <View style={styles.securityRow}>
                <ShieldIcon />
                <Text style={styles.securityText}>
                  Your information is secure and encrypted
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Need help? </Text>
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={showContactSupport}
                style={({ pressed }) => pressed && styles.controlPressed}
              >
                <Text style={styles.footerLink}>Contact Support</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
    paddingHorizontal: 23,
    paddingTop: 2,
  },
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginLeft: -10,
    width: 44,
  },
  backChevron: {
    borderBottomColor: colors.text,
    borderBottomWidth: 2.4,
    borderLeftColor: colors.text,
    borderLeftWidth: 2.4,
    height: 13,
    transform: [{ rotate: '45deg' }],
    width: 13,
  },
  brand: {
    alignItems: 'center',
    marginTop: 2,
  },
  cap: {
    height: 64,
    marginBottom: 12,
    position: 'relative',
    width: 82,
  },
  capTop: {
    backgroundColor: colors.mint,
    borderRadius: 4,
    height: 46,
    left: 18,
    position: 'absolute',
    top: -1,
    transform: [{ rotate: '45deg' }, { scaleY: 0.52 }],
    width: 46,
  },
  capBand: {
    backgroundColor: colors.mint,
    borderBottomLeftRadius: 19,
    borderBottomRightRadius: 19,
    height: 18,
    left: 20,
    position: 'absolute',
    top: 36,
    width: 42,
  },
  capTasselLine: {
    backgroundColor: colors.mint,
    borderRadius: 2,
    height: 29,
    position: 'absolute',
    right: 8,
    top: 22,
    transform: [{ rotate: '-8deg' }],
    width: 3,
  },
  capTasselEnd: {
    backgroundColor: colors.mint,
    borderRadius: 5,
    height: 9,
    position: 'absolute',
    right: 6,
    top: 48,
    width: 7,
  },
  brandName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 31,
    textAlign: 'center',
  },
  tagline: {
    color: colors.secondaryText,
    fontSize: 14,
    letterSpacing: 1.3,
    marginTop: 7,
    textAlign: 'center',
  },
  formSection: {
    marginTop: 30,
  },
  heading: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.65,
    lineHeight: 36,
  },
  subtitle: {
    color: colors.secondaryText,
    fontSize: 17,
    lineHeight: 23,
    marginTop: 3,
  },
  fields: {
    gap: 16,
    marginTop: 21,
  },
  field: {
    alignItems: 'center',
    backgroundColor: colors.input,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 80,
    paddingHorizontal: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
  },
  fieldErrorBorder: {
    borderColor: '#DF5363',
    borderWidth: 1.4,
  },
  iconTile: {
    alignItems: 'center',
    backgroundColor: colors.iconTile,
    borderRadius: 9,
    height: 34,
    justifyContent: 'center',
    marginRight: 13,
    width: 34,
  },
  envelope: {
    borderColor: colors.inputLabel,
    borderRadius: 2,
    borderWidth: 1.8,
    height: 13,
    overflow: 'hidden',
    position: 'relative',
    width: 18,
  },
  envelopeFold: {
    backgroundColor: colors.inputLabel,
    height: 1.6,
    position: 'absolute',
    top: 3,
    width: 12,
  },
  envelopeFoldLeft: {
    left: -1,
    transform: [{ rotate: '34deg' }],
  },
  envelopeFoldRight: {
    right: -1,
    transform: [{ rotate: '-34deg' }],
  },
  lockIcon: {
    height: 19,
    position: 'relative',
    width: 17,
  },
  lockShackle: {
    borderColor: colors.inputLabel,
    borderRadius: 6,
    borderWidth: 1.8,
    height: 11,
    left: 3,
    position: 'absolute',
    top: 0,
    width: 11,
  },
  lockBody: {
    backgroundColor: colors.inputLabel,
    borderRadius: 3,
    bottom: 0,
    height: 11,
    left: 0,
    position: 'absolute',
    width: 17,
  },
  fieldContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fieldLabel: {
    color: colors.inputLabel,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  input: {
    color: '#18342C',
    fontSize: 16,
    height: 33,
    padding: 0,
    paddingRight: 7,
  },
  eyeButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginRight: -6,
    width: 44,
  },
  eyeIcon: {
    alignItems: 'center',
    borderColor: colors.inputLabel,
    borderRadius: 10,
    borderWidth: 1.7,
    height: 13,
    justifyContent: 'center',
    position: 'relative',
    transform: [{ rotate: '-7deg' }],
    width: 20,
  },
  eyePupil: {
    backgroundColor: colors.inputLabel,
    borderRadius: 3,
    height: 5,
    width: 5,
  },
  eyeSlash: {
    backgroundColor: colors.inputLabel,
    height: 1.8,
    position: 'absolute',
    transform: [{ rotate: '48deg' }],
    width: 24,
  },
  validationText: {
    color: '#FFB9C0',
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 4,
    marginTop: 5,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 13,
  },
  forgotText: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '700',
  },
  requestError: {
    backgroundColor: 'rgba(169, 18, 36, 0.24)',
    borderColor: 'rgba(255, 185, 192, 0.4)',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    padding: 11,
  },
  requestErrorText: {
    color: '#FFD4D8',
    fontSize: 13,
    lineHeight: 18,
  },
  signInButton: {
    marginTop: 23,
  },
  securityRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 17,
  },
  shieldIcon: {
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
    borderColor: colors.secondaryText,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1.4,
    height: 16,
    marginRight: 7,
    position: 'relative',
    width: 14,
  },
  shieldCheckLeft: {
    backgroundColor: colors.secondaryText,
    height: 1.4,
    left: 2.5,
    position: 'absolute',
    top: 7,
    transform: [{ rotate: '45deg' }],
    width: 4,
  },
  shieldCheckRight: {
    backgroundColor: colors.secondaryText,
    height: 1.4,
    left: 5,
    position: 'absolute',
    top: 6.5,
    transform: [{ rotate: '-48deg' }],
    width: 6,
  },
  securityText: {
    color: colors.secondaryText,
    fontSize: 11.5,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 62,
    paddingTop: 25,
  },
  footerText: {
    color: colors.secondaryText,
    fontSize: 14,
  },
  footerLink: {
    color: colors.link,
    fontSize: 14,
    fontWeight: '700',
  },
  controlPressed: { opacity: 0.6 },
});
