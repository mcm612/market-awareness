'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import styles from './LoginForm.module.css'

interface LoginFormProps {
  onToggleMode: () => void
  isSignUp: boolean
}

export default function LoginForm({ onToggleMode, isSignUp }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn, signUp, signInWithGoogle, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError((err as Error).message || 'An error occurred')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      setError((err as Error).message || 'Google sign-in failed')
    }
  }

  return (
    <div className={styles.loginCard}>
      <h2 className={styles.title}>
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </h2>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.primaryButton}
        >
          {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={styles.googleButton}
      >
        Continue with Google
      </button>

      <div className={styles.toggle}>
        <button
          onClick={onToggleMode}
          className={styles.toggleButton}
        >
          {isSignUp 
            ? 'Already have an account? Sign in' 
            : "Don't have an account? Sign up"
          }
        </button>
      </div>
    </div>
  )
}