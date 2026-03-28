import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../../../components/layout/ScreenWrapper';
import HeaderBar from '../../../components/layout/HeaderBar';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../../constants/theme';
import { hostService } from '../../../services/host.service';

type Tab = 'details' | 'arrival';

const SUITABILITY_MAP: Record<string, string> = {
  families_and_singles: 'عوائل وعزاب',
  families_only: 'عوائل فقط',
  singles_only: 'عزاب فقط',
};

export default function UnitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('details');

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['unit', id],
    queryFn: () => hostService.getUnit(id!),
    enabled: !!id,
  });

  const unit = data?.data;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <ScreenWrapper>
        <HeaderBar title="..." showBack />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (isError || !unit) {
    return (
      <ScreenWrapper>
        <HeaderBar title="خطأ" showBack />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>حدث خطأ في تحميل بيانات الوحدة</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const isListed = unit.status === 'listed';

  return (
    <ScreenWrapper>
      <HeaderBar title={unit.name} showBack />

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.tabActive]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.tabTextActive]}>
            تفاصيل الوحدة
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'arrival' && styles.tabActive]}
          onPress={() => setActiveTab('arrival')}
        >
          <Text style={[styles.tabText, activeTab === 'arrival' && styles.tabTextActive]}>
            تعليمات الوصول
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={Colors.primary} />
        }
      >
        {activeTab === 'details' ? (
          <DetailsTab unit={unit} isListed={isListed} />
        ) : (
          <ArrivalTab arrivalInstructions={unit.arrivalInstructions} />
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

/* ─── Details Tab ─── */

interface DetailsTabProps {
  unit: NonNullable<ReturnType<typeof useUnitData>>;
  isListed: boolean;
}

function useUnitData() {
  return null as any;
}

function DetailsTab({ unit, isListed }: { unit: any; isListed: boolean }) {
  return (
    <>
      {/* Status badge */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, isListed ? styles.statusListed : styles.statusUnlisted]}>
          <View
            style={[styles.statusDot, { backgroundColor: isListed ? Colors.success : Colors.textTertiary }]}
          />
          <Text style={[styles.statusText, { color: isListed ? Colors.success : Colors.textTertiary }]}>
            {isListed ? 'معروض' : 'غير معروض'}
          </Text>
        </View>
        <EditButton />
      </View>

      {/* Photo gallery placeholder */}
      <View style={styles.gallerySection}>
        <SectionHeader title="الصور" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryScroll}>
          {(unit.photos?.length > 0 || unit.images?.length > 0)
            ? (unit.photos ?? unit.images).map((photo: string, i: number) => (
                <View key={`photo-${i}`} style={styles.photoPlaceholder}>
                  <Ionicons name="image-outline" size={24} color={Colors.textTertiary} />
                </View>
              ))
            : Array.from({ length: 4 }).map((_, i) => (
                <View key={`placeholder-${i}`} style={styles.photoPlaceholder}>
                  <Ionicons name="image-outline" size={24} color={Colors.textTertiary} />
                </View>
              ))}
        </ScrollView>
      </View>

      {/* Info rows */}
      <View style={styles.section}>
        <SectionHeader title="معلومات الوحدة" />
        <InfoRow label="اسم الوحدة" value={unit.name} />
        <InfoRow label="رمز الوحدة" value={unit.code} />
        <InfoRow label="المساحة" value={unit.area ? `${unit.area} م²` : '-'} />
        <InfoRow label="التصنيف" value={unit.classification ?? '-'} />
      </View>

      {/* Booking terms */}
      <View style={styles.section}>
        <SectionHeader title="شروط الحجز" />
        <InfoRow
          label="مبلغ التأمين"
          value={
            (unit.securityDeposit ?? unit.deposit)
              ? `${unit.securityDeposit ?? unit.deposit} ريال`
              : '-'
          }
        />
        <InfoRow label="سياسة الإلغاء" value={unit.cancellationPolicy ?? '-'} />
      </View>

      {/* Description */}
      {unit.description ? (
        <View style={styles.section}>
          <SectionHeader title="الوصف" />
          <Text style={styles.descriptionText}>{unit.description}</Text>
        </View>
      ) : null}

      {/* Suitability */}
      <View style={styles.section}>
        <SectionHeader title="لمن تناسب هذه الوحدة؟" />
        <Text style={styles.suitabilityText}>
          {SUITABILITY_MAP[unit.suitability] ?? unit.suitability ?? '-'}
        </Text>
      </View>
    </>
  );
}

/* ─── Arrival Tab ─── */

function ArrivalTab({ arrivalInstructions }: { arrivalInstructions?: string }) {
  return (
    <View style={styles.section}>
      <SectionHeader title="تعليمات الوصول" />
      <Text style={styles.descriptionText}>
        {arrivalInstructions || 'لم تتم إضافة تعليمات الوصول بعد'}
      </Text>
    </View>
  );
}

/* ─── Shared sub-components ─── */

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <EditButton />
    </View>
  );
}

function EditButton() {
  return (
    <TouchableOpacity style={styles.editButton} activeOpacity={0.6}>
      <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoValue}>{value}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
  );
}

/* ─── Styles ─── */

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  errorText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },

  /* Tabs */
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Typography.smallBold,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },

  /* Scroll */
  scrollView: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },

  /* Status row */
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  statusListed: {
    backgroundColor: '#dcfce7',
  },
  statusUnlisted: {
    backgroundColor: Colors.surfaceAlt,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },

  /* Gallery */
  gallerySection: {
    marginBottom: Spacing.base,
  },
  galleryScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  photoPlaceholder: {
    width: 100,
    height: 80,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Sections */
  section: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },

  /* Edit button */
  editButton: {
    padding: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary50,
  },

  /* Info rows */
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: Spacing.md,
  },

  /* Text blocks */
  descriptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'right',
    lineHeight: 24,
  },
  suitabilityText: {
    ...Typography.body,
    color: Colors.primary,
    textAlign: 'right',
    fontWeight: '500',
  },
});
