import { QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import queryClient from '../query/queryClient';
import colors from '../theme/colors';
import AuthProvider from './AuthProvider';
import ExamDraftProvider from '../features/exams/context/ExamDraftContext';

const navigationTheme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.lightNeutral,
    card: colors.white,
    text: colors.black,
    border: colors.border,
    notification: colors.primary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

export default function AppProviders({ children }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ExamDraftProvider>
            <NavigationContainer theme={navigationTheme}>
              {children}
            </NavigationContainer>
          </ExamDraftProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
