import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TitleBar from '@/components/titlebar';
import { SizableText, Tabs, Form, Button, AnimatePresence, Spinner, Card, ScrollView, XStack, YStack } from 'tamagui';
import FormInput from '@/components/forminput';
import { useEffect, useState } from 'react';
import { Flower2, Globe2, House, Microscope, Plus, Star, Trees, Warehouse } from '@tamagui/lucide-icons-2';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { getDriveImageUrl } from '@/lib/google-drive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AdminFleet() {
  const [saving, setSaving] = useState(false)
  const [agreementUrl, setAgreementUrl] = useState("")
  const [zones, setZones] = useState<any[]>([])

  const insets = useSafeAreaInsets()

  useEffect(() => {
    getZones()
  }, [])

  async function getZones() {
    const { data } = await supabase.from('zones').select()
    setZones(data || [])
  }

  return (
        <Tabs defaultValue="settings" flex={1} mt={insets.top + 20} px={"$4"} alignItems={"center"}>
          <Tabs.List elevation={"$2"} justify={"center"} mb={"$4"} width={"max-content"}>
            <Tabs.Tab value="settings">
              <SizableText>Fleet Settings</SizableText>
            </Tabs.Tab>
            <Tabs.Tab value="zones">
              <SizableText>Zones</SizableText>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Content value="settings">
            <TitleBar title='Fleet Settings' returnLink={"/(public)"}></TitleBar>
            <Form mt={"$4"} gap={"$4"} onSubmit={() => {}}>
              <FormInput title="Agreement URL" value={agreementUrl} onChangeText={setAgreementUrl}/>
              <Form.Trigger asChild>
                <Button mx="5%">
                  Save
                  <AnimatePresence>
                    {saving ? (
                      <Spinner
                        transition="bouncy"
                        enterStyle={{ opacity: 0 }}
                        alignSelf="center"
                        key="spinner"
                        color={"white"}
                        ml="$2"
                        width={8}
                      />
                    ) : null}
                  </AnimatePresence>
                </Button>
              </Form.Trigger>
            </Form>
          </Tabs.Content>

          <Tabs.Content value="zones" flex={1}>
            <ScrollView>
              <XStack flexWrap="wrap" justify="center" gap="$3" p="$3">
                <Card
                  borderWidth={1}
                  borderColor="$borderColor"
                  elevation="$2"
                  width={140}
                  height={160}
                  borderRadius={16}
                  items="center"
                  justify="center"
                  pressStyle={{ scale: 0.95 }}
                  onPress={() => router.push('/admin/zone/new')}
                >
                  <Plus size={32} />
                  <SizableText mt="$2">Add Zone</SizableText>
                </Card>

                {zones.map((zone) => (
                  <Card
                    key={zone.id}
                    elevation="$2"
                    width={140}
                    height={160}
                    borderRadius={16}
                    overflow="hidden"
                    pressStyle={{ scale: 0.95 }}
                    onPress={() => router.push(`/admin/zone/${zone.id}`)}
                  >
                    <Card.Background>
                      {getDriveImageUrl(zone.image_url) ? (
                        <Image source={{ uri: getDriveImageUrl(zone.image_url) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                      ) : (
                        <YStack flex={1} bg="$gray4" />
                      )}
                    </Card.Background>
                    <Card.Footer p="$2" bg="rgba(0,0,0,0.45)">
                      <SizableText color="white" fontWeight="600" numberOfLines={1}>{zone.name}</SizableText>
                    </Card.Footer>
                  </Card>
                ))}
              </XStack>
            </ScrollView>
          </Tabs.Content>
        </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
});
