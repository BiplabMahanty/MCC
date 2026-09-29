import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import AppButton from '../../../components/common/AppButton';
import Screen from '../../../components/common/Screen';
import useAuth from '../../../hooks/useAuth';
import colors from '../../../theme/colors';

export default function UnsupportedRoleScreen() {
  const { logout } = useAuth();

  return (
    <Screen>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.title}>Unsupported account role</Text>
        <Text style={styles.message}>
          This account cannot be routed safely. Contact your administrator to
          correct its role.
        </Text>
        <AppButton label="Sign out" onPress={logout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 18,
    justifyContent: 'center',
  },
  title: {
    color: colors.black,
    fontSize: 25,
    fontWeight: '900',
  },
  message: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
  },
});
