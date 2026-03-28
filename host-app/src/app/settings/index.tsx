import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';

interface MenuItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const menuItems: MenuItem[] = [
  {
    label: '\u0645\u062F\u0631\u0627\u0621 \u0627\u0644\u062D\u062C\u0648\u0632\u0627\u062A',
    icon: 'people-outline',
    route: '/settings/managers',
  },
  {
    label: '\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062D\u062C\u0632',
    icon: 'calendar-outline',
    route: '/settings/booking-rules',
  },
  {
    label: '\u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629',
    icon: 'receipt-outline',
    route: '/settings/vat',
  },
];

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper backgroundColor={Colors.surface}>
      <HeaderBar title={'\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A'} showBack />
      <View style={styles.container}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.route}
            style={styles.card}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-back" size={20} color={Colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.base,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
});
