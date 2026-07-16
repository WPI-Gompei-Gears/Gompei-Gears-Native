import { SharedRefType } from 'expo';
import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { Href, Link, RelativePathString } from 'expo-router';
import { ComponentProps, FunctionComponent, JSX } from 'react';
import { DimensionValue, GestureResponderEvent, ImageSource, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

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
    if (webOnly) return;

    const styles = StyleSheet.create({
        glass1: {
            width: w ?? 40,
            height: h ?? 40,
            borderRadius: 30,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
        },}
    )

    const button = (
        <TouchableOpacity activeOpacity={0.8} style={style} onPress={link ? undefined : onPress}>
            <GlassView style={styles.glass1} isInteractive>
                {icon ?
                    (<Image source={icon} style={{width: (iw ?? (h ?? 40)), height: ih ?? h ?? 40}} />) :
                    iconElement}
                {(icon && title) && <View style={{width: 10}} />}
                {title && <Text style={{fontSize: h ? h/2.5 : 20}}>{title}</Text>}
            </GlassView>
        </TouchableOpacity>
    )

    return link ? (
        <Link href={link} asChild>
            {button}
        </Link>
    ) : button
}
