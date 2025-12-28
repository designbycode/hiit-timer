import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Workout } from '@/libs/types/workout'
import { formatTimeShort } from '@/libs/utils/time'
import { colors, fontSizes, spacing } from '@/libs/constants/theme'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated'

interface WorkoutCardProps {
    workout: Workout
    onPress: () => void
    onEdit?: () => void
    onDelete?: () => void
}

export const WorkoutCard: React.FC<WorkoutCardProps> = React.memo(
    ({ workout, onPress, onDelete }) => {
        const isPressed = useSharedValue(false)

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

        const gesture = Gesture.LongPress()
            .onStart(() => {
                isPressed.value = true
            })
            .onEnd(() => {
                isPressed.value = false
            })
            .onFinalize(() => {
                isPressed.value = false
            })

        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: withSpring(isPressed.value ? 1.02 : 1) }],
        }))

        return (
            <GestureDetector gesture={gesture}>
                <Animated.View style={animatedStyle}>
                    <TouchableOpacity
                        style={styles.card}
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
                                        {formatTimeShort(workout.workDuration)}{' '}
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
                                        {formatTimeShort(workout.restDuration)}{' '}
                                        rest
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            {!!onDelete && (
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={onDelete}
                                    accessibilityLabel="Delete workout"
                                >
                                    <Ionicons
                                        name="trash-outline"
                                        size={18}
                                        color={colors.dark.error}
                                    />
                                </TouchableOpacity>
                            )}
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
        marginHorizontal: 12,
        marginVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.dark.border,
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
        gap: 6,
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
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.dark.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
