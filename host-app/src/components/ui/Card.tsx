import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  padded?: boolean;
}

export default function Card({ children, onPress, style, padded = true }: Props) {
  const content = (
    <View style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    ...Shadows.card,
  },
  padded: {
    padding: Spacing.base,
  },
});
