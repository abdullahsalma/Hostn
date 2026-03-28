import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

interface MonthGridProps {
  year: number;
  month: number; // 0-based
  bookedDates: string[]; // ISO date strings
  unitName: string;
}

const DAY_HEADERS = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const CELL_SIZE = 32;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOffset(year: number, month: number): number {
  // Sunday = 0 in JS Date. Our grid starts on Sunday (ح).
  return new Date(year, month, 1).getDay();
}

function formatDateISO(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export default function MonthGrid({ year, month, bookedDates, unitName }: MonthGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOffset = getFirstDayOffset(year, month);

  const bookedSet = React.useMemo(() => new Set(bookedDates), [bookedDates]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOffset; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.monthLabel}>
        {ARABIC_MONTHS[month]} {year}
      </Text>

      <View style={styles.headerRow}>
        {DAY_HEADERS.map((day, i) => (
          <View key={i} style={styles.headerCell}>
            <Text style={styles.headerText}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={`empty-${i}`} style={styles.cell} />;
          }

          const dateStr = formatDateISO(year, month, day);
          const isBooked = bookedSet.has(dateStr);

          return (
            <View
              key={day}
              style={[styles.cell, isBooked && styles.cellBooked]}
            >
              <Text style={[styles.dayText, isBooked && styles.dayTextBooked]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.unitLabel}>{unitName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  monthLabel: {
    ...Typography.smallBold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  headerCell: {
    width: CELL_SIZE,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    ...Typography.tiny,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: CELL_SIZE * 7,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  cellBooked: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  dayTextBooked: {
    color: Colors.textWhite,
    fontWeight: '600',
  },
  unitLabel: {
    ...Typography.tiny,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
