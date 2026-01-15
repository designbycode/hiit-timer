import React, { useState } from 'react'
import { View, Text, StyleSheet, StatusBar, Image, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import { NavigationDrawer } from '@/libs/components/NavigationDrawer'

interface MainHeaderProps {
    title: string
    testID?: string
}

export function MainHeader({ title, testID }: MainHeaderProps) {
    const [drawerVisible, setDrawerVisible] = useState(false)

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View style={styles.header} testID={testID}>
                <View style={styles.placeholder} />
                <View style={styles.titleContainer}>
                    <Image
                        source={require('@/assets/images/icon.png')}
                        style={styles.icon}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>{title}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setDrawerVisible(true)}
                    style={styles.menuButton}
                    accessibilityRole="button"
                    accessibilityLabel="Open menu"
                >
                    <Ionicons name="menu" size={28} color={colors.dark.text} />
                </TouchableOpacity>
            </View>
            
            <NavigationDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(false)}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: colors.dark.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    menuButton: {
        padding: spacing.xs,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    icon: {
        width: 32,
        height: 32,
    },
    title: {
        color: colors.dark.text,
        fontSize: fontSizes['2xl'],
        fontWeight: 'bold',
    },
    placeholder: {
        width: 40,
        height: 40,
    },
})

export default MainHeader
