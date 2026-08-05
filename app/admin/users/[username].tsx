import TitleBar from '@/components/titlebar';
import { supabase } from '@/lib/supabase';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SizableText, YStack } from 'tamagui';

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  preferred_name: string | null;
  phone_number: string | null;
  created_at: string | null;
};

function formatSignUpDate(value: string | null) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <YStack gap="$1">
      <SizableText size="$2" opacity={0.6} textTransform="uppercase" letterSpacing={1}>{label}</SizableText>
      <SizableText size="$5">{value}</SizableText>
    </YStack>
  );
}

export default function AdminUserDetail() {
  const insets = useSafeAreaInsets()
  const { username } = useLocalSearchParams<{ username: string }>()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) fetchProfile()
  }, [username])

  async function fetchProfile() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, name, email, preferred_name, phone_number, created_at')
      .eq('email', `${username}@wpi.edu`)
      .maybeSingle()
    setProfile(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <YStack style={styles.container} mt={15} mb={insets.bottom + 20} gap={"$6"} px="$4">
      <TitleBar title={profile?.name || 'User'} returnLink={"/admin/users"} dismissTo></TitleBar>

      {profile ? (
        <YStack gap="$4">
          <DetailRow label="Email" value={profile.email || '—'} />
          <DetailRow label="Preferred Name" value={profile.preferred_name || '—'} />
          <DetailRow label="Phone Number" value={profile.phone_number || '—'} />
          <DetailRow label="Signed Up" value={formatSignUpDate(profile.created_at)} />
        </YStack>
      ) : (
        <SizableText opacity={0.6}>User not found</SizableText>
      )}
    </YStack>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'stretch' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
