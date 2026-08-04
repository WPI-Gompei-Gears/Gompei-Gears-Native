import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { supabase } from '@/lib/supabase';
import { attemptLockConnection } from './use-lock';

// ~40 feet — inside the requested 10-50ft range, expressed in meters since
// that's the unit Location.watchPositionAsync's distanceInterval expects.
const MIN_MOVEMENT_METERS = 12;

// While mounted, watches the user's location and, whenever it moves more
// than MIN_MOVEMENT_METERS, attempts a BLE connection to `deviceName`. A
// successful connection means the phone is physically near the bike's lock,
// so that fix gets logged to sidewalk_locations as a "Phone" measurement —
// a supplementary, more precise source alongside the Sidewalk network relay.
export function useLocationLockSync(deviceName: string, sidewalkId: string | null) {
  const busyRef = useRef(false);

  useEffect(() => {
    if (!sidewalkId) return;

    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: MIN_MOVEMENT_METERS,
        },
        async (location) => {
          if (busyRef.current) return;
          busyRef.current = true;

          try {
            const connected = await attemptLockConnection(deviceName);
            if (!connected) return;

            await supabase.from('sidewalk_locations').insert({
              wireless_device_id: sidewalkId,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              horizontal_accuracy_m: location.coords.accuracy,
              measurement_type: 'Phone',
              resolved_at: new Date().toISOString(),
              payload: {},
            });
          } finally {
            busyRef.current = false;
          }
        }
      );

      if (cancelled) subscription.remove();
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [deviceName, sidewalkId]);
}
