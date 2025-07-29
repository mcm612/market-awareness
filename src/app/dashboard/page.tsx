'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import styles from './dashboard.module.css'

interface ContractData {
  symbol: string
  name: string
  personality: string
  currentPrice: number
  change: number
  changePercent: number
  mood: string
  moodIcon: string
  personalityIcon: string
}

// Mock data for the 5 main futures contracts - WSB Style!
const contractsData: ContractData[] = [
  {
    symbol: '/ES',
    name: 'E-mini S&P 500',
    personality: 'The Paper-Handed Boomer',
    currentPrice: 4850.50,
    change: -12.25,
    changePercent: -0.25,
    mood: 'Paper Handing',
    moodIcon: '📰',
    personalityIcon: '📰'
  },
  {
    symbol: '/NQ',
    name: 'E-mini NASDAQ',
    personality: 'The YOLO Diamond Hands Ape',
    currentPrice: 16234.25,
    change: 45.75,
    changePercent: 0.28,
    mood: 'MOONING',
    moodIcon: '🚀',
    personalityIcon: '🦍'
  },
  {
    symbol: '/GC',
    name: 'Gold Futures',
    personality: 'The Paranoid Prepper King',
    currentPrice: 2045.80,
    change: 8.30,
    changePercent: 0.41,
    mood: 'Hoarding',
    moodIcon: '😤',
    personalityIcon: '👑'
  },
  {
    symbol: '/CL',
    name: 'Crude Oil',
    personality: 'The Bipolar Energy Chad',
    currentPrice: 78.95,
    change: -2.15,
    changePercent: -2.65,
    mood: 'Going Psycho',
    moodIcon: '😡',
    personalityIcon: '💥'
  },
  {
    symbol: '/ZB',
    name: '30-Year Treasury Bond',
    personality: 'The Theta Gang Boomer',
    currentPrice: 123.84,
    change: 0.25,
    changePercent: 0.20,
    mood: 'Collecting Coupons',
    moodIcon: '💰',
    personalityIcon: '🏦'
  }
]

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [contracts, setContracts] = useState<ContractData[]>(contractsData)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleContractClick = (symbol: string) => {
    // Navigate to contract personality page
    router.push(`/contracts/${symbol.replace('/', '')}`)
  }

  const formatCurrency = (value: number, symbol: string) => {
    if (symbol === '/GC') return `$${value.toFixed(2)}`
    if (symbol === '/CL') return `$${value.toFixed(2)}`
    if (symbol === '/ZB') return value.toFixed(2)
    return value.toLocaleString()
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return styles.positive
    if (change < 0) return styles.negative
    return styles.neutral
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <div className={styles.logo}>
              <span className={styles.logoIcon}>📈</span>
              <h1 className={styles.logoText}>Futures Education</h1>
            </div>
            <p className={styles.tagline}>Learn futures through personality-driven education</p>
          </div>
          
          <div className={styles.userSection}>
            <span className={styles.welcome}>
              Welcome, <strong>{user.email?.split('@')[0]}</strong>
            </span>
            <button onClick={handleSignOut} className={styles.signOutButton}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Market Overview Section */}
        <section className={styles.marketOverview}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Meet Your Futures Personalities</h2>
            <p className={styles.sectionSubtitle}>
              Each contract has its own personality, triggers, and behaviors. Click to learn more about each one.
            </p>
          </div>

          <div className={styles.contractGrid}>
            {contracts.map((contract) => (
              <div 
                key={contract.symbol}
                className={styles.contractCard}
                onClick={() => handleContractClick(contract.symbol)}
              >
                <div className={styles.contractHeader}>
                  <div className={styles.contractSymbol}>
                    <span className={styles.personalityIcon}>{contract.personalityIcon}</span>
                    <span className={styles.symbol}>{contract.symbol}</span>
                  </div>
                  <div className={styles.contractMood}>
                    <span className={styles.moodIcon}>{contract.moodIcon}</span>
                    <span className={styles.mood}>{contract.mood}</span>
                  </div>
                </div>

                <div className={styles.contractInfo}>
                  <h3 className={styles.contractPersonality}>{contract.personality}</h3>
                  <p className={styles.contractName}>{contract.name}</p>
                </div>

                <div className={styles.contractStats}>
                  <div className={styles.price}>
                    {formatCurrency(contract.currentPrice, contract.symbol)}
                  </div>
                  <div className={`${styles.change} ${getChangeColor(contract.change)}`}>
                    {contract.change >= 0 ? '+' : ''}{contract.change.toFixed(2)} 
                    ({contract.changePercent >= 0 ? '+' : ''}{contract.changePercent.toFixed(2)}%)
                  </div>
                </div>

                <div className={styles.learnMore}>
                  <span>Learn about {contract.personality} →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Today's Learning Section */}
        <section className={styles.todaysLearning}>
          <div className={styles.learningContent}>
            <div className={styles.learningMain}>
              <h2 className={styles.learningTitle}>What's Moving Markets Today</h2>
              <div className={styles.marketEvent}>
                <h3 className={styles.eventTitle}>📊 Fed Policy Uncertainty Creates Mixed Signals</h3>
                <p className={styles.eventDescription}>
                  Today's market action perfectly demonstrates how different futures personalities react to the same news. 
                  While /ES (The Steady Giant) shows its typical cautious behavior with a slight decline, /NQ (The Tech Optimist) 
                  remains bullish on tech innovation. Meanwhile, /GC (The Safe Haven) is attracting safety-seekers.
                </p>
                <div className={styles.whyMatters}>
                  <h4 className={styles.whyTitle}>💡 Why This Matters for Learning</h4>
                  <p className={styles.whyDescription}>
                    Understanding how each contract's "personality" responds to macro events is the key to futures success. 
                    This isn't just about numbers - it's about market psychology and character traits that remain consistent over time.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.learningOpportunity}>
              <h3 className={styles.opportunityTitle}>Today's Learning Opportunity</h3>
              <div className={styles.opportunityCard}>
                <div className={styles.opportunityHeader}>
                  <span className={styles.opportunityIcon}>🎯</span>
                  <span className={styles.opportunityLabel}>Observation Exercise</span>
                </div>
                <p className={styles.opportunityText}>
                  Watch how /ES and /NQ react differently to the same Fed news throughout the day. 
                  Notice /ES's steady, cautious moves vs /NQ's more dramatic swings.
                </p>
                <div className={styles.opportunityAction}>
                  <strong>Your Task:</strong> Click on both contracts to learn about their personalities, 
                  then observe their price action patterns.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className={styles.quickActions}>
          <h2 className={styles.actionsTitle}>Continue Your Learning Journey</h2>
          <div className={styles.actionGrid}>
            <button 
              className={styles.actionButton}
              onClick={() => router.push('/learn')}
            >
              <span className={styles.actionIcon}>📚</span>
              <span className={styles.actionText}>Learning Center</span>
              <span className={styles.actionDescription}>Structured lessons and modules</span>
            </button>

            <button 
              className={styles.actionButton}
              onClick={() => router.push('/daily')}
            >
              <span className={styles.actionIcon}>📅</span>
              <span className={styles.actionText}>Daily Lessons</span>
              <span className={styles.actionDescription}>Market-driven education</span>
            </button>

            <button 
              className={styles.actionButton}
              onClick={() => router.push('/simulator')}
            >
              <span className={styles.actionIcon}>🎮</span>
              <span className={styles.actionText}>Practice Trading</span>
              <span className={styles.actionDescription}>Paper trading simulator</span>
            </button>

            <button 
              className={styles.actionButton}
              onClick={() => router.push('/macro')}
            >
              <span className={styles.actionIcon}>🌍</span>
              <span className={styles.actionText}>Macro Context</span>
              <span className={styles.actionDescription}>Current market environment</span>
            </button>
          </div>
        </section>

        {/* Progress Section */}
        <section className={styles.progress}>
          <div className={styles.progressContent}>
            <h2 className={styles.progressTitle}>Your Learning Progress</h2>
            <div className={styles.progressStats}>
              <div className={styles.progressStat}>
                <div className={styles.statNumber}>3</div>
                <div className={styles.statLabel}>Contracts Learned</div>
              </div>
              <div className={styles.progressStat}>
                <div className={styles.statNumber}>7</div>
                <div className={styles.statLabel}>Lessons Completed</div>
              </div>
              <div className={styles.progressStat}>
                <div className={styles.statNumber}>12</div>
                <div className={styles.statLabel}>Days Learning</div>
              </div>
            </div>
            <div className={styles.nextLesson}>
              <strong>Next Recommended:</strong> Learn about margin and risk management in futures trading
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}