import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

const tips = [
    {
        icon: 'bulb',
        title: 'Start with Beginner Preset',
        text: 'New to HIIT? Try the "Beginner HIIT" preset (30s work, 30s rest) to build your endurance.',
    },
    {
        icon: 'fitness',
        title: 'Keep Your Phone Close',
        text: 'Make sure your phone volume is up and the device is nearby to hear audio cues during your workout.',
    },
    {
        icon: 'water',
        title: 'Stay Hydrated',
        text: 'Use rest intervals to hydrate. Set longer rest periods if you need more recovery time.',
    },
    {
        icon: 'repeat',
        title: 'Warm Up & Cool Down',
        text: 'Always enable warm-up and cool-down periods to prevent injury and improve performance.',
    },
]

export function TipsSection() {
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.title}>Tips & Tricks</Text>
            
            <View style={styles.tipsContainer}>
                {tips.map((tip, index) => (
                    <React.Fragment key={tip.title}>
                        <View style={styles.tipItem}>
                            <View style={styles.tipIcon}>
                                <Ionicons name={tip.icon as any} size={24} color={colors.accent} />
                            </View>
                            <View style={styles.tipContent}>
                                <Text style={styles.tipTitle}>{tip.title}</Text>
                                <Text style={styles.tipText}>{tip.text}</Text>
                            </View>
                        </View>
                        {index < tips.length - 1 && <View style={styles.divider} />}
                    </React.Fragment>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    sectionCard: {
        backgroundColor: colors.dark.surface,
        borderWidth: 1,
        borderColor: colors.dark.border,
        borderRadius: 16,
        padding: spacing.lg,
    },
    title: {
        fontSize: fontSizes.xl,
        fontWeight: '700',
        color: colors.dark.text,
        marginBottom: spacing.md,
    },
    tipsContainer: {
        gap: spacing.sm,
    },
    tipItem: {
        flexDirection: 'row',
        paddingVertical: spacing.xs,
        gap: spacing.md,
    },
    tipIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${colors.accent}20`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    tipText: {
        fontSize: fontSizes.sm,
        color: colors.dark.subtle,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        backgroundColor: colors.dark.divider,
        marginVertical: spacing.sm,
    },
})
