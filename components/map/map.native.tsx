import { Image } from 'expo-image';
import MapView, { MapPolyline, Marker, Polygon, Polyline } from 'react-native-maps';

const PIN_SOURCES: Record<number, string> = {
  0: require('@/assets/pins/pin0.svg'),
  1: require('@/assets/pins/pin1.svg'),
  2: require('@/assets/pins/pin2.svg'),
  3: require('@/assets/pins/pin3.svg'),
  4: require('@/assets/pins/pin4.svg'),
};

export default function LocalMap({
  APIKey,
  pins,
  routes,
  zones,
} : {
  APIKey?: string,
  pins?: { name: string, latitude: number, longitude: number, type: number }[]
  routes?: { latitude: number, longitude: number }[][]
  zones?: { name: string, borders: { latitude: number, longitude: number }[]}[]
}) {
  const pinMarkers = pins?.map((pin, index) => {
      // const pinImg = require(`../assets/pins/pin${pin.type}.png`)
  
      return (
        <Marker
          key={index}
          title={pin.name}
          coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
        >
          <Image source={PIN_SOURCES[pin.type]} style={{ width: 50, height: 62, transform: "translate(0%, -50%)" }}></Image>
        </Marker>
      )
    })

  const routeLines = routes?.map((route, index) => {
    return (
      <Polyline
        key={index}
        coordinates={route}
        strokeColor="#007AFF"
        strokeWidth={4}
      >
      </Polyline>
    )
  })

  const zonePolygons = zones?.map((zone, index) => {
    return (
      <Polygon
        coordinates={zone.borders}
        strokeColor="#2F80ED" // Line color
        strokeWidth={3}        // Line thickness
        fillColor="rgba(47, 128, 237, 0.3)" // Shape interior color
      >
      </Polygon>
    )
  })

  return <MapView style={{ flex: 1 }} 
    initialRegion={{
      latitude: 42.2738260, // Central latitude coordinate
      longitude: -71.8097721, // Central longitude coordinate
      latitudeDelta: 0.02, // Vertical span (zoom level)
      longitudeDelta: 0.02, // Horizontal span (zoom level)
    }}
  >
    {pinMarkers}
    {routeLines}

  </MapView>;
}