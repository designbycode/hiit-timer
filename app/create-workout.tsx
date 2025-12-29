import React, { useState, useEffect, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Modal,
    TouchableOpacity,
    Animated,
    PanResponder,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useWorkoutStore } from '@/libs/store/workoutStore'
import { storageService } from '@/libs/services/storage/StorageService'
import { Button } from '@/libs/components/Button'
import CustomModal from '@/libs/components/CustomModal'
import { Workout } from '@/libs/types/workout'
import { TIMINGS } from '@/libs/constants/timings'
import { colors, fontSizes, spacing } from '@/libs/constants/theme'
import { formatTimeShort } from '@/libs/utils/time'

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

    // Quick preset modal
    const [presetModalVisible, setPresetModalVisible] = useState(false)
    const presetTranslateY = React.useRef(new Animated.Value(300)).current

    const openPresetModal = () => {
        setPresetModalVisible(true)
        requestAnimationFrame(() => {
            presetTranslateY.setValue(300)
            Animated.timing(presetTranslateY, {
                toValue: 0,
                duration: 240,
                useNativeDriver: true,
            }).start()
        })
    }

    const closePresetModal = () => {
        Animated.timing(presetTranslateY, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) setPresetModalVisible(false)
        })
    }

    const panResponder = React.useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 4,
            onPanResponderMove: (_, gesture) => {
                const y = Math.max(0, gesture.dy)
                presetTranslateY.setValue(y)
            },
            onPanResponderRelease: (_, gesture) => {
                if (gesture.dy > 120 || gesture.vy > 0.8) {
                    closePresetModal()
                } else {
                    Animated.timing(presetTranslateY, {
                        toValue: 0,
                        duration: 180,
                        useNativeDriver: true,
                    }).start()
                }
            },
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
        const warm = parseInt(warmUpDuration || '0', 10) || 0
        const cool = parseInt(coolDownDuration || '0', 10) || 0
        if (roundsNum <= 0) return warm + cool
        const betweenRests = Math.max(0, roundsNum - 1)
        return warm + roundsNum * work + betweenRests * rest + cool
    }, [workDuration, restDuration, rounds, warmUpDuration, coolDownDuration])

    const totalLabel = React.useMemo(() => formatTimeShort(totalSeconds), [totalSeconds])

    const applyPreset = useCallback((p: { name: string; work: number; rest: number; rounds: number; warm?: number; cool?: number }) => {
        setWorkDuration(String(p.work))
        setRestDuration(String(p.rest))
        setRounds(String(p.rounds))
        setWarmUpDuration(p.warm ? String(p.warm) : '')
        setCoolDownDuration(p.cool ? String(p.cool) : '')
        if (!name.trim()) setName(p.name)
    }, [name])

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
            await storageService.flush()
            router.replace('/')
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
                        await storageService.flush()
                        setModalVisible(false)
                        router.replace('/')
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
            <SafeAreaView edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBack}>
                        <Text style={styles.headerBackText}>{'< Back'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{isEditing ? 'Edit Workout' : 'Create Workout'}</Text>
                    <View style={styles.headerRightSpacer} />
                </View>
            </SafeAreaView>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <Text style={styles.title}>{isEditing ? 'Edit Workout' : 'Create Workout'}</Text>
                <Text style={styles.subtitle}>Configure your intervals and optional warm-up/cool-down.</Text>
                <Text style={styles.summaryText}>{`${parseInt(rounds||'0',10)||0} rounds • Workout ${parseInt(workDuration||'0',10)||0}s / Rest ${parseInt(restDuration||'0',10)||0}s • Warm ${parseInt(warmUpDuration||'0',10)||0}s • Cool ${parseInt(coolDownDuration||'0',10)||0}s • Total ${totalLabel}`}</Text>

                {/* Quick Presets */}
                <View style={styles.presetsCard}>
                    <Text style={styles.sectionTitle}>Quick presets</Text>
                    <View style={styles.presetsRow}>
                        <Button
                            title="Choose preset"
                            variant="secondary"
                            onPress={openPresetModal}
                            style={styles.presetBtn}
                        />
                    </View>
                </View>

                {/* Basics Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Basics</Text>
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Workout name</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter workout name"
                            placeholderTextColor={colors.dark.muted}
                        />
                    </View>

                    {/* Workout */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Workout (sec)</Text>
                        <View style={styles.stepperRow}>
                            <Button
                                title="-"
                                variant="secondary"
                                onPress={() => {
                                    const v = Math.max(
                                        TIMINGS.MIN_WORK_DURATION,
                                        (parseInt(workDuration || '0', 10) || 0) - 5
                                    )
                                    setWorkDuration(String(v))
                                }}
                                style={styles.stepperBtn}
                            />
                            <TextInput
                                style={[styles.input, styles.inputCenter, styles.inputGrow]}
                                value={workDuration}
                                onChangeText={setWorkDuration}
                                keyboardType="numeric"
                                placeholder="30"
                                placeholderTextColor={colors.dark.muted}
                            />
                            <Button
                                title="+"
                                variant="secondary"
                                onPress={() => {
                                    const v = Math.min(
                                        TIMINGS.MAX_WORK_DURATION,
                                        (parseInt(workDuration || '0', 10) || 0) + 5
                                    )
                                    setWorkDuration(String(v))
                                }}
                                style={styles.stepperBtn}
                            />
                        </View>
                    </View>

                    {/* Rest */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Rest (sec)</Text>
                        <View style={styles.stepperRow}>
                            <Button
                                title="-"
                                variant="secondary"
                                onPress={() => {
                                    const v = Math.max(
                                        TIMINGS.MIN_REST_DURATION,
                                        (parseInt(restDuration || '0', 10) || 0) - 5
                                    )
                                    setRestDuration(String(v))
                                }}
                                style={styles.stepperBtn}
                            />
                            <TextInput
                                style={[styles.input, styles.inputCenter, styles.inputGrow]}
                                value={restDuration}
                                onChangeText={setRestDuration}
                                keyboardType="numeric"
                                placeholder="15"
                                placeholderTextColor={colors.dark.muted}
                            />
                            <Button
                                title="+"
                                variant="secondary"
                                onPress={() => {
                                    const v = Math.min(
                                        TIMINGS.MAX_REST_DURATION,
                                        (parseInt(restDuration || '0', 10) || 0) + 5
                                    )
                                    setRestDuration(String(v))
                                }}
                                style={styles.stepperBtn}
                            />
                        </View>
                    </View>

                    {/* Rounds */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Rounds</Text>
                        <View style={styles.stepperRow}>
                            <Button
                                title="-"
                                variant="secondary"
                                onPress={() => {
                                    const v = Math.max(
                                        TIMINGS.MIN_ROUNDS,
                                        (parseInt(rounds || '0', 10) || 0) - 1
                                    )
                                    setRounds(String(v))
                                }}
                                style={styles.stepperBtn}
                            />
                            <TextInput
                                style={[styles.input, styles.inputCenter, styles.inputGrow]}
                                value={rounds}
                                onChangeText={setRounds}
                                keyboardType="numeric"
                                placeholder="5"
                                placeholderTextColor={colors.dark.muted}
                            />
                            <Button
                                title="+"
                                variant="secondary"
                                onPress={() => {
                                    const v = Math.min(
                                        TIMINGS.MAX_ROUNDS,
                                        (parseInt(rounds || '0', 10) || 0) + 1
                                    )
                                    setRounds(String(v))
                                }}
                                style={styles.stepperBtn}
                            />
                        </View>
                    </View>
                </View>

                {/* Optional Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Optional</Text>

                    {/* Warm-up */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Warm-up (sec)</Text>
                        <TextInput
                            style={styles.input}
                            value={warmUpDuration}
                            onChangeText={setWarmUpDuration}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.dark.muted}
                        />
                    </View>

                    {/* Cool-down */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.inputLabel}>Cool-down (sec)</Text>
                        <TextInput
                            style={styles.input}
                            value={coolDownDuration}
                            onChangeText={setCoolDownDuration}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.dark.muted}
                        />
                    </View>
                </View>

                {/* Total duration */}
                <View style={styles.totalBar}>
                    <Text style={styles.totalLabel}>Estimated total</Text>
                    <Text style={styles.totalValue}>{totalLabel}</Text>
                </View>

                {/* Actions */}
                <View style={styles.footerActions}>
                    <Button
                        title={isEditing ? 'Save Changes' : 'Save Workout'}
                        onPress={handleSave}
                        variant="primary"
                        loading={loading}
                        style={styles.footerButton}
                    />
                    {isEditing && (
                        <Button
                            title="Delete"
                            onPress={handleDelete}
                            variant="danger"
                            style={styles.footerButton}
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

           {/* Preset selection modal */}
           <Modal transparent visible={presetModalVisible} onRequestClose={closePresetModal}>
               <View style={styles.presetOverlay}>
                   <TouchableOpacity style={styles.presetOverlayFill} activeOpacity={1} onPress={closePresetModal} />
                   <Animated.View
                       style={[
                           styles.presetSheet,
                           { transform: [{ translateY: presetTranslateY }] },
                       ]}
                       {...panResponder.panHandlers}
                   >
                       <Text style={styles.presetTitle}>Choose a preset</Text>
                       <View style={styles.presetList}>
                           {[
                               { label: 'Tabata 20/10 x8', p: { name: 'Tabata', work: 20, rest: 10, rounds: 8 } },
                               { label: 'HIIT 30/15 x10', p: { name: 'HIIT 30/15', work: 30, rest: 15, rounds: 10 } },
                               { label: 'Sprint 40/20 x6', p: { name: 'Sprint 40/20', work: 40, rest: 20, rounds: 6 } },
                               { label: '45/15 x12', p: { name: 'Intervals 45/15', work: 45, rest: 15, rounds: 12 } },
                               { label: '60/30 x10', p: { name: 'Intervals 60/30', work: 60, rest: 30, rounds: 10 } },
                               { label: 'EMOM 60 x12', p: { name: 'EMOM 12 min', work: 60, rest: 0, rounds: 12 } },
                           ].map(({ label, p }) => (
                               <TouchableOpacity
                                   key={label}
                                   style={styles.presetItem}
                                   onPress={() => {
                                       applyPreset(p as any)
                                       setPresetModalVisible(false)
                                   }}
                               >
                                   <Text style={styles.presetItemText}>{label}</Text>
                               </TouchableOpacity>
                           ))}
                       </View>
                   </Animated.View>
               </View>
           </Modal>
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
        paddingBottom: spacing.lg + 16,
        gap: spacing.md,
    },
    title: {
        color: colors.dark.text,
        fontSize: fontSizes.xl,
        fontWeight: '700',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: Platform.OS === 'ios' ? spacing.lg : spacing.md,
        paddingBottom: spacing.sm,
        borderBottomColor: colors.dark.border,
        borderBottomWidth: 1,
        backgroundColor: colors.dark.background,
    },
    headerBack: {
        paddingVertical: spacing.xs,
        paddingRight: spacing.md,
        paddingLeft: 0,
    },
    headerBackText: {
        color: colors.dark.primary,
        fontSize: fontSizes.md,
        fontWeight: '700',
    },
    headerTitle: {
        color: colors.dark.text,
        fontSize: fontSizes.lg,
        fontWeight: '800',
    },
    headerRightSpacer: {
        width: 60,
    },
    subtitle: {
        color: colors.dark.muted,
        fontSize: fontSizes.sm,
        marginTop: spacing.xs,
    },
    summaryText: {
        color: colors.dark.subtle,
        fontSize: fontSizes.sm,
        marginTop: spacing.xs,
        lineHeight: 18,
    },
    presetsCard: {
        backgroundColor: colors.dark.surface,
        borderColor: colors.dark.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: spacing.sm,
    },
    presetsRow: {
        gap: spacing.xs,
        paddingRight: spacing.sm,
    },
    presetBtn: {
        minWidth: 180,
    },
    card: {
        backgroundColor: colors.dark.surface,
        borderColor: colors.dark.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: spacing.sm,
    },
    sectionTitle: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    fieldGroup: {
        marginBottom: spacing.md,
    },
    inputLabel: {
        color: colors.dark.subtle,
        fontSize: fontSizes.sm,
        marginBottom: spacing.xs,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    rowSingle: {
        marginTop: spacing.md,
    },
    col: {
        flex: 1,
        minWidth: 0,
    },
    colFull: {
        flex: 1,
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
        borderRadius: 10,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        fontSize: fontSizes.md,
        backgroundColor: colors.dark.surfaceAlt,
        color: colors.dark.text,
    },
    inputCenter: {
        textAlign: 'center',
    },
    inputGrow: {
        flex: 1,
        minWidth: 0,
    },
    footerActions: {
        marginTop: spacing.lg,
        gap: spacing.sm,
    },
    footerButton: {
        width: '100%',
    },
    totalBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.dark.surface,
        borderColor: colors.dark.border,
        borderWidth: 1,
        borderRadius: 12,
        padding: spacing.md,
        marginTop: spacing.md,
    },
    totalLabel: {
        color: colors.dark.muted,
        fontSize: fontSizes.md,
        fontWeight: '600',
    },
    totalValue: {
        color: colors.dark.text,
        fontSize: fontSizes.lg,
        fontWeight: '800',
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    stepperBtn: {
        minWidth: 36,
        paddingHorizontal: 0,
    },
    presetOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    presetOverlayFill: {
        flex: 1,
    },
    presetSheet: {
        backgroundColor: colors.dark.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderColor: colors.dark.border,
        borderWidth: 1,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
        maxHeight: 480,
    },
    presetTitle: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    presetList: {
        maxHeight: 360,
        marginTop: spacing.xs,
    },
    presetListContent: {
        gap: spacing.xs,
        paddingBottom: spacing.sm,
    },
    presetItem: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 10,
        backgroundColor: colors.dark.surfaceAlt,
    },
    presetItemText: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '600',
    },
    presetFooter: {
        marginTop: spacing.sm,
        alignItems: 'flex-end',
    },
    presetHandle: {
        alignSelf: 'center',
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.dark.border,
        marginBottom: spacing.xs,
    }
})
