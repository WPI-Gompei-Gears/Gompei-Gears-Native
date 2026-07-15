import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Button, Linking, View } from 'react-native';

export default function rerouteoAuth() {
  // 1. Grab all existing parameters from the current URL
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleRedirect = async () => {
      const externalUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/callback`;

      // 2. Append parameters to the external URL
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else if (value !== undefined) {
          searchParams.append(key, value);
        }
      }
      const targetUrl = `${externalUrl}?${searchParams.toString()}`;

      console.log(targetUrl);

      // 3. Continue the OAuth flow in the same browser tab/popup.
      // This page only ever loads inside a real browser context (Azure's
      // redirect_uri is an https URL, not a native deep link), so `window`
      // is always available here. Linking.openURL defaults to `target:
      // '_blank'` on web, which would open a *new* window instead of
      // navigating this one — breaking WebBrowser.openAuthSessionAsync's
      // ability to detect completion.
      if (typeof window !== 'undefined') {
        window.location.replace(targetUrl);
      } else {
        const supported = await Linking.canOpenURL(targetUrl);
        if (supported) {
          await Linking.openURL(targetUrl);
        }
      }
    };

    handleRedirect();
  }, [params]);

  return (
    <View>
      <Button title="Forward All Params" />
    </View>
  );
}