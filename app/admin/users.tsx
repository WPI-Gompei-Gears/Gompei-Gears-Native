import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TitleBar from '@/components/titlebar';

export default function AdminUsers() {
  return (
    <ThemedView style={styles.container}>
      <TitleBar title='Users' returnLink={"/(public)"}></TitleBar>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 15,
  },
});
