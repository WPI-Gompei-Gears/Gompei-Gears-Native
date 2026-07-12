import { StyleSheet, Text, View } from 'react-native';

import NativeButton from '@/components/button/button';
import LocalMap from '@/components/map/map';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  const [bicycles, setBicycles] = useState<any[]>([])
  
  const appState = useRef(AppState.currentState)

  useEffect(() => {
    getInstruments()
    const interval = setInterval(getInstruments, 5_000)

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current !== 'active' && nextState === 'active') {
        getInstruments()
      }
      appState.current = nextState
    })

    return () => {
      clearInterval(interval)
      subscription.remove()
    }
  }, [])

  async function getInstruments() {
    const { data } = await supabase.from('bicycles').select()
    setBicycles(data || [])
  }

  const pins = bicycles.map((bicycle: any) => (
    {name: `WPI${bicycle.bike_id}`, lat: bicycle.lat, lng: bicycle.lng, type: bicycle.quality}
  ))

  return (
    <View style={{flex: 1}}>
      {/* <Text style={{marginTop: insets.top}}>{pins[0].name}</Text> */}
      <LocalMap APIKey={process.env.EXPO_PUBLIC_GMAPS_API_KEY} pins={pins}/>
      <Image style={{position: "absolute", top: insets.top + 10, left: "50%", height: 65, width: 65, transform: "translate(-50%, 0%)"}} source={require("@/assets/images/appicon240.png")}/>
      <View style={{position: "absolute", top: insets.top + 5, right: 25}}>
        <NativeButton link='/(public)/modal/account' icon={require("@/assets/images/person-crop-circle.png")}></NativeButton>
      </View>
      <View style={{position: "absolute", top: insets.top + 5, left: 25}}>
        <NativeButton link='/admin' icon={require("@/assets/images/bolt-circle.png")}></NativeButton>
      </View>
      <View style={{position: "absolute", bottom: 25, left: "50%", transform: "translate(-50%, 0%)"}}>
        <NativeButton link='/(public)/qrcode' title='Scan QR Code' icon={require("@/assets/images/qrcode.png")} ih={30} iw={30} w={300} h={60} mobileOnly></NativeButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});