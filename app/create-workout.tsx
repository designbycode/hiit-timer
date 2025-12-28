import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useWorkoutStore } from '@/libs/store/workoutStore'
import { storageService } from '@/libs/services/storage/StorageService'
import { Button } from '@/libs/components/Button'
import CustomModal from '@/libs/components/CustomModal'
import { Workout } from '@/libs/types/workout'
import { TIMINGS } from '@/libs/constants/timings'
import { colors, fontSizes, spacing } from '@/libs/constants/theme'

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
            setWarmUpDuration(currentWorkout.warmUpDuration?.toString() || '')
            setCoolDownDuration(
                currentWorkout.coolDownDuration?.toString() || ''
            )
        }
    }, [isEditing, currentWorkout])

    const validate = useCallback((): boolean => {
        if (!name.trim()) {
            showAlert('Error', 'Please enter a workout name', [
                { text: 'OK', onPress: () => setModalVisible(false) },
            ])
            return false
        }

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
                `Work duration must be between ${TIMINGS.MIN_WORK_DURATION} and ${TIMINGS.MAX_WORK_DURATION} seconds`,
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

    const handleSave = useCallback(async () => {
        if (!validate()) return

        setLoading(true)
        try {
            const workout: Workout = {
                id: id || `workout_${Date.now()}`,
                name: name.trim(),
                workDuration: parseInt(workDuration, 10),
                restDuration: parseInt(restDuration, 10),
                rounds: parseInt(rounds, 10),
                warmUpDuration: warmUpDuration
                    ? parseInt(warmUpDuration, 10)
                    : undefined,
                coolDownDuration: coolDownDuration
                    ? parseInt(coolDownDuration, 10)
                    : undefined,
            }

            await storageService.saveWorkout(workout)
            router.back()
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
                        setModalVisible(false)
                        router.back()
                    },
                },
            ]
        )
    }, [id, router])

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
            >
                <Text style={styles.label}>Workout Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter workout name"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Work Duration (seconds)</Text>
                <TextInput
                    style={styles.input}
                    value={workDuration}
                    onChangeText={setWorkDuration}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Rest Duration (seconds)</Text>
                <TextInput
                    style={styles.input}
                    value={restDuration}
                    onChangeText={setRestDuration}
                    keyboardType="numeric"
                    placeholder="15"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>Rounds</Text>
                <TextInput
                    style={styles.input}
                    value={rounds}
                    onChangeText={setRounds}
                    keyboardType="numeric"
                    placeholder="5"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>
                    Warm-up Duration (seconds, optional)
                </Text>
                <TextInput
                    style={styles.input}
                    value={warmUpDuration}
                    onChangeText={setWarmUpDuration}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                />

                <Text style={styles.label}>
                    Cool-down Duration (seconds, optional)
                </Text>
                <TextInput
                    style={styles.input}
                    value={coolDownDuration}
                    onChangeText={setCoolDownDuration}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                />

                <View style={styles.actions}>
                    <Button
                        title="Save"
                        onPress={handleSave}
                        variant="primary"
                        loading={loading}
                        style={styles.button}
                    />
                    {isEditing && (
                        <Button
                            title="Delete"
                            onPress={handleDelete}
                            variant="danger"
                            style={styles.button}
                        />
                    )}
                </View>
            </ScrollView>
            <CustomModal
                visible={modalVisible}
                title={modalTitle}
                message={modalMessage}
                buttons={modalButtons}
                onRequestClose={() => setModalVisible(false)}
            />
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        padding: spacing.md,
    },
    label: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        color: colors.dark.text,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.dark.border,
        borderRadius: 8,
        padding: spacing.sm,
        fontSize: fontSizes.md,
        backgroundColor: colors.dark.surface,
        color: colors.dark.text,
    },
    actions: {
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    button: {
        width: '100%',
    },
})
