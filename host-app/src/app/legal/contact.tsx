import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import { hostService } from '../../services/host.service';
import type { SupportInfo } from '../../types';

const FALLBACK_SUPPORT: SupportInfo = {
  hoursStart: '10 \u0635\u0628\u0627\u062D\u0627\u064B',
  hoursEnd: '12 \u0645\u0646\u062A\u0635\u0641 \u0627\u0644\u0644\u064A\u0644',
  days: '\u0637\u0648\u0627\u0644 \u0623\u064A\u0627\u0645 \u0627\u0644\u0623\u0633\u0628\u0648\u0639',
  phone: '920007858',
};

export default function ContactScreen() {
  const router = useRouter();

  const { data } = useQuery<{ data: SupportInfo }>({
    queryKey: ['supportInfo'],
    queryFn: hostService.getSupportInfo,
  });

  const support = data?.data ?? FALLBACK_SUPPORT;
  const formattedPhone = '9200 07858';

  return (
    <ScreenWrapper>
      <HeaderBar title={'\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627'} showBack />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="happy-outline" size={64} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>{'\u0646\u062E\u062F\u0645\u0643 \u0628\u0639\u064A\u0648\u0646\u0646\u0627'}</Text>
          <Text style={styles.hoursText}>
            {'\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644: '}{support.hoursStart}{' - '}{support.hoursEnd}
          </Text>
        </View>

        {/* Action Cards */}
        <View style={styles.cardsContainer}>
          {/* Chat Card */}
          <TouchableOpacity
            style={[styles.actionCard, styles.chatCard]}
            onPress={() => router.push('/messages/support' as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIconCircle, { backgroundColor: Colors.primary100 }]}>
              <Ionicons name="chatbubbles-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.cardTitle}>{'\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A'}</Text>
            <Text style={styles.cardDescription}>{'\u062A\u062D\u062F\u062B \u0645\u0639\u0646\u0627 \u0645\u0628\u0627\u0634\u0631\u0629'}</Text>
            <View style={[styles.cardButton, { backgroundColor: Colors.primary }]}>
              <Text style={styles.cardButtonText}>{'\u0627\u0628\u062F\u0623 \u0645\u062D\u0627\u062F\u062B\u0629'}</Text>
              <Ionicons name="arrow-back" size={16} color={Colors.textWhite} />
            </View>
          </TouchableOpacity>

          {/* Call Card */}
          <TouchableOpacity
            style={[styles.actionCard, styles.callCard]}
            onPress={() => Linking.openURL('tel:920007858')}
            activeOpacity={0.7}
          >
            <View style={[styles.cardIconCircle, { backgroundColor: '#dcfce7' }]}>
              <Ionicons name="call-outline" size={32} color={Colors.success} />
            </View>
            <Text style={styles.cardTitle}>{'\u0645\u0631\u0643\u0632 \u0627\u0644\u0627\u062A\u0635\u0627\u0644'}</Text>
            <Text style={styles.cardPhone}>{formattedPhone}</Text>
            <View style={[styles.cardButton, { backgroundColor: Colors.success }]}>
              <Text style={styles.cardButtonText}>{'\u0627\u062A\u0635\u0644 \u0627\u0644\u0622\u0646'}</Text>
              <Ionicons name="call" size={16} color={Colors.textWhite} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  hoursText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: Spacing.base,
    marginTop: Spacing.lg,
  },
  actionCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.card,
  },
  chatCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  callCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  cardIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cardDescription: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
    textAlign: 'center',
  },
  cardPhone: {
    ...Typography.h3,
    color: Colors.textSecondary,
    marginBottom: Spacing.base,
    letterSpacing: 2,
    textAlign: 'center',
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    width: '100%',
  },
  cardButtonText: {
    ...Typography.bodyBold,
    color: Colors.textWhite,
  },
});
