import React, { forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<TextInput, Props>(({ label, error, icon, style, ...props }, ref) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={Colors.textTertiary}
          textAlign="right"
          {...props}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
});

Input.displayName = 'Input';
export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.base,
  },
  label: {
    ...Typography.smallBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: Colors.error,
  },
  icon: {
    paddingHorizontal: Spacing.md,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  error: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});
