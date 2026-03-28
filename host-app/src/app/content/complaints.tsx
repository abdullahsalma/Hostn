import React from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { hostService } from '../../services/host.service';
import { Colors, Spacing } from '../../constants/theme';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import EmptyState from '../../components/ui/EmptyState';

export default function ComplaintsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['complaints'],
    queryFn: () => hostService.getComplaints(),
    retry: false,
  });

  const complaints: unknown[] = data?.data || [];

  return (
    <ScreenWrapper>
      <HeaderBar title="البلاغات والشكاوى" showBack />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(_, index) => String(index)}
          renderItem={() => null}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="shield-checkmark-outline"
              message="لا توجد لديك بلاغات"
              submessage="لم يتم تسجيل أي بلاغات أو شكاوى"
            />
          }
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxxl,
    flexGrow: 1,
  },
});
