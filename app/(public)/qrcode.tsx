import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import { AlertDialog, Button, Input, XStack, YStack } from 'tamagui';
import { Dispatch, SetStateAction, useState } from 'react';
import { router } from 'expo-router';
import { ArrowDownRight, CornerDownRight } from '@tamagui/lucide-icons-2';

const FIRST_DETENT = 0.55;

function onQRScan(data: String, errorDialogAffector: Dispatch<SetStateAction<boolean>>) {
  console.log(data)
  const myUrl: string = process.env.EXPO_PUBLIC_SITE_URL ?? ""

  if (data.match(`${myUrl}/rent/WPI[0-9]{1,3}`.replaceAll("/", "\."))) {
    const bikeID = data.replace(`${myUrl}/rent/`, "")
    router.dismissTo(`/rent/${bikeID}`)

  } else if (data.match("WPI[0-9]{3}")) {
    router.dismissTo(`/rent/${data}`)
  } else {
    errorDialogAffector(true)
  }
}

function onTextInput(text: String) {

}

export default function QRCodeScan() {
  const { height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [isOpen, setIsOpen] = useState(false);
  const [textBoxValue, setTextBoxValue] = useState("");
  const [textBoxFocused, setTextBoxFocused] = useState(false);

  if (!permission) {
    return <ThemedView style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.permissionContainer}>
        <ThemedText>Camera access is needed to scan QR codes.</ThemedText>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <ThemedText type="link">Grant Camera Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.cameraSection, { height: textBoxFocused ? height * FIRST_DETENT * 0.7 : height * FIRST_DETENT }]}>
        <ThemedText type="title" style={styles.title}>Scan Code</ThemedText>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => onQRScan(data, setIsOpen)}
        />
      </View>

      <AlertDialog native open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialog.Trigger/>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            transition="quick"
            opacity={0.5}
            backgroundColor="$background"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            elevate
            key="content"
            transition={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            scale={1}
            opacity={1}
            y={0}
          >
            <YStack gap="$4">
              <AlertDialog.Title>Invalid QR Code</AlertDialog.Title>
              <AlertDialog.Description>
                Please scan or enter a QR code from a Gompei Gears bike
              </AlertDialog.Description>

              <XStack gap="$3" justify="flex-end">
                <AlertDialog.Cancel asChild>
                  <Button>Will do, cap!</Button>
                </AlertDialog.Cancel>
              </XStack>
            </YStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>


      <View style={styles.inputSection}>
        <ThemedText type="defaultSemiBold">Or enter a code manually</ThemedText>
        <XStack flex={1} gap={"$3"}>
          <Input
            placeholder="Bike ID"
            style={styles.input}
            flex={1}
            value={textBoxValue}
            onChangeText={(text) => setTextBoxValue(text)}
            onSubmitEditing={() => {onQRScan(textBoxValue, setIsOpen)}}
            onFocus={() => {setTextBoxFocused(true)}}
            onBlur={() => {setTextBoxFocused(false)}}
          />
          <Button icon={CornerDownRight} onPress={() => {onQRScan(textBoxValue, setIsOpen)}}></Button>
        </XStack>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 16,
  },
  permissionButton: {
    marginTop: 8,
  },
  cameraSection: {
    padding: 20,
    gap: 12,
    transitionProperty: "height",
    transitionDuration: "1",
  },
  title: {
    fontFamily: Fonts.rounded,
    textAlign: "center"
  },
  camera: {
    flex: 1,
    borderRadius: 50,
    overflow: 'hidden',
  },
  inputSection: {
    padding: 20,
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});
