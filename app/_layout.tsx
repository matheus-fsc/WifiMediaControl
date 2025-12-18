import { Stack } from 'expo-router';
import { LocalizationProvider } from './_contexts/LocalizationContext';

export default function Layout() {
  return (
    <LocalizationProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </LocalizationProvider>
  );
}