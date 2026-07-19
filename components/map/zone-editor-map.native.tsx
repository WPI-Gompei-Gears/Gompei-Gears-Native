import { useRef } from 'react';
import MapView, { LatLng, Marker, Polygon } from 'react-native-maps';
import { SizableText } from 'tamagui';

export default function ZoneEditorMap({
  points,
  onChangePoint,
  onAddPoint,
  centerLocation,
} : {
  points: LatLng[]
  onChangePoint: (index: number, coordinate: LatLng) => void
  onAddPoint: (coordinate: LatLng) => void
  centerLocation?: LatLng
}) {
  const mapRef = useRef<MapView>(null)

  const initialCenter = centerLocation ?? points[0] ?? { latitude: 42.2738260, longitude: -71.8097721 }

  const markers = points.map((point, index) => (
    <Marker
      key={index}
      coordinate={point}
      draggable
      onDragEnd={(e) => onChangePoint(index, e.nativeEvent.coordinate)}
      title={`Point ${index + 1}`}
    />
  ))

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      initialRegion={{
        latitude: initialCenter.latitude,
        longitude: initialCenter.longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      }}
      onPress={(e) => {
        if (e.nativeEvent.action === 'marker-press') return
        onAddPoint(e.nativeEvent.coordinate)
      }}
    >
      {points.length > 2 && (
        <Polygon
          coordinates={points}
          strokeColor="#2F80ED"
          strokeWidth={3}
          fillColor="rgba(47, 128, 237, 0.3)"
        />
      )}
      {markers}
    </MapView>
  )
}
