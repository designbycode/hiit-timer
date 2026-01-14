import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSizes } from '@/libs/constants/theme';
import { storageService } from '@/libs/services/storage/StorageService';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '@/libs/utils/time';

interface WorkoutHistory {
  id: string;
  workoutId: string;
  workoutName: string;
  completedAt: number;
  duration: number;
  rounds: number;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      // For now, we'll show a placeholder since history tracking isn't implemented yet
      // TODO: Implement workout history tracking in StorageService
      setHistory([]);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={64} color={colors.dark.textSecondary} />
      <Text style={styles.emptyTitle}>No Workout History</Text>
      <Text style={styles.emptyText}>
        Your completed workouts will appear here
      </Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push('/(tabs)/')}
        activeOpacity={0.7}
      >
        <Text style={styles.startButtonText}>Start a Workout</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHistoryItem = (item: WorkoutHistory) => (
    <View key={item.id} style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>{item.workoutName}</Text>
        <Text style={styles.historyDate}>
          {new Date(item.completedAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.historyStats}>
        <View style={styles.statItem}>
          <Ionicons name="time" size={16} color={colors.dark.textSecondary} />
          <Text style={styles.statText}>{formatTime(item.duration)}</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="repeat" size={16} color={colors.dark.textSecondary} />
          <Text style={styles.statText}>{item.rounds} rounds</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout History</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : history.length === 0 ? (
          renderEmptyState()
        ) : (
          history.map(renderHistoryItem)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.dark.text,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.md,
    color: colors.dark.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSizes.md,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  startButton: {
    backgroundColor: colors.dark.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.dark.text,
  },
  historyCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  historyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.dark.text,
    flex: 1,
  },
  historyDate: {
    fontSize: fontSizes.sm,
    color: colors.dark.textSecondary,
  },
  historyStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: fontSizes.sm,
    color: colors.dark.textSecondary,
  },
});
