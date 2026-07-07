import { Image } from "expo-image";
import { Href, Link, RelativePathString } from "expo-router";
import { Button, DimensionValue, Text, TouchableOpacity, View } from "react-native";

export default function NativeButton({
    title,
    icon,
    w,
    h,
    iw,
    ih,
    link,
    mobileOnly,
}: {
    title? : string,
    icon? : any, // allow require(...) or uri string
    w? : DimensionValue,
    h? : number,
    iw? : DimensionValue,
    ih? : DimensionValue,
    link : Href,
    mobileOnly? : boolean,
}) {
    if(!mobileOnly) {
        return (
            <Link href={link}>
                <TouchableOpacity>
                    {icon && (<Image source={icon} style={{width: (iw ?? (h ?? 40)), height: ih ?? h ?? 40}}></Image>)}
                    {(icon && title) && <View style={{width: 10}}></View>}
                    {title && <Text style={{fontSize: h ? h/2.5 : 20}}>{title}</Text>}
                </TouchableOpacity>
            </Link>
        )
    } else {
        return <></>
    }
}