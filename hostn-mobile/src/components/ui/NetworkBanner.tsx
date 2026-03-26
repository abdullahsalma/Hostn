import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { t } from '../../utils/i18n';

export default function NetworkBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const height = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Use a simple connectivity check via fetch
    let interval: ReturnType<typeof setInterval>;
    let mounted = true;

    const checkConnection = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch('https://hostn-backend-production.up.railway.app/api/health', {
          method: 'HEAD',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (mounted) setIsOffline(false);
      } catch {
        if (mounted) setIsOffline(true);
      }
    };

    // Check every 30 seconds
    interval = setInterval(checkConnection, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    Animated.timing(height, {
      toValue: isOffline ? 44 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isOffline]);

  const handleRetry = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      await fetch('https://hostn-backend-production.up.railway.app/api/health', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      setIsOffline(false);
    } catch {
      // Still offline
    }
  };

  return (
    <Animated.View style={[styles.banner, { height }]}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={18} color={Colors.textWhite} />
        <Text style={styles.text}>{t('common.noInternet')}</Text>
        <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.error,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    height: 44,
  },
  text: {
    ...Typography.small,
    color: Colors.textWhite,
    marginHorizontal: Spacing.sm,
  },
  retryButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  retryText: {
    ...Typography.caption,
    color: Colors.textWhite,
    fontWeight: '600',
  },
});
