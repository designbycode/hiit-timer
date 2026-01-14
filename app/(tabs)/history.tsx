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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import { storageService } from '@/libs/services/storage/StorageService'
import { Ionicons } from '@expo/vector-icons'
import { formatTime } from '@/libs/utils/time'
import { WorkoutHistory } from '@/libs/types/workout'
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit'

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

    // Focus listener to reload data when screen comes into view
    useEffect(() => {
        const unsubscribe = router.subscribe?.(() => {
            loadHistory()
        })
        return unsubscribe
    }, [router])

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

    const renderTabItem = ({ item }: { item: TabType }) => (
        <TouchableOpacity
            style={[styles.tab, selectedTab === item && styles.tabActive]}
            onPress={() => setSelectedTab(item)}
            activeOpacity={0.7}
        >
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

    const renderHistoryItem = ({ item }: { item: WorkoutHistory }) => (
        <View style={styles.historyCard}>
            <View style={styles.historyHeader}>
                <View style={styles.historyTitleContainer}>
                    <Text style={styles.historyTitle}>{item.workoutName}</Text>
                    <Text style={styles.historyDate}>
                        {new Date(item.completedAt).toLocaleDateString()} at{' '}
                        {new Date(item.completedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => handleDeleteHistory(item.id)}
                    style={styles.deleteButton}
                >
                    <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.dark.danger}
                    />
                </TouchableOpacity>
            </View>
            <View style={styles.historyStats}>
                <View style={styles.statItem}>
                    <Ionicons
                        name="time"
                        size={16}
                        color={colors.dark.textSecondary}
                    />
                    <Text style={styles.statText}>
                        {formatTime(item.duration)}
                    </Text>
                </View>
                <View style={styles.statItem}>
                    <Ionicons
                        name="repeat"
                        size={16}
                        color={colors.dark.textSecondary}
                    />
                    <Text style={styles.statText}>{item.rounds} rounds</Text>
                </View>
            </View>
        </View>
    )

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
            {/* Stats Cards - 2x3 Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Ionicons
                        name="fitness"
                        size={28}
                        color={colors.dark.primary}
                    />
                    <Text style={styles.statCardValue}>
                        {stats.totalWorkouts}
                    </Text>
                    <Text style={styles.statCardLabel}>Workouts</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons
                        name="time"
                        size={28}
                        color={colors.dark.success}
                    />
                    <Text style={styles.statCardValue}>
                        {formatTime(stats.totalDuration)}
                    </Text>
                    <Text style={styles.statCardLabel}>Total Time</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons
                        name="speedometer"
                        size={28}
                        color={colors.dark.info}
                    />
                    <Text style={styles.statCardValue}>
                        {formatTime(stats.avgDuration)}
                    </Text>
                    <Text style={styles.statCardLabel}>Avg Time</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons
                        name="flame-outline"
                        size={28}
                        color={colors.dark.primary}
                    />
                    <Text style={styles.statCardValue}>
                        {stats.currentStreak}
                    </Text>
                    <Text style={styles.statCardLabel}>Current Streak</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons
                        name="trophy-outline"
                        size={28}
                        color={colors.dark.warning}
                    />
                    <Text style={styles.statCardValue}>{stats.bestStreak}</Text>
                    <Text style={styles.statCardLabel}>Best Streak</Text>
                </View>
                <View style={styles.statCard}>
                    <Ionicons
                        name="repeat"
                        size={28}
                        color={colors.dark.accent}
                    />
                    <Text style={styles.statCardValue}>
                        {stats.totalRounds}
                    </Text>
                    <Text style={styles.statCardLabel}>Total Rounds</Text>
                </View>
            </View>

            {/* Charts */}
            {history.length > 0 && (
                <>
                    {/* Workout Distribution Pie Chart */}
                    {stats.workoutDistribution.length > 0 && (
                        <>
                            <Text style={styles.sectionTitle}>
                                Workout Distribution
                            </Text>
                            <View style={styles.chartContainer}>
                                <View style={styles.chartWrapper}>
                                    <PieChart
                                        data={stats.workoutDistribution}
                                        width={CHART_WIDTH}
                                        height={220}
                                        chartConfig={{
                                            color: (opacity = 1) =>
                                                `rgba(255, 255, 255, ${opacity})`,
                                            labelColor: (opacity = 1) =>
                                                `rgba(255, 255, 255, ${opacity})`,
                                        }}
                                        accessor="count"
                                        backgroundColor="transparent"
                                        paddingLeft="15"
                                        absolute
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    <Text style={styles.sectionTitle}>Weekly Activity</Text>
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
                                        `rgba(138, 180, 248, ${opacity})`,
                                    labelColor: (opacity = 1) =>
                                        `rgba(255, 255, 255, ${opacity})`,
                                    style: { borderRadius: 16 },
                                    barPercentage: 0.6,
                                }}
                                style={styles.chart}
                                fromZero
                            />
                        </View>
                    </View>

                    {/* Progress Line Chart */}
                    <Text style={styles.sectionTitle}>
                        30-Day Progress (Minutes/Day)
                    </Text>
                    <View style={styles.chartContainer}>
                        <View style={styles.chartWrapper}>
                            <LineChart
                                data={{
                                    labels: progressData.labels,
                                    datasets: [
                                        {
                                            data:
                                                progressData.data.length > 0
                                                    ? progressData.data
                                                    : [0],
                                        },
                                    ],
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
                                    color: (opacity = 1) =>
                                        `rgba(76, 175, 80, ${opacity})`,
                                    labelColor: (opacity = 1) =>
                                        `rgba(255, 255, 255, ${opacity})`,
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
                    </View>

                    {/* Insights */}
                    <Text style={styles.sectionTitle}>Insights</Text>

                    <View style={styles.infoCard}>
                        <Ionicons
                            name="trophy"
                            size={24}
                            color={colors.dark.warning}
                        />
                        <View style={styles.infoCardContent}>
                            <Text style={styles.infoCardLabel}>
                                Most Frequent Workout
                            </Text>
                            <Text style={styles.infoCardText}>
                                {stats.mostFrequentWorkout || 'N/A'}
                            </Text>
                        </View>
                    </View>

                    {stats.longestWorkout && (
                        <View style={styles.infoCard}>
                            <Ionicons
                                name="medal"
                                size={24}
                                color={colors.dark.primary}
                            />
                            <View style={styles.infoCardContent}>
                                <Text style={styles.infoCardLabel}>
                                    Longest Workout
                                </Text>
                                <Text style={styles.infoCardText}>
                                    {stats.longestWorkout.workoutName} -{' '}
                                    {formatTime(stats.longestWorkout.duration)}
                                </Text>
                            </View>
                        </View>
                    )}
                </>
            )}
        </ScrollView>
    )

    const renderCalendarSection = () => {
        const now = new Date()
        const monthName = selectedMonth?.toLocaleDateString('en-US', {
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
                            color={colors.dark.text}
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
                            color={colors.dark.text}
                        />
                    </TouchableOpacity>
                </View>

                {/* Month Statistics Summary */}
                <View style={styles.monthStatsContainer}>
                    <View style={styles.monthStatItem}>
                        <Text style={styles.monthStatValue}>
                            {monthStats.totalWorkouts}
                        </Text>
                        <Text style={styles.monthStatLabel}>Workouts</Text>
                    </View>
                    <View style={styles.monthStatItem}>
                        <Text style={styles.monthStatValue}>
                            {monthStats.activeDays}
                        </Text>
                        <Text style={styles.monthStatLabel}>Active Days</Text>
                    </View>
                    <View style={styles.monthStatItem}>
                        <Text style={styles.monthStatValue}>
                            {formatTime(monthStats.totalDuration)}
                        </Text>
                        <Text style={styles.monthStatLabel}>Total Time</Text>
                    </View>
                </View>

                {/* Heat Map Calendar Grid */}
                <View style={styles.calendarContainer}>
                    {/* Day headers */}
                    <View style={styles.calendarRow}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
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

                    {/* Calendar days with colored dots */}
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
                                            style={styles.calendarDay}
                                        />
                                    )
                                }

                                const dotColor = getDotColor(
                                    dayData?.count || 0
                                )
                                const dotSize = getDotSize(dayData?.count || 0)

                                return (
                                    <TouchableOpacity
                                        key={dayIndex}
                                        style={[
                                            styles.calendarDaySimple,
                                            isToday &&
                                                styles.calendarDayTodayBorder,
                                            isSelected &&
                                                styles.calendarDaySelected,
                                        ]}
                                        onPress={() =>
                                            setSelectedDay(
                                                isSelected ? null : dayNumber
                                            )
                                        }
                                        activeOpacity={0.7}
                                    >
                                        <Text
                                            style={[
                                                styles.calendarDayTextSimple,
                                                isToday &&
                                                    styles.calendarDayTextToday,
                                                isSelected &&
                                                    styles.calendarDayTextSelected,
                                            ]}
                                        >
                                            {dayNumber}
                                        </Text>
                                        {dayData && dayData.count > 0 && (
                                            <View
                                                style={[
                                                    styles.workoutDot,
                                                    {
                                                        backgroundColor:
                                                            dotColor,
                                                        width: dotSize,
                                                        height: dotSize,
                                                        borderRadius:
                                                            dotSize / 2,
                                                    },
                                                ]}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    ))}
                </View>

                {/* Dot Legend */}
                <View style={styles.dotLegend}>
                    <View style={styles.dotLegendItem}>
                        <View
                            style={[
                                styles.legendDotExample,
                                {
                                    backgroundColor: colors.dark.info,
                                    width: 6,
                                    height: 6,
                                },
                            ]}
                        />
                        <Text style={styles.dotLegendText}>1 workout</Text>
                    </View>
                    <View style={styles.dotLegendItem}>
                        <View
                            style={[
                                styles.legendDotExample,
                                {
                                    backgroundColor: colors.dark.success,
                                    width: 8,
                                    height: 8,
                                },
                            ]}
                        />
                        <Text style={styles.dotLegendText}>2 workouts</Text>
                    </View>
                    <View style={styles.dotLegendItem}>
                        <View
                            style={[
                                styles.legendDotExample,
                                {
                                    backgroundColor: colors.dark.primary,
                                    width: 10,
                                    height: 10,
                                },
                            ]}
                        />
                        <Text style={styles.dotLegendText}>3+ workouts</Text>
                    </View>
                </View>

                {/* Selected Day Details */}
                {selectedDay && (
                    <>
                        {calendarData.find((d) => d.day === selectedDay)
                            ?.count === 0 && (
                            <View style={styles.noWorkoutMessage}>
                                <Ionicons
                                    name="calendar-outline"
                                    size={48}
                                    color={colors.dark.textSecondary}
                                />
                                <Text style={styles.noWorkoutTitle}>
                                    No Workout
                                </Text>
                                <Text style={styles.noWorkoutText}>
                                    {selectedMonth ? selectedMonth.toLocaleDateString('en-US', {
                                        month: 'long',
                                    }) : 'Month'}{' '}
                                    {selectedDay} - Rest Day
                                </Text>
                            </View>
                        )}
                    </>
                )}
                {selectedDay &&
                    calendarData.find((d) => d.day === selectedDay)?.count >
                        0 && (
                        <View style={styles.selectedDayDetails}>
                            <View style={styles.selectedDayHeader}>
                                <Text style={styles.selectedDayTitle}>
                                    {selectedMonth ? selectedMonth.toLocaleDateString('en-US', {
                                        month: 'long',
                                    }) : 'Month'}{' '}
                                    {selectedDay}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setSelectedDay(null)}
                                >
                                    <Ionicons
                                        name="close"
                                        size={24}
                                        color={colors.dark.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            {calendarData
                                .find((d) => d.day === selectedDay)
                                ?.workouts.map((workout, index) => (
                                    <View
                                        key={workout.id}
                                        style={styles.selectedDayWorkout}
                                    >
                                        <View
                                            style={
                                                styles.selectedDayWorkoutHeader
                                            }
                                        >
                                            <Ionicons
                                                name="fitness"
                                                size={20}
                                                color={colors.dark.primary}
                                            />
                                            <Text
                                                style={
                                                    styles.selectedDayWorkoutName
                                                }
                                            >
                                                {workout.workoutName}
                                            </Text>
                                        </View>
                                        <View
                                            style={
                                                styles.selectedDayWorkoutStats
                                            }
                                        >
                                            <View
                                                style={
                                                    styles.selectedDayWorkoutStat
                                                }
                                            >
                                                <Ionicons
                                                    name="time-outline"
                                                    size={16}
                                                    color={
                                                        colors.dark
                                                            .textSecondary
                                                    }
                                                />
                                                <Text
                                                    style={
                                                        styles.selectedDayWorkoutStatText
                                                    }
                                                >
                                                    {new Date(
                                                        workout.completedAt
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Text>
                                            </View>
                                            <View
                                                style={
                                                    styles.selectedDayWorkoutStat
                                                }
                                            >
                                                <Ionicons
                                                    name="timer-outline"
                                                    size={16}
                                                    color={
                                                        colors.dark
                                                            .textSecondary
                                                    }
                                                />
                                                <Text
                                                    style={
                                                        styles.selectedDayWorkoutStatText
                                                    }
                                                >
                                                    {formatTime(
                                                        workout.duration
                                                    )}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                        </View>
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
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
    },
    header: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.dark.border,
    },
    headerTitle: {
        fontSize: fontSizes['2xl'],
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
        paddingHorizontal: spacing.sm,
    },
    tab: {
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
        padding: spacing.sm,
    },
    historyCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 12,
        padding: spacing.sm,
        marginBottom: spacing.sm,
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
        gap: spacing.md,
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
        padding: spacing.sm,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    statCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 10,
        padding: spacing.sm,
        width: (SCREEN_WIDTH - spacing.sm * 2 - spacing.xs * 2) / 3,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.dark.border,
        minHeight: 90,
    },
    statCardValue: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.dark.text,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
    },
    statCardLabel: {
        fontSize: fontSizes.xs,
        color: colors.dark.textSecondary,
        textAlign: 'center',
        lineHeight: 14,
    },
    sectionTitle: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.dark.text,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
    },
    chartContainer: {
        backgroundColor: colors.dark.surface,
        borderRadius: 12,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.dark.border,
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    chart: {
        borderRadius: 12,
        marginVertical: 0,
    },
    chartWrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
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
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.sm,
    },
    monthNavButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.dark.surface,
        borderWidth: 1,
        borderColor: colors.dark.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarMonth: {
        fontSize: fontSizes.xl,
        fontWeight: 'bold',
        color: colors.dark.text,
        textAlign: 'center',
    },

    // Month Statistics
    monthStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: colors.dark.surface,
        borderRadius: 10,
        padding: spacing.sm,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.dark.border,
    },
    monthStatItem: {
        alignItems: 'center',
    },
    monthStatValue: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.dark.primary,
        marginBottom: spacing.xs,
    },
    monthStatLabel: {
        fontSize: fontSizes.xs,
        color: colors.dark.textSecondary,
    },

    // Heat Map Calendar
    calendarContainer: {
        backgroundColor: colors.dark.surface,
        borderRadius: 10,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.dark.border,
    },
    calendarRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: spacing.xs,
    },
    calendarDayHeader: {
        width: (SCREEN_WIDTH - spacing.sm * 2 - spacing.sm * 2) / 7,
        alignItems: 'center',
        paddingVertical: spacing.xs,
    },
    calendarDayHeaderText: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.dark.textSecondary,
    },
    calendarDay: {
        width: (SCREEN_WIDTH - spacing.sm * 2 - spacing.sm * 2) / 7,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        position: 'relative',
    },
    calendarDaySimple: {
        width: (SCREEN_WIDTH - spacing.sm * 2 - spacing.sm * 2) / 7,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRadius: 8,
    },
    calendarDayTodayBorder: {
        borderWidth: 2,
        borderColor: colors.dark.primary,
    },
    calendarDaySelected: {
        backgroundColor: 'rgba(255, 152, 0, 0.15)',
    },
    calendarDayText: {
        fontSize: fontSizes.sm,
        color: colors.dark.text,
    },
    calendarDayTextSimple: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '500',
    },
    calendarDayTextToday: {
        color: colors.dark.primary,
        fontWeight: 'bold',
    },
    calendarDayTextSelected: {
        fontWeight: 'bold',
    },
    workoutDot: {
        position: 'absolute',
        bottom: 4,
    },

    // Dot Legend
    dotLegend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        marginTop: spacing.sm,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.dark.surface,
        borderRadius: 10,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.dark.border,
    },
    dotLegendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    legendDotExample: {
        borderRadius: 50,
    },
    dotLegendText: {
        fontSize: fontSizes.sm,
        color: colors.dark.text,
        fontWeight: '500',
    },

    // No Workout Message
    noWorkoutMessage: {
        marginTop: spacing.sm,
        backgroundColor: colors.dark.surface,
        borderRadius: 10,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.dark.border,
    },
    noWorkoutTitle: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.dark.text,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    noWorkoutText: {
        fontSize: fontSizes.md,
        color: colors.dark.textSecondary,
        textAlign: 'center',
    },

    // Selected Day Details
    selectedDayDetails: {
        marginTop: spacing.sm,
        backgroundColor: colors.dark.surface,
        borderRadius: 10,
        padding: spacing.sm,
        borderWidth: 1,
        borderColor: colors.dark.border,
    },
    selectedDayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.dark.border,
    },
    selectedDayTitle: {
        fontSize: fontSizes.lg,
        fontWeight: 'bold',
        color: colors.dark.text,
    },
    selectedDayWorkout: {
        backgroundColor: colors.dark.background,
        borderRadius: 8,
        padding: spacing.sm,
        marginBottom: spacing.sm,
    },
    selectedDayWorkoutHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    selectedDayWorkoutName: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.dark.text,
        flex: 1,
    },
    selectedDayWorkoutStats: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xs,
    },
    selectedDayWorkoutStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    selectedDayWorkoutStatText: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
    },
})
