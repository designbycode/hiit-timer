import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Switch,
    PanResponder,
    Animated,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useWorkoutStore } from '@/libs/store/workoutStore'
import { storageService } from '@/libs/services/storage/StorageService'
import { Button } from '@/libs/components/Button'
import { PrimaryButton } from '@/libs/components/PrimaryButton'
import CustomModal from '@/libs/components/CustomModal'
import { Workout } from '@/libs/types/workout'
import { TIMINGS } from '@/libs/constants/timings'
import { colors, fontSizes, spacing } from '@/libs/constants/theme'
import { formatTime, formatTimeShort } from '@/libs/utils/time'
import { SafeAreaView } from 'react-native-safe-area-context'
import { hapticManager } from '@/libs/services/alerts/HapticManager'
import Header from '@/libs/components/Header'

export default function CreateWorkoutScreen() {
    const router = useRouter()
    const { id } = useLocalSearchParams<{ id?: string }>()
    const { currentWorkout } = useWorkoutStore()
    const isEditing = !!id

    const [name, setName] = useState('')
    const [workDuration, setWorkDuration] = useState('30')
    const [restDuration, setRestDuration] = useState('15')
    const [rounds, setRounds] = useState('5')
    const [warmUpDuration, setWarmUpDuration] = useState('')
    const [coolDownDuration, setCoolDownDuration] = useState('')
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [modalTitle, setModalTitle] = useState('')
    const [modalMessage, setModalMessage] = useState('')
    const [modalButtons, setModalButtons] = useState<any[]>([])

    // Toggle states for warm-up and cool-down
    const [warmUpEnabled, setWarmUpEnabled] = useState(false)
    const [coolDownEnabled, setCoolDownEnabled] = useState(false)

    // Slider state
    const sliderWidth = useRef(0)
    const isDragging = useRef(false)

    // Focus state for name input
    const [nameInputFocused, setNameInputFocused] = useState(false)

    // Name validation error state
    const [nameError, setNameError] = useState(false)
    const [nameErrorMessage, setNameErrorMessage] = useState('')

    // Debounce timer for validation
    const validationTimerRef = useRef<number | null>(null)

    // Slider dragging state for visual feedback
    const [isSliderDragging, setIsSliderDragging] = useState(false)

    const updateWorkDurationFromPosition = useCallback(
        (x: number) => {
            if (sliderWidth.current === 0) return
            const percentage = Math.max(0, Math.min(1, x / sliderWidth.current))
            const value = Math.round(
                TIMINGS.MIN_WORK_DURATION +
                    percentage *
                        (TIMINGS.MAX_WORK_DURATION - TIMINGS.MIN_WORK_DURATION)
            )
            const currentValue = parseInt(workDuration || '0', 10)
            if (value !== currentValue) {
                setWorkDuration(String(value))
                if (value % 10 === 0) {
                    // Haptic feedback every 10 seconds
                    hapticManager.trigger('light')
                }
            }
        },
        [workDuration]
    )

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => true,
            onPanResponderGrant: (evt) => {
                isDragging.current = true;
                setIsSliderDragging(true);
                hapticManager.trigger('light');
                const locationX = evt.nativeEvent.locationX;
                updateWorkDurationFromPosition(locationX);
            },
            onPanResponderMove: (evt, gestureState) => {
                if (!isDragging.current) return;
                // Use gestureState.dx for smoother tracking of movement
                const touchX = Math.max(0, Math.min(gestureState.moveX, sliderWidth.current));
                updateWorkDurationFromPosition(touchX);
            },
            onPanResponderRelease: () => {
                isDragging.current = false;
                setIsSliderDragging(false);
                hapticManager.trigger('light');
            },
            onPanResponderTerminate: () => {
                isDragging.current = false;
                setIsSliderDragging(false);
            }
        })
    ).current

    const showAlert = (title: string, message: string, buttons: any[]) => {
        setModalTitle(title)
        setModalMessage(message)
        setModalButtons(buttons)
        setModalVisible(true)
    }

    useEffect(() => {
        if (isEditing && currentWorkout) {
            setName(currentWorkout.name)
            setWorkDuration(currentWorkout.workDuration.toString())
            setRestDuration(currentWorkout.restDuration.toString())
            setRounds(currentWorkout.rounds.toString())
            const hasWarmUp =
                currentWorkout.warmUpDuration &&
                currentWorkout.warmUpDuration > 0
            const hasCoolDown =
                currentWorkout.coolDownDuration &&
                currentWorkout.coolDownDuration > 0
            setWarmUpDuration(
                hasWarmUp ? currentWorkout.warmUpDuration!.toString() : '60'
            )
            setCoolDownDuration(
                hasCoolDown ? currentWorkout.coolDownDuration!.toString() : '60'
            )
            setWarmUpEnabled(!!hasWarmUp)
            setCoolDownEnabled(!!hasCoolDown)
        }

        // Cleanup validation timer on unmount
        return () => {
            if (validationTimerRef.current) {
                clearTimeout(validationTimerRef.current)
            }
        }
    }, [isEditing, currentWorkout])

    // Real-time validation while typing (debounced)
    const validateNameDebounced = useCallback(
        (workoutName: string) => {
            // Clear existing timer
            if (validationTimerRef.current) {
                clearTimeout(validationTimerRef.current)
            }

            // Clear error immediately if name is empty
            if (!workoutName.trim()) {
                setNameError(false)
                setNameErrorMessage('')
                return
            }

            // Debounce the validation check
            validationTimerRef.current = setTimeout(async () => {
                // Check for duplicate workout names
                const existingWorkouts = await storageService.loadWorkouts()
                const duplicateWorkout = existingWorkouts.find(
                    (w) =>
                        w.name.toLowerCase() ===
                            workoutName.trim().toLowerCase() && w.id !== id
                )
                if (duplicateWorkout) {
                    setNameError(true)
                    setNameErrorMessage('This workout name already exists')
                    return
                }

                // Clear error if validation passes
                setNameError(false)
                setNameErrorMessage('')
            }, 500) // Wait 500ms after user stops typing
        },
        [id]
    )

    const validate = useCallback(async (): Promise<boolean> => {
        if (!name.trim()) {
            setNameError(true)
            setNameErrorMessage('Please enter a workout name')
            showAlert('Error', 'Please enter a workout name', [
                { text: 'OK', onPress: () => setModalVisible(false) },
            ])
            return false
        }

        // Check for duplicate workout names
        const existingWorkouts = await storageService.loadWorkouts()
        const duplicateWorkout = existingWorkouts.find(
            (w) => w.name.toLowerCase() === name.trim().toLowerCase() && w.id !== id
        )
        if (duplicateWorkout) {
            setNameError(true)
            setNameErrorMessage('This workout name already exists')
            showAlert(
                'Duplicate Name',
                `A workout named "${name.trim()}" already exists. Please choose a different name.`,
                [{ text: 'OK', onPress: () => setModalVisible(false) }]
            )
            return false
        }

        // Clear error if validation passes
        setNameError(false)
        setNameErrorMessage('')

        const work = parseInt(workDuration, 10)
        const rest = parseInt(restDuration, 10)
        const roundsNum = parseInt(rounds, 10)
        const warmUp = warmUpDuration ? parseInt(warmUpDuration, 10) : 0
        const coolDown = coolDownDuration ? parseInt(coolDownDuration, 10) : 0

        if (
            work < TIMINGS.MIN_WORK_DURATION ||
            work > TIMINGS.MAX_WORK_DURATION
        ) {
            showAlert(
                'Error',
                `Workout duration must be between ${TIMINGS.MIN_WORK_DURATION} and ${TIMINGS.MAX_WORK_DURATION} seconds`,
                [{ text: 'OK', onPress: () => setModalVisible(false) }]
            )
            return false
        }

        if (
            rest < TIMINGS.MIN_REST_DURATION ||
            rest > TIMINGS.MAX_REST_DURATION
        ) {
            showAlert(
                'Error',
                `Rest duration must be between ${TIMINGS.MIN_REST_DURATION} and ${TIMINGS.MAX_REST_DURATION} seconds`,
                [{ text: 'OK', onPress: () => setModalVisible(false) }]
            )
            return false
        }

        if (roundsNum < TIMINGS.MIN_ROUNDS || roundsNum > TIMINGS.MAX_ROUNDS) {
            showAlert(
                'Error',
                `Rounds must be between ${TIMINGS.MIN_ROUNDS} and ${TIMINGS.MAX_ROUNDS}`,
                [{ text: 'OK', onPress: () => setModalVisible(false) }]
            )
            return false
        }

        if (warmUp > TIMINGS.MAX_WARM_UP) {
            showAlert(
                'Error',
                `Warm-up duration cannot exceed ${TIMINGS.MAX_WARM_UP} seconds`,
                [{ text: 'OK', onPress: () => setModalVisible(false) }]
            )
            return false
        }

        if (coolDown > TIMINGS.MAX_COOL_DOWN) {
            showAlert(
                'Error',
                `Cool-down duration cannot exceed ${TIMINGS.MAX_COOL_DOWN} seconds`,
                [{ text: 'OK', onPress: () => setModalVisible(false) }]
            )
            return false
        }

        return true
    }, [
        name,
        workDuration,
        restDuration,
        rounds,
        warmUpDuration,
        coolDownDuration,
    ])

    const totalSeconds = React.useMemo(() => {
        const work = parseInt(workDuration || '0', 10) || 0
        const rest = parseInt(restDuration || '0', 10) || 0
        const roundsNum = parseInt(rounds || '0', 10) || 0
        const warm = warmUpEnabled
            ? parseInt(warmUpDuration || '0', 10) || 0
            : 0
        const cool = coolDownEnabled
            ? parseInt(coolDownDuration || '0', 10) || 0
            : 0
        if (roundsNum <= 0) return warm + cool
        const betweenRests = Math.max(0, roundsNum - 1)
        return warm + roundsNum * work + betweenRests * rest + cool
    }, [
        workDuration,
        restDuration,
        rounds,
        warmUpDuration,
        coolDownDuration,
        warmUpEnabled,
        coolDownEnabled,
    ])

    const totalLabel = React.useMemo(
        () => formatTimeShort(totalSeconds),
        [totalSeconds]
    )

    const handleSave = useCallback(async () => {
        const isValid = await validate()
        if (!isValid) return

        setLoading(true)
        try {
            const workout: Workout = {
                id: id || `workout_${Date.now()}`,
                name: name.trim(),
                workDuration: parseInt(workDuration, 10),
                restDuration: parseInt(restDuration, 10),
                rounds: parseInt(rounds, 10),
                warmUpDuration:
                    warmUpEnabled && warmUpDuration
                        ? parseInt(warmUpDuration, 10)
                        : undefined,
                coolDownDuration:
                    coolDownEnabled && coolDownDuration
                        ? parseInt(coolDownDuration, 10)
                        : undefined,
            }

            await storageService.saveWorkout(workout)
            await storageService.flush()
            router.replace('/(tabs)/')
        } catch (error) {
            console.error('Error saving workout:', error)
            showAlert('Error', 'Failed to save workout', [
                { text: 'OK', onPress: () => setModalVisible(false) },
            ])
        } finally {
            setLoading(false)
        }
    }, [
        id,
        name,
        workDuration,
        restDuration,
        rounds,
        warmUpDuration,
        coolDownDuration,
        warmUpEnabled,
        coolDownEnabled,
        validate,
        router,
    ])

    const handleDelete = useCallback(() => {
        if (!id) return

        showAlert(
            'Delete Workout',
            'Are you sure you want to delete this workout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => setModalVisible(false),
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await storageService.deleteWorkout(id)
                        await storageService.flush()
                        setModalVisible(false)
                        router.replace('/(tabs)/')
                    },
                },
            ]
        )
    }, [id, router])

    return (
        <SafeAreaView edges={['bottom']} style={styles.container}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Custom Header */}

                <Header
                    title={isEditing ? 'Edit Workout' : 'Create Workout'}
                    onBackPress={() => router.back()}
                    hideRightIcon
                />

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Workout Name Section */}
                    <Text style={styles.sectionHeader}>WORKOUT NAME</Text>
                    <View
                        style={[
                            styles.nameInputCard,
                            nameInputFocused && styles.nameInputCardFocused,
                            nameError && styles.nameInputCardError,
                        ]}
                    >
                        <TextInput
                            style={styles.nameInput}
                            value={name}
                            onChangeText={(text) => {
                                setName(text)
                                // Real-time validation with debounce
                                validateNameDebounced(text)
                            }}
                            placeholder="e.g., Tabata Tuesday"
                            placeholderTextColor={colors.dark.muted}
                            onFocus={() => setNameInputFocused(true)}
                            onBlur={() => setNameInputFocused(false)}
                            maxLength={20}
                        />
                        {name.length > 0 && (
                            <TouchableOpacity
                                style={styles.clearButton}
                                onPress={() => {
                                    hapticManager.trigger('light')
                                    setName('')
                                }}
                            >
                                <Ionicons
                                    name="close-circle"
                                    size={20}
                                    color={colors.dark.muted}
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.editIconButton}>
                            <Ionicons
                                name="create-outline"
                                size={20}
                                color={
                                    nameInputFocused
                                        ? colors.accent
                                        : colors.dark.muted
                                }
                            />
                        </TouchableOpacity>
                    </View>
                    {nameError && nameErrorMessage && (
                        <Text style={styles.errorMessage}>
                            {nameErrorMessage}
                        </Text>
                    )}
                    {name.length > 15 && !nameError && (
                        <Text style={styles.charCount}>
                            {name.length}/20 characters
                        </Text>
                    )}

                    {/* The Loop Section */}
                    <Text style={styles.sectionHeader}>THE LOOP</Text>

                    {/* Work Duration with Slider */}
                    <View style={styles.loopCard}>
                        <View style={styles.workHeader}>
                            <View style={styles.workLabelRow}>
                                <Ionicons
                                    name="fitness"
                                    size={20}
                                    color={colors.accent}
                                />
                                <Text style={styles.workLabel}>Work</Text>
                            </View>
                            <View style={styles.workValueContainer}>
                                <Text
                                    style={[
                                        styles.workValue,
                                        isSliderDragging &&
                                            styles.workValueDragging,
                                    ]}
                                >
                                    {workDuration}
                                </Text>
                                <Text style={styles.workUnit}>s</Text>
                            </View>
                        </View>
                        <View
                            style={styles.sliderContainer}
                            onLayout={(e) => {
                                sliderWidth.current = e.nativeEvent.layout.width
                            }}
                            {...panResponder.panHandlers}
                        >
                            <View style={styles.sliderTrack}>
                                <View
                                    style={[
                                        styles.sliderFill,
                                        {
                                            width: `${((parseInt(workDuration || '0') - TIMINGS.MIN_WORK_DURATION) / (TIMINGS.MAX_WORK_DURATION - TIMINGS.MIN_WORK_DURATION)) * 100}%`,
                                        },
                                    ]}
                                />
                                <View
                                    style={[
                                        styles.sliderThumb,
                                        isSliderDragging &&
                                            styles.sliderThumbDragging,
                                        {
                                            left: `${((parseInt(workDuration || '0') - TIMINGS.MIN_WORK_DURATION) / (TIMINGS.MAX_WORK_DURATION - TIMINGS.MIN_WORK_DURATION)) * 100}%`,
                                        },
                                    ]}
                                />
                            </View>
                            {/* Min/Max labels */}
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabelText}>
                                    {TIMINGS.MIN_WORK_DURATION}s
                                </Text>
                                <Text style={styles.sliderLabelText}>
                                    {formatTimeShort(TIMINGS.MAX_WORK_DURATION)}
                                </Text>
                            </View>
                        </View>
                        {/* Stepper buttons below slider */}
                        <View style={styles.workSteppers}>
                            <TouchableOpacity
                                style={styles.workStepperButton}
                                onPress={() => {
                                    hapticManager.trigger('light')
                                    const v = Math.max(
                                        TIMINGS.MIN_WORK_DURATION,
                                        (parseInt(workDuration || '0', 10) ||
                                            0) - 5
                                    )
                                    setWorkDuration(String(v))
                                }}
                            >
                                <Ionicons
                                    name="remove"
                                    size={18}
                                    color={colors.dark.text}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.workStepperButton}
                                onPress={() => {
                                    hapticManager.trigger('light')
                                    const v = Math.min(
                                        TIMINGS.MAX_WORK_DURATION,
                                        (parseInt(workDuration || '0', 10) ||
                                            0) + 5
                                    )
                                    setWorkDuration(String(v))
                                }}
                            >
                                <Ionicons
                                    name="add"
                                    size={18}
                                    color={colors.dark.text}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Rest Duration */}
                    <View style={styles.compactCard}>
                        <View style={styles.compactLeft}>
                            <Text style={styles.compactLabel}>Rest</Text>
                            <Text style={styles.compactSubLabel}>
                                Recovery time
                            </Text>
                        </View>
                        <View style={styles.compactStepper}>
                            <TouchableOpacity
                                style={styles.compactButton}
                                onPress={() => {
                                    hapticManager.trigger('light')
                                    const v = Math.max(
                                        TIMINGS.MIN_REST_DURATION,
                                        (parseInt(restDuration || '0', 10) ||
                                            0) - 5
                                    )
                                    setRestDuration(String(v))
                                }}
                            >
                                <Ionicons
                                    name="remove"
                                    size={20}
                                    color={colors.dark.text}
                                />
                            </TouchableOpacity>
                            <Text style={styles.compactValue}>
                                {restDuration}s
                            </Text>
                            <TouchableOpacity
                                style={styles.compactButton}
                                onPress={() => {
                                    hapticManager.trigger('light')
                                    const v = Math.min(
                                        TIMINGS.MAX_REST_DURATION,
                                        (parseInt(restDuration || '0', 10) ||
                                            0) + 5
                                    )
                                    setRestDuration(String(v))
                                }}
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color={colors.dark.text}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Rounds */}
                    <View style={styles.compactCard}>
                        <View style={styles.compactLeft}>
                            <Text style={styles.compactLabel}>Rounds</Text>
                            <Text style={styles.compactSubLabel}>
                                Total sets
                            </Text>
                        </View>
                        <View style={styles.compactStepper}>
                            <TouchableOpacity
                                style={styles.compactButton}
                                onPress={() => {
                                    hapticManager.trigger('light')
                                    const v = Math.max(
                                        TIMINGS.MIN_ROUNDS,
                                        (parseInt(rounds || '0', 10) || 0) - 1
                                    )
                                    setRounds(String(v))
                                }}
                            >
                                <Ionicons
                                    name="remove"
                                    size={20}
                                    color={colors.dark.text}
                                />
                            </TouchableOpacity>
                            <Text style={styles.compactValue}>{rounds}</Text>
                            <TouchableOpacity
                                style={styles.compactButton}
                                onPress={() => {
                                    hapticManager.trigger('light')
                                    const v = Math.min(
                                        TIMINGS.MAX_ROUNDS,
                                        (parseInt(rounds || '0', 10) || 0) + 1
                                    )
                                    setRounds(String(v))
                                }}
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color={colors.dark.text}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Extras Section */}
                    <Text style={styles.sectionHeader}>EXTRAS</Text>

                    {/* Warm-up Toggle */}
                    <View style={styles.extraCard}>
                        <View style={styles.extraIconContainer}>
                            <Ionicons
                                name="flame"
                                size={24}
                                color={colors.phase.WARM_UP}
                            />
                        </View>
                        <View style={styles.extraContent}>
                            <Text style={styles.extraLabel}>Warm-up</Text>
                            <Text
                                style={[
                                    styles.extraStatus,
                                    warmUpEnabled && styles.extraStatusEnabled,
                                ]}
                            >
                                {warmUpEnabled
                                    ? `${formatTimeShort(parseInt(warmUpDuration || '60'))} enabled`
                                    : 'Disabled'}
                            </Text>
                            {warmUpEnabled && (
                                <View style={styles.extraSteppers}>
                                    <TouchableOpacity
                                        style={styles.extraStepperButton}
                                        onPress={() => {
                                            hapticManager.trigger('light')
                                            const v = Math.max(
                                                5,
                                                (parseInt(
                                                    warmUpDuration || '60',
                                                    10
                                                ) || 60) - 5
                                            )
                                            setWarmUpDuration(String(v))
                                        }}
                                    >
                                        <Ionicons
                                            name="remove"
                                            size={16}
                                            color={colors.dark.text}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.extraStepperButton}
                                        onPress={() => {
                                            hapticManager.trigger('light')
                                            const v = Math.min(
                                                TIMINGS.MAX_WARM_UP,
                                                (parseInt(
                                                    warmUpDuration || '60',
                                                    10
                                                ) || 60) + 5
                                            )
                                            setWarmUpDuration(String(v))
                                        }}
                                    >
                                        <Ionicons
                                            name="add"
                                            size={16}
                                            color={colors.dark.text}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Switch
                            value={warmUpEnabled}
                            onValueChange={(val) => {
                                hapticManager.trigger('light')
                                setWarmUpEnabled(val)
                                if (val && !warmUpDuration)
                                    setWarmUpDuration('60')
                            }}
                            trackColor={{
                                false: colors.dark.border,
                                true: colors.accent,
                            }}
                            thumbColor={colors.dark.text}
                        />
                    </View>

                    {/* Cool-down Toggle */}
                    <View style={styles.extraCard}>
                        <View style={styles.extraIconContainer}>
                            <Ionicons
                                name="snow"
                                size={24}
                                color={colors.phase.COOL_DOWN}
                            />
                        </View>
                        <View style={styles.extraContent}>
                            <Text style={styles.extraLabel}>Cool-down</Text>
                            <Text
                                style={[
                                    styles.extraStatus,
                                    coolDownEnabled &&
                                        styles.extraStatusEnabled,
                                ]}
                            >
                                {coolDownEnabled
                                    ? `${formatTimeShort(parseInt(coolDownDuration || '60'))} enabled`
                                    : 'Disabled'}
                            </Text>
                            {coolDownEnabled && (
                                <View style={styles.extraSteppers}>
                                    <TouchableOpacity
                                        style={styles.extraStepperButton}
                                        onPress={() => {
                                            hapticManager.trigger('light')
                                            const v = Math.max(
                                                5,
                                                (parseInt(
                                                    coolDownDuration || '60',
                                                    10
                                                ) || 60) - 5
                                            )
                                            setCoolDownDuration(String(v))
                                        }}
                                    >
                                        <Ionicons
                                            name="remove"
                                            size={16}
                                            color={colors.dark.text}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.extraStepperButton}
                                        onPress={() => {
                                            hapticManager.trigger('light')
                                            const v = Math.min(
                                                TIMINGS.MAX_COOL_DOWN,
                                                (parseInt(
                                                    coolDownDuration || '60',
                                                    10
                                                ) || 60) + 5
                                            )
                                            setCoolDownDuration(String(v))
                                        }}
                                    >
                                        <Ionicons
                                            name="add"
                                            size={16}
                                            color={colors.dark.text}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                        <Switch
                            value={coolDownEnabled}
                            onValueChange={(val) => {
                                hapticManager.trigger('light')
                                setCoolDownEnabled(val)
                                if (val && !coolDownDuration)
                                    setCoolDownDuration('60')
                            }}
                            trackColor={{
                                false: colors.dark.border,
                                true: colors.accent,
                            }}
                            thumbColor={colors.dark.text}
                        />
                    </View>

                    {/* Total Duration */}
                    <View style={styles.totalDurationContainer}>
                        <Text style={styles.totalDurationLabel}>
                            Total Duration
                        </Text>
                        <Text style={styles.totalDurationValue}>
                            {formatTime(totalSeconds)}
                        </Text>
                    </View>

                    {/* Save Button */}
                    <PrimaryButton
                        title={isEditing ? 'Save Changes' : 'Save Workout'}
                        icon="save-outline"
                        onPress={handleSave}
                        loading={loading}
                        style={styles.saveButton}
                    />

                    {isEditing && (
                        <PrimaryButton
                            title="Delete Workout"
                            icon="trash-outline"
                            variant="danger"
                            onPress={handleDelete}
                            style={styles.deleteButton}
                        />
                    )}
                </ScrollView>

                <CustomModal
                    visible={modalVisible}
                    title={modalTitle}
                    message={modalMessage}
                    buttons={modalButtons}
                    onRequestClose={() => setModalVisible(false)}
                />
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
    },
    flex: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    sectionHeader: {
        color: colors.accent,
        fontSize: fontSizes.xs,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    nameInputCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    nameInputCardFocused: {
        borderColor: colors.accent,
    },
    nameInputCardError: {
        borderColor: '#FF453A',
    },
    nameInput: {
        flex: 1,
        color: colors.dark.text,
        fontSize: fontSizes.lg,
        fontWeight: '400',
    },
    clearButton: {
        padding: spacing.xs,
        marginRight: spacing.xs,
    },
    editIconButton: {
        padding: spacing.xs,
    },
    charCount: {
        fontSize: fontSizes.xs,
        color: colors.dark.muted,
        marginTop: -spacing.sm,
        marginBottom: spacing.sm,
        marginLeft: spacing.sm,
    },
    errorMessage: {
        fontSize: fontSizes.xs,
        color: '#FF453A',
        marginTop: -spacing.sm,
        marginBottom: spacing.sm,
        marginLeft: spacing.sm,
    },
    loopCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    workHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    workLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    workLabel: {
        color: colors.dark.text,
        fontSize: fontSizes.lg,
        fontWeight: '700',
    },
    workValueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    workValue: {
        color: colors.accent,
        fontSize: 48,
        fontWeight: '700',
    },
    workValueDragging: {
        transform: [{ scale: 1.1 }],
    },
    workUnit: {
        color: colors.accent,
        fontSize: fontSizes.lg,
        fontWeight: '400',
        marginLeft: 4,
    },
    sliderContainer: {
        paddingVertical: spacing.sm,
    },
    sliderTrack: {
        height: 8,
        backgroundColor: colors.dark.border,
        borderRadius: 4,
        position: 'relative',
        overflow: 'visible',
    },
    sliderFill: {
        height: '100%',
        backgroundColor: colors.accent,
        borderRadius: 4,
    },
    sliderThumb: {
        position: 'absolute',
        top: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: colors.dark.text,
        marginLeft: -10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    sliderThumbDragging: {
        width: 24,
        height: 24,
        borderRadius: 12,
        top: -8,
        marginLeft: -12,
        shadowOpacity: 0.5,
        shadowRadius: 6,
        elevation: 6,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    sliderLabelText: {
        fontSize: fontSizes.xs,
        color: colors.dark.muted,
        fontWeight: '500',
    },
    workSteppers: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    workStepperButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: colors.dark.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    compactLeft: {
        flex: 1,
    },
    compactLabel: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '600',
        marginBottom: 4,
    },
    compactSubLabel: {
        color: colors.dark.muted,
        fontSize: fontSizes.sm,
        fontWeight: '400',
    },
    compactStepper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    compactButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: colors.dark.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactValue: {
        color: colors.accent,
        fontSize: fontSizes.xl,
        fontWeight: '700',
        minWidth: 50,
        textAlign: 'center',
    },
    extraCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 16,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    extraIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.dark.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    extraContent: {
        flex: 1,
    },
    extraLabel: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '600',
        marginBottom: 4,
    },
    extraStatus: {
        color: colors.dark.muted,
        fontSize: fontSizes.sm,
        fontWeight: '400',
    },
    extraStatusEnabled: {
        color: colors.accent,
    },
    extraSteppers: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    extraStepperButton: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: colors.dark.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.dark.border,
    },
    totalDurationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginTop: spacing.md,
    },
    totalDurationLabel: {
        color: colors.dark.muted,
        fontSize: fontSizes.md,
        fontWeight: '600',
    },
    totalDurationValue: {
        color: colors.dark.text,
        fontSize: fontSizes['3xl'],
        fontWeight: '700',
    },
    saveButton: {
        marginTop: spacing.md,
    },
    deleteButton: {
        marginTop: spacing.sm,
    },
})
