import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';

const manager = new BleManager();

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const COMMAND_UUID = '12345678-1234-1234-1234-123456789abd';
const STATE_UUID = '12345678-1234-1234-1234-123456789abe';

export default function LockHandler({ statusSetter, desiredState, desiredStateSetter }: { statusSetter: any, desiredState: boolean | null, desiredStateSetter: any }) {
  // const [device, setDevice] = useState<Device | null>(null);
  const [lockState, setState] = useState<String | null>(null);
  const [setLock, setSetLock] = useState(false);
  const deviceRef = useRef<Device | null>(null);

  useEffect(() => {
    statusSetter(lockState)
  }, [deviceRef.current])

  useEffect(() => {
    if(desiredState != null) {
      const desiredStateful = desiredState ? "Locked" : "Unlocked"
      if(desiredStateful != lockState && lockState != null) {
        if (desiredState == false) sendCommand("UNLOCK")
        else sendCommand("LOCK")
      }
    }
  }, [desiredState])

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        scan();
      }
    }, true);

    return () => subscription.remove();
  }, []);

  const scan = () => {
    manager.startDeviceScan(null, null, (error, foundDevice) => {
      if (error) return;

      if (foundDevice?.name === 'AXA-Lock') {
        manager.stopDeviceScan();
        deviceRef.current = foundDevice;
        setTimeout(connect, 50);
      }
    });
  };

  const connect = async () => {
    const device = deviceRef.current
    console.log("Connecting to:", device)

    if (!device) return;
    
    try {
      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();
    
      // Subscribe for future notifications
      const monitor = connected.monitorCharacteristicForService(
        SERVICE_UUID,
        STATE_UUID,
        (error, characteristic) => {
          console.log("Found char...")

          if (error) {
            return;
          }

          if (characteristic?.value) {
            const decoded = base64.decode(characteristic.value);
            const readableState = decoded.startsWith("L") ? "Locked" : decoded.startsWith("T") ? "Unlocked" : null
            console.log(readableState)
            setState(readableState);
          }
          
          if(desiredState != null) {
            const desiredStateful = desiredState ? "Locked" : "Unlocked"
            if(desiredStateful != lockState && lockState != null) {
              if (desiredState == false) sendCommand("UNLOCK")
              else sendCommand("LOCK")
            }
          }
        }
      );

      const disconnectSubscription = connected.onDisconnected(() => {
        console.log("BLE disconnected :(")
        monitor.remove();
        disconnectSubscription.remove();
        deviceRef.current = null;
        setState(null);
        scan();
      });

      // Read the current state immediately after connecting
      try {
        const char = await connected.readCharacteristicForService(
          SERVICE_UUID,
          STATE_UUID
        );

        if (char?.value) {
          const decoded = base64.decode(char.value);
          const readableState = decoded.startsWith("L") ? "Locked" : decoded.startsWith("T") ? "Unlocked" : null
          console.log(readableState)
          setState(readableState);
        }
      } catch (err) {
        console.error('Read state failed:', err);
      }
    } catch(err) {
      console.error("BLE bisconnected mid operation:", err)
    }
  };

  const sendCommand = async (cmd: 'LOCK' | 'UNLOCK') => {
    if(!setLock) {
      setSetLock(true)

      const device = deviceRef.current
      if (!device) {
        setSetLock(false)
        return
      };

      const connected = await device.connect();
      await connected.discoverAllServicesAndCharacteristics();

      const payload = base64.encode(cmd);
      await connected.writeCharacteristicWithResponseForService(
        SERVICE_UUID,
        COMMAND_UUID,
        payload
      );

      desiredStateSetter(null);
      connect();
      setSetLock(false);
    }
  };

  return <></>
}