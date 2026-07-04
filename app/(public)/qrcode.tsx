import { CameraView, useCameraPermissions } from 'expo-camera';
import { StyleSheet, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

const FIRST_DETENT = 0.55;

export default function QRCodeScan() {
  const { height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();

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
      <View style={[styles.cameraSection, { height: height * FIRST_DETENT }]}>
        <ThemedText type="title" style={styles.title}>Scan Code</ThemedText>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => console.log(data)}
        />
      </View>

      <View style={styles.inputSection}>
        <ThemedText type="defaultSemiBold">Or enter a code manually</ThemedText>
        <TextInput
          placeholder="Bike ID"
          placeholderTextColor="#999"
          style={styles.input}
        />
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
