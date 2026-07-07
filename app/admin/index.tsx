import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import TitleBar from '@/components/titlebar';

export default function AdminRides() {
  const [instruments, setInstruments] = useState<any[]>([])

  useEffect(() => {
    getInstruments()
  }, [])

  async function getInstruments() {
    const { data } = await supabase.from('instruments').select()
    setInstruments(data || [])
  }

  return (
      <ThemedView style={styles.container}>
        <TitleBar title='Rides' returnLink={"/(public)"}></TitleBar>
        <FlatList
          data={instruments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Text style={styles.item}>{item.data}</Text>}
        />
      </ThemedView>
  )

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
})