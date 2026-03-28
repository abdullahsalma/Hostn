import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../constants/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.white },
        animation: 'slide_from_left',
      }}
    >
      <Stack.Screen name="phone-entry" />
      <Stack.Screen name="phone-login" />
      <Stack.Screen name="otp-verify" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
