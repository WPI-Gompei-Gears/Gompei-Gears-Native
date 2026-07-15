import { StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Avatar, Button, Form, Input, ScrollView, SizableText, Spacer, YStack } from 'tamagui';
import FormInput from '@/components/forminput';
import * as WebBrowser from 'expo-web-browser';
import {makeRedirectUri} from 'expo-auth-session';

const redirectTo = makeRedirectUri({ path: '/modal/account' });

// Required on web: closes the auth popup once it lands back on this page.
// No-op on native, so it's safe to call unconditionally.
WebBrowser.maybeCompleteAuthSession();

async function signInWithAzure() {
  // Final landing spot back in the app once Supabase finishes processing
  // the Azure callback (Azure itself redirects to MyURL/auth, which
  // forwards to Supabase's /auth/v1/callback, which then redirects here).

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      scopes: 'email profile',
      redirectTo,
      skipBrowserRedirect: true,
    },
  })
  if (error || !data?.url) return;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return;

  const fragment = result.url.split('#')[1] ?? '';
  const params = new URLSearchParams(fragment);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    await supabase.auth.setSession({ access_token, refresh_token });
  }
}

async function signInAsDevAccount(role: 'user' | 'admin') {
  const email = role === 'admin'
    ? process.env.EXPO_PUBLIC_DEV_ADMIN_EMAIL
    : process.env.EXPO_PUBLIC_DEV_USER_EMAIL;
  const password = role === 'admin'
    ? process.env.EXPO_PUBLIC_DEV_ADMIN_PASSWORD
    : process.env.EXPO_PUBLIC_DEV_USER_PASSWORD;
  if (!email || !password) return;

  await supabase.auth.signInWithPassword({ email, password });
}

export default function TabTwoScreen() {
  const [user, setUser] = useState<User>()
  const [preferredName, setPreferredName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    supabase
      .from('profiles')
      .select('preferred_name, phone_number, is_admin')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setPreferredName(data?.preferred_name ?? '')
        setPhoneNumber(data?.phone_number ?? '')
        setIsAdmin(data?.is_admin ?? false)
      })
  }, [user])

  async function saveProfile() {
    if (!user) return

    await supabase
      .from('profiles')
      .update({ preferred_name: preferredName, phone_number: phoneNumber })
      .eq('id', user.id)
  }

  return (
    <ScrollView flex={1} p="$5">
      <YStack items="center" gap={"$4"}>
        <Avatar circular size="$6">
          <Avatar.Image src="http://picsum.photos/200/300" />
          <Avatar.Fallback />
        </Avatar>
        <SizableText size={"$8"}>Your Account</SizableText>
        {/* <Spacer></Spacer> */}
        {user ? (
          <Form gap={"$4"} onSubmit={saveProfile}>
            <FormInput title="Name" value={user?.user_metadata?.name} disabled/>
            <FormInput title="Email" value={user?.email} disabled/>
            <FormInput title="Preferred Name" value={preferredName} onChangeText={setPreferredName}/>
            <FormInput title="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber}/>
            <Form.Trigger asChild>
              <Button width={"50%"} ml={"25%"}>Save</Button>
            </Form.Trigger>
          </Form>
        ) : process.env.EXPO_PUBLIC_IS_DEVELOPMENT_ENV == "true" ? (
            <>
              <Button onPress={() => signInAsDevAccount('user')}>Login as User</Button>
              <Button onPress={() => signInAsDevAccount('admin')}>Login as Admin</Button>
            </>
          ) : (
            <Button onPress={signInWithAzure}>Login</Button>
          )
        }
      </YStack>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    gap: 8,
  },
});
