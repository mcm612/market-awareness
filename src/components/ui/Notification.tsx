'use client'

import { useEffect } from 'react'
import styles from './Notification.module.css'

interface NotificationProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  isVisible: boolean
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

export default function Notification({
  message,
  type,
  isVisible,
  onClose,
  autoClose = true,
  duration = 3000
}: NotificationProps) {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, autoClose, duration, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return 'ℹ'
    }
  }

  return (
    <div className={`${styles.notification} ${styles[type]} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.content}>
        <div className={styles.icon}>{getIcon()}</div>
        <div className={styles.message}>{message}</div>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  )
}