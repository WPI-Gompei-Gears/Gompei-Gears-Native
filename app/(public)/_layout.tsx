import { Stack } from 'expo-router';

export default function PublicLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="index" options={{ presentation: 'card', headerShown: false }} />
      <Stack.Screen name="modal" options={{ headerShown: false }} />
      <Stack.Screen
        name="qrcode"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.57, 0.74],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          sheetLargestUndimmedDetentIndex: 'none',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
