import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

const faqs = [
    {
        question: 'How do I create a custom workout?',
        answer: 'Tap the "Create New Workout" button at the bottom of the home screen. Enter a workout name, set your work duration, rest duration, and number of rounds. Optionally add warm-up and cool-down periods. Tap "Create Workout" to save it.',
    },
    {
        question: 'How do I edit a workout?',
        answer: 'During a workout, tap the edit icon (pencil) in the top-right corner. You can also edit from the home screen by tapping on a custom workout card and selecting edit. Note: Preset workouts (Tabata, Beginner, Intermediate, Advanced) cannot be edited.',
    },
    {
        question: 'How do I delete a workout?',
        answer: 'Swipe left on any custom workout card on the home screen to reveal the delete button. Tap "Delete" to remove it. You can undo the deletion immediately using the "Undo" button in the notification. Preset workouts cannot be deleted.',
    },
    {
        question: 'What is Quick Start?',
        answer: 'Quick Start lets you immediately begin your most recently used workout without navigating through menus. It appears at the top of the home screen for instant access to your last workout session.',
    },
    {
        question: 'Can I edit preset workouts?',
        answer: 'No, preset workouts (Tabata, Beginner HIIT, Intermediate HIIT, Advanced HIIT) cannot be edited or deleted. However, you can create a custom workout with similar settings and adjust them to your preference.',
    },
    {
        question: 'How do I start a workout?',
        answer: 'Tap any workout card from the home screen, or use Quick Start. Once the workout screen opens, tap the timer display to begin. The countdown will start, followed by your workout phases.',
    },
    {
        question: 'How do I pause or resume during a workout?',
        answer: 'Tap the timer display while the workout is running to pause. Tap again to resume. You can also use the dedicated pause/resume button if available. Note: Pausing will be tracked in your workout history.',
    },
    {
        question: 'Can I skip phases during a workout?',
        answer: 'Yes! Tap the "Skip" button at the bottom of the workout screen to skip the current phase (warm-up, work, rest, or cool-down) and move to the next one. Skips are tracked in your history.',
    },
    {
        question: 'How do I restart a workout?',
        answer: 'Tap the "Reset" button during a workout to restart from the beginning. You\'ll be asked to confirm. After completing a workout, you can also tap "Restart Workout" from the completion screen.',
    },
    {
        question: 'What does the mute button do?',
        answer: 'The mute button (speaker icon at the top of the workout screen) silences all sounds and voice announcements for that specific workout session. Haptic feedback will still work. This is useful for silent training.',
    },
    {
        question: 'How do I adjust the volume?',
        answer: 'Go to Settings and use the "Sound Volume" slider to adjust between Low, Medium, and High volume. This affects all audio cues, ticking sounds, and voice announcements globally.',
    },
    {
        question: 'Can I turn off voice announcements?',
        answer: 'Yes. Go to Settings and toggle "Voice Announcements" off. This disables spoken phase changes while keeping other sounds active. You can also use the mute button during a workout for temporary silence.',
    },
    {
        question: 'Does the timer work in the background?',
        answer: 'Yes! The timer continues running when you lock your screen or switch apps. Audio cues and voice announcements will keep you on track. The workout auto-pauses when you lock your device and resumes when you return.',
    },
    {
        question: 'What happens when I lock my phone during a workout?',
        answer: 'The workout automatically pauses when you lock your screen or press the power button. When you unlock and return to the app, you can resume from where you left off. Your progress is saved.',
    },
    {
        question: 'How do I view my workout history?',
        answer: 'Tap the "History" tab at the bottom of the screen. You can view your completed workouts in list format, see weekly statistics with a bar chart, or browse a monthly calendar view.',
    },
    {
        question: 'What are workout streaks?',
        answer: 'Streaks track consecutive days you\'ve completed workouts. Your current streak shows how many days in a row you\'ve trained. Your best streak is the longest streak you\'ve ever achieved. View these in the History > Stats tab.',
    },
    {
        question: 'What is a "Perfect Session"?',
        answer: 'A Perfect Session is a workout completed without any pauses or skips. These are marked with a star badge in your workout history, celebrating your commitment to finishing the entire workout uninterrupted.',
    },
    {
        question: 'Can I delete workout history?',
        answer: 'Yes. In the History tab, swipe left on any workout entry to reveal the delete button. Confirm to remove it from your history. This does not affect your saved workout templates.',
    },
    {
        question: 'How do I filter my workouts on the home screen?',
        answer: 'Tap "My Workouts" in the top-right of the home screen to show only your custom workouts. Tap "See All" to show both custom workouts and presets together.',
    },
    {
        question: 'What do the different phases mean?',
        answer: 'Countdown (3-2-1 to prepare), Warm-up (prepare your body), Work (high intensity effort), Rest (recovery between rounds), Cool-down (gentle finish), and Complete (workout done).',
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
