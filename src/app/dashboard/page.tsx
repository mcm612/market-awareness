'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CorrelationHeatmap from '@/components/CorrelationHeatmap'
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

// Mock data for all futures contracts - WSB Style!
const contractsData: ContractData[] = [
  // Core 5 Contracts
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
  },
  // Commodity Futures
  {
    symbol: '/SI',
    name: 'Silver Futures',
    personality: 'The Poor Man\'s Gold Pleb',
    currentPrice: 24.85,
    change: 0.45,
    changePercent: 1.84,
    mood: 'Following Gold',
    moodIcon: '🤤',
    personalityIcon: '🥈'
  },
  {
    symbol: '/HG',
    name: 'Copper Futures',
    personality: 'The Economic PhD Chad',
    currentPrice: 3.92,
    change: -0.08,
    changePercent: -2.0,
    mood: 'Analyzing Data',
    moodIcon: '🤓',
    personalityIcon: '🔧'
  },
  {
    symbol: '/ZC',
    name: 'Corn Futures',
    personality: 'The Midwest Karen',
    currentPrice: 675.25,
    change: 12.50,
    changePercent: 1.89,
    mood: 'Weather Worried',
    moodIcon: '😰',
    personalityIcon: '🌽'
  },
  {
    symbol: '/ZS',
    name: 'Soybean Futures',
    personality: 'The Vegan Influencer',
    currentPrice: 1534.75,
    change: 18.25,
    changePercent: 1.20,
    mood: 'Plant Based Gains',
    moodIcon: '🌱',
    personalityIcon: '🫘'
  },
  {
    symbol: '/ZW',
    name: 'Wheat Futures',
    personality: 'The Geopolitical Drama Queen',
    currentPrice: 745.50,
    change: 25.75,
    changePercent: 3.58,
    mood: 'Crisis Mode',
    moodIcon: '😱',
    personalityIcon: '🌾'
  },
  // Currency Futures
  {
    symbol: '/6E',
    name: 'Euro Futures',
    personality: 'The Sophisticated European Mess',
    currentPrice: 1.0875,
    change: -0.0025,
    changePercent: -0.23,
    mood: 'Existential Crisis',
    moodIcon: '😕',
    personalityIcon: '🇪🇺'
  },
  {
    symbol: '/6J',
    name: 'Japanese Yen Futures',
    personality: 'The Polite Kamikaze Pilot',
    currentPrice: 0.00685,
    change: 0.00015,
    changePercent: 2.24,
    mood: 'Safe Haven Mode',
    moodIcon: '🛡️',
    personalityIcon: '🇯🇵'
  },
  {
    symbol: '/6B',
    name: 'British Pound Futures',
    personality: 'The Brexit Disaster',
    currentPrice: 1.2450,
    change: -0.0075,
    changePercent: -0.60,
    mood: 'Brexit Regret',
    moodIcon: '😵‍💫',
    personalityIcon: '🇬🇧'
  },
  {
    symbol: '/6A',
    name: 'Australian Dollar Futures',
    personality: 'The Commodity Bro Surfer',
    currentPrice: 0.6725,
    change: 0.0035,
    changePercent: 0.52,
    mood: 'Riding the Wave',
    moodIcon: '🏄‍♂️',
    personalityIcon: '🇦🇺'
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
              From stocks to commodities to currencies - each contract has its own WSB-style personality, triggers, and behaviors. Click to learn more about each one.
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

        {/* Correlation Analysis Section */}
        <section className={styles.correlationSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>How the Personalities Relate</h2>
            <p className={styles.sectionSubtitle}>
              Understanding correlations helps you see which contracts move together, move opposite, or act independently. 
              This is key to understanding market dynamics and risk management.
            </p>
          </div>
          <CorrelationHeatmap />
        </section>

        {/* Today's Learning Section */}
        <section className={styles.todaysLearning}>
          <div className={styles.learningContent}>
            <div className={styles.learningMain}>
              <h2 className={styles.learningTitle}>What's Moving Markets Today</h2>
              <div className={styles.marketEvent}>
                <h3 className={styles.eventTitle}>🌍 Global Market Relationships in Action</h3>
                <p className={styles.eventDescription}>
                  Today's market shows the full ecosystem in action: /ZW (Geopolitical Drama Queen) is freaking out about grain exports, 
                  /6J (Polite Kamikaze Pilot) is strengthening on safe haven flows, while /6A (Commodity Bro Surfer) rides the China optimism wave. 
                  This is why understanding ALL the personalities = true market awareness.
                </p>
                <div className={styles.whyMatters}>
                  <h4 className={styles.whyTitle}>💡 Why This Matters for Learning</h4>
                  <p className={styles.whyDescription}>
                    Real market awareness isn't just about stocks - it's understanding how equities, bonds, commodities, and currencies 
                    all relate to each other. Each personality reacts differently to the same global events, creating opportunities.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.learningOpportunity}>
              <h3 className={styles.opportunityTitle}>Today's Learning Opportunity</h3>
              <div className={styles.opportunityCard}>
                <div className={styles.opportunityHeader}>
                  <span className={styles.opportunityIcon}>🎯</span>
                  <span className={styles.opportunityLabel}>Cross-Market Exercise</span>
                </div>
                <p className={styles.opportunityText}>
                  Compare how /GC (Paranoid Prepper King) and /6J (Polite Kamikaze Pilot) both benefit from risk-off flows, 
                  while /6A (Commodity Bro Surfer) moves opposite due to its risk-on nature.
                </p>
                <div className={styles.opportunityAction}>
                  <strong>Your Task:</strong> Click on different asset classes (stocks, bonds, commodities, currencies) 
                  to see how they relate to each other.
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
                <div className={styles.statNumber}>13</div>
                <div className={styles.statLabel}>Contracts Available</div>
              </div>
              <div className={styles.progressStat}>
                <div className={styles.statNumber}>4</div>
                <div className={styles.statLabel}>Asset Classes</div>
              </div>
              <div className={styles.progressStat}>
                <div className={styles.statNumber}>∞</div>
                <div className={styles.statLabel}>Market Relationships</div>
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