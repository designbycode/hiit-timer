import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Header } from '@/libs/components/Header'
import { LegalSection } from '@/libs/components/settings/LegalSection'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import Constants from 'expo-constants'

export default function DeveloperScreen() {
    const router = useRouter()

    const appVersion = Constants.expoConfig?.version || '1.0.0'
    const buildNumber =
        Constants.expoConfig?.android?.versionCode?.toString() || '1'

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
    techGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    techCard: {
        backgroundColor: colors.dark.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.dark.border,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '47%',
        flex: 1,
    },
    techName: {
        fontSize: fontSizes.sm,
        fontWeight: '600',
        color: colors.dark.text,
        marginTop: spacing.xs,
    },
})
