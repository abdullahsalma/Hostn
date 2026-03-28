import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface SectionHeaderProps {
  title: string;
  onViewAll?: () => void;
}

export default function SectionHeader({ title, onViewAll }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      {onViewAll ? (
        <TouchableOpacity onPress={onViewAll} style={styles.viewAll} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={16} color={Colors.primary} />
          <Text style={styles.viewAllText}>عرض الكل</Text>
        </TouchableOpacity>
      ) : (
        <View />
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    ...Typography.small,
    color: Colors.primary,
  },
});
