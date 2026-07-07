import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NativeButton from "./button/button";
import { Href } from "expo-router";
import { ThemedText } from "./themed-text";

export default function TitleBar({
    returnLink,
    title,
}:{
    returnLink: Href,
    title: string,
}) {
    const insets = useSafeAreaInsets()

     const styles = StyleSheet.create({
      container: {
        marginTop: insets.top + 10,
        marginBottom: 15,
        width: "100%",
      },
    });

    return (
        <View style={ styles.container}>
            <ThemedText type="title" style={{textAlign: "center", marginTop: 7}}>{title}</ThemedText>
            <View style= {{position: "absolute", marginLeft: 5}}>
                <NativeButton link={returnLink} icon={require("@/assets/images/arrow-left-circle.png")}/>
            </View>
        </View>
    )
}