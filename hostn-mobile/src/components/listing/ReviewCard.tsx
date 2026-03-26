import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, Radius, Shadows } from '../../constants/theme';
import { formatRelativeTime } from '../../utils/format';
import type { Review } from '../../types';

interface ReviewCardProps {
  review: Review;
  width?: number;
}

function ReviewCard({ review, width }: ReviewCardProps) {
  const reviewer = typeof review.guest === 'object' ? review.guest : null;
  const rating = typeof review.ratings === 'object' ? review.ratings.overall : 0;

  return (
    <View style={[styles.card, Shadows.card, width ? { width } : undefined]}>
      <View style={styles.header}>
        <Image
          source={{ uri: reviewer?.avatar }}
          style={styles.avatar}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
        <View style={styles.headerText}>
          <Text style={styles.name}>{reviewer?.name || 'Guest'}</Text>
          <Text style={styles.date}>{formatRelativeTime(review.createdAt)}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={Colors.star} />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>
      {review.comment && (
        <Text style={styles.comment} numberOfLines={4}>
          {review.comment}
        </Text>
      )}
    </View>
  );
}

export default memo(ReviewCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: Radius.card,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.skeleton,
  },
  headerText: {
    flex: 1,
    marginStart: Spacing.sm,
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
  },
  ratingText: {
    ...Typography.small,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  comment: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
});
