import { QuickStartCard } from '@/libs/components/QuickStartCard'
import { WorkoutCard } from '@/libs/components/WorkoutCard'
import { PrimaryButton } from '@/libs/components/PrimaryButton'
import CustomModal from '@/libs/components/CustomModal'
import { colors, fontSizes, spacing } from '@/libs/constants/theme'
import { PRESETS } from '@/libs/constants/presets'
import { storageService } from '@/libs/services/storage/StorageService'
import { useWorkoutStore } from '@/libs/store/workoutStore'
import { Workout } from '@/libs/types/workout'
import { useButtonSound } from '@/libs/hooks/useButtonSound'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Animated, { LinearTransition, FadeInDown, FadeOutUp } from 'react-native-reanimated'

export default function HomeScreen() {
    const router = useRouter()
    const [workouts, setWorkouts] = useState<Workout[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUsedWorkout, setLastUsedWorkout] = useState<Workout | null>(null)
    const { setWorkout } = useWorkoutStore()
    const { handlePressIn } = useButtonSound()
    const [modalVisible, setModalVisible] = useState(false)
    const [modalTitle, setModalTitle] = useState('')
    const [modalMessage, setModalMessage] = useState('')
    const [modalButtons, setModalButtons] = useState<any[]>([])

    // Undo toast state
    const [lastDeleted, setLastDeleted] = useState<Workout | null>(null)
    const [undoTimer, setUndoTimer] = useState<ReturnType<
        typeof setTimeout
    > | null>(null)
    const [showUndo, setShowUndo] = useState(false)

    // Filter state: true = show all, false = show only user workouts
    const [showAllWorkouts, setShowAllWorkouts] = useState(true)

    useEffect(() => {
        loadWorkouts()
        loadFilterPreference()
    }, [])

    const loadFilterPreference = async () => {
        try {
            const filterState = await storageService.getWorkoutFilter()
            setShowAllWorkouts(filterState)
        } catch (error) {
            console.error('Error loading filter preference:', error)
        }
    }

    const setDefaultWorkout = useCallback(() => {
        setLastUsedWorkout(workouts.length > 0 ? workouts[0] : PRESETS[0])
    }, [workouts])

    useEffect(() => {
        const loadLastUsed = async () => {
            try {
                const lastUsedId = await storageService.loadLastWorkout()
                const all = [...PRESETS, ...workouts]
                if (lastUsedId) {
                    const found = all.find((w) => w.id === lastUsedId)
                    if (found) {
                        setLastUsedWorkout(found)
                        return
                    }
                }
            } catch (error) {
                console.error('Error loading last used workout:', error)
            }
            setDefaultWorkout()
        }
        if (!loading) {
            loadLastUsed()
        }
    }, [workouts, loading, setDefaultWorkout])

    const loadWorkouts = useCallback(async () => {
        try {
            const saved = await storageService.loadWorkouts()
            setWorkouts(saved)
        } catch (error) {
            console.error('Error loading workouts:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Refresh list when returning to this screen
    useFocusEffect(
        useCallback(() => {
            loadWorkouts()
        }, [loadWorkouts])
    )

    const myWorkouts = useMemo(() => {
        const allWorkouts = [...PRESETS, ...workouts]
        if (showAllWorkouts) {
            return allWorkouts
        }
        // Show only user-created workouts (not presets)
        return workouts
    }, [workouts, showAllWorkouts])

    const toggleWorkoutFilter = useCallback(async () => {
        const newState = !showAllWorkouts
        setShowAllWorkouts(newState)
        await storageService.setWorkoutFilter(newState)
    }, [showAllWorkouts])

    const handleWorkoutPress = useCallback(
        async (workout: Workout) => {
            setWorkout(workout)
            await storageService.saveLastWorkout(workout.id)
            router.push(`/workout/${workout.id}`)
        },
        [router, setWorkout]
    )

    const handleDelete = useCallback(
        async (id: string) => {
            try {
                const all = [...PRESETS, ...workouts]
                const found = all.find((w) => w.id === id) || null
                await storageService.deleteWorkout(id)
                await storageService.flush?.()
                setLastDeleted(found)
                setShowUndo(true)
                // Auto-hide after 4 seconds
                if (undoTimer) clearTimeout(undoTimer)
                const t = setTimeout(() => {
                    setShowUndo(false)
                    setLastDeleted(null)
                    setUndoTimer(null)
                }, 4000)
                setUndoTimer(t)
                await loadWorkouts()
            } catch (e) {
                console.error('Failed to delete workout:', e)
            }
        },
        [workouts, loadWorkouts, undoTimer]
    )

    const handleUndo = useCallback(async () => {
        try {
            if (lastDeleted) {
                await storageService.saveWorkout(lastDeleted)
                await storageService.flush?.()
                await loadWorkouts()
            }
        } catch (e) {
            console.error('Failed to undo delete:', e)
        } finally {
            if (undoTimer) clearTimeout(undoTimer)
            setUndoTimer(null)
            setShowUndo(false)
            setLastDeleted(null)
        }
    }, [lastDeleted, loadWorkouts, undoTimer])

    const handleCreateWorkout = useCallback(() => {
        router.push('/create-workout')
    }, [router])

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.iconContainer}>
                        <Image
                            source={require('@/assets/images/hiit-icon.png')}
                            style={{ width: 80, height: 80 }}
                        />
                    </View>
                    <Text style={styles.title}>HIIT Timer</Text>
                </View>
            </View>

            <Animated.FlatList
                data={myWorkouts}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => (
                    <View style={{ height: spacing.sm }} />
                )}
                renderItem={({ item, index }) => (
                    <Animated.View 
                        key={item.id}
                        layout={LinearTransition.springify()}
                        entering={FadeInDown.delay(index * 50).duration(300)}
                        exiting={FadeOutUp.duration(200)}
                    >
                        <WorkoutCard
                            workout={item}
                            onPress={() => handleWorkoutPress(item)}
                            onDelete={!item.isPreset ? handleDelete : undefined}
                        />
                    </Animated.View>
                )}
                ListHeaderComponent={
                    <>
                        <Text style={styles.readyText}>Ready to Train?</Text>
                        {lastUsedWorkout && (
                            <QuickStartCard
                                workout={lastUsedWorkout}
                                onPress={() =>
                                    handleWorkoutPress(lastUsedWorkout)
                                }
                            />
                        )}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Workouts</Text>
                            <TouchableOpacity 
                                onPress={toggleWorkoutFilter}
                                onPressIn={handlePressIn}
                                style={styles.filterButton}
                            >
                                <Text style={styles.seeAllText}>
                                    {showAllWorkouts ? 'My Workouts' : 'See All'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                }
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.bottomButtonContainer}>
                <PrimaryButton
                    title="Create New Workout"
                    icon="add"
                    onPress={handleCreateWorkout}
                />
            </View>

            <CustomModal
                visible={modalVisible}
                title={modalTitle}
                message={modalMessage}
                buttons={modalButtons}
                onRequestClose={() => setModalVisible(false)}
            />

            {showUndo && (
                <View style={styles.toastContainer}>
                    <View style={styles.toast}>
                        <Text style={styles.toastText}>
                            Deleted{lastDeleted ? `: ${lastDeleted.name}` : ''}
                        </Text>
                        <TouchableOpacity onPress={handleUndo}>
                            <Text style={styles.toastUndo}>Undo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        backgroundColor: colors.dark.background,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    title: {
        fontSize: fontSizes['2xl'],
        fontWeight: '700',
        color: colors.dark.text,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    readyText: {
        fontSize: fontSizes['3xl'],
        fontWeight: '700',
        color: colors.dark.text,
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
    },
    sectionTitle: {
        fontSize: fontSizes.xl,
        fontWeight: '600',
        color: colors.dark.text,
    },
    filterButton: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
    },
    seeAllText: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.dark.primary,
    },
    bottomButtonContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.dark.background,
        borderTopWidth: 1,
        borderTopColor: colors.dark.border,
    },
    toastContainer: {
        position: 'absolute',
        left: spacing.sm,
        right: spacing.sm,
        bottom: 70,
    },
    toast: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.dark.surfaceAlt,
        borderColor: colors.dark.border,
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    toastText: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '500',
    },
    toastUndo: {
        color: colors.dark.primary,
        fontSize: fontSizes.md,
        fontWeight: '700',
        marginLeft: spacing.md,
    },
})
