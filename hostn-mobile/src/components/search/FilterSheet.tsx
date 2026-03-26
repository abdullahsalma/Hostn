import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import Button from '../ui/Button';
import { useSearchStore } from '../../store/searchStore';
import { PROPERTY_TYPES } from '../../constants/config';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: () => void;
}

const SORT_OPTIONS = [
  { label: 'Recommended', value: '-ratings.average' },
  { label: 'Price: Low to High', value: 'pricing.perNight' },
  { label: 'Price: High to Low', value: '-pricing.perNight' },
  { label: 'Highest Rated', value: '-ratings.average' },
  { label: 'Newest', value: '-createdAt' },
];

const PRICE_RANGES = [
  { label: 'Any', min: 0, max: 99999 },
  { label: 'Under 500 SAR', min: 0, max: 500 },
  { label: '500 - 1,000 SAR', min: 500, max: 1000 },
  { label: '1,000 - 2,500 SAR', min: 1000, max: 2500 },
  { label: '2,500 - 5,000 SAR', min: 2500, max: 5000 },
  { label: '5,000+ SAR', min: 5000, max: 99999 },
];

const RATING_OPTIONS = [
  { label: 'Any', value: 0 },
  { label: '4+ Stars', value: 4 },
  { label: '4.5+ Stars', value: 4.5 },
];

export default function FilterSheet({ visible, onClose, onApply }: FilterSheetProps) {
  const { filters, setFilters, propertyTypes, setPropertyTypes } = useSearchStore();

  const [selectedSort, setSelectedSort] = useState(filters.sortBy || '-ratings.average');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(propertyTypes as string[]);

  const handleApply = () => {
    const priceRange = PRICE_RANGES[selectedPriceRange];
    setFilters({
      ...filters,
      sortBy: selectedSort,
      minPrice: priceRange.min > 0 ? priceRange.min : undefined,
      maxPrice: priceRange.max < 99999 ? priceRange.max : undefined,
    });
    setPropertyTypes(selectedTypes as any);
    onApply();
    onClose();
  };

  const handleReset = () => {
    setSelectedSort('-ratings.average');
    setSelectedPriceRange(0);
    setSelectedRating(0);
    setSelectedTypes([]);
  };

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Sort */}
            <Text style={styles.sectionTitle}>Sort by</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value + option.label}
                style={styles.radioRow}
                onPress={() => setSelectedSort(option.value)}
              >
                <Ionicons
                  name={selectedSort === option.value ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selectedSort === option.value ? Colors.primary : Colors.textSecondary}
                />
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Price Range */}
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Price Range</Text>
            {PRICE_RANGES.map((range, index) => (
              <TouchableOpacity
                key={range.label}
                style={styles.radioRow}
                onPress={() => setSelectedPriceRange(index)}
              >
                <Ionicons
                  name={selectedPriceRange === index ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selectedPriceRange === index ? Colors.primary : Colors.textSecondary}
                />
                <Text style={styles.radioLabel}>{range.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Property Type */}
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Property Type</Text>
            <View style={styles.chipContainer}>
              {PROPERTY_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[styles.chip, selectedTypes.includes(type.key) && styles.chipSelected]}
                  onPress={() => toggleType(type.key)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedTypes.includes(type.key) && styles.chipTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating */}
            <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>Minimum Rating</Text>
            {RATING_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.label}
                style={styles.radioRow}
                onPress={() => setSelectedRating(option.value)}
              >
                <Ionicons
                  name={selectedRating === option.value ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={selectedRating === option.value ? Colors.primary : Colors.textSecondary}
                />
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ height: 100 }} />
          </ScrollView>

          <View style={[styles.footer, Shadows.bottomBar]}>
            <Button title="Apply Filters" onPress={handleApply} fullWidth />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopStartRadius: Radius.bottomSheet,
    borderTopEndRadius: Radius.bottomSheet,
    maxHeight: '85%',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.subtitle,
    color: Colors.textPrimary,
  },
  resetText: {
    ...Typography.body,
    color: Colors.primary,
  },
  body: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
  },
  sectionTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  radioLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  chipSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  chipText: {
    ...Typography.small,
    color: Colors.textPrimary,
  },
  chipTextSelected: {
    color: Colors.textWhite,
  },
  footer: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
});
