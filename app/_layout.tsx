import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider, View } from '@tamagui/core'
import config from './tamagui.config' // your configuration

import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '@/contexts/session';
import { Text } from 'tamagui';
import NativeButton from '@/components/button/button';
import { ArrowLeft, ArrowLeftCircle, PanelBottomClose } from '@tamagui/lucide-icons-2';

function RootNavigator() {
  const { isAdmin, isLoading } = useSession();
  const segments = useSegments();

  // If we're resolving a direct load of (or refresh on) an admin route,
  // hold off rendering until we actually know isAdmin — otherwise the
  // navigator excludes "admin" from its screens while loading and
  // immediately (and irreversibly) redirects away before the fetch
  // finishing could make it available. Other routes render immediately
  // regardless of loading state.
  if (isLoading && segments[0] === 'admin') {
    return <View bg="white"></View>;
  }

  if(!isAdmin && segments[0] === 'admin') {
    return (<Redirect href="/"/>)
  }

  const closeButton = (
    <NativeButton link={"/"} iconElement={<ArrowLeft/>} title='Back' w={100} style={{margin: 10}}/>
  )

  return (
    <Stack>
      <Stack.Screen name="(public)" options={{ headerShown: false }} />
      <Stack.Protected guard={!isLoading && isAdmin}>
        <Stack.Screen name="admin" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal'}}/>
      <Stack.Screen name="bike/[id]" options={{ presentation: 'modal', headerShown: false }} />
      <Stack.Screen name="rent/[id]" options={{ title: 'Rent Bike', headerLeft: () => closeButton }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config} defaultTheme="light">
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
        <StatusBar style="auto" animated />
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
