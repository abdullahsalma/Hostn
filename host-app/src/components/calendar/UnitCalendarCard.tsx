import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import MonthGrid from './MonthGrid';

interface UnitCalendarCardProps {
  unit: { id: string; name: string; code: string; isListed: boolean };
  bookedDates: string[];
  currentMonth: number;
  currentYear: number;
}

export default function UnitCalendarCard({
  unit,
  bookedDates,
  currentMonth,
  currentYear,
}: UnitCalendarCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: unit.isListed ? Colors.success : Colors.textTertiary },
            ]}
          />
          <Text style={styles.unitName}>{unit.name}</Text>
        </View>
        <Text style={styles.unitCode}>{unit.code}</Text>
      </View>

      <MonthGrid
        year={currentYear}
        month={currentMonth}
        bookedDates={bookedDates}
        unitName={unit.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unitName: {
    ...Typography.smallBold,
    color: Colors.textPrimary,
  },
  unitCode: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
