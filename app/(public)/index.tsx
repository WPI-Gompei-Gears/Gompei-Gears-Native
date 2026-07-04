import { StyleSheet, View } from 'react-native';

import NativeButton from '@/components/button/button';
import LocalMap from '@/components/map/map';
import { Image } from 'expo-image';

export default function HomeScreen() {
  return (
    <View style={{flex: 1}}>
      <LocalMap APIKey={process.env.EXPO_PUBLIC_GMAPS_API_KEY} pins={[{lat: 42.274, lng: -71.81, type: 2}]}/>
      <Image style={{position: "absolute", top: 60, left: "50%", height: 65, width: 65, transform: "translate(-50%, 0%)"}} source={require("@/assets/images/appicon240.png")}/>
      <View style={{position: "absolute", top: 65, right: 25}}>
        <NativeButton link='/(public)/modal/account' icon={require("@/assets/images/person-crop-circle.png")}></NativeButton>
      </View>
      <View style={{position: "absolute", top: 65, left: 25}}>
        <NativeButton link='/admin' icon={require("@/assets/images/hammer.png")} iw={30} ih={30}></NativeButton>
      </View>
      <View style={{position: "absolute", bottom: 25, left: "50%", transform: "translate(-50%, 0%)"}}>
        <NativeButton link='/(public)/qrcode' title='Scan QR Code' icon={require("@/assets/images/qrcode.png")} ih={30} iw={30} w={300} h={60}></NativeButton>
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