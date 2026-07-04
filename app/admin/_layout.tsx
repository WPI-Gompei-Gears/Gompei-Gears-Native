import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function AdminLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Rides</Label>
        <Icon sf="helm" drawable="ic_menu_home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="assets">
        <Label>Assets</Label>
        <Icon sf="house.fill" drawable="ic_menu_manage" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="users">
        <Label>Users</Label>
        <Icon sf="person.3.fill" drawable="ic_menu_manage" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <Label>Reports</Label>
        <Icon sf="exclamationmark.octagon.fill" drawable="ic_menu_manage" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="messaging">
        <Label>Messaging</Label>
        <Icon sf="message.fill" drawable="ic_menu_manage" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="fleet">
        <Label>Fleet</Label>
        <Icon sf="wrench.fill" drawable="ic_menu_manage" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
