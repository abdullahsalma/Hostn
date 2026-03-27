import React, { memo, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';
import type { Property } from '../../types';

interface ListingCardProps {
  property: Property;
  width: number;
  isFavorited?: boolean;
  onHeartPress?: (id: string) => void;
}

function ListingCard({ property, width, isFavorited = false, onHeartPress }: ListingCardProps) {
  const router = useRouter();
  const images = property.images?.slice(0, 5) || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const host = typeof property.host === 'object' ? property.host : null;

  const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <TouchableOpacity
      style={[styles.card, { width }, Shadows.card]}
      activeOpacity={0.9}
      onPress={() => router.push(`/listing/${property._id}`)}
    >
      <View style={[styles.imageContainer, { width }]}>
        {images.length > 1 ? (
          <FlatList
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.url }}
                style={[styles.cardImage, { width }]}
                contentFit="cover"
                transition={200}
                placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              />
            )}
          />
        ) : (
          <Image
            source={{ uri: images[0]?.url }}
            style={styles.cardImage}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
        )}
        {onHeartPress && (
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => onHeartPress(property._id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isFavorited ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorited ? Colors.heart : Colors.textWhite}
            />
          </TouchableOpacity>
        )}
        {/* Discount badge */}
        {property.pricing.discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{property.pricing.discountPercent}% OFF</Text>
          </View>
        )}
        {/* Image dots */}
        {images.length > 1 && (
          <View style={styles.dotsContainer}>
            {images.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {property.title}
        </Text>
        <View style={styles.cityRow}>
          <Text style={styles.cardCity} numberOfLines={1}>
            {property.location.city}
          </Text>
          {host?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
            </View>
          )}
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>
            {formatCurrency(property.pricing.perNight)}{' '}
            <Text style={styles.perNight}>/night</Text>
          </Text>
          {property.ratings.count > 0 && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={Colors.star} />
              <Text style={styles.ratingText}>
                {property.ratings.average.toFixed(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ListingCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.card,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  heartButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: Radius.full,
    padding: Spacing.xs + 2,
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: '#f97316',
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  discountText: {
    ...Typography.tiny,
    color: Colors.textWhite,
    fontWeight: '700',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: Spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    width: 8,
    backgroundColor: '#fff',
  },
  cardContent: {
    padding: Spacing.sm,
  },
  cardTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  cardCity: {
    ...Typography.small,
    color: Colors.textSecondary,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  cardPrice: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  perNight: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});
