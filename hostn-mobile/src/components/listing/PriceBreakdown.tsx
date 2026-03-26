import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';

interface PriceBreakdownProps {
  pricePerNight: number;
  nights: number;
  discount?: number;
  serviceFee?: number;
  vatRate?: number;
}

function PriceBreakdown({
  pricePerNight,
  nights,
  discount = 0,
  serviceFee = 0,
  vatRate = 0.15,
}: PriceBreakdownProps) {
  const subtotal = pricePerNight * nights;
  const afterDiscount = subtotal - discount;
  const vat = Math.round(afterDiscount * vatRate);
  const total = afterDiscount + serviceFee + vat;

  return (
    <View style={styles.container}>
      <Row
        label={`${formatCurrency(pricePerNight)} x ${nights} night${nights > 1 ? 's' : ''}`}
        value={formatCurrency(subtotal)}
      />
      {discount > 0 && (
        <Row
          label="Discount"
          value={`-${formatCurrency(discount)}`}
          valueColor={Colors.success}
        />
      )}
      {serviceFee > 0 && (
        <Row label="Service fee" value={formatCurrency(serviceFee)} />
      )}
      <Row label={`VAT (${(vatRate * 100).toFixed(0)}%)`} value={formatCurrency(vat)} />
      <View style={styles.divider} />
      <Row label="Total" value={formatCurrency(total)} bold />
    </View>
  );
}

function Row({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, bold && styles.boldText]}>{label}</Text>
      <Text
        style={[
          styles.value,
          bold && styles.boldText,
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default memo(PriceBreakdown);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.card,
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  value: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  boldText: {
    fontWeight: '700',
    color: Colors.textPrimary,
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xs,
  },
});
