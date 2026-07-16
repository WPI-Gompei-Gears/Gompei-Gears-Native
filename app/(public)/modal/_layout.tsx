import NativeButton from '@/components/button/button';
import { Home, PanelBottomClose } from '@tamagui/lucide-icons-2';
import { router, Stack } from 'expo-router';
import { Text } from 'tamagui';

export default function PublicModalLayout() {
  const closeButton = (
    <NativeButton webOnly style={{ margin: 20 }} link={"/"} iconElement={<Home/>}/>
  )

  return (
    <Stack screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen name="account" options={{ title: 'Account', headerRight: () => closeButton }} />
    </Stack>
  );
}
