import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import LocalMap from '@/components/map/map';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { X } from '@tamagui/lucide-icons-2';
import NativeButton from '@/components/button/button';

export default function BikeRoute() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [route, setRoute] = useState<{ latitude: number, longitude: number }[]>([]);

  useEffect(() => {
    if (id) getLocations();
  }, [id]);

  async function getLocations() {
    const { data: bicycle } = await supabase
      .from('bicycles')
      .select()
      .eq('bike_id', id)
      .single();

    if (!bicycle?.sidewalk_id) {
      setRoute([]);
      return;
    }

    const { data: locations } = await supabase
      .from('sidewalk_locations')
      .select()
      .eq('wireless_device_id', bicycle.sidewalk_id)
      .order('resolved_at', { ascending: true });

    setRoute(
      (locations || [])
        .filter((location: any) => location.latitude != null && location.longitude != null)
        .map((location: any) => ({
          latitude: Number(location.latitude),
          longitude: Number(location.longitude),
        }))
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top/2 }]}>
      <View style={styles.header}>
        <ThemedText type="title">History | WPI {id}</ThemedText>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={"$2"} />
        </TouchableOpacity>
      </View>
      <LocalMap APIKey={process.env.EXPO_PUBLIC_GMAPS_API_KEY} routes={[route]} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});
