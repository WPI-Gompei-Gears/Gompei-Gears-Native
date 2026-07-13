import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TitleBar from '@/components/titlebar';
import LocalMap from '@/components/map/map';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, ScrollView, SizableText, Text, XStack } from 'tamagui';
import { Bike } from "@tamagui/lucide-icons-2"
import { router } from 'expo-router';

export default function AdminAssets() {  
    const insets = useSafeAreaInsets()

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      },
    });

    const [bicycles, setBicycles] = useState<any[]>([])
  
    useEffect(() => {
      getInstruments()
    }, [])
  
    async function getInstruments() {
      const { data } = await supabase.from('bicycles').select()
      setBicycles(data || [])
    }
  
    const bikeCards = bicycles.map((bicycle: any, index) => (
      <Card 
        key={index}
        borderRadius={20}
        elevation={5}
        margin={10}
        padding={10}
        size="$4"
        $md={{ width: "$12"}}
        width={"40%"}
        aspectRatio={"1"}
        transition={"bouncyPress"}
        hoverStyle={{ scale: 1.1, cursor: 'pointer' }}
        pressStyle={{ scale: 0.9 }}
        onPress={() => router.push(`/bike/${bicycle.bike_id}`)}
      >
        <Card.Header items="center">
          <Bike size={"$4"}></Bike>
        </Card.Header>
        <Card.Footer justify="center">
          <SizableText size={"$6"}>WPI {bicycle.bike_id}</SizableText>
        </Card.Footer>
      </Card>
    ))

  return (
    <ThemedView style={styles.container}>
      <TitleBar title='Assets' returnLink={"/(public)"}></TitleBar>
      <ScrollView>
        <XStack justify={"center"} flexWrap='wrap'>
          {bikeCards}
        </XStack>
      </ScrollView>
    </ThemedView>
  );
}
