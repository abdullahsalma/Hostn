import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}

const menuItems: MenuItem[] = [
  { icon: 'card-outline', label: 'طريقة الدفع', route: '/financial/payment-method' },
  { icon: 'time-outline', label: 'مدة التحويل', route: '/financial/transfer-duration' },
  { icon: 'swap-horizontal-outline', label: 'الحوالات البنكية', route: '/financial/transfers' },
  { icon: 'receipt-outline', label: 'الفواتير', route: '/invoices' },
  { icon: 'document-text-outline', label: 'كشوف الحسابات', route: '/invoices/statements' },
  { icon: 'pie-chart-outline', label: 'ملخص الحسابات', route: '/invoices/summary' },
];

export default function FinancialMenuScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <HeaderBar title="المعاملات المالية" showBack />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => router.push(item.route as any)}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.textTertiary} />
            <View style={styles.menuContent}>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={24} color={Colors.primary} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  contentContainer: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.card,
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  menuLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
