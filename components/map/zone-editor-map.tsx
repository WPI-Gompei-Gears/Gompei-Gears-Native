import { AdvancedMarker, APIProvider, Map, Polygon } from '@vis.gl/react-google-maps';
import { View } from 'react-native';

type ZonePoint = { latitude: number, longitude: number }

export default function ZoneEditorMap({
  APIKey,
  points,
  onChangePoint,
  onAddPoint,
  centerLocation,
} : {
  APIKey?: string
  points: ZonePoint[]
  onChangePoint: (index: number, coordinate: ZonePoint) => void
  onAddPoint: (coordinate: ZonePoint) => void
  centerLocation?: ZonePoint
}) {
  const initialCenter = centerLocation ?? points[0] ?? { latitude: 42.2738260, longitude: -71.8097721 }

  const markers = points.map((point, index) => (
    <AdvancedMarker
      key={index}
      position={{ lat: point.latitude, lng: point.longitude }}
      draggable
      onDragEnd={(e) => {
        if (!e.latLng) return
        onChangePoint(index, { latitude: e.latLng.lat(), longitude: e.latLng.lng() })
      }}
      title={`Point ${index + 1}`}
    />
  ))

  return (
    <View style={{ flex: 1 }}>
      <APIProvider apiKey={APIKey ?? ""}>
        <Map
          style={{ flex: 1 }}
          defaultCenter={{ lat: initialCenter.latitude, lng: initialCenter.longitude }}
          defaultZoom={18}
          gestureHandling='greedy'
          disableDefaultUI
          mapId="DEMO_MAP_ID"
          onClick={(e) => {
            if (!e.detail.latLng) return
            onAddPoint({ latitude: e.detail.latLng.lat, longitude: e.detail.latLng.lng })
          }}
        >
          {points.length > 2 && (
            <Polygon
              paths={points.map((point) => ({ lat: point.latitude, lng: point.longitude }))}
              strokeColor="#2F80ED"
              strokeWeight={3}
              fillColor="rgba(47, 128, 237, 0.3)"
            />
          )}
          {markers}
        </Map>
      </APIProvider>
    </View>
  )
}
