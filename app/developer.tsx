import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/libs/components/Header'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import { storageService } from '@/libs/services/storage/StorageService'
import { useModal } from '@/libs/hooks/useModal'
import CustomModal from '@/libs/components/CustomModal'
import Constants from 'expo-constants'

export default function DeveloperScreen() {
    const router = useRouter()
    const modal = useModal()
    const [storageInfo, setStorageInfo] = useState({ keys: [] as string[], totalKeys: 0 })
    const [isClearing, setIsClearing] = useState(false)

    const appVersion = Constants.expoConfig?.version || '1.0.0'
    const buildNumber =
        Constants.expoConfig?.android?.versionCode?.toString() || '1'

    // Load storage info
    useEffect(() => {
        loadStorageInfo()
    }, [])

    const loadStorageInfo = async () => {
        const info = await storageService.getStorageInfo()
        setStorageInfo(info)
    }

    const handleClearCache = () => {
        modal.showConfirm(
            'Clear Cache',
            'This will clear temporary data like timer state and filters. Your workouts, settings, and history will be preserved.',
            async () => {
                try {
                    setIsClearing(true)
                    await storageService.clearCache()
                    await loadStorageInfo()
                    Alert.alert('Success', 'Cache cleared successfully!')
                } catch (error) {
                    Alert.alert('Error', 'Failed to clear cache. Please try again.')
                } finally {
                    setIsClearing(false)
                }
            },
            'Clear Cache',
            'Cancel'
        )
    }

    const handleClearAllData = () => {
        modal.showConfirm(
            '⚠️ Clear All Data',
            'This will delete EVERYTHING including all workouts, settings, and history. This action cannot be undone!',
            () => {
                // Double confirmation for destructive action
                modal.showConfirm(
                    '🚨 Final Warning',
                    'Are you absolutely sure? All your data will be permanently deleted!',
                    async () => {
                        try {
                            setIsClearing(true)
                            await storageService.clearAllData()
                            await loadStorageInfo()
                            Alert.alert(
                                'All Data Cleared',
                                'All app data has been deleted. The app will now restart.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            // Navigate to home and reset
                                            router.replace('/')
                                        },
                                    },
                                ]
                            )
                        } catch (error) {
                            Alert.alert('Error', 'Failed to clear data. Please try again.')
                        } finally {
                            setIsClearing(false)
                        }
                    },
                    'Delete Everything',
                    'Cancel'
                )
            },
            'Continue',
            'Cancel'
        )
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Header
                title="Developer Info"
                onBackPress={() => router.back()}
                showDrawerIcon={false}
            />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* App Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>App Information</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Version</Text>
                            <Text style={styles.infoValue}>{appVersion}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Build Number</Text>
                            <Text style={styles.infoValue}>{buildNumber}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Platform</Text>
                            <Text style={styles.infoValue}>
                                {Constants.platform?.ios
                                    ? 'iOS'
                                    : Constants.platform?.android
                                      ? 'Android'
                                      : 'Web'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Storage Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Storage</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Storage Keys</Text>
                            <Text style={styles.infoValue}>{storageInfo.totalKeys}</Text>
                        </View>
                    </View>
                </View>

                {/* Data Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data Management</Text>
                    
                    {/* Clear Cache Button */}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.cacheButton]}
                        onPress={handleClearCache}
                        disabled={isClearing}
                    >
                        <View style={styles.actionButtonContent}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(33, 150, 243, 0.2)' }]}>
                                <Ionicons name="trash-outline" size={24} color="#2196F3" />
                            </View>
                            <View style={styles.actionButtonText}>
                                <Text style={styles.actionButtonTitle}>Clear Cache</Text>
                                <Text style={styles.actionButtonDescription}>
                                    Remove temporary data
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.dark.textSecondary} />
                    </TouchableOpacity>

                    {/* Clear All Data Button */}
                    <TouchableOpacity
                        style={[styles.actionButton, styles.dangerButton]}
                        onPress={handleClearAllData}
                        disabled={isClearing}
                    >
                        <View style={styles.actionButtonContent}>
                            <View style={[styles.iconCircle, { backgroundColor: 'rgba(244, 67, 54, 0.2)' }]}>
                                <Ionicons name="warning-outline" size={24} color="#F44336" />
                            </View>
                            <View style={styles.actionButtonText}>
                                <Text style={[styles.actionButtonTitle, styles.dangerText]}>
                                    Clear All Data
                                </Text>
                                <Text style={styles.actionButtonDescription}>
                                    Delete everything (cannot be undone)
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.dark.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Developer Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Developer</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Developed By</Text>
                            <Text style={styles.infoValue}>designbycode</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <CustomModal
                visible={modal.visible}
                title={modal.title}
                message={modal.message}
                buttons={modal.buttons}
                onRequestClose={modal.hideModal}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.dark.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    section: {
        paddingHorizontal: spacing.md,
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.dark.text,
        marginBottom: spacing.md,
    },
    infoCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.dark.border,
        overflow: 'hidden',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    infoLabel: {
        fontSize: fontSizes.md,
        color: colors.dark.textSecondary,
    },
    infoValue: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.dark.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.dark.divider,
    },
    actionButton: {
        backgroundColor: colors.dark.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.dark.border,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    actionButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    actionButtonText: {
        flex: 1,
    },
    actionButtonTitle: {
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.dark.text,
        marginBottom: 4,
    },
    actionButtonDescription: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
    },
    cacheButton: {
        // Additional styles for cache button if needed
    },
    dangerButton: {
        borderColor: 'rgba(244, 67, 54, 0.3)',
    },
    dangerText: {
        color: '#F44336',
    },
})
