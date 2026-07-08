import { Feather } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { colors } from '@/src/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.amber,
        tabBarInactiveTintColor: colors.mistMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarStyle: {
          backgroundColor: colors.inkRaised,
          borderTopColor: colors.line,
          minHeight: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'circle.hexagongrid.circle',
              }}
              fallback={<Feather color={color} name="home" size={24} />}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'square.grid.2x2',
              }}
              fallback={<Feather color={color} name="grid" size={24} />}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'lock.shield',
              }}
              fallback={<Feather color={color} name="shield" size={24} />}
              tintColor={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
