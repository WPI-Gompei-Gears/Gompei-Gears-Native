import { StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import NativeButton from '@/components/button/button';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Avatar, Button, Form, Input, ScrollView, SizableText, Spacer, YStack } from 'tamagui';
import FormInput from '@/components/forminput';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from "expo-auth-session/build/QueryParams";
import {makeRedirectUri} from 'expo-auth-session';

const redirectTo = makeRedirectUri();

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

export default function TabTwoScreen() {
  const [user, setUser] = useState<User>()

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

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
          <Form gap={"$4"}>
            <FormInput title="Name" value={user?.user_metadata?.name} disabled/>
            <FormInput title="Email" value={user?.email} disabled/>
            <FormInput title="Preferred Name"/>
            <FormInput title="Phone Number"/>
            <Form.Trigger asChild>
              <Button width={"50%"} ml={"25%"}>Save</Button>
            </Form.Trigger>
          </Form>
        ) : process.env.EXPO_PUBLIC_IS_DEVELOPMENT_ENV == "true" ? (
            <>
              <Button>Login as User</Button>
              <Button>Login as Admin</Button>
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
