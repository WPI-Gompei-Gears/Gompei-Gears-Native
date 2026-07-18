import { Image } from "expo-image";
import { Href, Link, RelativePathString } from "expo-router";
import { ComponentProps, FunctionComponent, JSX } from "react";
import { Button, DimensionValue, GestureResponderEvent, Platform, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { SizableText, XStack } from "tamagui";

export default function NativeButton({
    title,
    icon,
    iconElement,
    w,
    h,
    iw,
    ih,
    p,
    link,
    onPress,
    mobileOnly,
    webOnly,
    style,
    noGlass,
}: {
    title? : string,
    icon? : ComponentProps<typeof Image>['source'], // allow require(...) or uri string
    iconElement? : JSX.Element,
    w? : DimensionValue,
    h? : number,
    iw? : DimensionValue,
    ih? : DimensionValue,
    p? : DimensionValue,
    link? : Href,
    onPress? : ((event: GestureResponderEvent) => void) | undefined,
    mobileOnly? : boolean,
    webOnly? : boolean,
    style? : StyleProp<ViewStyle>,
    noGlass? : boolean,
}) {
    const styles = StyleSheet.create({
        nativeSim: {
            borderRadius: h ?? 20,
            backgroundColor: "rgba(238, 238, 238, 0.75)",
            paddingHorizontal: p ?? (w ? 50 : 0),
            paddingVertical: p ?? (w ? 15 : 0),
        },}
    )

    const button = (
        <TouchableOpacity style={[style, styles.nativeSim]} onPress={link ? undefined : onPress}>
            <XStack flexWrap="nowrap" justify={"center"} alignItems="center">
                {icon ? 
                    (<Image source={icon} style={{width: (iw ?? (h ?? 40)), height: ih ?? h ?? 40}}></Image>):
                    iconElement
                }
                {((icon || iconElement) && title) && <View style={{width: 10}}></View>}
                {title && <SizableText numberOfLines={1} color="$color" style={{fontSize: h ? h/2.5 : 20}}>{title}</SizableText>}
            </XStack>
        </TouchableOpacity>
    )

    if(!mobileOnly || (webOnly && Platform.OS != "web")) {
        return link ? (
            <Link href={link}>
                {button}
            </Link>
        ) : button
    } else {
        return <></>
    }
}