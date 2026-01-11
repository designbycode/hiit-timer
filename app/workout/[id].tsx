import React, { useEffect, useCallback, useMemo, useState } from 'react'
import {
    View,
    StyleSheet,
    BackHandler,
    StatusBar,
    TouchableOpacity,
    Text,
    Modal,
    Animated,
    AppState,
    Dimensions,
    ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
    useWorkoutStore,
    useTimerState,
    useIsActive,
} from '@/libs/store/workoutStore'
import { useSettingsStore } from '@/libs/store/settingsStore'
import { useTimer } from '@/libs/hooks/useTimer'
import { useKeepScreenAwake } from '@/libs/hooks/useKeepAwake'
import { useBackgroundPersistence } from '@/libs/hooks/useBackgroundPersistence'
import { useButtonSound } from '@/libs/hooks/useButtonSound'
import { useAudio } from '@/libs/contexts/AudioContext'
import { TimerDisplay } from '@/libs/components/TimerDisplay'
import CustomModal from '@/libs/components/CustomModal'
import { Header } from '@/libs/components/Header'
import { PhaseLabel } from '@/libs/components/PhaseLabel'
import { Phase } from '@/libs/types/workout'

import { TIMINGS } from '@/libs/constants/timings'
import { colors, fontSizes, spacing } from '@/libs/constants/theme'
import { AdBanner } from '@/libs/components/AdBanner'

