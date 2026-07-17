import { Image } from "expo-image";
import { Href, Link, RelativePathString } from "expo-router";
import { ComponentProps, FunctionComponent, JSX } from "react";
import { Button, DimensionValue, GestureResponderEvent, Platform, StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { SizableText, XStack } from "tamagui";

export default function NativeButton({
    title,
    icon,
    iconElement,
    w,
    h,
    iw,
    ih,
    link,
    onPress,
    mobileOnly,
    webOnly,
    style,
}: {
    title? : string,
    icon? : ComponentProps<typeof Image>['source'], // allow require(...) or uri string
    iconElement? : JSX.Element,
    w? : DimensionValue,
    h? : number,
    iw? : DimensionValue,
    ih? : DimensionValue,
    link? : Href,
    onPress? : ((event: GestureResponderEvent) => void) | undefined,
    mobileOnly? : boolean,
    webOnly? : boolean,
    style? : StyleProp<ViewStyle>,
}) {
    const button = (
        <TouchableOpacity style={style} onPress={link ? undefined : onPress}>
            <XStack flexWrap="nowrap">
                {icon ? 
                    (<Image source={icon} style={{width: (iw ?? (h ?? 40)), height: ih ?? h ?? 40}}></Image>):
                    iconElement
                }
                {(icon && title) && <View style={{width: 10}}></View>}
                {title && <SizableText color="$color" style={{fontSize: h ? h/2.5 : 20}}>{title}</SizableText>}
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