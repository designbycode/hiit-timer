import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSizes } from '@/libs/constants/theme';
import { storageService } from '@/libs/services/storage/StorageService';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '@/libs/utils/time';
import { WorkoutHistory } from '@/libs/types/workout';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

type TabType = 'History' | 'Stats' | 'Calendar';
type DateFilterType = 'all' | 'week' | 'month' | 'year';

export default function HistoryScreen() {
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabType>('History');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  // Focus listener to reload data when screen comes into view
  useEffect(() => {
    const unsubscribe = router.subscribe?.(() => {
      loadHistory();
    });
    return unsubscribe;
  }, [router]);

  const loadHistory = async () => {
    try {
      const data = await storageService.loadWorkoutHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteWorkoutHistory(id);
              await loadHistory();
            } catch (error) {
              console.error('Failed to delete history:', error);
            }
          },
        },
      ]
    );
  };

  const handleClearAllHistory = () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all workout history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearWorkoutHistory();
              await loadHistory();
            } catch (error) {
              console.error('Failed to clear history:', error);
            }
          },
        },
      ]
    );
  };

  const handleExportHistory = () => {
    if (history.length === 0) {
      Alert.alert('No Data', 'There is no workout history to export.');
      return;
    }

    const csvContent = [
      'Workout Name,Date,Time,Duration (seconds),Rounds,Calories',
      ...filteredHistory.map((h) => {
        const date = new Date(h.completedAt);
        return `"${h.workoutName}","${date.toLocaleDateString()}","${date.toLocaleTimeString()}",${h.duration},${h.rounds},${h.calories || 0}`;
      }),
    ].join('\n');

    Alert.alert(
      'Export History',
      `Ready to export ${filteredHistory.length} workouts.\n\nData format: CSV\n\nNote: In a production app, this would save to a file or share via email.`,
      [
        { text: 'OK', style: 'default' },
      ]
    );
    
    console.log('CSV Export Data:\n', csvContent);
  };

  // Filter history by date range
  const filteredHistory = useMemo(() => {
    if (dateFilter === 'all') return history;

    const now = Date.now();
    const filterDate = {
      week: now - 7 * 24 * 60 * 60 * 1000,
      month: now - 30 * 24 * 60 * 60 * 1000,
      year: now - 365 * 24 * 60 * 60 * 1000,
    }[dateFilter];

    return history.filter((h) => h.completedAt >= filterDate);
  }, [history, dateFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const data = filteredHistory;
    if (data.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        totalCalories: 0,
        avgDuration: 0,
        totalRounds: 0,
        mostFrequentWorkout: '',
        workoutDistribution: [],
        longestWorkout: null,
        currentStreak: 0,
        bestStreak: 0,
      };
    }

    const totalDuration = data.reduce((sum, h) => sum + h.duration, 0);
    const totalCalories = data.reduce((sum, h) => sum + (h.calories || 0), 0);
    const totalRounds = data.reduce((sum, h) => sum + h.rounds, 0);

    // Find most frequent workout
    const workoutCounts = data.reduce((acc, h) => {
      acc[h.workoutName] = (acc[h.workoutName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentWorkout = Object.entries(workoutCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || '';

    // Workout distribution for pie chart
    const workoutDistribution = Object.entries(workoutCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5) // Top 5 workouts
      .map(([name, count]) => ({
        name,
        count,
        color: ['#FF9800', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'][
          Object.keys(workoutCounts).indexOf(name) % 5
        ],
        legendFontColor: '#FFFFFF',
        legendFontSize: 12,
      }));

    // Find longest workout
    const longestWorkout = data.reduce((max, h) => 
      h.duration > (max?.duration || 0) ? h : max
    , data[0]);

    // Calculate streaks (consecutive days with workouts)
    const sortedDates = [...data]
      .sort((a, b) => b.completedAt - a.completedAt)
      .map((h) => {
        const d = new Date(h.completedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      });

    const uniqueDates = [...new Set(sortedDates)];
    
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 1;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const yesterdayTime = todayTime - 24 * 60 * 60 * 1000;

    // Current streak
    if (uniqueDates.length > 0) {
      if (uniqueDates[0] === todayTime || uniqueDates[0] === yesterdayTime) {
        currentStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          if (uniqueDates[i] === uniqueDates[i - 1] - 24 * 60 * 60 * 1000) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Best streak
    for (let i = 1; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === uniqueDates[i - 1] - 24 * 60 * 60 * 1000) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak, currentStreak);

    return {
      totalWorkouts: data.length,
      totalDuration,
      totalCalories,
      avgDuration: Math.round(totalDuration / data.length),
      totalRounds,
      mostFrequentWorkout,
      workoutDistribution,
      longestWorkout,
      currentStreak,
      bestStreak,
    };
  }, [filteredHistory]);

  // Prepare chart data for last 7 days
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const dailyWorkouts = last7Days.map((dayStart) => {
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      return history.filter(
        (h) => h.completedAt >= dayStart && h.completedAt < dayEnd
      ).length;
    });

    const labels = last7Days.map((day) => {
      const d = new Date(day);
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    });

    return { labels, data: dailyWorkouts };
  }, [history]);

  // Progress chart data (last 30 days - duration trend)
  const progressData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    });

    const dailyDuration = last30Days.map((dayStart) => {
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayWorkouts = history.filter(
        (h) => h.completedAt >= dayStart && h.completedAt < dayEnd
      );
      return dayWorkouts.reduce((sum, h) => sum + h.duration, 0) / 60; // in minutes
    });

    const labels = last30Days.map((day, i) => {
      if (i % 5 === 0 || i === last30Days.length - 1) {
        return new Date(day).getDate().toString();
      }
      return '';
    });

    return { labels, data: dailyDuration };
  }, [history]);

  // Calendar data - workouts per day this month
  const calendarData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthData = Array.from({ length: daysInMonth }, (_, i) => {
      const dayStart = new Date(year, month, i + 1, 0, 0, 0, 0).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const count = history.filter(
        (h) => h.completedAt >= dayStart && h.completedAt < dayEnd
      ).length;
      return { day: i + 1, count };
    });

    return monthData;
  }, [history]);

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

  // Tab navigation data
  const tabs: TabType[] = ['History', 'Stats', 'Calendar'];

  const renderTabItem = ({ item }: { item: TabType }) => (
    <TouchableOpacity
      style={[styles.tab, selectedTab === item && styles.tabActive]}
      onPress={() => setSelectedTab(item)}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, selectedTab === item && styles.tabTextActive]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: WorkoutHistory }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyTitleContainer}>
          <Text style={styles.historyTitle}>{item.workoutName}</Text>
          <Text style={styles.historyDate}>
            {new Date(item.completedAt).toLocaleDateString()} at{' '}
            {new Date(item.completedAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteHistory(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color={colors.dark.danger} />
        </TouchableOpacity>
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
        <View style={styles.statItem}>
          <Ionicons name="flame" size={16} color={colors.dark.warning} />
          <Text style={styles.statText}>{item.calories || 0} cal</Text>
        </View>
      </View>
    </View>
  );

  const renderStatsSection = () => (
    <ScrollView 
      style={styles.sectionContainer}
      contentContainerStyle={styles.sectionContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="fitness" size={32} color={colors.dark.primary} />
          <Text style={styles.statCardValue}>{stats.totalWorkouts}</Text>
          <Text style={styles.statCardLabel}>Total Workouts</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="time" size={32} color={colors.dark.success} />
          <Text style={styles.statCardValue}>{formatTime(stats.totalDuration)}</Text>
          <Text style={styles.statCardLabel}>Total Time</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={32} color={colors.dark.warning} />
          <Text style={styles.statCardValue}>{stats.totalCalories}</Text>
          <Text style={styles.statCardLabel}>Calories Burned</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="speedometer" size={32} color={colors.dark.info} />
          <Text style={styles.statCardValue}>{formatTime(stats.avgDuration)}</Text>
          <Text style={styles.statCardLabel}>Avg Duration</Text>
        </View>
      </View>

      {/* Streak Cards */}
      {history.length > 0 && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="flame-outline" size={32} color={colors.dark.primary} />
            <Text style={styles.statCardValue}>{stats.currentStreak}</Text>
            <Text style={styles.statCardLabel}>Current Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy-outline" size={32} color={colors.dark.warning} />
            <Text style={styles.statCardValue}>{stats.bestStreak}</Text>
            <Text style={styles.statCardLabel}>Best Streak</Text>
          </View>
        </View>
      )}

      {/* Charts */}
      {history.length > 0 && (
        <>
          {/* Workout Distribution Pie Chart */}
          {stats.workoutDistribution.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Workout Distribution</Text>
              <View style={styles.chartContainer}>
                <PieChart
                  data={stats.workoutDistribution}
                  width={CHART_WIDTH}
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  }}
                  accessor="count"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            </>
          )}

          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={{
                labels: chartData.labels,
                datasets: [{ data: chartData.data.length > 0 ? chartData.data : [0] }],
              }}
              width={CHART_WIDTH}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: colors.dark.surface,
                backgroundGradientFrom: colors.dark.surface,
                backgroundGradientTo: colors.dark.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(138, 180, 248, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                barPercentage: 0.6,
              }}
              style={styles.chart}
              fromZero
            />
          </View>

          {/* Progress Line Chart */}
          <Text style={styles.sectionTitle}>30-Day Progress (Minutes/Day)</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: progressData.labels,
                datasets: [{ data: progressData.data.length > 0 ? progressData.data : [0] }],
              }}
              width={CHART_WIDTH}
              height={220}
              yAxisLabel=""
              yAxisSuffix="m"
              chartConfig={{
                backgroundColor: colors.dark.surface,
                backgroundGradientFrom: colors.dark.surface,
                backgroundGradientTo: colors.dark.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: colors.dark.success,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          {/* Insights */}
          <Text style={styles.sectionTitle}>Insights</Text>
          
          <View style={styles.infoCard}>
            <Ionicons name="trophy" size={24} color={colors.dark.warning} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>Most Frequent Workout</Text>
              <Text style={styles.infoCardText}>{stats.mostFrequentWorkout || 'N/A'}</Text>
            </View>
          </View>

          {stats.longestWorkout && (
            <View style={styles.infoCard}>
              <Ionicons name="medal" size={24} color={colors.dark.primary} />
              <View style={styles.infoCardContent}>
                <Text style={styles.infoCardLabel}>Longest Workout</Text>
                <Text style={styles.infoCardText}>
                  {stats.longestWorkout.workoutName} - {formatTime(stats.longestWorkout.duration)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.infoCard}>
            <Ionicons name="repeat" size={24} color={colors.dark.info} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardLabel}>Total Rounds Completed</Text>
              <Text style={styles.infoCardText}>{stats.totalRounds} rounds</Text>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );

  const renderCalendarSection = () => {
    const now = new Date();
    const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

    return (
      <ScrollView 
        style={styles.sectionContainer}
        contentContainerStyle={styles.sectionContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.calendarMonth}>{monthName}</Text>
        
        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {/* Day headers */}
          <View style={styles.calendarRow}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <View key={day} style={styles.calendarDayHeader}>
                <Text style={styles.calendarDayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar days */}
          {Array.from({ length: Math.ceil((calendarData.length + firstDayOfMonth) / 7) }).map((_, weekIndex) => (
            <View key={weekIndex} style={styles.calendarRow}>
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayNumber = weekIndex * 7 + dayIndex - firstDayOfMonth + 1;
                const dayData = calendarData.find((d) => d.day === dayNumber);
                const isToday = dayNumber === now.getDate();

                if (dayNumber < 1 || dayNumber > calendarData.length) {
                  return <View key={dayIndex} style={styles.calendarDay} />;
                }

                return (
                  <View 
                    key={dayIndex} 
                    style={[
                      styles.calendarDay,
                      isToday && styles.calendarDayToday,
                      dayData && dayData.count > 0 && styles.calendarDayActive,
                    ]}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      isToday && styles.calendarDayTextToday,
                      dayData && dayData.count > 0 && styles.calendarDayTextActive,
                    ]}>
                      {dayNumber}
                    </Text>
                    {dayData && dayData.count > 0 && (
                      <View style={styles.calendarDayBadge}>
                        <Text style={styles.calendarDayBadgeText}>{dayData.count}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Calendar Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.dark.primary }]} />
            <Text style={styles.legendText}>Workout completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.dark.border }]} />
            <Text style={styles.legendText}>No workout</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderDateFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'week', 'month', 'year'] as DateFilterType[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, dateFilter === filter && styles.filterButtonActive]}
            onPress={() => setDateFilter(filter)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, dateFilter === filter && styles.filterButtonTextActive]}>
              {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'This Year'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.filterActions}>
        <TouchableOpacity onPress={handleExportHistory} style={styles.actionIconButton}>
          <Ionicons name="share-outline" size={22} color={colors.dark.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClearAllHistory} style={styles.actionIconButton}>
          <Ionicons name="trash-outline" size={22} color={colors.dark.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHistorySection = () => (
    <View style={styles.sectionContainer}>
      {renderDateFilter()}
      <FlatList
        data={filteredHistory}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.historyList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="filter-outline" size={64} color={colors.dark.textSecondary} />
            <Text style={styles.emptyTitle}>No Workouts Found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filter or start a new workout
            </Text>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout History</Text>
      </View>

      {/* Custom Tab Navigation */}
      <View style={styles.tabNavigation}>
        <FlatList
          data={tabs}
          renderItem={renderTabItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabList}
        />
      </View>

      {/* Content based on selected tab */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : history.length === 0 && selectedTab === 'History' ? (
        renderEmptyState()
      ) : (
        <>
          {selectedTab === 'History' && renderHistorySection()}
          {selectedTab === 'Stats' && renderStatsSection()}
          {selectedTab === 'Calendar' && renderCalendarSection()}
        </>
      )}
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
  
  // Tab Navigation
  tabNavigation: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    backgroundColor: colors.dark.surface,
  },
  tabList: {
    paddingHorizontal: spacing.lg,
  },
  tab: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginRight: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.dark.primary,
  },
  tabText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.dark.textSecondary,
  },
  tabTextActive: {
    color: colors.dark.primary,
  },

  // Loading & Empty States
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

  // History Section
  historyList: {
    padding: spacing.lg,
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  historyTitleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  historyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.dark.text,
    marginBottom: spacing.xs,
  },
  historyDate: {
    fontSize: fontSizes.sm,
    color: colors.dark.textSecondary,
  },
  deleteButton: {
    padding: spacing.xs,
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

  // Stats Section
  sectionContainer: {
    flex: 1,
  },
  sectionContent: {
    padding: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: spacing.md,
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  statCardValue: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginTop: spacing.sm,
  },
  statCardLabel: {
    fontSize: fontSizes.sm,
    color: colors.dark.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  chartContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  infoCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: spacing.md,
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: fontSizes.sm,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xs,
  },
  infoCardText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    color: colors.dark.text,
  },

  // Filter Section
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.dark.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginRight: spacing.sm,
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  filterButtonActive: {
    backgroundColor: colors.dark.primary,
    borderColor: colors.dark.primary,
  },
  filterButtonText: {
    fontSize: fontSizes.sm,
    color: colors.dark.textSecondary,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.dark.background,
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Calendar Section
  calendarMonth: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.dark.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  calendarContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  calendarDayHeader: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2) / 7,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  calendarDayHeaderText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.dark.textSecondary,
  },
  calendarDay: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md * 2) / 7,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  calendarDayToday: {
    backgroundColor: colors.dark.border,
  },
  calendarDayActive: {
    backgroundColor: colors.dark.primary,
  },
  calendarDayText: {
    fontSize: fontSizes.sm,
    color: colors.dark.text,
  },
  calendarDayTextToday: {
    fontWeight: 'bold',
  },
  calendarDayTextActive: {
    color: colors.dark.background,
    fontWeight: 'bold',
  },
  calendarDayBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.dark.warning,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  calendarDayBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.dark.background,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: fontSizes.sm,
    color: colors.dark.textSecondary,
  },
});
