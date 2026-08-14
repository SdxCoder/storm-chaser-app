import { Tabs } from 'expo-router';

import { useAppTheme } from '../../src/theme/use-app-theme';

export default function TabLayout() {
  const { colors } = useAppTheme();

  return (
    <Tabs
      initialRouteName="weather"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.action,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="weather"
        options={{
          title: 'Weather',
          tabBarAccessibilityLabel: 'Weather tab',
        }}
      />
      <Tabs.Screen
        name="document"
        options={{
          title: 'Document',
          tabBarAccessibilityLabel: 'Document storm tab',
        }}
      />
      <Tabs.Screen
        name="storm-log"
        options={{
          title: 'Storm Log',
          tabBarAccessibilityLabel: 'Storm Log tab',
        }}
      />
    </Tabs>
  );
}
