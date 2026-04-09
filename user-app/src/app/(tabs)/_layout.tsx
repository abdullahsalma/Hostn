import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../i18n';
import { Colors, Typography, Shadows } from '../../constants/theme';
import type { TranslationKey } from '../../i18n';

type TabIcon = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ITEMS: { name: string; titleKey: TranslationKey; icon: TabIcon; iconFocused: TabIcon }[] = [
  { name: 'index', titleKey: 'tab.search', icon: 'search-outline', iconFocused: 'search' },
  { name: 'favorites', titleKey: 'tab.favorites', icon: 'heart-outline', iconFocused: 'heart' },
  { name: 'bookings', titleKey: 'tab.bookings', icon: 'calendar-outline', iconFocused: 'calendar' },
  { name: 'conversations', titleKey: 'tab.chat', icon: 'chatbubble-outline', iconFocused: 'chatbubble' },
  { name: 'more', titleKey: 'tab.more', icon: 'menu-outline', iconFocused: 'menu' },
];

export default function TabsLayout() {
  const { t } = useLanguage();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          ...Typography.tiny,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          ...Shadows.bottomBar,
        },
      }}
    >
      {TAB_ITEMS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.titleKey),
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons name={focused ? tab.iconFocused : tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
