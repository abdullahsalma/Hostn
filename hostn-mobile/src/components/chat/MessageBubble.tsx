import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.text, isOwn ? styles.ownText : styles.otherText]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isOwn ? styles.ownTime : styles.otherTime]}>
          {time}
        </Text>
      </View>
    </View>
  );
}

export default memo(MessageBubble);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  ownBubble: {
    backgroundColor: Colors.messageSent,
    borderBottomEndRadius: Radius.xs,
  },
  otherBubble: {
    backgroundColor: Colors.messageReceived,
    borderBottomStartRadius: Radius.xs,
  },
  text: {
    ...Typography.body,
    lineHeight: 22,
  },
  ownText: {
    color: Colors.textWhite,
  },
  otherText: {
    color: Colors.textPrimary,
  },
  time: {
    ...Typography.tiny,
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
  },
  ownTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherTime: {
    color: Colors.textSecondary,
  },
});
