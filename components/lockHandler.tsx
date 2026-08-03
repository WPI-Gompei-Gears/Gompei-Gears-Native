// import React, { useEffect, useState } from 'react';
// import { View, Button, Text, Platform } from 'react-native';
// import { BleManager, Device } from 'react-native-ble-plx';
// import base64 from 'react-native-base64';

// const manager = new BleManager();

// const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
// const COMMAND_UUID = '12345678-1234-1234-1234-123456789abd';

// function findLock(lockID: String) {
//     const [device, setDevice] = useState<Device | null>(null);

//     useEffect(() => {
//         const subscription = manager.onStateChange((state) => {
//         if (state === 'PoweredOn') {
//             console.log('Bluetooth is on');
//             startScan();
//         }
//         }, true);

//         return () => subscription.remove();
//     }, []);

//     const startScan = () => {
//         manager.startDeviceScan(null, null, (error, foundDevice) => {
//         if (error) {
//             console.error(error);
//             return;
//         }

//         if (foundDevice?.name === 'AXA-Lock') {
//             console.log('Found lock device:', foundDevice.id);
//             manager.stopDeviceScan();
//             setDevice(foundDevice);
//         }
//         });
//     };

//     return device;
// }

// export async function getLockStatus(lockID: String) {
//     const device = findLock(lockID)
// }

// export async function setLockStatus(lockID: String, state: boolean) {
//     const device = findLock(lockID)
//     const command = state ? "LOCK" : "UNLOCK"

//     if (!device) {
//         console.log('No device found');
//         return;
//     }

//     try {
//         const connected = await device.connect();
//         await connected.discoverAllServicesAndCharacteristics();

//         const payload = base64.encode(command);
//         await connected.writeCharacteristicWithResponseForService(
//             SERVICE_UUID,
//             COMMAND_UUID,
//             payload
//         );

//         console.log(`Sent ${command}`);
//         await connected.cancelConnection();
//     } catch (err) {
//         console.error(err); 
//     }
// }