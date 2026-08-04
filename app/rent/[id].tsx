import CheckboxWithLabel from "@/components/checkbox";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, Circle, H1, H2, Image, SizableText, Spacer, Spinner, Text, View, XStack, YStack } from "tamagui";
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from "expo-router";
import { Apple, ArrowRight, Bike, Divide, Lock, LockOpen, MessageCircleQuestion, Play } from "@tamagui/lucide-icons-2";
import AcceptSlider from "@/components/acceptslider";
import LocalMap from "@/components/map/map";
import { supabase } from "@/lib/supabase";
import { Alert, Platform } from "react-native";
import { useSession } from "@/contexts/session";
import { useLock } from "@/hooks/use-lock";

export default function RentPage() {
    const [agreed, setAgreed] = useState(false)
    const insets = useSafeAreaInsets()
    const { id } = useLocalSearchParams<{ id: string }>();
    const { session, refreshActiveRental, hasAgreedToTerms, agreeToTerms, isLoading } = useSession();
    const [boxState, setBoxState] = useState(hasAgreedToTerms)

    const [bicycles, setBicycles] = useState<any[]>([])
    const [starting, setStarting] = useState(false)
    const [rentalPage, setRentalPage] = useState(0)
    
    const { unlock, busy: lockBusy, error: lockError } = useLock('AXA-Lock');

    useEffect(() => {
        setAgreed(hasAgreedToTerms)
    }, [hasAgreedToTerms])

    useEffect(() => {
        if (lockError) Alert.alert("Lock error", lockError)
    }, [lockError])

    function InstructionPage({
        title,
        body,
        image,
    } : {
        title: String,
        body: String,
        image: any,
    }) {
        const insets = useSafeAreaInsets()

        return (
            <View flex={1} margin={"$4"} mb={insets.bottom} alignItems="center">
                <YStack flex={1} alignItems="center" gap={"$5"}>
                    <Image src={image} aspectRatio={1} width={"80%"}></Image>
                    <H1>{title}</H1>
                    <SizableText size="$5" opacity={0.8}>{body}</SizableText>
                </YStack>
                <Button width={"100%"} iconAfter={ArrowRight} onPress={() => setRentalPage(rentalPage + 1)}>Continue</Button>
            </View>
        )
    }

    useEffect(() => {
        async function getInstruments() {
            const { data } = await supabase.from('bicycles').select().eq('bike_id', id.replace("WPI", ""))
            setBicycles(data || [])
        }
        getInstruments()
    }, [id])

    async function startRental() {
        const bicycle = bicycles[0]
        if (!session?.user || !bicycle || starting || lockBusy) return

        setStarting(true)

        const { error } = await supabase.from('rentals').insert({
            user_id: session.user.id,
            bicycle_id: bicycle.id,
        })

        if (error) {
            Alert.alert('Unable to start rental', error.message)
            setStarting(false)
            return
        }

        const unlocked = await unlock()
        await refreshActiveRental()
        if (!unlocked) {
            setStarting(false)
            return
        }

        setStarting(false)
    }

    const pins = bicycles
    .filter((bicycle: any) => bicycle.lat != null && bicycle.lng != null)
    .map((bicycle: any) => ({
      name: `WPI${bicycle.bike_id}`,
      latitude: Number(bicycle.lat),
      longitude: Number(bicycle.lng),
      type: Number(bicycle.quality),
    }))

    const centerLocation = pins[0] ? { latitude: pins[0].latitude - 0.0008, longitude: pins[0].longitude + 0.0006 } : undefined

    if(Platform.OS == "web") {
        return (
            <View justify={"center"} alignItems="center" height="80%">
                <YStack gap="$4" alignItems="center">
                    <SizableText size="$8" textAlign="center">Open the Mobile App to Start a Rental!</SizableText>
                    <Image src={require("@/assets/images/appicon240.png").uri} width={"$10"} aspectRatio={1} />
                    <XStack gap="$2">
                        <Button icon={Apple} bg={"black"} size={"$3"}><SizableText>App Store</SizableText></Button>
                        <Button icon={Play} bg={"black"} size={"$3"}><SizableText>Play Store</SizableText></Button>
                    </XStack>
                </YStack>
            </View>
        )
    } else if(isLoading) {
        return (
            <View flex={1} justify={"center"} alignItems="center">
                <Spinner size="large" />
            </View>
        )
    } else if(agreed) {
        switch(rentalPage) {
            case 0:
                return <InstructionPage
                    title={"Ride Up To 8 Hours"}
                    body={"Take out Gompei's Gears bike for up to 8 hours, 100% free! Just make sure you press \"End Ride\" after your time is up."}
                    image={require("@/assets/images/instructions/bikelock.png")}
                />
            case 1:
                return <InstructionPage
                    title={"Return to Any Station"}
                    body={"Any green bike rack on the WPI campus is for Gompei's Gears. Make sure you return to one to end your ride! Can't find one? No problem, they're visible on this app after your rental has started."}
                    image={require("@/assets/images/instructions/bikelock.png")}
                />
            case 2:
                return <InstructionPage
                    title={"Make Sure to Lock Up"}
                    body={"Run the included chain securely through the rack loop, and close the lock through the rear wheel to ensure the bike is secure. Stolen bikes will be the financial responsibility of the last renter, unless further evidence is present."}
                    image={require("@/assets/images/instructions/bikelock.png")}
                />
            case 3:
                return <InstructionPage
                    title={"Wear a Helmet and Have Fun!"}
                    body={"To stay safe while riding, the Rubin Campus Center offers free helmet rentals with your WPI ID. Have Fun!"}
                    image={require("@/assets/images/instructions/bikelock.png")}
                />
            case 4:
                return (
                    <YStack alignItems="center" flex={1} mb={insets.bottom + 50} width={"100%"}>
                        <YStack flex={1} alignItems="center" width={"100%"}>
                            <View height={"70%"} width={"100%"} borderBottomLeftRadius={200} borderBottomRightRadius={200} overflow="hidden">
                                <LocalMap APIKey={process.env.EXPO_PUBLIC_GMAPS_API_KEY} pins={pins} centerLocation={centerLocation}/>
                            </View>
                            <YStack width={"$19"} justify={"center"} alignItems="center" aspectRatio={1} transform={"translateY(-200%)"} shadowRadius={"$2"}>
                                {/* <Bike color={"white"} size={"$10"} strokeWidth={1}></Bike> */}
                                <Image
                                position="absolute"
                                objectFit="contain"
                                width={300}
                                height={300}
                                src={require("@/assets/images/app-icon-rent.png")}
                                />
                                <Spacer height={"$3"}/>
                                <SizableText size="$8" color="white" fontWeight={"bold"}>Renting</SizableText>
                                <SizableText size="$12" color="white" fontWeight={"bold"}>{id}</SizableText>
                            </YStack>
                        </YStack>
                        {starting ? 
                            <YStack gap={"$4"}>
                                <Spinner/>
                                <SizableText fontWeight={700} opacity={0.8}>Connecting to lock...</SizableText>
                            </YStack> : 
                            <AcceptSlider onAccept={startRental} label={starting ? "Starting…" : "Slide to Start"}/>
                        }
                    </YStack>
                )
        }
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
                <XStack height="10%" px="$2" justify={"space-between"} alignItems="center">
                    <CheckboxWithLabel size="$5" label="I Agree" checked={boxState} onCheckedChange={(value) => {if (value != "indeterminate") setBoxState(value)}}/>
                    <Button onPress={() => {agreeToTerms(boxState)}} disabled={!boxState} opacity={boxState ? 1:0.5}><Text>Continue</Text></Button>
                </XStack>
            </YStack>
        )
    }
}