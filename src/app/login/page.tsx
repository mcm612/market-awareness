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
            <h1>Market Awareness</h1>
          </div>
          
          <div className={styles.tagline}>
            <h2>Intelligent Stock Sentiment Analysis</h2>
            <p>Track your investments with multi-timeframe sentiment insights</p>
          </div>

          <div className={styles.features}>
            <h3>Key Features</h3>
            <ul>
              <li>Real-time stock & futures search</li>
              <li>Multi-timeframe sentiment analysis (1D - 6M)</li>
              <li>Personal watchlists with alerts</li>
              <li>Technical indicators & market data</li>
              <li>News sentiment tracking</li>
              <li>Analyst price targets</li>
            </ul>
          </div>

          <div className={styles.marketStats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>$2.7T</div>
              <div className={styles.statLabel}>AAPL Market Cap</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>+1.2%</div>
              <div className={styles.statLabel}>S&P 500 Today</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>Live</div>
              <div className={styles.statLabel}>Market Data</div>
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