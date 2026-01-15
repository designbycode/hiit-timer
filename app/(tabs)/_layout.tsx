import { Tabs } from 'expo-router'
import { useSettingsStore } from '@/libs/store/settingsStore'
import { colors } from '@/libs/constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabLayout() {
    const { soundEnabled } = useSettingsStore()
    const insets = useSafeAreaInsets()

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.dark.primary,
                tabBarInactiveTintColor: colors.dark.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.dark.surface,
                    borderTopColor: colors.dark.primary + 30,
                    borderTopWidth: 1,
                    height: 70 + insets.bottom,
                    paddingBottom: insets.bottom,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Workouts',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="fitness" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}
