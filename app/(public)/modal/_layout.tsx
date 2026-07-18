import NativeButton from '@/components/button/button';
import { ChevronLeft, Home, PanelBottomClose } from '@tamagui/lucide-icons-2';
import { router, Stack } from 'expo-router';
import { Platform } from 'react-native';
import { Text } from 'tamagui';

export default function PublicModalLayout() {
  const closeButton = (
    <NativeButton webOnly style={{ margin: 15 }} p={7.5} link={"/"} iconElement={<ChevronLeft mt={2}/>}/>
  )

  return (
    <Stack screenOptions={{ presentation: 'modal' }}>
      {Platform.OS == "web" ? 
        <Stack.Screen name="account" options={{ title: 'Account', headerLeft: () => closeButton, headerTitleAlign: 'center' }} /> :
        <Stack.Screen name="account" options={{ title: 'Account', headerTitleAlign: 'center' }} />}
    </Stack>
  );
}
