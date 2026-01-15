import React from 'react'
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'

interface MainHeaderProps {
    title: string
    testID?: string
}

export function MainHeader({ title, testID }: MainHeaderProps) {
    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View style={styles.header} testID={testID}>
                <Image
                    source={require('@/assets/images/icon.png')}
                    style={styles.icon}
                    resizeMode="contain"
                />
                <Text style={styles.title}>{title}</Text>
            </View>
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
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
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
})

export default MainHeader
