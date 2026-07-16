import { StyleSheet } from 'react-native';

import { Fonts } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { AnimatePresence, Avatar, Button, Form, Input, ScrollView, SizableText, Spacer, Spinner, YStack } from 'tamagui';
import FormInput from '@/components/forminput';
import * as WebBrowser from 'expo-web-browser';
import {makeRedirectUri} from 'expo-auth-session';
import { useSession } from '@/contexts/session';
import { BriefcaseConveyorBelt, PanelBottomClose } from '@tamagui/lucide-icons-2';
import { router } from 'expo-router';
import NativeButton from '@/components/button/button';

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
  const { session } = useSession()
  const user = session?.user
  const [preferredName, setPreferredName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')

  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user) return

    supabase
      .from('profiles')
      .select('preferred_name, phone_number')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setPreferredName(data?.preferred_name ?? '')
        setPhoneNumber(data?.phone_number ?? '')
      })
  }, [user])

  async function saveProfile() {
    console.log("Saving...")
    if (!user) return

    setSubmitting(true);

    await supabase
      .from('profiles')
      .update({ preferred_name: preferredName, phone_number: phoneNumber })
      .eq('id', user.id)

    setSubmitting(false);
  }

  return (
    <YStack items="center" gap={"$4"} mt="$6">
      <Avatar circular size="$6">
        <Avatar.Image src="http://picsum.photos/200/300" />
        <Avatar.Fallback />
      </Avatar>
      <SizableText size={"$8"}>Your Account</SizableText>
      {/* <Spacer></Spacer> */}
      {user ? (
        <>
          <Form gap={"$4"} onSubmit={() => saveProfile()}>
            <FormInput title="Name" value={user?.user_metadata?.full_name} disabled/>
            <FormInput title="Email" value={user?.email} disabled/>
            <FormInput title="Preferred Name" value={preferredName} onChangeText={setPreferredName}/>
            <FormInput title="Phone Number" value={phoneNumber} onChangeText={setPhoneNumber}/>
            <Form.Trigger asChild>
              <Button mx="5%">
                Save
                <AnimatePresence>
                  {submitting ? (
                    <Spinner
                      transition="bouncy"
                      enterStyle={{ opacity: 0 }}
                      alignSelf="center"
                      key="spinner"
                      color={"white"}
                      ml="$2"
                      width={8}
                    />
                  ) : null}
                </AnimatePresence>
              </Button>
            </Form.Trigger>
          </Form>
          <Button onPress={() => supabase.auth.signOut()}>Log Out</Button>
        </>
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
