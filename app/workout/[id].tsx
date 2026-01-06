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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
    useWorkoutStore,
    useTimerState,
    useIsActive,
} from '@/libs/store/workoutStore'
import { useTimer } from '@/libs/hooks/useTimer'
import { useKeepScreenAwake } from '@/libs/hooks/useKeepAwake'
import { useBackgroundPersistence } from '@/libs/hooks/useBackgroundPersistence'
import { useButtonSound } from '@/libs/hooks/useButtonSound'
import { TimerDisplay } from '@/libs/components/TimerDisplay'
import CustomModal from '@/libs/components/CustomModal'
import { Header } from '@/libs/components/Header'
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
    const {
        start,
        pause,
        resume,
        skip,
        stop: stopTimer,
        restart,
    } = useTimer(id || null)
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

    const totalRounds = useMemo(() => {
        return currentWorkout?.rounds || 0
    }, [currentWorkout])

    const phaseColor = useMemo(() => {
        const colors: Record<Phase, string> = {
            [Phase.COUNTDOWN]: '#9E9E9E',
            [Phase.WARM_UP]: '#4CAF50',
            [Phase.WORK]: '#F44336',
            [Phase.REST]: '#2196F3',
            [Phase.COOL_DOWN]: '#FF9800',
            [Phase.COMPLETE]: '#9C27B0',
        }
        return colors[timerState.phase] || '#007AFF'
    }, [timerState.phase])

    const phaseLabel = useMemo(() => {
        const labels: Record<Phase, string> = {
            [Phase.COUNTDOWN]: 'GET READY',
            [Phase.WARM_UP]: 'WARM UP',
            [Phase.WORK]: 'WORKOUT',
            [Phase.REST]: 'REST',
            [Phase.COOL_DOWN]: 'COOL DOWN',
            [Phase.COMPLETE]: 'FINISHED',
        }
        return labels[timerState.phase] || 'ACTIVE'
    }, [timerState.phase])

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
                onRightPress={handleOpenSettings}
                hideRightIcon
            />

            <View style={styles.content}>
                {/* Workout Label */}
                <View
                    style={[
                        styles.workoutLabel,
                        { backgroundColor: phaseColor },
                    ]}
                >
                    <Text style={styles.workoutLabelText}>{phaseLabel}</Text>
                </View>
                <TimerDisplay
                    timerState={timerState}
                    totalRounds={totalRounds}
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
                            <Ionicons name="refresh" size={32} color="#999" />
                            <Text style={styles.actionButtonLabel}>Reset</Text>
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
                            <Text style={styles.actionButtonLabel}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleStop}
                            onPressIn={handlePressIn}
                            accessibilityRole="button"
                            accessibilityLabel="End"
                        >
                            <Ionicons name="stop" size={32} color="#999" />
                            <Text style={styles.actionButtonLabel}>End</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

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

    workoutLabel: {
        alignSelf: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        marginBottom: spacing.lg,
    },
    workoutLabelText: {
        color: colors.dark.text,
        textTransform: 'uppercase',
        fontSize: fontSizes.sm,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    controls: {
        width: '100%',
        marginTop: spacing.xl,
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
})
