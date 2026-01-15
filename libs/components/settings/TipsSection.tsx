import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

const tips = [
    {
        icon: 'bulb-outline',
        title: 'Start with Beginner Preset',
        text: 'New to HIIT? Try the "Beginner HIIT" preset (30s work, 30s rest) to build your endurance gradually. Progress to Intermediate once you can complete it comfortably.',
    },
    {
        icon: 'flash-outline',
        title: 'Use Quick Start',
        text: 'Quick Start appears at the top of the home screen after your first workout. Tap it to instantly restart your most recent workout without navigating through menus.',
    },
    {
        icon: 'create-outline',
        title: 'Customize Your Workouts',
        text: 'Create custom workouts tailored to your fitness level. Start with shorter work intervals and gradually increase duration as you get stronger.',
    },
    {
        icon: 'heart-outline',
        title: 'Warm Up & Cool Down',
        text: 'Always enable warm-up (60-120s) and cool-down (60-120s) periods to prevent injury, improve performance, and aid recovery. Your body will thank you!',
    },
    {
        icon: 'water-outline',
        title: 'Stay Hydrated',
        text: 'Use rest intervals to hydrate. Set longer rest periods (20-30s) if you need more recovery time between high-intensity rounds.',
    },
    {
        icon: 'volume-high-outline',
        title: 'Keep Your Phone Close',
        text: 'Make sure your phone volume is up and the device is nearby to hear audio cues and voice announcements during your workout.',
    },
    {
        icon: 'chatbox-outline',
        title: 'Enable Voice Announcements',
        text: 'Turn on Voice Announcements in Settings to hear "Work", "Rest", and other phase changes. This helps you stay focused on your exercises without looking at the screen.',
    },
    {
        icon: 'phone-portrait-outline',
        title: 'Use Haptic Feedback',
        text: 'Enable Vibration in Settings for haptic feedback during phase changes. Great for workouts where audio might not be suitable (e.g., quiet environments).',
    },
    {
        icon: 'pause-outline',
        title: 'Tap Timer to Pause',
        text: 'Tap the large timer display during a workout to pause/resume. Perfect if you need a quick break or to check your form.',
    },
    {
        icon: 'play-skip-forward-outline',
        title: 'Skip Unwanted Phases',
        text: 'Use the Skip button at the bottom to skip warm-up, cool-down, or any phase you want to move past. The app tracks skips in your history.',
    },
    {
        icon: 'star-outline',
        title: 'Aim for Perfect Sessions',
        text: 'Complete workouts without pausing or skipping to earn a Perfect Session badge (⭐) in your history. Challenge yourself to increase your perfect session count!',
    },
    {
        icon: 'flame-outline',
        title: 'Build Your Streak',
        text: 'Workout daily to build your streak. View your current streak and best streak in the History > Stats tab. Consistency is key to fitness success!',
    },
    {
        icon: 'calendar-outline',
        title: 'Check Your Calendar',
        text: 'Use the Calendar view in History to see which days you worked out. Visual tracking helps maintain motivation and identify patterns in your routine.',
    },
    {
        icon: 'bar-chart-outline',
        title: 'Track Weekly Progress',
        text: 'View the weekly bar chart in History > Stats to see your workout frequency. Aim for at least 3-4 workouts per week for optimal results.',
    },
    {
        icon: 'volume-mute-outline',
        title: 'Use Silent Mode',
        text: 'Tap the mute button (speaker icon) during a workout for silent training. Perfect for early morning or late night sessions when you need to stay quiet.',
    },
    {
        icon: 'swap-horizontal-outline',
        title: 'Swipe to Delete',
        text: 'Swipe left on custom workouts or history entries to delete them. An "Undo" option appears immediately if you change your mind.',
    },
    {
        icon: 'phone-landscape-outline',
        title: 'Screen Stays Awake',
        text: 'The screen stays on during active workouts so you can always see your progress. Locking your phone will auto-pause the workout.',
    },
    {
        icon: 'time-outline',
        title: 'Try Tabata for Quick Workouts',
        text: 'Short on time? The Tabata preset (20s work, 10s rest, 8 rounds) gives you an intense 4-minute workout. Perfect for busy schedules!',
    },
    {
        icon: 'repeat-outline',
        title: 'Restart After Completion',
        text: 'After completing a workout, tap "Restart Workout" to immediately do another round. Great for pushing yourself to the next level!',
    },
    {
        icon: 'settings-outline',
        title: 'Adjust Settings to Your Preference',
        text: 'Customize sound volume, enable/disable voice and haptics in Settings. Find the perfect combination that keeps you motivated without being distracting.',
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
