import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { ChevronsRight, CircleCheck } from "@tamagui/lucide-icons-2";
import { SizableText, View } from "tamagui";

const TRACK_WIDTH = 300;
const TRACK_HEIGHT = 56;
const THUMB_PADDING = 4;
const THUMB_SIZE = TRACK_HEIGHT - THUMB_PADDING * 2;
const MAX_TRANSLATE = TRACK_WIDTH - THUMB_SIZE - THUMB_PADDING * 2;
const COMPLETE_THRESHOLD = 0.7;
const SPRING_BACK = { damping: 16, stiffness: 200, mass: 0.6 };

type AcceptSliderProps = {
    onAccept: () => void;
    label?: string;
};

export default function AcceptSlider({ onAccept, label = "Slide to Accept" }: AcceptSliderProps) {
    const translateX = useSharedValue(0);
    const startX = useSharedValue(0);

    const fireAccept = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onAccept();
    }, [onAccept]);

    const fireImpact = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, []);

    const pan = Gesture.Pan()
        .onStart(() => {
            startX.value = translateX.value;
        })
        .onUpdate((e) => {
            translateX.value = Math.min(Math.max(startX.value + e.translationX, 0), MAX_TRANSLATE);
        })
        .onEnd(() => {
            if (translateX.value > MAX_TRANSLATE * COMPLETE_THRESHOLD) {
                translateX.value = withTiming(MAX_TRANSLATE, { duration: 150 });
                scheduleOnRN(fireAccept);
            } else {
                scheduleOnRN(fireImpact);
                translateX.value = withSpring(0, SPRING_BACK);
            }
        });

    const thumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const fillStyle = useAnimatedStyle(() => ({
        width: translateX.value + THUMB_SIZE + THUMB_PADDING * 2,
    }));

    const labelStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, MAX_TRANSLATE * 0.6], [1, 0], Extrapolation.CLAMP),
    }));

    const iconStyle = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [MAX_TRANSLATE * 0.6, MAX_TRANSLATE], [0, 1], Extrapolation.CLAMP),
        transform: [
            { scale: interpolate(translateX.value, [MAX_TRANSLATE * 0.6, MAX_TRANSLATE], [0.5, 1], Extrapolation.CLAMP) },
        ],
    }));

    return (
        <View
            width={TRACK_WIDTH}
            height={TRACK_HEIGHT}
            bg="$backgroundPress"
            borderRadius={TRACK_HEIGHT / 2}
            // overflow="hidden"
            position="relative"
            justify="center"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.15}
            shadowRadius={6}
        >
            <Animated.View style={[styles.fill, fillStyle]} />

            <Animated.View style={[styles.labelWrap, labelStyle]} pointerEvents="none">
                <SizableText fontWeight="bold" color="darkred">
                    {label}
                </SizableText>
            </Animated.View>

            <Animated.View style={[styles.iconWrap, iconStyle]} pointerEvents="none">
                <CircleCheck color="white" size={22} />
            </Animated.View>

            <GestureDetector gesture={pan}>
                <Animated.View style={[styles.thumb, thumbStyle]}>
                    <ChevronsRight color="darkred" size={24} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    fill: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "darkred",
        borderRadius: TRACK_HEIGHT / 2,
    },
    labelWrap: {
        position: "absolute",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    iconWrap: {
        position: "absolute",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    thumb: {
        position: "absolute",
        left: THUMB_PADDING,
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
});
