import React, { useEffect, useCallback, useMemo, useState } from 'react'
import {
    View,
    StyleSheet,
    BackHandler,
    StatusBar,
    TouchableOpacity,
    Text,
    Modal,
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
import { Phase } from '@/libs/types/workout'
import { formatTime } from '@/libs/utils/time'
import { TIMINGS } from '@/libs/constants/timings'
import { colors, fontSizes, spacing } from '@/libs/constants/theme'

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
        if (timerState.isRunning && !timerState.isPaused) {
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
        return false
    }, [router, stopTimer, timerState.isPaused, timerState.isRunning])

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
            resume()
        } else {
            pause()
        }
    }, [timerState.isPaused, pause, resume])

    const handleStop = useCallback(() => {
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
    }, [stopTimer, router])

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
            [Phase.WORK]: 'WORK',
            [Phase.REST]: 'REST',
            [Phase.COOL_DOWN]: 'COOL DOWN',
            [Phase.COMPLETE]: 'FINISHED',
        }
        return labels[timerState.phase] || 'ACTIVE'
    }, [timerState.phase])

    useEffect(() => {
        if (!timerState.isRunning && !timerState.isPaused && id) {
            start()
        }
    }, [id, start, timerState.isRunning, timerState.isPaused])

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
            [Phase.WORK]: 'Work',
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

            {/* Completion Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={showCompletionModal}
                onRequestClose={() => setShowCompletionModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Workout Complete!</Text>
                        <Text style={styles.modalText}>
                            Great job! You&apos;ve completed your workout in{' '}
                            {formatTime(timerState.totalTime)}.
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
                    </View>
                </View>
            </Modal>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleStop}
                    onPressIn={handlePressIn}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>ACTIVE WORKOUT</Text>
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={() => router.push('/settings')}
                    onPressIn={handlePressIn}
                >
                    <Ionicons name="settings" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Workout Label */}
            <View
                style={[styles.workoutLabel, { backgroundColor: phaseColor }]}
            >
                <Text style={styles.workoutLabelText}>{phaseLabel}</Text>
            </View>

            <View style={styles.content}>
                <TimerDisplay
                    timerState={timerState}
                    totalRounds={totalRounds}
                />

                <View style={styles.controls}>
                    <View style={styles.controlRow}>
                        <TouchableOpacity
                            style={[
                                styles.controlButton,
                                { backgroundColor: '#333' },
                            ]}
                            onPress={handlePauseResume}
                            onPressIn={handlePressIn}
                        >
                            <Ionicons
                                name={timerState.isPaused ? 'play' : 'pause'}
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.controlButton,
                                { backgroundColor: '#FFA500' },
                            ]}
                            onPress={handleRestart}
                            onPressIn={handlePressIn}
                        >
                            <Ionicons name="refresh" size={24} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.controlButton,
                                { backgroundColor: phaseColor },
                            ]}
                            onPress={handleSkip}
                            onPressIn={handlePressIn}
                        >
                            <Ionicons
                                name="play-skip-forward"
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[styles.nextButton, { backgroundColor: '#333' }]}
                        onPress={handleSkip}
                        onPressIn={handlePressIn}
                    >
                        {(() => {
                            const next = getNextPhaseInfo()
                            return (
                                <Text style={styles.nextButtonText}>
                                    {next.label} ({formatTime(next.duration)})
                                </Text>
                            )
                        })()}
                        <View style={styles.nextButtonIcon}>
                            <Ionicons
                                name="arrow-forward"
                                size={16}
                                color="#fff"
                            />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    backButton: {
        padding: spacing.sm,
    },
    headerTitle: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '600',
    },
    settingsButton: {
        padding: spacing.sm,
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
        fontSize: fontSizes.xs,
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
    },
    controlRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    controlButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 30,
        minWidth: 200,
        justifyContent: 'space-between',
    },
    nextButtonText: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '600',
    },
    nextButtonIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
    },
})
