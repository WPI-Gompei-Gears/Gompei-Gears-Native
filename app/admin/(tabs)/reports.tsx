import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import TitleBar from '@/components/titlebar';

export default function AdminReports() {
  return (
    <ThemedView style={styles.container}>
      <TitleBar title='Reports' returnLink={"/(public)"}></TitleBar>
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
