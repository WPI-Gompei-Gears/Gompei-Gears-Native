import { Stack } from 'expo-router';

export default function PublicModalLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="account" options={{ title: 'Account' }} />
    </Stack>
  );
}
