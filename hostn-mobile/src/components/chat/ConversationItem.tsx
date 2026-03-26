import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { formatRelativeTime } from '../../utils/format';
import type { Conversation } from '../../types';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
}

function ConversationItem({ conversation, currentUserId, onPress }: ConversationItemProps) {
  const otherParticipant = conversation.participants?.find(
    (p: any) => (p._id || p) !== currentUserId
  );
  const name = typeof otherParticipant === 'object' ? otherParticipant?.name : 'User';
  const avatar = typeof otherParticipant === 'object' ? otherParticipant?.avatar : null;
  const hasUnread = (conversation.unreadCount ?? 0) > 0;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: avatar }}
        style={styles.avatar}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, hasUnread && styles.unreadName]} numberOfLines={1}>
            {name}
          </Text>
          {conversation.lastMessage && (
            <Text style={styles.time}>
              {formatRelativeTime(conversation.lastMessage.createdAt || conversation.updatedAt)}
            </Text>
          )}
        </View>
        <View style={styles.footer}>
          <Text
            style={[styles.lastMessage, hasUnread && styles.unreadMessage]}
            numberOfLines={1}
          >
            {conversation.lastMessage?.content || 'Start a conversation'}
          </Text>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ConversationItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.skeleton,
  },
  content: {
    flex: 1,
    marginStart: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  unreadName: {
    fontWeight: '700',
  },
  time: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginStart: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  lastMessage: {
    ...Typography.small,
    color: Colors.textSecondary,
    flex: 1,
  },
  unreadMessage: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginStart: Spacing.sm,
  },
  badgeText: {
    ...Typography.tiny,
    color: Colors.textWhite,
    fontWeight: '700',
  },
});
