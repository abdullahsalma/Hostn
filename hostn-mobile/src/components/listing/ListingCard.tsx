import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
  const imageUrl = property.images?.[0]?.url;

  return (
    <TouchableOpacity
      style={[styles.card, { width }, Shadows.card]}
      activeOpacity={0.9}
      onPress={() => router.push(`/listing/${property._id}`)}
    >
      <View style={[styles.imageContainer, { width }]}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.cardImage}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
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
        {property.images && property.images.length > 1 && (
          <View style={styles.imageCount}>
            <Ionicons name="images-outline" size={12} color={Colors.textWhite} />
            <Text style={styles.imageCountText}>{property.images.length}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {property.title}
        </Text>
        <Text style={styles.cardCity} numberOfLines={1}>
          {property.location.city}
        </Text>
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
  imageCount: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: Radius.xs,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    gap: 3,
  },
  imageCountText: {
    ...Typography.tiny,
    color: Colors.textWhite,
  },
  cardContent: {
    padding: Spacing.sm,
  },
  cardTitle: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  cardCity: {
    ...Typography.small,
    color: Colors.textSecondary,
    marginTop: 2,
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
