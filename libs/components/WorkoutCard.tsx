import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Workout } from '@/libs/types/workout'
import { formatTimeShort } from '@/libs/utils/time'
import { colors, fontSizes, spacing } from '@/libs/constants/theme'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated'

interface WorkoutCardProps {
    workout: Workout
    onPress: () => void
    onDeleteRequest?: () => void
}

export const WorkoutCard: React.FC<WorkoutCardProps> = React.memo(
    ({ workout, onPress, onDeleteRequest }) => {
        const isPressed = useSharedValue(false)
        const translateX = useSharedValue(0)
        const screenWidth = Dimensions.get('window').width

        const totalDuration = React.useMemo(() => {
            let total = 0
            if (workout.warmUpDuration) total += workout.warmUpDuration
            total += workout.workDuration * workout.rounds
            total += workout.restDuration * (workout.rounds - 1)
            if (workout.coolDownDuration) total += workout.coolDownDuration
            return total
        }, [workout])

        const formatDuration = (seconds: number) => {
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            if (mins > 0) {
                return secs > 0
                    ? `${mins}:${secs.toString().padStart(2, '0')}`
                    : `${mins}:00`
            }
            return `0:${secs.toString().padStart(2, '0')}`
        }

        const pan = Gesture.Pan()
            .enabled(!workout.isPreset)
            .onUpdate((e) => {
                // Only allow swiping left
                const tx = Math.min(0, e.translationX)
                translateX.value = tx
            })
            .onEnd(() => {
                const THRESHOLD = -80
                if (translateX.value < THRESHOLD) {
                    // fling out and request delete
                    translateX.value = withTiming(
                        -screenWidth,
                        { duration: 180 },
                        (finished) => {
                            if (finished && onDeleteRequest) {
                                runOnJS(onDeleteRequest)()
                            }
                        }
                    )
                } else {
                    translateX.value = withSpring(0)
                }
            })

        const pressGesture = Gesture.LongPress()
            .onStart(() => {
                isPressed.value = true
            })
            .onEnd(() => {
                isPressed.value = false
            })
            .onFinalize(() => {
                isPressed.value = false
            })

        const composed = Gesture.Simultaneous(pan, pressGesture)

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [
                { translateX: translateX.value },
                { scale: withSpring(isPressed.value ? 1.02 : 1) },
            ],
        }))

        return (
            <GestureDetector gesture={composed}>
                <View style={styles.swipeBackground}>
                    {!workout.isPreset && (
                        <View style={styles.deleteBackground}>
                            <Ionicons
                                name="trash-outline"
                                size={20}
                                color={colors.dark.error}
                            />
                            <Text style={styles.deleteLabel}>Delete</Text>
                        </View>
                    )}
                    <Animated.View style={animatedStyle}>
                        <TouchableOpacity
                            style={[
                                styles.card,
                                workout.isPreset && styles.presetCard,
                            ]}
                            onPress={onPress}
                            activeOpacity={0.7}
                        >
                            {/* Accent bar */}
                            <View style={styles.accent} />

                            {/* Main content */}
                            <View style={styles.content}>
                                <View style={styles.headerRow}>
                                    <Text style={styles.name} numberOfLines={1}>
                                        {workout.name}
                                    </Text>
                                    <View style={styles.durationPill}>
                                        <Ionicons
                                            name="time-outline"
                                            size={12}
                                            color={colors.dark.subtle}
                                        />
                                        <Text style={styles.durationText}>
                                            {formatDuration(totalDuration)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.metaRow}>
                                    <View style={styles.metaItem}>
                                        <Ionicons
                                            name="repeat-outline"
                                            size={14}
                                            color="#9EA2A8"
                                        />
                                        <Text style={styles.metaText}>
                                            {workout.rounds} rounds
                                        </Text>
                                    </View>
                                    <View style={styles.dot} />
                                    <View style={styles.metaItem}>
                                        <Ionicons
                                            name="flash-outline"
                                            size={14}
                                            color="#9EA2A8"
                                        />
                                        <Text style={styles.metaText}>
                                            {formatTimeShort(
                                                workout.workDuration
                                            )}{' '}
                                            work
                                        </Text>
                                    </View>
                                    <View style={styles.dot} />
                                    <View style={styles.metaItem}>
                                        <Ionicons
                                            name="pause-outline"
                                            size={14}
                                            color="#9EA2A8"
                                        />
                                        <Text style={styles.metaText}>
                                            {formatTimeShort(
                                                workout.restDuration
                                            )}{' '}
                                            rest
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Actions */}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={styles.playButton}
                                    onPress={onPress}
                                    accessibilityLabel="Start workout"
                                >
                                    <Ionicons
                                        name="play"
                                        size={18}
                                        color={colors.dark.text}
                                    />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </GestureDetector>
        )
    },
    (prev, next) =>
        prev.workout.id === next.workout.id &&
        prev.workout.name === next.workout.name
)

WorkoutCard.displayName = 'WorkoutCard'

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.dark.surface,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginHorizontal: spacing.sm / 2,
        marginVertical: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.dark.border,
        overflow: 'hidden',
    },
    accent: {
        width: 3,
        alignSelf: 'stretch',
        backgroundColor: colors.dark.accent,
        borderRadius: 2,
        marginRight: 10,
    },
    content: {
        flex: 1,
        minWidth: 0,
        paddingRight: 12,
        gap: 6,
        marginRight: 8,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    name: {
        flex: 1,
        color: colors.dark.text,
        fontWeight: '600',
        fontSize: 16,
        marginRight: 8,
        paddingRight: 8,
        overflow: 'hidden',
    },
    durationPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.dark.surfaceAlt,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    durationText: {
        color: colors.dark.subtle,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.2,
        marginLeft: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        color: colors.dark.muted,
        fontSize: 12,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 2,
        backgroundColor: colors.dark.divider,
        marginHorizontal: 8,
    },
    actions: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
        paddingLeft: 8,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.dark.accent,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    swipeBackground: {
        marginHorizontal: 12,
        marginVertical: 6,
        position: 'relative',
    },
    deleteBackground: {
        position: 'absolute',
        right: 16,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    deleteLabel: {
        color: colors.dark.error,
        fontSize: 12,
        fontWeight: '600',
    },
    presetCard: {
        opacity: 0.95,
    },
})
