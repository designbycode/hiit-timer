import React from 'react'
import { StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Header } from '@/libs/components/Header'
import { RateAppSection } from '@/libs/components/settings/RateAppSection'
import { colors } from '@/libs/constants/theme'

export default function SupportScreen() {
    const router = useRouter()

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Header
                title="Rate App"
                onBackPress={() => router.back()}
                showDrawerIcon={false}
            />
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <RateAppSection />
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
})
