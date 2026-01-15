import React, { useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NavigationDrawer } from '@/libs/components/NavigationDrawer'

interface HeaderProps {
    title: string
    onBackPress?: () => void
    onRightPress?: () => void
    rightIconName?: keyof typeof Ionicons.glyphMap
    hideRightIcon?: boolean
    showDrawerIcon?: boolean
    testID?: string
}

export function Header({
    title,
    onBackPress,
    onRightPress,
    rightIconName,
    hideRightIcon,
    showDrawerIcon = true,
    testID,
}: HeaderProps) {
    const [drawerVisible, setDrawerVisible] = useState(false)

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View style={styles.header} testID={testID}>
                {onBackPress ? (
                    <TouchableOpacity
                        onPress={onBackPress}
                        style={styles.iconButton}
                        accessibilityRole="button"
                        accessibilityLabel="Back"
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={colors.dark.text}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconButtonPlaceholder} />
                )}
                <Text style={styles.title}>{title}</Text>
                {hideRightIcon ? (
                    <View style={styles.iconButtonPlaceholder} />
                ) : onRightPress ? (
                    <TouchableOpacity
                        onPress={onRightPress}
                        style={styles.iconButton}
                        accessibilityRole="button"
                        accessibilityLabel="Action"
                    >
                        <Ionicons
                            name={rightIconName ?? 'settings'}
                            size={24}
                            color={colors.dark.text}
                        />
                    </TouchableOpacity>
                ) : showDrawerIcon ? (
                    <TouchableOpacity
                        onPress={() => setDrawerVisible(true)}
                        style={styles.iconButton}
                        accessibilityRole="button"
                        accessibilityLabel="Open menu"
                    >
                        <Ionicons
                            name="menu"
                            size={24}
                            color={colors.dark.text}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconButtonPlaceholder} />
                )}
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
    iconButton: {
        padding: spacing.sm,
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonPlaceholder: {
        width: 40,
        height: 40,
    },
    title: {
        color: colors.dark.text,
        fontSize: fontSizes.md,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
})

export default Header
