import { router, useLocalSearchParams } from 'expo-router';
import { Button, Linking, View } from 'react-native';

export default function rerouteoAuth() {
  // 1. Grab all existing parameters from the current URL
  const params = useLocalSearchParams();

  const handleRedirect = async () => {
    const externalUrl = `${process.env.EXPO_PUBLIC_GMAPS_API_KEY}/auth/v1/callback`;

    // 2. Append parameters to the external URL
    const queryString = params.toString();
    const targetUrl = `${externalUrl}?${queryString}`;

    console.log(targetUrl);

    // 3. Open in the system browser
    const supported = await Linking.canOpenURL(targetUrl);
    if (supported) {
      await Linking.openURL(targetUrl);
    }
  };

  handleRedirect()

  return (
    <View>
      <Button title="Forward All Params" />
    </View>
  );
}