import LockHandler from "@/components/lock-handler";
import LocalMap from "@/components/map/map";
// import { useLock } from "@/contexts/lock";
import { useSession } from "@/contexts/session";
import { supabase } from "@/lib/supabase";
import { Check, Lock, LockOpen, MessageCircleQuestion, Pause } from "@tamagui/lucide-icons-2";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, H2, SizableText, Spinner, View, XStack, YStack } from "tamagui";

function formatElapsed(startTime?: string) {
    if (!startTime) return "0:00";
    const totalSeconds = Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function RentingPage() {
    const insets = useSafeAreaInsets();
    // const { lockState, setLockStatus } = useLock();
    const { activeRental, refreshActiveRental } = useSession();
    const [ending, setEnding] = useState(false);
    const [elapsed, setElapsed] = useState(() => formatElapsed(activeRental?.startTime));

    const [lockStatus, setLockStatus] = useState<String | null>(null)
    const [lockSet, setLockSet] = useState<boolean | null>(null)

    useEffect(() => {
        setElapsed(formatElapsed(activeRental?.startTime));
        const interval = setInterval(() => setElapsed(formatElapsed(activeRental?.startTime)), 1000);
        return () => clearInterval(interval);
    }, [activeRental?.startTime]);

    const pins = activeRental?.lat != null && activeRental?.lng != null
        ? [{ name: activeRental.bikeLabel, latitude: activeRental.lat, longitude: activeRental.lng, type: 0 }]
        : undefined;

    async function endRide() {
        if (!activeRental || ending) return;

        setEnding(true);
        const { error } = await supabase
            .from("rentals")
            .update({ end_time: new Date().toISOString() })
            .eq("id", activeRental.id);
        setEnding(false);

        if (error) {
            Alert.alert("Unable to end ride", error.message);
            return;
        }

        await refreshActiveRental();
        router.replace("/");
    }

    return (
        <YStack flex={1} bg="$background" pt={insets.top + 20} pb={insets.bottom + 20} px="$4" gap="$4">
            <YStack items="center" gap="$1">
                <SizableText size="$3" opacity={0.6} textTransform="uppercase" letterSpacing={2}>
                    Currently Renting
                </SizableText>
                <H2 fontWeight="900">{activeRental?.bikeLabel ?? "Bike"}</H2>
                <SizableText size="$5" opacity={0.6}>{elapsed} elapsed</SizableText>
            </YStack>

            <Card flex={1} borderRadius="$10" overflow="hidden" elevation={5}>
                <View flex={1}>
                    <LocalMap
                        APIKey={process.env.EXPO_PUBLIC_GMAPS_API_KEY}
                        pins={pins}
                        centerLocation={pins?.[0]}
                    />
                </View>
            </Card>

            <Card borderRadius="$10" p="$5" bg="$accentColor" elevation={4}>
                <SizableText size="$5" fontWeight="700" mb="$4">Ride Options</SizableText>
                <XStack justify="space-around">
                    <YStack items="center" gap="$2" opacity={lockStatus == null ? 0.4 : 1}>
                        <Button circular size="$6" bg="$background" onPress={lockStatus == "Locked" ? () => {setLockSet(false)} : () => {setLockSet(true)}} icon={lockStatus == "Locked" ? LockOpen : Lock} disabled={lockStatus == null} />
                        <SizableText size="$2">{lockStatus == "Locked" ? "Unlock Bike" : lockStatus == "Unlocked" ? "Lock Bike" : "Disconnected"}</SizableText>
                    </YStack>

                    <YStack items="center" gap="$2" opacity={0.4}>
                        <Button circular size="$6" bg="$background" icon={MessageCircleQuestion} disabled />
                        <SizableText size="$2">Get Help</SizableText>
                    </YStack>

                    <YStack items="center" gap="$2">
                        <Button
                            circular
                            size="$6"
                            bg="darkred"
                            pressStyle={{ scale: 0.94 }}
                            onPress={endRide}
                            disabled={ending}
                            icon={ending ? undefined : <Check size={26} color="white" />}
                        >
                            {ending && <Spinner color="white" />}
                        </Button>
                        <SizableText size="$2" fontWeight="700">End Ride</SizableText>
                    </YStack>
                </XStack>
            </Card>
            <LockHandler statusSetter={setLockStatus} desiredState={lockSet} desiredStateSetter={setLockSet}/>
        </YStack>
    );
}
