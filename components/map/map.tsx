import { AdvancedMarker, APIProvider, Map } from '@vis.gl/react-google-maps';
import { Image } from 'expo-image';
import { View } from 'react-native';

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
  APIKey?: string,
  pins?: { name: string, lat: number, lng: number, type: number }[]
}) {

  const pinMarkers = pins?.map((pin, index) => {
    // const pinImg = require(`../assets/pins/pin${pin.type}.png`)

    return (
      <AdvancedMarker key={index} position={{lat: pin.lat, lng: pin.lng}} title={pin.name}>
        <Image source={PIN_SOURCES[pin.type]} style={{ width: 50, height: 62, alignSelf: 'center' }}></Image>
      </AdvancedMarker>
    )
  })

  return (
    <View style={{flex: 1}}>
      <APIProvider apiKey={APIKey ?? ""}>
        <Map
          style={{flex: 1}}
          defaultCenter={{lat: 42.2738260, lng: -71.8097721}}
          defaultZoom={15}
          gestureHandling='greedy'
          disableDefaultUI
          mapId="DEMO_MAP_ID"
        >
          {pinMarkers}
        </Map>
      </APIProvider>
    </View>
  )
};