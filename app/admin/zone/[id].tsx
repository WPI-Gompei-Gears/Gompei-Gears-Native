import TitleBar from '@/components/titlebar';
import ZoneEditorMap from '@/components/map/zone-editor-map';
import { supabase } from '@/lib/supabase';
import { getDriveImageUrl } from '@/lib/google-drive';
import { Plus, Trash2 } from '@tamagui/lucide-icons-2';
import { router, useLocalSearchParams } from 'expo-router';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Input, Sheet, SizableText, XStack, YStack } from 'tamagui';

type ZonePoint = { latitude: number, longitude: number }

const DEFAULT_CENTER: ZonePoint = { latitude: 42.2738260, longitude: -71.8097721 }

function defaultPoints(center: ZonePoint): ZonePoint[] {
  const d = 0.0015
  return [
    { latitude: center.latitude + d, longitude: center.longitude - d },
    { latitude: center.latitude + d, longitude: center.longitude + d },
    { latitude: center.latitude - d, longitude: center.longitude + d },
    { latitude: center.latitude - d, longitude: center.longitude - d },
  ]
}

export default function AdminZoneEditor() {
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id: string }>()
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [points, setPoints] = useState<ZonePoint[]>(defaultPoints(DEFAULT_CENTER))
  const [imageUrl, setImageUrl] = useState('')
  const [sheetOpen, setSheetOpen] = useState(true)
  const [sheetPosition, setSheetPosition] = useState(1)

  useEffect(() => {
    if (!isNew && id) fetchZone()
  }, [id])

  async function fetchZone() {
    setLoading(true)
    const { data, error } = await supabase.from('zones').select().eq('id', id).single()
    if (error) {
      Alert.alert('Error loading zone', error.message)
    } else if (data) {
      setName(data.name ?? '')
      setImageUrl(data.image_url ?? '')
      const loadedPoints: ZonePoint[] = Array.isArray(data.points) ? data.points : []
      setPoints(loadedPoints.length >= 4 ? loadedPoints : defaultPoints(DEFAULT_CENTER))
    }
    setLoading(false)
  }

  function updatePoint(index: number, coordinate: ZonePoint) {
    setPoints((prev) => prev.map((point, i) => (i === index ? coordinate : point)))
  }

  function addPoint(coordinate: ZonePoint) {
    setPoints((prev) => [...prev, coordinate])
  }

  function removePoint(index: number) {
    if (points.length <= 4) {
      Alert.alert('A zone needs at least four points')
      return
    }
    setPoints((prev) => prev.filter((_, i) => i !== index))
  }

  async function saveZone() {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please give this zone a name.')
      return
    }
    if (points.length < 4) {
      Alert.alert('Not enough points', 'A zone needs at least four points.')
      return
    }
    setSaving(true)
    try {
      const payload = { name: name.trim(), image_url: imageUrl.trim() || null, points }
      const { error } = isNew
        ? await supabase.from('zones').insert(payload)
        : await supabase.from('zones').update(payload).eq('id', id)
      if (error) throw error
      router.push(`/admin/zone/${id}`)
    } catch (error: any) {
      Alert.alert('Error saving zone', error?.message ?? String(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const pointRows = points.map((point, index) => (
    <XStack key={index} justify="space-between" items="center" py="$2" borderBottomWidth={1} borderColor="$borderColor">
      <SizableText size="$3">Point {index + 1}: {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}</SizableText>
      <Button size="$2" circular icon={Trash2} disabled={points.length <= 4} onPress={() => removePoint(index)} />
    </XStack>
  ))

  const previewUri = getDriveImageUrl(imageUrl)

  return (
    <View style={styles.container}>
      <ZoneEditorMap
        APIKey={process.env.EXPO_PUBLIC_GMAPS_API_KEY}
        points={points}
        onChangePoint={updatePoint}
        onAddPoint={addPoint}
        centerLocation={points[0]}
      />
      <Card borderRadius={20} px="$2" elevation={5} width={"90%"} left={"5%"} position='absolute' top={insets.top}>
        <TitleBar title={isNew ? 'New Zone' : 'Edit Zone'} returnLink={"/admin"}></TitleBar>
      </Card>
      <Sheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        position={sheetPosition}
        onPositionChange={setSheetPosition}
        snapPoints={[55, 30]}
        dismissOnSnapToBottom={false}
        modal={false}
        zIndex={100_000}
      >
        <Sheet.Handle />
        <GlassView style={{ height: "100%", borderRadius: 20, marginHorizontal: "2.5%" }}>
          <Sheet.Frame pt="$2" style={ isLiquidGlassAvailable() ? {backgroundColor: "rgba(0,0,0,0)"} : {backgroundColor: "rgb(228,228,228)"}}>
            <Sheet.ScrollView>
              <YStack gap="$3" px="$4" pb={40}>
                <YStack gap="$2">
                  <SizableText size="$3" fontWeight="600">Zone name</SizableText>
                  <Input value={name} onChangeText={setName} placeholder="e.g. Founders Hall Rack" />
                </YStack>

                <YStack gap="$2">
                  <SizableText size="$3" fontWeight="600">Zone image</SizableText>
                  <XStack items="center" gap="$3">
                    {previewUri ? (
                      <Image source={{ uri: previewUri }} style={{ width: 72, height: 72, borderRadius: 12 }} />
                    ) : (
                      <View style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: 'rgba(128,128,128,0.2)' }} />
                    )}
                    <Input
                      flex={1}
                      value={imageUrl}
                      onChangeText={setImageUrl}
                      placeholder="Paste a Google Drive share link"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </XStack>
                  <SizableText size="$2" opacity={0.6}>The file must be shared as "Anyone with the link".</SizableText>
                </YStack>

                <YStack gap="$2">
                  <XStack justify="space-between" items="center">
                    <SizableText size="$3" fontWeight="600">Points ({points.length})</SizableText>
                    <Button size="$2" circular icon={Plus} onPress={() => addPoint(points[points.length - 1] ?? DEFAULT_CENTER)} />
                  </XStack>
                  <SizableText size="$2" opacity={0.6}>Tap the map to add a point, or { Platform.OS == "web" ? "drag" : "tap and hold"} markers to reposition them.</SizableText>
                  {pointRows}
                </YStack>

                <Button theme="blue" onPress={saveZone} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Zone'}
                </Button>
              </YStack>
            </Sheet.ScrollView>
          </Sheet.Frame>
        </GlassView>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
