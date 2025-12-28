import React, { useMemo } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Workout } from '@/libs/types/workout'
import { formatTimeShort } from '@/libs/utils/time'
import { colors } from '@/libs/constants/theme'

interface QuickStartCardProps {
    workout: Workout
    onPress: () => void
}

export const QuickStartCard: React.FC<QuickStartCardProps> = React.memo(
    ({ workout, onPress }) => {
        const totalDuration = useMemo(() => {
            let total = 0
            if (workout.warmUpDuration) total += workout.warmUpDuration
            total += workout.workDuration * workout.rounds
            total += workout.restDuration * (workout.rounds - 1)
            if (workout.coolDownDuration) total += workout.coolDownDuration
            return total
        }, [workout])

        const formatDuration = (seconds: number) => {
            const mins = Math.floor(seconds / 60)
            return mins > 0 ? `${mins}m` : `${seconds}s`
        }

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={onPress}
                activeOpacity={0.9}
            >
                <ImageBackground
                    source={require('@/assets/images/training.png')}
                    style={styles.backgroundImage}
                    imageStyle={styles.imageStyle}
                >
                    <View style={styles.overlay}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>LAST USED</Text>
                        </View>
                        <View style={styles.content}>
                            <Text style={styles.title}>{workout.name}</Text>
                            <Text style={styles.details}>
                                {formatDuration(totalDuration)} •{' '}
                                {formatTimeShort(workout.workDuration)} Work /{' '}
                                {formatTimeShort(workout.restDuration)} Rest
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.playButton}
                            onPress={onPress}
                        >
                            <Ionicons name="play" size={32} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        )
    }
)

QuickStartCard.displayName = 'QuickStartCard'

const styles = StyleSheet.create({
    card: {
        height: 200,
        borderRadius: 16,
        marginHorizontal: 16,
        marginVertical: 16,
        overflow: 'hidden',
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'space-between',
    },
    imageStyle: {
        opacity: 0.6,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        padding: 20,
        justifyContent: 'space-between',
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: `${colors.dark.accent}75`,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    content: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    details: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    playButton: {
        alignSelf: 'flex-end',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF9800',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
})
