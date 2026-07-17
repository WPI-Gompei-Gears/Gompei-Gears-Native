import { Image } from 'expo-image';
import { useEffect, useRef } from 'react';
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
  centerLocation,
} : {
  APIKey?: string,
  pins?: { name: string, latitude: number, longitude: number, type: number }[]
  routes?: { latitude: number, longitude: number }[][]
  zones?: { name: string, borders: { latitude: number, longitude: number }[]}[]
  centerLocation?: { latitude: number, longitude: number }
}) {
  const mapRef = useRef<MapView>(null)

  useEffect(() => {
    if (!centerLocation) return
    const zoomTimer = setTimeout(() => {
      mapRef.current?.animateToRegion({
        latitude: centerLocation.latitude,
        longitude: centerLocation.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.004,
      }, 2000)
    }, 400)
    const tiltTimer = setTimeout(() => {
      mapRef.current?.animateCamera({
        center: centerLocation,
        pitch: 60,
        zoom: 19,
      }, { duration: 1200 })
    }, 2800)
    return () => {
      clearTimeout(zoomTimer)
      clearTimeout(tiltTimer)
    }
  }, [centerLocation?.latitude, centerLocation?.longitude])

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

  return <MapView ref={mapRef} style={{ flex: 1 }}
    initialRegion={{
      latitude: centerLocation?.latitude ?? 42.2738260, // Central latitude coordinate
      longitude: centerLocation?.longitude ?? -71.8097721, // Central longitude coordinate
      latitudeDelta: centerLocation ? 60 : 0.02, // Vertical span (zoom level)
      longitudeDelta: centerLocation ? 60 : 0.02, // Horizontal span (zoom level)
    }}
  >
    {pinMarkers}
    {routeLines}

  </MapView>;
}