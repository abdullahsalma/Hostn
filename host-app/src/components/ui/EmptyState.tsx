import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface Props {
  icon?: string;
  message: string;
  submessage?: string;
}

export default function EmptyState({ icon = 'file-tray-outline', message, submessage }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={56} color={Colors.textTertiary} />
      <Text style={styles.message}>{message}</Text>
      {submessage && <Text style={styles.submessage}>{submessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  message: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.base,
  },
  submessage: {
    ...Typography.small,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
