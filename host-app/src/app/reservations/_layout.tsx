import React from 'react';
import { Stack } from 'expo-router';

export default function ReservationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackVisible: true,
        headerTitle: '',
        headerTransparent: true,
        headerTintColor: '#6d28d9',
      }}
    />
  );
}
