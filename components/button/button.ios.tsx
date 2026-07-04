import { GlassView } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { Href, Link, RelativePathString } from 'expo-router';
import { DimensionValue, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NativeButton({
    title,
    icon,
    w,
    h,
    iw,
    ih,
    link,
}: {
    title? : string,
    icon? : NodeJS.Require,
    w? : DimensionValue,
    h? : number,
    iw? : DimensionValue,
    ih? : DimensionValue,
    link : Href,
}) {
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

    return (
        <Link href={link} asChild>
            <TouchableOpacity activeOpacity={0.8}>
                <GlassView style={styles.glass1} isInteractive>
                    {icon && (<Image source={icon} style={{width: (iw ?? (h ?? 40)), height: ih ?? h ?? 40}}></Image>)}
                    {(icon && title) && <View style={{width: 10}}></View>}
                    {title && <Text style={{fontSize: h ? h/2.5 : 20}}>{title}</Text>}
                </GlassView>
            </TouchableOpacity>
        </Link>
    )
}