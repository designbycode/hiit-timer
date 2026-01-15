import { useState, useCallback } from 'react'

export interface ModalButton {
    text: string
    onPress: () => void
    style?: 'default' | 'cancel' | 'destructive'
}

export interface ModalConfig {
    title: string
    message: string
    buttons: ModalButton[]
}

/**
 * Reusable hook for managing modal state and displaying alerts
 * Replaces repeated modal state management across screens
 */
export function useModal() {
    const [visible, setVisible] = useState(false)
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [buttons, setButtons] = useState<ModalButton[]>([])

    const showAlert = useCallback(
        (alertTitle: string, alertMessage: string, alertButtons: ModalButton[]) => {
            setTitle(alertTitle)
            setMessage(alertMessage)
            setButtons(alertButtons)
            setVisible(true)
        },
        []
    )

    const hideModal = useCallback(() => {
        setVisible(false)
    }, [])

    const showConfirm = useCallback(
        (
            confirmTitle: string,
            confirmMessage: string,
            onConfirm: () => void,
            confirmText = 'Confirm',
            cancelText = 'Cancel'
        ) => {
            showAlert(confirmTitle, confirmMessage, [
                {
                    text: cancelText,
                    style: 'cancel',
                    onPress: hideModal,
                },
                {
                    text: confirmText,
                    style: 'destructive',
                    onPress: () => {
                        hideModal()
                        onConfirm()
                    },
                },
            ])
        },
        [showAlert, hideModal]
    )

    const showError = useCallback(
        (errorTitle: string, errorMessage: string) => {
            showAlert(errorTitle, errorMessage, [
                {
                    text: 'OK',
                    onPress: hideModal,
                },
            ])
        },
        [showAlert, hideModal]
    )

    return {
        visible,
        title,
        message,
        buttons,
        showAlert,
        hideModal,
        showConfirm,
        showError,
    }
}
