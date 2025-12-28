import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Workout } from '@/libs/types/workout'
import { formatTimeShort } from '@/libs/utils/time'
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

        const animatedStyle = useAnimatedStyle(() => {
            return {
                transform: [{ scale: withSpring(isPressed.value ? 1.05 : 1) }],
            }
        })

        return (
            <GestureDetector gesture={gesture}>
                <Animated.View style={animatedStyle}>
                    <TouchableOpacity
                        style={styles.card}
                        onPress={onPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.imagePlaceholder}>
                            <Ionicons
                                name="fitness"
                                size={28}
                                color="#666666"
                            />
                        </View>
                        <View style={styles.content}>
                            <Text style={styles.name}>{workout.name}</Text>
                            <Text style={styles.duration}>
                                {formatDuration(totalDuration)}
                            </Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {workout.rounds} Rounds
                                </Text>
                            </View>
                            <Text style={styles.details}>
                                {formatTimeShort(workout.workDuration)} Work •{' '}
                                {formatTimeShort(workout.restDuration)} Rest
                            </Text>
                        </View>
                        {onDelete && (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={onDelete}
                            >
                                <Ionicons
                                    name="trash-outline"
                                    size={20}
                                    color="#FF3B30"
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={onPress}
                        >
                            <Ionicons name="play" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        )
    },
    (prevProps, nextProps) => {
        return (
            prevProps.workout.id === nextProps.workout.id &&
            prevProps.workout.name === nextProps.workout.name
        )
    }
)

WorkoutCard.displayName = 'WorkoutCard'

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333333',
    },
    imagePlaceholder: {
        width: 54,
        height: 54,
        borderRadius: 8,
        backgroundColor: '#2A2A2A',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    duration: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: '#333333',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 8,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    details: {
        fontSize: 14,
        color: '#999999',
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    deleteButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
})
