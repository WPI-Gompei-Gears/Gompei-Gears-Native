import CheckboxWithLabel from "@/components/checkbox";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Circle, Image, SizableText, Spacer, Text, View, XStack, YStack } from "tamagui";
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from "expo-router";
import { Bike, Divide } from "@tamagui/lucide-icons-2";
import AcceptSlider from "@/components/acceptslider";
import LocalMap from "@/components/map/map";
import { supabase } from "@/lib/supabase";

export default function rentPage() {
    const [agreed, setAgreed] = useState(false)
    const [checkOn, setCheck] = useState(false)
    const insets = useSafeAreaInsets()
    const { id } = useLocalSearchParams<{ id: string }>();

    const [bicycles, setBicycles] = useState<any[]>([])

    useEffect(() => {
        async function getInstruments() {
            const { data } = await supabase.from('bicycles').select().eq('bike_id', id.replace("WPI", ""))
            setBicycles(data || [])
        }
        getInstruments()
    }, [id])

    const pins = bicycles
    .filter((bicycle: any) => bicycle.lat != null && bicycle.lng != null)
    .map((bicycle: any) => ({
      name: `WPI${bicycle.bike_id}`,
      latitude: Number(bicycle.lat),
      longitude: Number(bicycle.lng),
      type: Number(bicycle.quality),
    }))

    const centerLocation = pins[0] ? { latitude: pins[0].latitude - 0.0008, longitude: pins[0].longitude + 0.0006 } : undefined

    if(agreed) {
        return (
            <YStack alignItems="center" flex={1} mb={insets.bottom + 50} width={"100%"}>
                <YStack flex={1} alignItems="center" width={"100%"}>
                    <View height={"70%"} width={"100%"} bblr="50%" bbrr="50%" overflow="hidden">
                        <LocalMap APIKey={process.env.EXPO_PUBLIC_GMAPS_API_KEY} pins={pins} centerLocation={centerLocation}/>
                    </View>
                    <Circle width={"$19"} justify={"center"} alignItems="center" bg="#AC2B37" aspectRatio={1} transform={"translateY(-200%)"} shadowRadius={"$2"}>
                        <Bike color={"white"} size={"$10"} strokeWidth={1}></Bike>
                        <SizableText size="$8" color="white" fontWeight={"bold"}>Renting {id}</SizableText>
                        <Spacer/>
                    </Circle>
                </YStack>
                <AcceptSlider onAccept={() => {}} label="Slide to Start"/>
            </YStack>
        )
    } else {
        return (
            <YStack flex={1} mb={insets.bottom} p="$4" width="100%" gap="$3">
                <View flex={1} bg="gray" borderRadius={"$5"} overflow="hidden">
                    <WebView
                        scalesPageToFit={true}
                        scrollEnabled={true}
                        style={{flex: 1}}
                        source={{uri: "https://drive.google.com/file/d/147I0zCKz7B8zP5tZSdI2vs4DXY2YYm6z/preview"}}
                    />
                </View>
                <SizableText textAlign="center">Please Review the WPI Rental Agreement</SizableText>
                <XStack height="10%" justify={"space-between"} alignItems="center">
                    <CheckboxWithLabel size="$5" label="I Agree" onCheckedChange={(value) => {if (value != "indeterminate") setCheck(value)}}/>
                    <Button onPress={() => {setAgreed(true)}} disabled={!checkOn} opacity={checkOn ? 1:0.5}><Text>Continue</Text></Button>
                </XStack>
            </YStack>
        )
    }
}