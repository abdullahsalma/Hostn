import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';

interface QuickCardProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  accentColor?: string;
  onPress?: () => void;
}

export default function QuickCard({
  icon,
  title,
  subtitle,
  accentColor = Colors.primary,
  onPress,
}: QuickCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={accentColor} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 100,
    ...Shadows.sm,
  },
  title: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.tiny,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
