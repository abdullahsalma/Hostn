import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { hostService } from '../../services/host.service';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import type { UnitPermit } from '../../types';

interface PropertyPermitGroup {
  propertyId: string;
  propertyName: string;
  units: UnitPermit[];
}

const permitStatusConfig: Record<
  UnitPermit['permitStatus'],
  { bg: string; text: string; label: string }
> = {
  none: { bg: Colors.surfaceAlt, text: Colors.textSecondary, label: 'لا يوجد تصريح' },
  pending: { bg: '#fef3c7', text: '#d97706', label: 'قيد المراجعة' },
  approved: { bg: '#dcfce7', text: '#059669', label: 'معتمد' },
  rejected: { bg: '#fecaca', text: '#dc2626', label: 'مرفوض' },
};

export default function PermitsScreen() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['permits'],
    queryFn: hostService.getPermits,
  });

  const properties: PropertyPermitGroup[] = data?.data ?? [];

  const handleAddPermit = (unitId: string, unitName: string) => {
    Alert.alert(
      'إضافة تصريح',
      `سيتم إضافة تصريح وزارة السياحة للوحدة "${unitName}".\nهذه الميزة قيد التطوير.`,
      [{ text: 'حسناً', style: 'default' }],
    );
  };

  const renderPermitBadge = (permit: UnitPermit) => {
    const config = permitStatusConfig[permit.permitStatus];
    return (
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <View style={[styles.badgeDot, { backgroundColor: config.text }]} />
        <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
      </View>
    );
  };

  const renderUnitCard = (unit: UnitPermit) => (
    <Card key={unit.unitId} style={styles.unitCard}>
      <View style={styles.unitRow}>
        {unit.thumbnailUrl ? (
          <Image source={{ uri: unit.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
            <Ionicons name="home-outline" size={24} color={Colors.textTertiary} />
          </View>
        )}
        <View style={styles.unitInfo}>
          <Text style={styles.unitName}>{unit.unitName}</Text>
          <Text style={styles.unitLocation}>{unit.location}</Text>
          {renderPermitBadge(unit)}
          {unit.permitStatus === 'approved' && unit.permitNumber && (
            <Text style={styles.permitNumber}>رقم التصريح: {unit.permitNumber}</Text>
          )}
        </View>
      </View>
      {unit.permitStatus === 'none' && (
        <Button
          title="أضف التصريح"
          onPress={() => handleAddPermit(unit.unitId, unit.unitName)}
          variant="primary"
          size="sm"
          fullWidth
          style={styles.addButton}
        />
      )}
    </Card>
  );

  return (
    <ScreenWrapper>
      <HeaderBar title="تصريح وزارة السياحة" showBack />
      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isError ? (
        <EmptyState
          icon="alert-circle-outline"
          message="حدث خطأ في تحميل التصاريح"
          submessage="اسحب للأسفل للمحاولة مرة أخرى"
        />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          <TouchableOpacity style={styles.infoBanner} activeOpacity={0.7}>
            <Ionicons name="information-circle" size={22} color={Colors.primary} />
            <Text style={styles.infoBannerText}>
              تعرف على قرار وزارة السياحة رقم 2295
            </Text>
            <Ionicons name="open-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>

          {properties.length === 0 ? (
            <EmptyState
              icon="document-outline"
              message="لا توجد عقارات لعرض التصاريح"
              submessage="أضف عقاراتك أولاً لتتمكن من إدارة التصاريح"
            />
          ) : (
            properties.map((property) => (
              <View key={property.propertyId} style={styles.propertySection}>
                <View style={styles.propertyHeader}>
                  <Text style={styles.propertyName}>{property.propertyName}</Text>
                  <Text style={styles.unitCount}>
                    {property.units.length} وحدة
                  </Text>
                </View>
                {property.units.map(renderUnitCard)}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary50,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoBannerText: {
    ...Typography.small,
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  propertySection: {
    marginBottom: Spacing.xl,
  },
  propertyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  propertyName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  unitCount: {
    ...Typography.small,
    color: Colors.textSecondary,
  },
  unitCard: {
    marginBottom: Spacing.md,
  },
  unitRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
  },
  thumbnailPlaceholder: {
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  unitName: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  unitLocation: {
    ...Typography.small,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  permitNumber: {
    ...Typography.caption,
    color: Colors.success,
    textAlign: 'right',
  },
  addButton: {
    marginTop: Spacing.md,
  },
});
