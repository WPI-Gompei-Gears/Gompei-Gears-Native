import { StyleSheet } from 'react-native';

import TitleBar from '@/components/titlebar';
import { supabase } from '@/lib/supabase';
import { useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, ListItem, ScrollView, SizableText, Spinner, View, XStack, YStack } from 'tamagui';
import { ChevronRight, Search } from '@tamagui/lucide-icons-2';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { router } from 'expo-router';

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
};

export default function AdminUsers() {
  const insets = useSafeAreaInsets()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getUsers()
  }, [])

  async function getUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email')
      .order('name', { ascending: true })
    setProfiles(data || [])
    setLoading(false)
  }

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return profiles

    return profiles.filter((profile) => {
      const name = profile.name?.toLowerCase() ?? ''
      const email = profile.email?.toLowerCase() ?? ''
      return name.includes(query) || email.includes(query)
    })
  }, [profiles, search])

  function openProfile(profile: Profile) {
    if (!profile.email) return
    const username = profile.email.split('@')[0]
    router.push(`/admin/users/${username}`)
  }

  const userList = filteredProfiles.map((profile) => (
    <YStack key={profile.id}>
      <ListItem
        title={profile.name || 'Unnamed User'}
        subTitle={profile.email ?? undefined}
        iconAfter={ChevronRight}
        onPress={() => openProfile(profile)}
        disabled={!profile.email}
        pressStyle={{ opacity: 0.6 }}
      />
      <View width={"100%"} bg={"$white3"} height={1} alignItems={"flex-end"}>
        <View bg={"lightgray"} width={"70%"} height={"100%"} marginEnd={"$4"}/>
      </View>
    </YStack>
  ))

  return (
    <YStack style={styles.container} mt={insets.top} mb={insets.bottom + 60} gap={"$4"}>
      <TitleBar title='Users' returnLink={"/(public)"}></TitleBar>
      <View
        width="100%"
        borderRadius={16}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View position="relative" width="100%" borderRadius={16} overflow="hidden">
          <GlassView
            isInteractive
            style={[
              StyleSheet.absoluteFillObject,
              isLiquidGlassAvailable() ? null : { backgroundColor: "rgb(228, 228, 228)" },
            ]}
          />
          <XStack alignItems='center' gap={"$2"} paddingHorizontal={14} paddingVertical={12}>
            <Search size={18} opacity={0.6}/>
            <Input
              unstyled
              backgroundColor="transparent"
              borderWidth={0}
              placeholder='Search users...'
              flex={1}
              value={search}
              onChangeText={setSearch}
              color="$color"
              fontSize={"$4"}
            />
          </XStack>
        </View>
      </View>

      <ScrollView flex={1} m={"$2"} borderRadius={"$8"} backgroundColor={"$white3"} height={5} width={"100%"}>
        {loading ? (
          <YStack items="center" py="$6"><Spinner/></YStack>
        ) : filteredProfiles.length === 0 ? (
          <YStack items="center" py="$6"><SizableText opacity={0.6}>No users found</SizableText></YStack>
        ) : (
          userList
        )}
      </ScrollView>
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
});
