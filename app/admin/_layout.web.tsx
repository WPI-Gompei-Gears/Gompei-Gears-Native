import { Link, Slot, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Separator, SizableText, XStack, YStack } from 'tamagui';
import {
  AlertOctagon,
  Home,
  MessageSquare,
  ShipWheel,
  Users,
  Wrench,
} from '@tamagui/lucide-icons-2';

const NAV_ITEMS = [
  { href: '/admin', label: 'Rides', icon: ShipWheel },
  { href: '/admin/assets', label: 'Assets', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: AlertOctagon },
  { href: '/admin/messaging', label: 'Messaging', icon: MessageSquare },
  { href: '/admin/fleet', label: 'Fleet', icon: Wrench },
] as const;

export default function AdminLayoutWeb() {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  return (
    <XStack flex={1}>
      <YStack
        width={220}
        gap="$1"
        px={10}
        pt={insets.top + 20}
        pb={insets.bottom + 10}
        borderRightWidth={1}
        borderRightColor="$borderColor"
        background="$background"
      >
        <SizableText size="$6" fontWeight="700" px={12} mb={15}>
          Gompei's Gears Admin
        </SizableText>

        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

          return (
            <Link key={href} href={href} asChild>
              <XStack
                items="center"
                gap="$3"
                py={10}
                px={12}
                borderStartEndRadius={12}
                borderRadius={12}
                background={active ? '$red4' : 'transparent'}
                hoverStyle={{ background: '$red3', cursor: 'pointer' }}
              >
                <Icon size={20} color={active ? '$red10' : '$color'} />
                <SizableText color={active ? '$red10' : '$color'} fontWeight={active ? '700' : '400'}>
                  {label}
                </SizableText>
              </XStack>
            </Link>
          );
        })}

        <Separator my={10} />
      </YStack>

      <YStack flex={1}>
        <Slot />
      </YStack>
    </XStack>
  );
}
