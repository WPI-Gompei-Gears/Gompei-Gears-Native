// import React, { useEffect, useState } from 'react';
// import { View, Text, Button } from 'react-native';
// import { BleManager, Device } from 'react-native-ble-plx';
// import base64 from 'react-native-base64';

// const manager = new BleManager();

// const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
// const COMMAND_UUID = '12345678-1234-1234-1234-123456789abd';
// const STATE_UUID = '12345678-1234-1234-1234-123456789abe';

// export default function App() {
//   const [device, setDevice] = useState<Device | null>(null);
//   const [state, setState] = useState('Unknown');

//   useEffect(() => {
//     const subscription = manager.onStateChange((state) => {
//       if (state === 'PoweredOn') {
//         scan();
//       }
//     }, true);

//     return () => subscription.remove();
//   }, []);

//   const scan = () => {
//     manager.startDeviceScan(null, null, (error, foundDevice) => {
//       if (error) return;

//       if (foundDevice?.name === 'AXA-Lock') {
//         manager.stopDeviceScan();
//         setDevice(foundDevice);
//         setTimeout(connect, 50);
//       }
//     });
//   };

//   const connect = async () => {
//     if (!device) return;

//     const connected = await device.connect();
//     await connected.discoverAllServicesAndCharacteristics();

//     // Subscribe for future notifications
//     const monitor = connected.monitorCharacteristicForService(
//       SERVICE_UUID,
//       STATE_UUID,
//       (error, characteristic) => {
//         if (error) {
//           return;
//         }

//         if (characteristic?.value) {
//           const decoded = base64.decode(characteristic.value);
//           setState(decoded);
//         }
//       }
//     );

//     const disconnectSubscription = connected.onDisconnected(() => {
//       monitor.remove();
//       disconnectSubscription.remove();
//       setDevice(null);
//       setState('Unknown');
//       scan();
//     });

//     // Read the current state immediately after connecting
//     try {
//       const char = await connected.readCharacteristicForService(
//         SERVICE_UUID,
//         STATE_UUID
//       );

//       if (char?.value) {
//         const decoded = base64.decode(char.value);
//         setState(decoded);
//       }
//     } catch (err) {
//       console.error('Read state failed:', err);
//     }
//   };

//   const sendCommand = async (cmd: 'LOCK' | 'UNLOCK') => {
//     if (!device) return;

//     const connected = await device.connect();
//     await connected.discoverAllServicesAndCharacteristics();

//     const payload = base64.encode(cmd);
//     await connected.writeCharacteristicWithResponseForService(
//       SERVICE_UUID,
//       COMMAND_UUID,
//       payload
//     );
//   };

//   return (
//     <View style={{ padding: 24, gap: 12, marginTop: 100 }}>
//       <Text>Device: {device?.name ?? 'Scanning...'}</Text>
//       <Text>State: {state}</Text>

//       <Button title="Connect" onPress={connect} />
//       <Button title="Lock" onPress={() => sendCommand('LOCK')} />
//       <Button title="Unlock" onPress={() => sendCommand('UNLOCK')} />
//     </View>
//   );
// }