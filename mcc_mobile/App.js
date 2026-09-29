import RootNavigator from './src/navigation/RootNavigator';
import AppProviders from './src/providers/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
