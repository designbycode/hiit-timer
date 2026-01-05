import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

const faqs = [
    {
        question: 'How do I create a custom workout?',
        answer: 'Tap the "Create New Workout" button on the home screen, then configure your work/rest intervals, rounds, and optional warm-up/cool-down periods.',
    },
    {
        question: 'Can I edit preset workouts?',
        answer: 'Preset workouts cannot be edited, but you can create a custom workout with similar settings and adjust them to your preference.',
    },
    {
        question: 'How do I adjust the volume?',
        answer: 'Use the Sound Volume setting to choose between Low, Medium, or High volume for audio cues.',
    },
    {
        question: 'Does the timer work in the background?',
        answer: 'Yes! The timer continues running even when your screen is locked or you switch to another app. Audio cues will keep you on track.',
    },
]

export function FAQSection() {
    return (
        <View style={styles.sectionCard}>
            <Text style={styles.title}>Frequently Asked Questions</Text>
            
            <View style={styles.faqContainer}>
                {faqs.map((faq, index) => (
                    <React.Fragment key={faq.question}>
                        <View style={styles.faqItem}>
                            <Text style={styles.faqQuestion}>{faq.question}</Text>
                            <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        </View>
                        {index < faqs.length - 1 && <View style={styles.divider} />}
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
    faqContainer: {
        gap: spacing.sm,
    },
    faqItem: {
        paddingVertical: spacing.xs,
    },
    faqQuestion: {
        fontSize: fontSizes.md,
        color: colors.dark.text,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    faqAnswer: {
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
