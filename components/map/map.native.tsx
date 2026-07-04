import { Image } from 'expo-image';
import MapView, { Marker } from 'react-native-maps';

const PIN_SOURCES: Record<number, string> = {
  0: require('@/assets/pins/pin0.svg'),
  1: require('@/assets/pins/pin1.svg'),
  2: require('@/assets/pins/pin2.svg'),
  3: require('@/assets/pins/pin3.svg'),
  4: require('@/assets/pins/pin4.svg'),
};

export default function LocalMap({
  APIKey,
  pins
} : {
  APIKey: string,
  pins?: { lat: number, lng: number, type: number }[]
}) {
  const pinMarkers = pins?.map((pin, index) => {
      // const pinImg = require(`../assets/pins/pin${pin.type}.png`)
  
      return (
        <Marker
          key={index}
          title='Bike Pin'
          coordinate={{ latitude: pin.lat, longitude: pin.lng }}
        >
          <Image source={PIN_SOURCES[pin.type]} style={{ width: 50, height: 62, transform: "translate(0%, -50%)" }}></Image>
        </Marker>
      )
    })

  return <MapView style={{ flex: 1 }} >
    {pinMarkers}
  </MapView>;
}