import { AdvancedMarker, APIProvider, Map, Polygon, Polyline, useMap } from '@vis.gl/react-google-maps';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { View } from 'react-native';

const PIN_SOURCES: Record<number, string> = {
  0: require('@/assets/pins/pin0.svg'),
  1: require('@/assets/pins/pin1.svg'),
  2: require('@/assets/pins/pin2.svg'),
  3: require('@/assets/pins/pin3.svg'),
  4: require('@/assets/pins/pin4.svg'),
};

function CenterZoomAnimator({ centerLocation }: { centerLocation?: { latitude: number, longitude: number } }) {
  const map = useMap()

  useEffect(() => {
    if (!map || !centerLocation) return

    const center = { lat: centerLocation.latitude, lng: centerLocation.longitude }
    const startZoom = 3
    const endZoom = 18
    const endTilt = 60

    map.setCenter(center)
    map.setZoom(startZoom)
    map.setTilt(0)

    let zoom = startZoom
    const interval = setInterval(() => {
      zoom += 1
      map.setZoom(zoom)
      if (zoom >= endZoom) {
        clearInterval(interval)
        map.setTilt(endTilt)
      }
    }, 90)

    return () => clearInterval(interval)
  }, [map, centerLocation?.latitude, centerLocation?.longitude])

  return null
}

export default function LocalMap({
  APIKey,
  pins,
  routes,
  zones,
  centerLocation,
} : {
  APIKey?: string,
  pins?: { name: string, latitude: number, longitude: number, type: number }[]
  routes?: { latitude: number, longitude: number }[][]
  zones?: { name: string, borders: { latitude: number, longitude: number }[]}[]
  centerLocation?: { latitude: number, longitude: number }
}) {

  const pinMarkers = pins?.map((pin, index) => {
    // const pinImg = require(`../assets/pins/pin${pin.type}.png`)

    return (
      <AdvancedMarker key={index} position={{lat: pin.latitude, lng: pin.longitude}} title={pin.name}>
        <Image source={PIN_SOURCES[pin.type]} style={{ width: 50, height: 62, alignSelf: 'center' }}></Image>
      </AdvancedMarker>
    )
  })

  const routeLines = routes?.map((route, index) => (
    <Polyline
      key={index}
      path={route.map((point) => ({ lat: point.latitude, lng: point.longitude }))}
      strokeColor="#007AFF"
      strokeWeight={4}
    />
  ))

  const zonePolygons = zones?.map((zone, index) => (
    <Polygon
      key={index}
      paths={zone.borders.map((point) => ({ lat: point.latitude, lng: point.longitude }))}
      strokeColor="#2F80ED"
      strokeWeight={3}
      fillColor="rgba(47, 128, 237, 0.3)"
    />
  ))

  return (
    <View style={{flex: 1}}>
      <APIProvider apiKey={APIKey ?? ""}>
        <Map
          style={{flex: 1}}
          defaultCenter={centerLocation ? {lat: centerLocation.latitude, lng: centerLocation.longitude} : {lat: 42.2738260, lng: -71.8097721}}
          defaultZoom={centerLocation ? 3 : 15}
          gestureHandling='greedy'
          disableDefaultUI
          mapId="DEMO_MAP_ID"
        >
          <CenterZoomAnimator centerLocation={centerLocation}/>
          {pinMarkers}
          {routeLines}
          {zonePolygons}
        </Map>
      </APIProvider>
    </View>
  )
};