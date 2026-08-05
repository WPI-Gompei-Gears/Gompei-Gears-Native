import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NativeButton from "./button/button";
import { Href, router } from "expo-router";
import { ThemedText } from "./themed-text";
import { Button, SizableText, XGroup } from "tamagui";
import { ArrowLeft } from "@tamagui/lucide-icons-2";

export default function TitleBar({
    returnLink,
    title,
    dismissTo,
}:{
    returnLink: Href,
    title: string,
    dismissTo?: boolean,
}) {
     const styles = StyleSheet.create({
      container: {
        marginTop: 10,
        marginBottom: 15,
        width: "100%",
      },
    });

    return (
        <XGroup my={"$4"} justify={"center"} py={"$1.5"} width={"100%"}>
            <View style={{position: "absolute", left: 10}}><NativeButton link={returnLink} dismissTo={dismissTo} icon={require("@/assets/images/arrow-left-circle.png")}/></View>
            {/* <Button icon={ArrowLeft} width="$4" position="absolute" left="$2" onPress={() => router.navigate(returnLink)}></Button> */}
            <SizableText size={"$8"}>{title}</SizableText>
        </XGroup>
    )
}