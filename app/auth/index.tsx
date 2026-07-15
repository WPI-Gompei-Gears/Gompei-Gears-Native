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

      // 3. Open in the system browser
      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
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