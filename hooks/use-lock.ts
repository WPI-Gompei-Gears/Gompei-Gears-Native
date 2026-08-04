import { useCallback, useEffect, useRef, useState } from 'react';
import { BleManager, Device } from 'react-native-ble-plx';
import base64 from 'react-native-base64';

const manager = new BleManager();

const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const COMMAND_UUID = '12345678-1234-1234-1234-123456789abd';
const STATE_UUID = '12345678-1234-1234-1234-123456789abe';

const CONNECT_TIMEOUT_MS = 15000;
const CONFIRM_TIMEOUT_MS = 8000;

function decodeState(value: string): 'Locked' | 'Unlocked' | null {
  const decoded = base64.decode(value);
  return decoded.startsWith('L') ? 'Locked' : decoded.startsWith('T') ? 'Unlocked' : null;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

// Scans for `deviceName` and connects, aborting if `signal.cancelled` is set
// (used to give up cleanly when a timeout fires while the scan is still running).
function scanAndConnect(deviceName: string, signal: { cancelled: boolean }): Promise<Device> {
  return new Promise((resolve, reject) => {
    const stateSub = manager.onStateChange((state) => {
      if (state !== 'PoweredOn') return;
      stateSub.remove();

      if (signal.cancelled) {
        reject(new Error('Cancelled'));
        return;
      }

      manager.startDeviceScan(null, null, async (error, found) => {
        if (signal.cancelled) return;

        if (error) {
          manager.stopDeviceScan();
          reject(error);
          return;
        }

        if (found?.name === deviceName) {
          manager.stopDeviceScan();

          try {
            const connected = await found.connect();

            if (signal.cancelled) {
              connected.cancelConnection();
              reject(new Error('Cancelled'));
              return;
            }

            await connected.discoverAllServicesAndCharacteristics();
            resolve(connected);
          } catch (err) {
            reject(err);
          }
        }
      });
    }, true);
  });
}

// Connects to `deviceName` only for the duration of a lock()/unlock() call.
// Stays connected until the device's state characteristic actually confirms
// the requested state (or the confirmation times out), then disconnects.
export function useLock(deviceName: string) {
  const [status, setStatus] = useState<'Locked' | 'Unlocked'>('Locked');
  const [locking, setLocking] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const performAction = useCallback(async (cmd: 'LOCK' | 'UNLOCK'): Promise<boolean> => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setError(null);
    const desired = cmd === 'LOCK' ? 'Locked' : 'Unlocked';
    const setActionBusy = cmd === 'LOCK' ? setLocking : setUnlocking;
    setActionBusy(true);

    const signal = { cancelled: false };
    let device: Device | null = null;
    const monitorSubRef: { current: { remove: () => void } | null } = { current: null };

    try {
      device = await withTimeout(
        scanAndConnect(deviceName, signal),
        CONNECT_TIMEOUT_MS,
        'Could not find the lock'
      );

      const reachedDesired = new Promise<void>((resolve, reject) => {
        monitorSubRef.current = device!.monitorCharacteristicForService(
          SERVICE_UUID,
          STATE_UUID,
          (err, characteristic) => {
            if (err) {
              reject(err);
              return;
            }
            if (characteristic?.value && decodeState(characteristic.value) === desired) {
              resolve();
            }
          }
        );
      });

      const current = await device.readCharacteristicForService(SERVICE_UUID, STATE_UUID);
      const alreadyThere = current?.value ? decodeState(current.value) === desired : false;

      if (!alreadyThere) {
        const payload = base64.encode(cmd);
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, COMMAND_UUID, payload);
        await withTimeout(reachedDesired, CONFIRM_TIMEOUT_MS, 'Lock did not confirm new state');
      }

      if (mountedRef.current) setStatus(desired);
      return true;
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : 'Lock action failed');
      return false;
    } finally {
      signal.cancelled = true;
      manager.stopDeviceScan();
      monitorSubRef.current?.remove();
      device?.cancelConnection();
      busyRef.current = false;
      if (mountedRef.current) setActionBusy(false);
    }
  }, [deviceName]);

  const lock = useCallback(() => performAction('LOCK'), [performAction]);
  const unlock = useCallback(() => performAction('UNLOCK'), [performAction]);

  return { status, lock, unlock, locking, unlocking, busy: locking || unlocking, error };
}
