import { useCallback, useEffect, useRef, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';

const manager = new BleManager();

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const COMMAND_UUID = '12345678-1234-1234-1234-123456789abd';
const STATE_UUID = '12345678-1234-1234-1234-123456789abe';

function decodeState(value: string): string | null {
  const decoded = base64.decode(value);
  return decoded.startsWith('L') ? 'Locked' : decoded.startsWith('T') ? 'Unlocked' : null;
}

// Connects to `deviceName` while the calling component is mounted and
// disconnects on unmount. Lock state updates come from the device's notify
// characteristic, so there's no polling once connected.
export function useLock(deviceName: string) {
  const [status, setStatus] = useState<string | null>(null);
  const deviceRef = useRef<Device | null>(null);
  const statusRef = useRef<string | null>(null);
  const sendingRef = useRef(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    let monitorSub: { remove: () => void } | null = null;
    let disconnectSub: { remove: () => void } | null = null;

    const startScan = () => {
      manager.startDeviceScan(null, null, (error, found) => {
        if (error || cancelled) return;

        if (found?.name === deviceName) {
          manager.stopDeviceScan();
          connectToDevice(found);
        }
      });
    };

    const connectToDevice = async (found: Device) => {
      try {
        const connected = await found.connect();
        await connected.discoverAllServicesAndCharacteristics();

        if (cancelled) {
          connected.cancelConnection();
          return;
        }

        deviceRef.current = connected;

        monitorSub = connected.monitorCharacteristicForService(
          SERVICE_UUID,
          STATE_UUID,
          (error, characteristic) => {
            if (error || !characteristic?.value) return;
            setStatus(decodeState(characteristic.value));
          }
        );

        disconnectSub = connected.onDisconnected(() => {
          monitorSub?.remove();
          disconnectSub?.remove();
          deviceRef.current = null;
          setStatus(null);
          if (!cancelled) startScan();
        });

        const char = await connected.readCharacteristicForService(SERVICE_UUID, STATE_UUID);
        if (char?.value) setStatus(decodeState(char.value));
      } catch (err) {
        console.error('Lock connect failed:', err);
        if (!cancelled) startScan();
      }
    };

    const stateSub = manager.onStateChange((state) => {
      if (state !== 'PoweredOn') return;
      startScan();
    }, true);

    return () => {
      cancelled = true;
      stateSub.remove();
      manager.stopDeviceScan();
      monitorSub?.remove();
      disconnectSub?.remove();
      deviceRef.current?.cancelConnection();
      deviceRef.current = null;
      setStatus(null);
    };
  }, [deviceName]);

  const sendCommand = useCallback(async (cmd: 'LOCK' | 'UNLOCK') => {
    if (sendingRef.current) return;
    const device = deviceRef.current;
    if (!device) return;

    sendingRef.current = true;
    try {
      const payload = base64.encode(cmd);
      await device.writeCharacteristicWithResponseForService(SERVICE_UUID, COMMAND_UUID, payload);
    } catch (err) {
      console.error('Lock command failed:', err);
    } finally {
      sendingRef.current = false;
    }
  }, []);

  const lock = useCallback(() => {
    if (statusRef.current === 'Locked') return;
    sendCommand('LOCK');
  }, [sendCommand]);

  const unlock = useCallback(() => {
    if (statusRef.current === 'Unlocked') return;
    sendCommand('UNLOCK');
  }, [sendCommand]);

  return { status, lock, unlock };
}
