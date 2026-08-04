import LocalMap from "@/components/map/map";
import { useLock } from "@/hooks/use-lock";
import { useSession } from "@/contexts/session";
import { supabase } from "@/lib/supabase";
import { Check, Lock, LockOpen, MessageCircleQuestion, Pause } from "@tamagui/lucide-icons-2";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Card, H2, SizableText, Spinner, View, XStack, YStack, Image } from "tamagui";
import AcceptSlider from "@/components/acceptslider";

function formatElapsed(startTime?: string) {
    if (!startTime) return "0:00";
    const totalSeconds = Math.max(0, Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;
    const overtimeColor = hours >= 12 ? "red" : (hours >= 11 && hours < 12) ? "orange" : "black";
    return <SizableText size="$5" opacity={0.6} color={overtimeColor}
        >{hours > 0 ? (hours + " hours, ") : ""}{overtimeColor == "red" ? "Overtime!" : `${minutes}:${seconds.toString().padStart(2, "0")} elapsed`}</SizableText>
}

export default function RentingPage() {
    const insets = useSafeAreaInsets();
    const { activeRental, refreshActiveRental } = useSession();
    const [ending, setEnding] = useState(false);
    const [elapsed, setElapsed] = useState(() => formatElapsed(activeRental?.startTime));

    const { status: lockStatus, lock, unlock, locking, unlocking, busy: lockBusy, error: lockError } = useLock('AXA-Lock');

    //Handes the "elapesed" timer
    useEffect(() => {
        setElapsed(formatElapsed(activeRental?.startTime));
        const interval = setInterval(() => setElapsed(formatElapsed(activeRental?.startTime)), 1000);
        return () => clearInterval(interval);
    }, [activeRental?.startTime]);

    useEffect(() => {
        if (lockError) Alert.alert("Lock error", lockError);
    }, [lockError]);

    const pins = activeRental?.lat != null && activeRental?.lng != null
        ? [{ name: activeRental.bikeLabel, latitude: activeRental.lat, longitude: activeRental.lng, type: 0 }]
        : undefined;

    async function endRide() {
        if (!activeRental || ending || lockBusy) return;

        setEnding(true);

        const locked = await lock();
        if (!locked) {
            setEnding(false);
            return;
        }

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
                {elapsed}
            </YStack>

            <Card flex={1} borderRadius="$10" overflow="hidden" elevation={5}>
                {ending ? 
                    <YStack alignItems="center" m={"$5"}>
                        <H2 textAlign="center">Slide the lock closed to end your ride</H2> 
                        <Image src={require("@/assets/images/instructions/bikelock.png")}></Image>
                    </YStack> :
                    <View flex={1}>
                        <LocalMap
                            APIKey={process.env.EXPO_PUBLIC_GMAPS_API_KEY}
                            pins={pins}
                            centerLocation={pins?.[0]}
                        />
                    </View>
                }
            </Card>

            <Card borderRadius="$10" p="$5" bg="$accentColor" elevation={4}>
                <XStack flex={0} justifyContent="space-between">
                    <SizableText size="$5" fontWeight="700" mb="$4">Ride Options</SizableText>
                    <Button circular size="$2" bg="$background" icon={MessageCircleQuestion} disabled opacity={0.4} />
                </XStack>
                <XStack justify={"space-between"} gap={"$3"}>
                    <YStack items="center" gap="$2" opacity={lockBusy ? 0.6 : 1}>
                        <Button circular color={"darkred"} size="$6" bg="$white" borderColor={"darkred"} borderWidth={"$1.5"} onPress={lockStatus == "Locked" ? unlock : lock} disabled={lockBusy} icon={lockBusy ? undefined : lockStatus == "Locked" ? LockOpen : Lock}>
                            {lockBusy && <Spinner color="darkred" />}
                        </Button>
                        <SizableText size="$2">{locking ? "Locking…" : unlocking ? "Unlocking…" : lockStatus == "Locked" ? "Unlock Bike" : "Lock Bike"}</SizableText>
                    </YStack>

                    <YStack flex={1} items="center" gap={"$2.5"}>
                        <AcceptSlider onAccept={endRide} label={ending ? "Ending…" : ""} width={225}/>
                        <SizableText size="$2">Slide to End Ride</SizableText>
                    </YStack>
                </XStack>
            </Card>
        </YStack>
    );
}
