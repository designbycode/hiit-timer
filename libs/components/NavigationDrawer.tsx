import React from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated,
    Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSizes } from '@/libs/constants/theme'
import { useRouter } from 'expo-router'
import Constants from 'expo-constants'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8

interface DrawerItem {
    label: string
    icon: keyof typeof Ionicons.glyphMap
    route: string
}

interface NavigationDrawerProps {
    visible: boolean
    onClose: () => void
}

export function NavigationDrawer({ visible, onClose }: NavigationDrawerProps) {
    const router = useRouter()
    const translateX = React.useRef(new Animated.Value(DRAWER_WIDTH)).current

    React.useEffect(() => {
        Animated.timing(translateX, {
            toValue: visible ? 0 : DRAWER_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start()
    }, [visible, translateX])

    const drawerItems: DrawerItem[] = [
        { label: 'About', icon: 'information-circle-outline', route: '/about' },
        { label: 'FAQ', icon: 'help-circle-outline', route: '/faq' },
        { label: 'Rate App', icon: 'star-outline', route: '/support' },
        { label: 'Tips', icon: 'bulb-outline', route: '/tips' },
        {
            label: 'Developer Info',
            icon: 'code-slash-outline',
            route: '/developer',
        },
    ]

    const handleNavigate = (route: string) => {
        onClose()
        setTimeout(() => {
            router.push(route as any)
        }, 300)
    }

    if (!visible) return null

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        styles.drawer,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    {/* Drawer Header */}
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>Menu</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={styles.closeButton}
                        >
                            <Ionicons
                                name="close"
                                size={24}
                                color={colors.dark.text}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Drawer Items */}
                    <View style={styles.drawerContent}>
                        {drawerItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.drawerItem}
                                onPress={() => handleNavigate(item.route)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.itemIconContainer}>
                                    <Ionicons
                                        name={item.icon}
                                        size={24}
                                        color={colors.dark.primary}
                                    />
                                </View>
                                <Text style={styles.itemLabel}>
                                    {item.label}
                                </Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    color={colors.dark.textSecondary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Drawer Footer */}
                    <View style={styles.drawerFooter}>
                        <Text style={styles.footerText}>
                            HIIT Timer v
                            {Constants.expoConfig?.version || '1.0.0'}
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        flexDirection: 'row',
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: DRAWER_WIDTH,
        backgroundColor: colors.dark.surface,
        borderLeftWidth: 1,
        borderLeftColor: colors.dark.border,
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    drawerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.dark.border,
    },
    drawerTitle: {
        fontSize: fontSizes['2xl'],
        fontWeight: 'bold',
        color: colors.dark.text,
    },
    closeButton: {
        padding: spacing.xs,
    },
    drawerContent: {
        flex: 1,
        paddingTop: spacing.md,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.dark.divider,
    },
    itemIconContainer: {
        width: 30,
        height: 30,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    itemLabel: {
        flex: 1,
        fontSize: fontSizes.md,
        fontWeight: '600',
        color: colors.dark.text,
    },
    drawerFooter: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.dark.border,
        alignItems: 'center',
    },
    footerText: {
        fontSize: fontSizes.sm,
        color: colors.dark.textSecondary,
    },
})
