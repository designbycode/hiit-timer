import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Workout } from '@/libs/types/workout'
import { formatTimeShort } from '@/libs/utils/time'
import { colors, spacing } from '@/libs/constants/theme'
import { Swipeable } from 'react-native-gesture-handler'
import { useAudio } from '@/libs/contexts/AudioContext'
import { useSettingsStore } from '@/libs/store/settingsStore'
import { hapticManager } from '@/libs/services/alerts/HapticManager'

interface WorkoutCardProps {
    workout: Workout
    onPress: () => void
    onDelete?: (workoutId: string) => Promise<void>
}

export const WorkoutCard: React.FC<WorkoutCardProps> = React.memo(
    ({ workout, onPress, onDelete }) => {
        const isCustom = !workout.isPreset
        // Swipe handled by Swipeable; no manual pan gesture required

        const { playButtonClick } = useAudio()
        const { soundEnabled, vibrationEnabled } = useSettingsStore()

        const handleFeedback = async () => {
            if (vibrationEnabled) {
                await hapticManager.trigger('medium')
            }
            // Sound disabled for swipe-to-delete actions
            // if (soundEnabled) {
            //     playButtonClick()
            // }
        }

        const handleDelete = async () => {
            try {
                await handleFeedback()
                if (onDelete) {
                    await onDelete(workout.id)
                }
            } catch (e) {
                console.error('Delete failed', e)
            }
        }

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

        // Swipe handled by Swipeable; no additional gestures or animations needed

        const Wrapper: any = workout.isPreset ? View : Swipeable

        return (
            <>
                <View style={styles.swipeBackground}>
                    <Wrapper
                        {...(!workout.isPreset
                            ? {
                                  friction: 2,
                                  rightThreshold: 40,
                                  overshootRight: false,
                                  renderRightActions: () => (
                                      <View
                                          style={styles.rightActionsContainer}
                                      >
                                          <TouchableOpacity
                                              style={styles.deleteButton}
                                              onPress={handleDelete}
                                              activeOpacity={0.85}
                                          >
                                              <Ionicons
                                                  name="trash"
                                                  size={24}
                                                  color="#fff"
                                              />
                                              <Text
                                                  style={
                                                      styles.deleteButtonText
                                                  }
                                              >
                                                  Delete
                                              </Text>
                                          </TouchableOpacity>
                                      </View>
                                  ),
                                  onSwipeableOpen: async (
                                      direction: 'left' | 'right'
                                  ) => {
                                      if (direction === 'right') {
                                          await handleFeedback()
                                      }
                                  },
                              }
                            : {})}
                    >
                        <TouchableOpacity
                            style={[
                                styles.card,
                                workout.isPreset
                                    ? styles.presetCard
                                    : styles.customCard,
                            ]}
                            onPress={onPress}
                            activeOpacity={0.7}
                        >
                            {/* Accent bar */}
                            <View
                                style={[
                                    styles.accent,
                                    isCustom ? styles.customAccent : null,
                                ]}
                            />

                            {/* Main content */}
                            <View style={styles.content}>
                                <View style={styles.headerRow}>
                                    <View style={styles.headerLeftRow}>
                                        <Text
                                            style={styles.name}
                                            numberOfLines={1}
                                        >
                                            {workout.name}
                                        </Text>
                                    </View>
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
                    </Wrapper>
                </View>
            </>
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
        marginHorizontal: spacing.sm,
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
        justifyContent: 'space-between',
    },
    name: {
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
    headerLeftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
        minWidth: 0,
        gap: 6,
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
        paddingLeft: 8,
    },
    swipeHint: {
        position: 'absolute',
        left: 8,
        top: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        opacity: 0.6,
    },
    swipeHintText: {
        color: colors.dark.muted,
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.2,
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
        position: 'relative',
    },
    rightActionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: spacing.sm,
    },
    deleteButton: {
        backgroundColor: colors.dark.error + 90,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        minWidth: 80,
        height: '96%',
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 4,
    },
    presetCard: {
        opacity: 0.95,
    },
    customCard: {
        borderColor: colors.dark.divider,
        backgroundColor: colors.dark.surface,
    },
    customAccent: {
        backgroundColor: colors.dark.secondary,
    },
})
