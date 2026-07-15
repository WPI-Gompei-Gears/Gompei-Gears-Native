import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { TamaguiProvider, View } from '@tamagui/core'
import config from './tamagui.config' // your configuration

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <Stack>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="bike/[id]" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" animated />
    </TamaguiProvider>
  );
}
