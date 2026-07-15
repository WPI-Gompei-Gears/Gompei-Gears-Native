import NativeButton from '@/components/button/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { supabase } from '@/lib/supabase';
import { Redirect } from 'expo-router';

async function signInWithAzure() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      scopes: 'email profile',
      redirectTo: `${window.location.origin}/modal/account`
    },
  })
}

export default function OAuth() {
  if(process.env.EXPO_PUBLIC_IS_DEVELOPMENT_ENV == "true") {
    return (
      <ThemedView>
        <ThemedText type="title">Choose Development Login Type:</ThemedText>
        <NativeButton link="/(public)" title="Admin" w={300} h={60}></NativeButton>
        <NativeButton link="/(public)" title="User" w={300} h={60}></NativeButton>
      </ThemedView>
    )
  } else {
    signInWithAzure()
    return <Redirect href="/(public)/modal/account"></Redirect>
  }
}