export default function WorkoutScreen() {
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id: string }>()
    const timerState = useTimerState()
    const isActive = useIsActive()
    const { currentWorkout } = useWorkoutStore()
    const settingsStore = useSettingsStore()
    const {
        soundEnabled,
        vibrationEnabled,
        voiceEnabled,
        toggleSound,
        toggleVibration,
        toggleVoice,
    } = settingsStore
    const [workoutMuted, setWorkoutMuted] = useState(false)

    const {
        start,
        pause,
        resume,
        skip,
        stop: stopTimer,
        restart,
    } = useTimer(id || null, workoutMuted)
    const { handlePressIn } = useButtonSound()
    const [showCompletionModal, setShowCompletionModal] = useState(false)
    const [completionVisible, setCompletionVisible] = useState(false)
    const [wasPausedByUser, setWasPausedByUser] = useState(false)

    const completionTranslateY = React.useRef(new Animated.Value(300)).current

    const openCompletion = useCallback(() => {
        setCompletionVisible(true)
        requestAnimationFrame(() => {
            completionTranslateY.setValue(300)
            Animated.timing(completionTranslateY, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start()
        })
    }, [completionTranslateY])

    const closeCompletion = useCallback(() => {
        Animated.timing(completionTranslateY, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) setCompletionVisible(false)
        })
    }, [completionTranslateY])

    useEffect(() => {
        if (showCompletionModal) {
            openCompletion()
        } else if (completionVisible) {
            closeCompletion()
        }
    }, [
        showCompletionModal,
        openCompletion,
        closeCompletion,
        completionVisible,
    ])

    // Handle app state changes (power button / screen lock)
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === 'background' || nextAppState === 'inactive') {
                // App is going to background (power button pressed, screen locked, etc.)
                if (isActive && !wasPausedByUser) {
                    pause()
                    setWasPausedByUser(false) // This was auto-paused, not user-paused
                }
            } else if (nextAppState === 'active') {
                // App is coming back to foreground
                // Don't auto-resume - let user decide when to continue
                setWasPausedByUser(false)
            }
        }

        const subscription = AppState.addEventListener(
            'change',
            handleAppStateChange
        )

        return () => subscription?.remove()
    }, [isActive, pause, wasPausedByUser])
    const [modalVisible, setModalVisible] = useState(false)
    const [modalTitle, setModalTitle] = useState('')
    const [modalMessage, setModalMessage] = useState('')
    const [modalButtons, setModalButtons] = useState<any[]>([])

    const showAlert = (title: string, message: string, buttons: any[]) => {
        setModalTitle(title)
        setModalMessage(message)
        setModalButtons(buttons)
        setModalVisible(true)
    }

    const handleBackPress = useCallback(() => {
        const hasStarted = !!timerState.startTime
        if (hasStarted) {
            showAlert(
                'Workout in Progress',
                'Are you sure you want to leave? Your progress will be lost.',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => setModalVisible(false),
                    },
                    {
                        text: 'Leave',
                        style: 'destructive',
                        onPress: () => {
                            setModalVisible(false)
                            stopTimer()
                            router.back()
                        },
                    },
                ]
            )
            return true
        }
        // Not started yet; allow default back behavior
        return false
    }, [router, stopTimer, timerState.startTime])

    useKeepScreenAwake(isActive && timerState.isRunning)

    useBackgroundPersistence(
        useCallback(() => timerState, [timerState]),
        isActive && timerState.isRunning
    )

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            handleBackPress
        )
        return () => backHandler.remove()
    }, [handleBackPress])

    const handlePauseResume = useCallback(() => {
        if (timerState.isPaused) {
            // User is manually resuming
            setWasPausedByUser(false)
            resume()
        } else {
            // User is manually pausing
            setWasPausedByUser(true)
            pause()
        }
    }, [timerState.isPaused, pause, resume])

    const handleStop = useCallback(() => {
        const hasStarted = !!timerState.startTime
        if (!hasStarted) {
            // If never started, no need to confirm — just go back
            router.back()
            return
        }
        showAlert(
            'Stop Workout',
            'Are you sure you want to stop this workout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => setModalVisible(false),
                },
                {
                    text: 'Stop',
                    style: 'destructive',
                    onPress: () => {
                        setModalVisible(false)
                        stopTimer()
                        router.back()
                    },
                },
            ]
        )
    }, [router, stopTimer, timerState.startTime])

    const handleSkip = useCallback(() => {
        skip()
    }, [skip])

    const handleNewTimer = useCallback(() => {
        setShowCompletionModal(false)
        stopTimer()
        router.back()
    }, [stopTimer, router])

    const handleRestart = useCallback(() => {
        if (showCompletionModal) {
            setShowCompletionModal(false)
            restart()
        } else {
            showAlert(
                'Restart Workout',
                'Are you sure you want to restart this workout from the beginning?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => setModalVisible(false),
                    },
                    {
                        text: 'Restart',
                        style: 'destructive',
                        onPress: () => {
                            setModalVisible(false)
                            restart()
                        },
                    },
                ]
            )
        }
    }, [restart, showCompletionModal])

    const handleOpenSettings = useCallback(() => {
        const hasStarted = !!timerState.startTime
        if (!hasStarted) {
            router.push('/settings')
            return
        }
        showAlert(
            'Workout in Progress',
            'Are you sure you want to leave? Your progress will be lost.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => setModalVisible(false),
                },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: () => {
                        setModalVisible(false)
                        stopTimer()
                        router.push('/settings')
                    },
                },
            ]
        )
    }, [router, stopTimer, timerState.startTime])

    const handleEditWorkout = useCallback(() => {
        const hasStarted = !!timerState.startTime
        if (!hasStarted) {
            router.push(`/create-workout?id=${id}`)
            return
        }
        showAlert(
            'Workout in Progress',
            'Are you sure you want to leave? Your progress will be lost.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => setModalVisible(false),
                },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: () => {
                        setModalVisible(false)
                        stopTimer()
                        router.push(`/create-workout?id=${id}`)
                    },
                },
            ]
        )
    }, [router, stopTimer, timerState.startTime, id])

    const totalRounds = useMemo(() => {
        return currentWorkout?.rounds || 0
    }, [currentWorkout])

    // Calculate total workout duration (memoized, only changes if workout changes)
    const totalWorkoutDuration = useMemo(() => {
        if (!currentWorkout) return 0

        let total = TIMINGS.COUNTDOWN_DURATION
        if (currentWorkout.warmUpDuration)
            total += currentWorkout.warmUpDuration
        total += currentWorkout.workDuration * currentWorkout.rounds
        total += currentWorkout.restDuration * (currentWorkout.rounds - 1)
        if (currentWorkout.coolDownDuration)
            total += currentWorkout.coolDownDuration

        return total
    }, [currentWorkout])

    // Calculate elapsed time directly (always increases, never decreases)
    const elapsedTime = useMemo(() => {
        if (!currentWorkout) return 0

        let elapsed = 0

        // Calculate based on current phase
        switch (timerState.phase) {
            case Phase.COUNTDOWN:
                // Only countdown progress
                elapsed = TIMINGS.COUNTDOWN_DURATION - timerState.timeRemaining
                break

            case Phase.WARM_UP:
                // Countdown complete + warmup progress
                elapsed = TIMINGS.COUNTDOWN_DURATION
                elapsed +=
                    (currentWorkout.warmUpDuration || 0) -
                    timerState.timeRemaining
                break

            case Phase.WORK:
                // Countdown + warmup + completed rounds + current work progress
                elapsed = TIMINGS.COUNTDOWN_DURATION
                if (currentWorkout.warmUpDuration)
                    elapsed += currentWorkout.warmUpDuration

                // Add FULLY completed rounds (both work AND rest done)
                const fullyCompletedRounds = timerState.currentRound
                if (fullyCompletedRounds > 0) {
                    elapsed +=
                        fullyCompletedRounds *
                        (currentWorkout.workDuration +
                            currentWorkout.restDuration)
                }

                // Add current work phase progress
                elapsed +=
                    currentWorkout.workDuration - timerState.timeRemaining
                break

            case Phase.REST:
                // Countdown + warmup + completed rounds + current round's work (done) + rest progress
                elapsed = TIMINGS.COUNTDOWN_DURATION
                if (currentWorkout.warmUpDuration)
                    elapsed += currentWorkout.warmUpDuration

                // BUG FIX: currentRound increments AFTER work phase completes
                // So during REST, currentRound is already incremented by 1
                const actualRoundNumber = timerState.currentRound - 1

                // Add FULLY completed rounds (both work AND rest done)
                if (actualRoundNumber > 0) {
                    elapsed +=
                        actualRoundNumber *
                        (currentWorkout.workDuration +
                            currentWorkout.restDuration)
                }

                // Add current round's work (completed) + rest progress
                elapsed += currentWorkout.workDuration
                elapsed +=
                    currentWorkout.restDuration - timerState.timeRemaining
                break

            case Phase.COOL_DOWN:
                // Everything except cooldown is complete
                elapsed = TIMINGS.COUNTDOWN_DURATION
                if (currentWorkout.warmUpDuration)
                    elapsed += currentWorkout.warmUpDuration
                elapsed += currentWorkout.rounds * currentWorkout.workDuration
                elapsed +=
                    (currentWorkout.rounds - 1) * currentWorkout.restDuration
                elapsed +=
                    (currentWorkout.coolDownDuration || 0) -
                    timerState.timeRemaining
                break

            case Phase.COMPLETE:
                elapsed = totalWorkoutDuration
                break
        }

        return elapsed
    }, [
        currentWorkout,
        timerState.phase,
        timerState.currentRound,
        timerState.timeRemaining,
        totalWorkoutDuration,
    ])

    // Calculate remaining time from elapsed
    const totalRemainingTime = totalWorkoutDuration - elapsedTime

    // Calculate total workout progress (0 to 1)
    const totalProgress = useMemo(() => {
        if (totalWorkoutDuration === 0) return 0
        if (timerState.phase === Phase.COMPLETE) return 1

        // Progress = elapsed / total (always increases from 0 to 1)
        const progress = Math.max(
            0,
            Math.min(1, elapsedTime / totalWorkoutDuration)
        )

        return progress
    }, [totalWorkoutDuration, elapsedTime, timerState.phase])

    useEffect(() => {
        if (timerState.phase === Phase.COMPLETE) {
            setShowCompletionModal(true)
        }
    }, [timerState.phase])

    const getNextPhaseInfo = useCallback(() => {
        const workout = currentWorkout
        let nextPhase: Phase = Phase.COMPLETE
        if (!workout) return { label: 'Next', duration: 0 }

        switch (timerState.phase) {
            case Phase.COUNTDOWN:
                nextPhase =
                    workout.warmUpDuration && workout.warmUpDuration > 0
                        ? Phase.WARM_UP
                        : Phase.WORK
                break
            case Phase.WARM_UP:
                nextPhase = Phase.WORK
                break
            case Phase.WORK:
                nextPhase =
                    timerState.currentRound < workout.rounds - 1
                        ? Phase.REST
                        : workout.coolDownDuration &&
                            workout.coolDownDuration > 0
                          ? Phase.COOL_DOWN
                          : Phase.COMPLETE
                break
            case Phase.REST:
                nextPhase = Phase.WORK
                break
            case Phase.COOL_DOWN:
                nextPhase = Phase.COMPLETE
                break
            case Phase.COMPLETE:
                nextPhase = Phase.COMPLETE
                break
        }

        const labels: Record<Phase, string> = {
            [Phase.COUNTDOWN]: 'Get Ready',
            [Phase.WARM_UP]: 'Warm Up',
            [Phase.WORK]: 'Workout',
            [Phase.REST]: 'Rest',
            [Phase.COOL_DOWN]: 'Cool Down',
            [Phase.COMPLETE]: 'Finished',
        }

        const getDuration = (phase: Phase): number => {
            switch (phase) {
                case Phase.COUNTDOWN:
                    return TIMINGS.COUNTDOWN_DURATION
                case Phase.WARM_UP:
                    return workout.warmUpDuration || 0
                case Phase.WORK:
                    return workout.workDuration || 0
                case Phase.REST:
                    return workout.restDuration || 0
                case Phase.COOL_DOWN:
                    return workout.coolDownDuration || 0
                default:
                    return 0
            }
        }

        return {
            label: `Next ${labels[nextPhase]}`,
            duration: getDuration(nextPhase),
        }
    }, [timerState.phase, timerState.currentRound, currentWorkout])

    if (!currentWorkout) {
        return null
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            {/* Completion Bottom Sheet */}
            <Modal
                animationType="none"
                transparent
                visible={completionVisible}
                onRequestClose={() => setShowCompletionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalOverlayFill}
                        activeOpacity={1}
                        onPress={() => setShowCompletionModal(false)}
                    />
                    <Animated.View
                        style={[
                            styles.bottomSheet,
                            {
                                transform: [
                                    { translateY: completionTranslateY },
                                ],
                            },
                        ]}
                    >
                        <View style={styles.sheetHandle} />
                        <Text style={styles.modalTitle}>Workout Complete!</Text>
                        <Text style={styles.modalText}>
                            Great job! You&apos;ve completed your workout.
                        </Text>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.restartButton]}
                            onPress={handleRestart}
                            onPressIn={handlePressIn}
                        >
                            <Text style={styles.buttonText}>
                                Restart Workout
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.newTimerButton]}
                            onPress={handleNewTimer}
                            onPressIn={handlePressIn}
                        >
                            <Text
                                style={[styles.buttonText, { color: '#000' }]}
                            >
                                Select New Timer
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* Header */}
            <Header
                title="ACTIVE WORKOUT"
                onBackPress={handleStop}
                onRightPress={handleEditWorkout}
                rightIconName="create-outline"
                hideRightIcon={currentWorkout.isPreset}
            />

            {/* Workout Name */}

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.content}>
                    {/* Mute Button */}
                    <TouchableOpacity
                        style={styles.muteButton}
                        onPress={() => setWorkoutMuted(!workoutMuted)}
                        accessibilityRole="button"
                        accessibilityLabel={workoutMuted ? "Unmute workout" : "Mute workout"}
                    >
                        <Ionicons
                            name={workoutMuted ? "volume-mute" : "volume-high"}
                            size={24}
                            color={workoutMuted ? "#ff6b6b" : "rgba(255, 255, 255, 0.7)"}
                        />
                    </TouchableOpacity>

                    {/* Workout Label */}
                    <View style={styles.workoutLabelContainer}>
                        <PhaseLabel phase={timerState.phase} />
                    </View>
                    <TimerDisplay
                        timerState={timerState}
                        totalRounds={totalRounds}
                        workoutName={currentWorkout.name}
                        totalProgress={totalProgress}
                        onPress={() => {
                            if (timerState.phase === Phase.COMPLETE) {
                                // Restart when workout is complete
                                restart()
                            } else if (
                                !timerState.isRunning &&
                                timerState.phase === Phase.COUNTDOWN
                            ) {
                                start()
                            } else if (timerState.isRunning) {
                                handlePauseResume()
                            }
                        }}
                    />
                    <View style={styles.controls}>
                        {/* Three action buttons: Reset, Skip, End */}
                        <View style={styles.actionButtonRow}>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleRestart}
                                onPressIn={handlePressIn}
                                accessibilityRole="button"
                                accessibilityLabel="Reset"
                            >
                                <Ionicons
                                    name="refresh"
                                    size={32}
                                    color="#999"
                                />
                                <Text style={styles.actionButtonLabel}>
                                    Reset
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleSkip}
                                onPressIn={handlePressIn}
                                accessibilityRole="button"
                                accessibilityLabel="Skip"
                            >
                                <Ionicons
                                    name="play-forward"
                                    size={32}
                                    color="#999"
                                />
                                <Text style={styles.actionButtonLabel}>
                                    Skip
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleStop}
                                onPressIn={handlePressIn}
                                accessibilityRole="button"
                                accessibilityLabel="End"
                            >
                                <Ionicons name="stop" size={32} color="#999" />
                                <Text style={styles.actionButtonLabel}>
                                    End
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Ad Banner at bottom - Temporarily disabled, requires native rebuild */}
            <AdBanner style={styles.adBanner} />

            <CustomModal
                visible={modalVisible}
                title={modalTitle}
                message={modalMessage}
                buttons={modalButtons}
                onRequestClose={() => setModalVisible(false)}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'flex-end',
    },
    modalOverlayFill: {
        flex: 1,
    },
    bottomSheet: {
        backgroundColor: colors.dark.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderColor: colors.dark.border,
        borderWidth: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    sheetHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.dark.border,
        marginBottom: spacing.sm,
    },
    modalContent: {
        backgroundColor: colors.dark.surface,
        borderRadius: 20,
        padding: spacing.lg,
        alignItems: 'center',
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        color: colors.dark.text,
        fontSize: fontSizes['2xl'],
        fontWeight: 'bold',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    modalText: {
        color: colors.dark.muted,
        fontSize: fontSizes.md,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    modalButton: {
        width: '100%',
        padding: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    restartButton: {
        backgroundColor: colors.dark.success,
    },
    newTimerButton: {
        backgroundColor: colors.dark.text,
    },
    buttonText: {
        color: colors.dark.text,
        fontWeight: 'bold',
        fontSize: fontSizes.md,
    },

    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    workoutLabelContainer: {
        marginBottom: spacing.lg,
        width: '100%',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 60,
    },
    controls: {
        width: '100%',
        marginVertical: spacing.xl,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    actionButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
    },
    actionButton: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 80,
    },
    actionButtonLabel: {
        marginTop: spacing.sm,
        color: '#999',
        fontSize: fontSizes.sm,
        fontWeight: '600',
    },
    adBanner: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    muteButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
})
