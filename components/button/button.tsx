import { Href, RelativePathString } from "expo-router";
import { Button, DimensionValue } from "react-native";

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
    return (
        <Button title={title ?? ""}></Button>
    )
}