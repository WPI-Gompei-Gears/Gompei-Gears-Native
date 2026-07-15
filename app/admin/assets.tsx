import { StyleSheet, View } from 'react-native';

import TitleBar from '@/components/titlebar';
import LocalMap from '@/components/map/map';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Sheet, SizableText, styled, Text, XStack, YStack } from 'tamagui';
import { Bike } from "@tamagui/lucide-icons-2"
import { router } from 'expo-router';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

export default function AdminAssets() {
    const insets = useSafeAreaInsets()

    const styles = StyleSheet.create({
      container: {
        flex: 1,
      },
      titleBar: {
        position: 'absolute',
        top: insets.top,
        left: 15,
        right: 15,
        borderRadius: 20,
        backgroundColor: 'rgba(128, 128, 128, 0.5)',
      },
    });

    const [bicycles, setBicycles] = useState<any[]>([])
    const [sheetOpen, setSheetOpen] = useState(true)
    const [sheetPosition, setSheetPosition] = useState(1)

    useEffect(() => {
      getInstruments()
    }, [])

    async function getInstruments() {
      const { data } = await supabase.from('bicycles').select()
      setBicycles(data || [])
    }

    const pins = bicycles
      .filter((bicycle: any) => bicycle.lat != null && bicycle.lng != null)
      .map((bicycle: any) => ({
        name: `WPI${bicycle.bike_id}`,
        latitude: Number(bicycle.lat),
        longitude: Number(bicycle.lng),
        type: Number(bicycle.quality),
      }))

      const TagFrame = styled(XStack, {
        name: 'Tag',
        bg: '$blue5', // Customize the background color
        px: '$3', // Or adjust to fit your design
        py: '$1.5',
        borderRadius: '$4',      // Use size tokens to create pill shapes
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
      });

    const bikeCards = bicycles.map((bicycle: any, index) => (
      <Card 
        key={index}
        borderRadius={20}
        elevation={5}
        margin={10}
        padding={10}
        width={"90%"}
        transition={"bouncyPress"}
        hoverStyle={{ scale: 1.1, cursor: 'pointer' }}
        pressStyle={{ scale: 0.9 }}
        onPress={() => router.push(`/bike/${bicycle.bike_id}`)}
        justify={"center"}
      >
        <XStack justify={"space-between"}>
          <XStack>
            <Bike height={"$2"}></Bike>
            <SizableText size={"$6"} mx="$4">WPI {bicycle.bike_id}</SizableText>
          </XStack>
          <XStack>
            <TagFrame><Text>Locked</Text></TagFrame>
          </XStack>
        </XStack>
      </Card>
    ))

  return (
    <View style={styles.container}>
      <LocalMap APIKey={process.env.EXPO_PUBLIC_GMAPS_API_KEY} pins={pins}/>
      <Card borderRadius={20} px="$2" elevation={5} width={"90%"} left={"5%"} position='absolute' top={insets.top}>
        <TitleBar title='Assets' returnLink={"/(public)"}></TitleBar>
      </Card>
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        position={sheetPosition}
        onPositionChange={setSheetPosition}
        snapPoints={[80, 40]}
        dismissOnSnapToBottom={false}
        modal={false}
        zIndex={100_000}
      >
        <Sheet.Handle />
        <GlassView style={{ height: "100%", borderRadius: 20, marginHorizontal: "2.5%" }}>
          <Sheet.Frame pt="$2" style={ isLiquidGlassAvailable() ? {backgroundColor: "rgba(0, 0, 0, 0)"} : {backgroundColor: "rgb(228, 228, 228)"}}>
            <Sheet.ScrollView>
              <XStack justify={"center"} flexWrap='wrap' pb={40}>
                {bikeCards}
              </XStack>
            </Sheet.ScrollView>
          </Sheet.Frame>
        </GlassView>
      </Sheet>
    </View>
  );
}
