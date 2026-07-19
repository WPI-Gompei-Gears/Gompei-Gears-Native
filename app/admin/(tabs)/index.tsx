import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TitleBar from '@/components/titlebar';

export default function AdminRides() {
  const insets = useSafeAreaInsets()

  const [instruments, setInstruments] = useState<any[]>([])

  useEffect(() => {
    getInstruments()
  }, [])

  async function getInstruments() {
    const { data } = await supabase.from('instruments').select()
    setInstruments(data || [])
  }

  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginTop: insets.top
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
})

  return (
      <View style={styles.container}>
        <TitleBar title='Rides' returnLink={"/(public)"}></TitleBar>
        <FlatList
          data={instruments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Text style={styles.item}>{item.data}</Text>}
        />
      </View>
  )

}