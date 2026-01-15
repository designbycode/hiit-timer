import React, { useState, useEffect, useMemo } from 'react'
import {
    View,
    StyleSheet,
    ScrollView,
    Text,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Alert,
    RefreshControl,
    Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import { storageService } from '@/libs/services/storage/StorageService'
import { Ionicons } from '@expo/vector-icons'
import { formatTime } from '@/libs/utils/time'
import { WorkoutHistory } from '@/libs/types/workout'
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit'
import { Header } from '@/libs/components/Header'
import { Swipeable } from 'react-native-gesture-handler'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const CHART_WIDTH = SCREEN_WIDTH - spacing.sm * 4 - spacing.md // Account for all padding and margins

type TabType = 'History' | 'Stats' | 'Calendar'
type DateFilterType = 'all' | 'week' | 'month' | 'year'

export default function HistoryScreen() {
    const [history, setHistory] = useState<WorkoutHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [selectedTab, setSelectedTab] = useState<TabType>('History')
    const [dateFilter, setDateFilter] = useState<DateFilterType>('all')
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
    const [selectedDay, setSelectedDay] = useState<number | null>(null)
    const router = useRouter()

    useEffect(() => {
        loadHistory()
    }, [])

    // Reload data when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadHistory()
        }, [])
    )

    const loadHistory = async () => {
        try {
            const data = await storageService.loadWorkoutHistory()
            setHistory(data)
        } catch (error) {
            console.error('Failed to load history:', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        try {
            const data = await storageService.loadWorkoutHistory()
            setHistory(data)
        } catch (error) {
            console.error('Failed to refresh history:', error)
        } finally {
            setRefreshing(false)
        }
    }

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
                            await storageService.deleteWorkoutHistory(id)
                            await loadHistory()
                        } catch (error) {
                            console.error('Failed to delete history:', error)
                        }
                    },
                },
            ]
        )
    }

    // Filter history by date range
    const filteredHistory = useMemo(() => {
        if (dateFilter === 'all') return history

        const now = Date.now()
        const filterDate = {
            week: now - 7 * 24 * 60 * 60 * 1000,
            month: now - 30 * 24 * 60 * 60 * 1000,
            year: now - 365 * 24 * 60 * 60 * 1000,
        }[dateFilter]

        return history.filter((h) => h.completedAt >= filterDate)
    }, [history, dateFilter])

    // Calculate statistics
    const stats = useMemo(() => {
        const data = filteredHistory
        if (data.length === 0) {
            return {
                totalWorkouts: 0,
                totalDuration: 0,
                avgDuration: 0,
                totalRounds: 0,
                mostFrequentWorkout: '',
                workoutDistribution: [],
                longestWorkout: null,
                currentStreak: 0,
                bestStreak: 0,
            }
        }

        const totalDuration = data.reduce((sum, h) => sum + h.duration, 0)
        const totalRounds = data.reduce((sum, h) => sum + h.rounds, 0)

        // Find most frequent workout
        const workoutCounts = data.reduce(
            (acc, h) => {
                acc[h.workoutName] = (acc[h.workoutName] || 0) + 1
                return acc
            },
            {} as Record<string, number>
        )

        const mostFrequentWorkout =
            Object.entries(workoutCounts).sort(
                ([, a], [, b]) => b - a
            )[0]?.[0] || ''

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
            }))

        // Find longest workout
        const longestWorkout = data.reduce(
            (max, h) => (h.duration > (max?.duration || 0) ? h : max),
            data[0]
        )

        // Calculate streaks (consecutive days with workouts)
        const sortedDates = [...data]
            .sort((a, b) => b.completedAt - a.completedAt)
            .map((h) => {
                const d = new Date(h.completedAt)
                d.setHours(0, 0, 0, 0)
                return d.getTime()
            })

        const uniqueDates = [...new Set(sortedDates)]

        let currentStreak = 0
        let bestStreak = 0
        let tempStreak = 1

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayTime = today.getTime()
        const yesterdayTime = todayTime - 24 * 60 * 60 * 1000

        // Current streak
        if (uniqueDates.length > 0) {
            if (
                uniqueDates[0] === todayTime ||
                uniqueDates[0] === yesterdayTime
            ) {
                currentStreak = 1
                for (let i = 1; i < uniqueDates.length; i++) {
                    if (
                        uniqueDates[i] ===
                        uniqueDates[i - 1] - 24 * 60 * 60 * 1000
                    ) {
                        currentStreak++
                    } else {
                        break
                    }
                }
            }
        }

        // Best streak
        for (let i = 1; i < uniqueDates.length; i++) {
            if (uniqueDates[i] === uniqueDates[i - 1] - 24 * 60 * 60 * 1000) {
                tempStreak++
                bestStreak = Math.max(bestStreak, tempStreak)
            } else {
                tempStreak = 1
            }
        }
        bestStreak = Math.max(bestStreak, tempStreak, currentStreak)

        return {
            totalWorkouts: data.length,
            totalDuration,
            avgDuration: Math.round(totalDuration / data.length),
            totalRounds,
            mostFrequentWorkout,
            workoutDistribution,
            longestWorkout,
            currentStreak,
            bestStreak,
        }
    }, [filteredHistory])

    // Prepare chart data for last 7 days
    const chartData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (6 - i))
            date.setHours(0, 0, 0, 0)
            return date.getTime()
        })

        const dailyWorkouts = last7Days.map((dayStart) => {
            const dayEnd = dayStart + 24 * 60 * 60 * 1000
            return history.filter(
                (h) => h.completedAt >= dayStart && h.completedAt < dayEnd
            ).length
        })

        const labels = last7Days.map((day) => {
            const d = new Date(day)
            return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
        })

        return { labels, data: dailyWorkouts }
    }, [history])

    // Progress chart data (last 30 days - duration trend)
    const progressData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            date.setHours(0, 0, 0, 0)
            return date.getTime()
        })

        const dailyDuration = last30Days.map((dayStart) => {
            const dayEnd = dayStart + 24 * 60 * 60 * 1000
            const dayWorkouts = history.filter(
                (h) => h.completedAt >= dayStart && h.completedAt < dayEnd
            )
            return dayWorkouts.reduce((sum, h) => sum + h.duration, 0) / 60 // in minutes
        })

        const labels = last30Days.map((day, i) => {
            if (i % 5 === 0 || i === last30Days.length - 1) {
                return new Date(day).getDate().toString()
            }
            return ''
        })

        return { labels, data: dailyDuration }
    }, [history])

    // Calendar data - workouts per day for selected month
    const calendarData = useMemo(() => {
        const year = selectedMonth.getFullYear()
        const month = selectedMonth.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        const monthData = Array.from({ length: daysInMonth }, (_, i) => {
            const dayStart = new Date(year, month, i + 1, 0, 0, 0, 0).getTime()
            const dayEnd = dayStart + 24 * 60 * 60 * 1000
            const dayWorkouts = history.filter(
                (h) => h.completedAt >= dayStart && h.completedAt < dayEnd
            )
            const count = dayWorkouts.length
            const totalDuration = dayWorkouts.reduce(
                (sum, h) => sum + h.duration,
                0
            )

            return {
                day: i + 1,
                count,
                totalDuration,
                workouts: dayWorkouts,
            }
        })

        return monthData
    }, [history, selectedMonth])

    // Month statistics
    const monthStats = useMemo(() => {
        const totalWorkouts = calendarData.reduce((sum, d) => sum + d.count, 0)
        const totalDuration = calendarData.reduce(
            (sum, d) => sum + d.totalDuration,
            0
        )
        const activeDays = calendarData.filter((d) => d.count > 0).length
        const maxWorkoutsDay = calendarData.reduce(
            (max, d) => (d.count > max.count ? d : max),
            calendarData[0] || { count: 0 }
        )

        return {
            totalWorkouts,
            totalDuration,
            activeDays,
            maxWorkoutsDay: maxWorkoutsDay.count,
        }
    }, [calendarData])

    const navigateMonth = (direction: 'prev' | 'next') => {
        setSelectedMonth((prev) => {
            const newDate = new Date(prev)
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1)
            } else {
                newDate.setMonth(newDate.getMonth() + 1)
            }
            return newDate
        })
        setSelectedDay(null)
    }

    const goToToday = () => {
        setSelectedMonth(new Date())
        setSelectedDay(new Date().getDate())
    }

    // Get dot color based on workout count
    const getDotColor = (count: number): string => {
        if (count === 0) return 'transparent'
        if (count === 1) return colors.dark.info // Blue for 1 workout
        if (count === 2) return colors.dark.success // Green for 2 workouts
        if (count >= 3) return colors.dark.primary // Orange for 3+ workouts
        return 'transparent'
    }

    // Get dot size based on workout count
    const getDotSize = (count: number): number => {
        if (count === 0) return 0
        if (count === 1) return 6
        if (count === 2) return 8
        if (count >= 3) return 10
        return 0
    }

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name="time-outline"
                size={64}
                color={colors.dark.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Workout History</Text>
            <Text style={styles.emptyText}>
                Your completed workouts will appear here
            </Text>
            <TouchableOpacity
                style={styles.startButton}
                onPress={() => router.replace('/(tabs)')}
                activeOpacity={0.7}
            >
                <Text style={styles.startButtonText}>Start a Workout</Text>
            </TouchableOpacity>
        </View>
    )

    // Tab navigation data
    const tabs: TabType[] = ['History', 'Stats', 'Calendar']

    const getTabIcon = (tab: TabType): keyof typeof Ionicons.glyphMap => {
        switch (tab) {
            case 'History':
                return 'list'
            case 'Stats':
                return 'bar-chart'
            case 'Calendar':
                return 'calendar'
            default:
                return 'list'
        }
    }

    const renderTabItem = ({ item }: { item: TabType }) => (
        <TouchableOpacity
            style={[styles.tab, selectedTab === item && styles.tabActive]}
            onPress={() => setSelectedTab(item)}
            activeOpacity={0.7}
        >
            <Ionicons
                name={getTabIcon(item)}
                size={20}
                color={selectedTab === item ? colors.dark.primary : colors.dark.textSecondary}
            />
            <Text
                style={[
                    styles.tabText,
                    selectedTab === item && styles.tabTextActive,
                ]}
            >
                {item}
            </Text>
        </TouchableOpacity>
    )

    const renderRightActions = (
        progress: Animated.AnimatedInterpolation<number>,
        dragX: Animated.AnimatedInterpolation<number>,
        item: WorkoutHistory
    ) => {
        const scale = dragX.interpolate({
            inputRange: [-100, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        })

        return (
            <TouchableOpacity
                style={styles.deleteAction}
                onPress={() => handleDeleteHistory(item.id)}
            >
                <Animated.View style={{ transform: [{ scale }] }}>
                    <Ionicons name="trash" size={24} color="#fff" />
                </Animated.View>
            </TouchableOpacity>
        )
    }

    const renderHistoryItem = ({ item }: { item: WorkoutHistory }) => {
        const hasPauses = (item.pauseCount ?? 0) > 0
        const hasSkips = (item.skipCount ?? 0) > 0
        const isPerfect = !hasPauses && !hasSkips
        
        // Format date nicely
        const date = new Date(item.completedAt)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

        return (
            <Swipeable
                renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item)}
                overshootRight={false}
            >
            <View style={styles.historyCard}>
                {/* Title with achievement badge */}
                <View style={styles.historyTitleRow}>
                    <Text style={styles.historyTitle}>{item.workoutName}</Text>
                    {isPerfect && (
                        <View style={styles.achievementBadge}>
                            <Ionicons name="star" size={14} color={colors.dark.warning} />
                        </View>
                    )}
                </View>
                
                {/* Date and time */}
                <Text style={styles.historyDate}>
                    {dateStr} • {timeStr}
                </Text>

                {/* Main stats */}
                <View style={styles.historyMainStats}>
                    <View style={styles.mainStatItem}>
                        <Ionicons
                            name="time-outline"
                            size={20}
                            color={colors.dark.primary}
                        />
                        <Text style={styles.mainStatValue}>
                            {item.duration ? formatTime(item.duration) : '00:00'}
                        </Text>
                    </View>
                    <View style={styles.mainStatItem}>
                        <Ionicons
                            name="repeat-outline"
                            size={20}
                            color={colors.dark.primary}
                        />
                        <Text style={styles.mainStatValue}>
                            {item.rounds || 0} rounds
                        </Text>
                    </View>
                </View>

                {/* Achievement or interruptions */}
                {isPerfect ? (
                    <View style={styles.perfectBadge}>
                        <Ionicons
                            name="trophy"
                            size={16}
                            color={colors.dark.success}
                        />
                        <Text style={styles.perfectText}>Perfect Session</Text>
                    </View>
                ) : (
                    <View style={styles.interruptionsRow}>
                        {hasPauses && (
                            <View style={styles.interruptionItem}>
                                <Ionicons
                                    name="pause-circle-outline"
                                    size={16}
                                    color={colors.dark.warning}
                                />
                                <Text style={styles.interruptionText}>
                                    {item.pauseCount} {item.pauseCount === 1 ? 'pause' : 'pauses'}
                                </Text>
                            </View>
                        )}
                        {hasSkips && (
                            <View style={styles.interruptionItem}>
                                <Ionicons
                                    name="play-skip-forward-outline"
                                    size={16}
                                    color={colors.dark.info}
                                />
                                <Text style={styles.interruptionText}>
                                    {item.skipCount} {item.skipCount === 1 ? 'skip' : 'skips'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
            </Swipeable>
        )
    }

    const renderStatsSection = () => (
        <ScrollView
            style={styles.sectionContainer}
            contentContainerStyle={styles.sectionContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    tintColor={colors.dark.primary}
                    colors={[colors.dark.primary]}
                />
            }
        >
            {/* Overview Section */}
            <Text style={styles.statsHeading}>Overview</Text>
            <View style={styles.overviewGrid}>
                {/* Total Workouts */}
                <View style={styles.overviewCard}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 152, 0, 0.2)' }]}>
                        <Ionicons
                            name="fitness"
                            size={24}
                            color={colors.dark.primary}
                        />
                    </View>
                    <Text style={styles.overviewValue}>
                        {stats.totalWorkouts}
                    </Text>
                    <Text style={styles.overviewLabel}>Total Workouts</Text>
                </View>

                {/* Current Streak */}
                <View style={styles.overviewCard}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 87, 34, 0.2)' }]}>
                        <Ionicons
                            name="flame"
                            size={24}
                            color="#FF5722"
                        />
                    </View>
                    <Text style={styles.overviewValue}>
                        {stats.currentStreak}
                    </Text>
                    <Text style={styles.overviewLabel}>Current Streak</Text>
                    <Text style={styles.overviewSubtext}>Best: {stats.bestStreak}</Text>
                </View>

                {/* Total Time */}
                <View style={styles.overviewCard}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 188, 212, 0.2)' }]}>
                        <Ionicons
                            name="time"
                            size={24}
                            color="#00BCD4"
                        />
                    </View>
                    <Text style={styles.overviewValue}>
                        {formatTime(stats.totalDuration)}
                    </Text>
                    <Text style={styles.overviewLabel}>Total Time</Text>
                </View>

                {/* Total Rounds */}
                <View style={styles.overviewCard}>
                    <View style={[styles.iconCircle, { backgroundColor: 'rgba(96, 125, 139, 0.2)' }]}>
                        <Ionicons
                            name="repeat"
                            size={24}
                            color="#607D8B"
                        />
                    </View>
                    <Text style={styles.overviewValue}>
                        {stats.totalRounds}
                    </Text>
                    <Text style={styles.overviewLabel}>Total Rounds</Text>
                </View>
            </View>

            {/* This Week Section */}
            {history.length > 0 && (
                <>
                    <Text style={styles.statsHeading}>This Week</Text>
                    <View style={styles.chartContainer}>
                        <View style={styles.chartWrapper}>
                            <BarChart
                                data={{
                                    labels: chartData.labels,
                                    datasets: [
                                        {
                                            data:
                                                chartData.data.length > 0
                                                    ? chartData.data
                                                    : [0],
                                        },
                                    ],
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
                                    color: (opacity = 1) =>
                                        `rgba(255, 152, 0, ${opacity})`,
                                    labelColor: (opacity = 1) =>
                                        `rgba(255, 255, 255, ${opacity})`,
                                    style: { borderRadius: 16 },
                                    barPercentage: 0.5,
                                }}
                                style={styles.chart}
                                fromZero
                            />
                        </View>
                        <Text style={styles.chartSubtext}>
                            {chartData.data.reduce((a, b) => a + b, 0)} workout{chartData.data.reduce((a, b) => a + b, 0) !== 1 ? 's' : ''} this week
                        </Text>
                    </View>

                    {/* Performance Section */}
                    <Text style={styles.statsHeading}>Performance</Text>
                    <View style={styles.performanceGrid}>
                        {/* Avg Duration */}
                        <View style={styles.performanceCard}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(0, 188, 212, 0.2)' }]}>
                                <Ionicons
                                    name="speedometer"
                                    size={24}
                                    color="#00BCD4"
                                />
                            </View>
                            <Text style={styles.performanceValue}>
                                {formatTime(stats.avgDuration)}
                            </Text>
                            <Text style={styles.performanceLabel}>Avg Duration</Text>
                        </View>

                        {/* Longest */}
                        <View style={styles.performanceCard}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 193, 7, 0.2)' }]}>
                                <Ionicons
                                    name="trophy"
                                    size={24}
                                    color="#FFC107"
                                />
                            </View>
                            <Text style={styles.performanceValue}>
                                {stats.longestWorkout ? formatTime(stats.longestWorkout.duration) : '00:00'}
                            </Text>
                            <Text style={styles.performanceLabel}>Longest</Text>
                        </View>
                    </View>

                    {/* More Stats Section */}
                    <Text style={styles.statsHeading}>More Stats</Text>
                    <View style={styles.moreStatsContainer}>
                        {/* This Month */}
                        <View style={styles.moreStatsRow}>
                            <Text style={styles.moreStatsLabel}>This Month</Text>
                            <Text style={styles.moreStatsValue}>
                                {monthStats.totalWorkouts} workout{monthStats.totalWorkouts !== 1 ? 's' : ''}
                            </Text>
                        </View>

                        {/* Favorite Workout */}
                        <View style={styles.moreStatsRow}>
                            <Text style={styles.moreStatsLabel}>Favorite Workout</Text>
                            <Text style={styles.moreStatsValue}>
                                {stats.mostFrequentWorkout || 'N/A'}
                            </Text>
                        </View>

                        {/* Last Workout */}
                        {history.length > 0 && (
                            <View style={styles.moreStatsRow}>
                                <Text style={styles.moreStatsLabel}>Last Workout</Text>
                                <Text style={styles.moreStatsValue}>
                                    {new Date(history[0].completedAt).toLocaleDateString()}
                                </Text>
                            </View>
                        )}
                    </View>
                </>
            )}
        </ScrollView>
    )

    const renderCalendarSection = () => {
        const now = new Date()
        const monthName =
            selectedMonth?.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
            }) || ''
        const firstDayOfMonth = new Date(
            selectedMonth.getFullYear(),
            selectedMonth.getMonth(),
            1
        ).getDay()
        const isCurrentMonth =
            selectedMonth.getMonth() === now.getMonth() &&
            selectedMonth.getFullYear() === now.getFullYear()

        return (
            <ScrollView
                style={styles.sectionContainer}
                contentContainerStyle={styles.sectionContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.dark.primary}
                        colors={[colors.dark.primary]}
                    />
                }
            >
                {/* Calendar Container */}
                <View style={styles.calendarMainContainer}>
                    {/* Month Navigation */}
                    <View style={styles.calendarHeader}>
                        <TouchableOpacity
                            onPress={() => navigateMonth('prev')}
                            style={styles.monthNavButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={24}
                                color={colors.dark.primary}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={goToToday} activeOpacity={0.7}>
                            <Text style={styles.calendarMonth}>{monthName}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => navigateMonth('next')}
                            style={styles.monthNavButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="chevron-forward"
                                size={24}
                                color={colors.dark.primary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Day headers */}
                    <View style={styles.calendarRow}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                            (day, index) => (
                                <View
                                    key={index}
                                    style={styles.calendarDayHeader}
                                >
                                    <Text style={styles.calendarDayHeaderText}>
                                        {day}
                                    </Text>
                                </View>
                            )
                        )}
                    </View>

                    {/* Calendar days grid */}
                    {Array.from({
                        length: Math.ceil(
                            (calendarData.length + firstDayOfMonth) / 7
                        ),
                    }).map((_, weekIndex) => (
                        <View key={weekIndex} style={styles.calendarRow}>
                            {Array.from({ length: 7 }).map((_, dayIndex) => {
                                const dayNumber =
                                    weekIndex * 7 +
                                    dayIndex -
                                    firstDayOfMonth +
                                    1
                                const dayData = calendarData.find(
                                    (d) => d.day === dayNumber
                                )
                                const isToday =
                                    isCurrentMonth &&
                                    dayNumber === now.getDate()
                                const isSelected = selectedDay === dayNumber

                                if (
                                    dayNumber < 1 ||
                                    dayNumber > calendarData.length
                                ) {
                                    return (
                                        <View
                                            key={dayIndex}
                                            style={styles.calendarDayEmpty}
                                        />
                                    )
                                }

                                const hasWorkouts = dayData && dayData.count > 0
                                const dotColor = hasWorkouts
                                    ? dayData.count === 1
                                        ? colors.dark.primary
                                        : dayData.count === 2
                                          ? '#FFA500'
                                          : '#FF6B6B'
                                    : 'transparent'

                                return (
                                    <TouchableOpacity
                                        key={dayIndex}
                                        style={styles.calendarDayCell}
                                        onPress={() =>
                                            setSelectedDay(
                                                isSelected ? null : dayNumber
                                            )
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.calendarDayText,
                                                isToday && styles.calendarDayTextToday,
                                            ]}
                                        >
                                            {dayNumber}
                                        </Text>
                                        {hasWorkouts && (
                                            <View
                                                style={[
                                                    styles.workoutIndicatorDot,
                                                    { backgroundColor: dotColor },
                                                ]}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    ))}
                </View>

                {/* Legend */}
                <View style={styles.calendarLegend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.dark.primary }]} />
                        <Text style={styles.legendText}>1 workout</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#FFA500' }]} />
                        <Text style={styles.legendText}>2 workouts</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
                        <Text style={styles.legendText}>3+ workouts</Text>
                    </View>
                </View>

                {/* Selected Day Details */}
                {selectedDay && (
                    <>
                        {calendarData.find((d) => d.day === selectedDay)?.count === 0 ? (
                            <View style={styles.selectedDayCard}>
                                <Text style={styles.selectedDayDateText}>
                                    {selectedMonth?.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </Text>
                                <View style={styles.noWorkoutContainer}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={48}
                                        color={colors.dark.textSecondary}
                                    />
                                    <Text style={styles.noWorkoutText}>
                                        No workout on this day
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.selectedDayCard}>
                                <Text style={styles.selectedDayDateText}>
                                    {selectedMonth?.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </Text>
                                <Text style={styles.selectedDaySubtext}>
                                    {calendarData.find((d) => d.day === selectedDay)?.count} workout completed
                                </Text>

                                {calendarData
                                    .find((d) => d.day === selectedDay)
                                    ?.workouts.map((workout) => (
                                        <View
                                            key={workout.id}
                                            style={styles.workoutDetailCard}
                                        >
                                            <Text style={styles.workoutDetailName}>
                                                {workout.workoutName}
                                            </Text>
                                            <Text style={styles.workoutDetailTime}>
                                                {new Date(workout.completedAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Text>
                                        </View>
                                    ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        )
    }

    const renderDateFilter = () => (
        <View style={styles.filterContainer}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScrollContent}
            >
                {(['all', 'week', 'month', 'year'] as DateFilterType[]).map(
                    (filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterButton,
                                dateFilter === filter &&
                                    styles.filterButtonActive,
                            ]}
                            onPress={() => setDateFilter(filter)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={[
                                    styles.filterButtonText,
                                    dateFilter === filter &&
                                        styles.filterButtonTextActive,
                                ]}
                            >
                                {filter === 'all'
                                    ? 'All Time'
                                    : filter === 'week'
                                      ? 'This Week'
                                      : filter === 'month'
                                        ? 'This Month'
                                        : 'This Year'}
                            </Text>
                        </TouchableOpacity>
                    )
                )}
            </ScrollView>
        </View>
    )

    const renderHistorySection = () => (
        <View style={styles.sectionContainer}>
            {renderDateFilter()}
            <FlatList
                data={filteredHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.historyList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.dark.primary}
                        colors={[colors.dark.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="filter-outline"
                            size={64}
                            color={colors.dark.textSecondary}
                        />
                        <Text style={styles.emptyTitle}>No Workouts Found</Text>
                        <Text style={styles.emptyText}>
                            Try adjusting your filter or start a new workout
                        </Text>
                    </View>
                }
            />
        </View>
    )

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Header
                title="Workout History"
                hideRightIcon
            />

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
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
    },

    // Tab Navigation
    tabNavigation: {
        borderBottomWidth: 1,
        borderBottomColor: colors.dark.border,
        backgroundColor: colors.dark.surface,
    },
    tabList: {
        paddingHorizontal: spacing.sm,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginRight: spacing.xs,
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
        padding: spacing.md,
    },
    historyCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.dark.border,
    },
    historyTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    historyTitle: {
        fontSize: fontSizes.xl,
        fontWeight: 'bold',
        color: colors.dark.text,
    },
    achievementBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 193, 7, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    historyDate: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
        marginBottom: spacing.md,
    },
    historyMainStats: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    mainStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    mainStatValue: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.dark.text,
    },
    perfectBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    perfectText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.dark.success,
    },
    interruptionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    interruptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    interruptionText: {
        fontSize: fontSizes.sm,
        color: colors.dark.muted,
    },
    deleteAction: {
        backgroundColor: colors.dark.error + '90',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
        borderRadius: 16,
        marginLeft: spacing.xs,
    },

    // Stats Section
    sectionContainer: {
        flex: 1,
    },
    sectionContent: {
        padding: spacing.md,
    },
    statsHeading: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.dark.text,
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    
    // Overview Grid (2x2)
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    overviewCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        width: (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.dark.border,
        minHeight: 140,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    overviewValue: {
        fontSize: fontSizes['3xl'],
        fontWeight: 'bold',
        color: colors.dark.text,
        marginBottom: spacing.xs,
    },
    overviewLabel: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
        textAlign: 'center',
    },
    overviewSubtext: {
        fontSize: fontSizes.xs,
        color: colors.dark.muted,
        marginTop: spacing.xs,
    },
    
    // Performance Grid (2 cards side by side)
    performanceGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    performanceCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.dark.border,
        minHeight: 140,
    },
    performanceValue: {
        fontSize: fontSizes['2xl'],
        fontWeight: 'bold',
        color: colors.dark.text,
        marginBottom: spacing.xs,
    },
    performanceLabel: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
        textAlign: 'center',
    },
    
    // More Stats Section
    moreStatsContainer: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.dark.border,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    moreStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.dark.border,
    },
    moreStatsLabel: {
        fontSize: fontSizes.md,
        color: colors.dark.textSecondary,
    },
    moreStatsValue: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.dark.text,
    },
    chartContainer: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.dark.border,
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    chart: {
        borderRadius: 16,
        marginVertical: 0,
    },
    chartWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chartSubtext: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    infoCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 10,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.dark.border,
        marginBottom: spacing.sm,
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
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.sm,
        backgroundColor: colors.dark.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.dark.border,
    },
    filterScrollContent: {
        gap: spacing.xs,
    },
    filterButton: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
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

    // Calendar Section
    calendarMainContainer: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.dark.border,
        marginBottom: spacing.md,
    },
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    monthNavButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarMonth: {
        fontSize: fontSizes['2xl'],
        fontWeight: 'bold',
        color: colors.dark.text,
        textAlign: 'center',
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    calendarDayHeader: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    calendarDayHeaderText: {
        fontSize: fontSizes.sm,
        fontWeight: '500',
        color: colors.dark.textSecondary,
    },
    calendarDayEmpty: {
        flex: 1,
        aspectRatio: 1,
    },
    calendarDayCell: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    calendarDayText: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '500',
    },
    calendarDayTextToday: {
        color: colors.dark.primary,
        fontWeight: 'bold',
    },
    workoutIndicatorDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        position: 'absolute',
        bottom: 4,
    },

    // Calendar Legend
    calendarLegend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
    },

    // Selected Day Card
    selectedDayCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.dark.border,
        marginBottom: spacing.md,
    },
    selectedDayDateText: {
        fontSize: fontSizes.xl,
        fontWeight: 'bold',
        color: colors.dark.text,
        marginBottom: spacing.xs,
    },
    selectedDaySubtext: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
        marginBottom: spacing.md,
    },
    workoutDetailCard: {
        backgroundColor: colors.dark.background,
        borderRadius: 12,
        padding: spacing.md,
        marginTop: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    workoutDetailName: {
        fontSize: fontSizes.lg,
        fontWeight: '600',
        color: colors.dark.text,
    },
    workoutDetailTime: {
        fontSize: fontSizes.md,
        color: colors.dark.textSecondary,
    },
    noWorkoutContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xl,
    },
    noWorkoutText: {
        fontSize: fontSizes.md,
        color: colors.dark.textSecondary,
        marginTop: spacing.md,
        textAlign: 'center',
    },
})
