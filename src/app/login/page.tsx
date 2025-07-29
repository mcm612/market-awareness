'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/auth/LoginForm'
import styles from './login.module.css'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🚀</span>
            <h1>Futures Education</h1>
          </div>
          
          <div className={styles.tagline}>
            <h2>Learn Futures Through Personality-Driven Education</h2>
            <p>Meet 13 futures personalities with serious attitude problems and learn how they really behave</p>
          </div>

          <div className={styles.personalityPreview}>
            <h3>Meet Some of Our Problem Children</h3>
            <div className={styles.personalityCards}>
              <div className={styles.miniCard}>
                <span className={styles.cardIcon}>📰</span>
                <span className={styles.cardName}>Paper-Handed Boomer</span>
                <span className={styles.cardSymbol}>/ES</span>
              </div>
              <div className={styles.miniCard}>
                <span className={styles.cardIcon}>🦍</span>
                <span className={styles.cardName}>YOLO Diamond Hands Ape</span>
                <span className={styles.cardSymbol}>/NQ</span>
              </div>
              <div className={styles.miniCard}>
                <span className={styles.cardIcon}>👑</span>
                <span className={styles.cardName}>Paranoid Prepper King</span>
                <span className={styles.cardSymbol}>/GC</span>
              </div>
            </div>
          </div>

          <div className={styles.features}>
            <h3>Why This Actually Works</h3>
            <ul>
              <li>🎭 13 futures contracts with WSB-style personalities</li>
              <li>📊 Live correlation analysis shows how they relate</li>
              <li>🧠 Real market psychology made understandable</li>
              <li>📈 Interactive charts with actual market data</li>
            </ul>
          </div>

          <div className={styles.marketStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>13</div>
              <div className={styles.statLabel}>Contract Personalities</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>4</div>
              <div className={styles.statLabel}>Asset Classes</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>Live</div>
              <div className={styles.statLabel}>Market Drama</div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Section */}
      <div className={styles.loginSection}>
        <LoginForm 
          onToggleMode={() => setIsSignUp(!isSignUp)}
          isSignUp={isSignUp}
        />
      </div>
    </div>
  )
}