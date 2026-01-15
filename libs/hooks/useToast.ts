import { useState, useCallback, useRef, useEffect } from 'react'

export interface ToastConfig {
    message: string
    action?: {
        label: string
        onPress: () => void
    }
    duration?: number
}

/**
 * Reusable hook for displaying toast/snackbar messages with optional actions
 */
export function useToast(defaultDuration = 4000) {
    const [visible, setVisible] = useState(false)
    const [message, setMessage] = useState('')
    const [action, setAction] = useState<ToastConfig['action']>()
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
    }, [])

    const hide = useCallback(() => {
        clearTimer()
        setVisible(false)
    }, [clearTimer])

    const show = useCallback(
        (config: ToastConfig | string) => {
            clearTimer()

            if (typeof config === 'string') {
                setMessage(config)
                setAction(undefined)
            } else {
                setMessage(config.message)
                setAction(config.action)
            }

            setVisible(true)

            const duration = typeof config === 'string' ? defaultDuration : (config.duration ?? defaultDuration)
            
            timerRef.current = setTimeout(() => {
                setVisible(false)
                timerRef.current = null
            }, duration)
        },
        [clearTimer, defaultDuration]
    )

    // Cleanup on unmount
    useEffect(() => {
        return () => clearTimer()
    }, [clearTimer])

    return {
        visible,
        message,
        action,
        show,
        hide,
    }
}
