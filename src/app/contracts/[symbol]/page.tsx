'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import styles from './contract.module.css'

interface ContractPersonality {
  symbol: string
  name: string
  personality: string
  personalityIcon: string
  description: string
  temperament: string
  violentDirection: string
  keyTriggers: string[]
  tradingHours: string
  beginnerTips: string[]
  currentMood: string
  moodIcon: string
  directionalBias: 'bullish' | 'bearish' | 'neutral'
  biasStrength: 'strong' | 'moderate' | 'weak'
  biasReasoning: string
  keyRelationships: {
    contract: string
    relationship: string
    currentCorrelation: number
    explanation: string
  }[]
  marketRegimeImpact: {
    riskOn: string
    riskOff: string
    inflation: string
    recession: string
  }
}

const contractData: Record<string, ContractPersonality> = {
  ES: {
    symbol: '/ES',
    name: 'E-mini S&P 500',
    personality: 'The Paper-Handed Boomer',
    personalityIcon: '📰',
    description: 'The reliable dividend-loving dad who panic sells at the first sign of trouble. Moves with whatever CNBC tells the institutions to do.',
    temperament: 'Rational most days, emotional during crises',
    violentDirection: 'Downside (fear sells faster than greed buys)',
    keyTriggers: ['Fed speeches', 'Economic data (jobs, GDP, inflation)', 'Corporate earnings seasons', 'Geopolitical events', 'Market sentiment shifts'],
    tradingHours: '9:30 AM - 4:00 PM ET (most active), 24-hour electronic trading',
    beginnerTips: [
      'Controls $240K of stonks with only ~$12K margin - this ain\'t your Robinhood account anymore',
      'Paper hands at first sign of FUD but diamond hands during bull runs',
      'Most active when boomers are awake (9:30 AM - 4:00 PM ET)',
      'When VIX goes brrr, /ES goes 📉📉📉 - fear = paper handed panic selling'
    ],
    currentMood: 'Cautious',
    moodIcon: '😐',
    directionalBias: 'neutral',
    biasStrength: 'weak',
    biasReasoning: 'Mixed signals from Fed policy uncertainty and resilient economic data create sideways bias',
    keyRelationships: [
      {
        contract: '/NQ',
        relationship: 'Highly Correlated Brother',
        currentCorrelation: 0.85,
        explanation: 'Usually moves in same direction but /NQ is more volatile. When they diverge, it signals sector rotation.'
      },
      {
        contract: '/ZB',
        relationship: 'Inverse Dance Partner',
        currentCorrelation: -0.60,
        explanation: 'When bonds rally (rates fall), stocks often follow. When bonds sell off (rates rise), stocks get nervous.'
      },
      {
        contract: '/GC',
        relationship: 'Fair Weather Friend',
        currentCorrelation: -0.20,
        explanation: 'Negative correlation during stress (flight to safety), positive during inflation fears.'
      },
      {
        contract: '/CL',
        relationship: 'Economic Indicator',
        currentCorrelation: 0.30,
        explanation: 'Oil rises often signal economic growth (good for stocks) but also inflation concerns (bad for stocks).'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Thrives - institutional money flows into equities, steady upward grind',
      riskOff: 'Panics first - massive selling as institutions reduce risk',
      inflation: 'Conflicted - corporate profits vs higher rates create volatility',
      recession: 'Deep selloff - forward-looking, prices in earnings decline early'
    }
  },
  NQ: {
    symbol: '/NQ',
    name: 'E-mini NASDAQ-100',
    personality: 'The YOLO Diamond Hands Ape',
    personalityIcon: '🦍',
    description: 'The degenerate who either rockets to the moon or crashes spectacularly. Pure hopium and FOMO energy with zero chill.',
    temperament: 'Optimistic with dramatic mood swings',
    violentDirection: 'Both directions - can rocket up or crash down violently',
    keyTriggers: ['Tech earnings', 'Interest rate changes', 'Growth vs Value rotation', 'Innovation news', 'Risk appetite shifts'],
    tradingHours: '9:30 AM - 4:00 PM ET (most active), 24-hour electronic trading',
    beginnerTips: [
      'WAY more volatile than boomer /ES - either 🚀🌙 or 💀💀💀',
      'Hates high interest rates like apes hate paper hands',
      'Follows the tech gods: TSLA, NVDA, AAPL - when they moon, /NQ goes BRRR',
      'Diverges from /ES when growth vs value rotation happens - stay woke'
    ],
    currentMood: 'Bullish',
    moodIcon: '😊',
    directionalBias: 'bullish',
    biasStrength: 'moderate',
    biasReasoning: 'AI innovation themes and tech earnings optimism offset by rate concerns',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Volatile Sibling',
        currentCorrelation: 0.85,
        explanation: 'Moves with /ES but with 30% more volatility. Divergences signal sector rotation between growth and value.'
      },
      {
        contract: '/ZB',
        relationship: 'Rate Sensitive Enemy',
        currentCorrelation: -0.75,
        explanation: 'Strong inverse relationship - rising rates (falling bonds) hurt growth stocks more than value stocks.'
      },
      {
        contract: '/GC',
        relationship: 'Inflation Hedge Competitor',
        currentCorrelation: -0.10,
        explanation: 'Both compete as inflation hedges, but gold wins during uncertainty, tech wins during optimism.'
      },
      {
        contract: '/CL',
        relationship: 'Economic Growth Indicator',
        currentCorrelation: 0.40,
        explanation: 'Higher correlation than /ES to oil - both benefit from economic growth and innovation demand.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Rocket ship - leads markets higher with growth premium',
      riskOff: 'Crashes harder - growth stocks sold first in risk-off moves',
      inflation: 'Depends - benefits from pricing power, hurt by higher rates',
      recession: 'Deep pain - growth stocks get hit hardest in economic slowdowns'
    }
  },
  GC: {
    symbol: '/GC',
    name: 'Gold Futures',
    personality: 'The Paranoid Prepper King',
    personalityIcon: '👑',
    description: 'The conspiracy theorist who hoards shiny rocks and screams "I TOLD YOU SO!" every time the market crashes. Been preparing for the apocalypse since 3000 BC.',
    temperament: 'Calm and steady, springs into action during crisis',
    violentDirection: 'Upside during panic - can spike 3-5% in hours during crisis',
    keyTriggers: ['Dollar strength/weakness', 'Real interest rates', 'Geopolitical tensions', 'Inflation expectations', 'Central bank policy'],
    tradingHours: '8:20 AM - 1:30 PM ET (most active), nearly 24-hour trading',
    beginnerTips: [
      'Inverse relationship with real interest rates is key',
      'Watch DXY (Dollar Index) - strong dollar usually means weak gold',
      'Spikes during geopolitical events and market crashes',
      'Think in terms of "real money" vs "paper money"'
    ],
    currentMood: 'Steady',
    moodIcon: '😌',
    directionalBias: 'bullish',
    biasStrength: 'moderate',
    biasReasoning: 'Geopolitical tensions and potential Fed pivot support gold, but strong dollar provides headwinds',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Crisis Inverse Partner',
        currentCorrelation: -0.20,
        explanation: 'Negative correlation during market stress (flight to safety), sometimes positive during inflation.'
      },
      {
        contract: '/ZB',
        relationship: 'Safe Haven Cousin',
        currentCorrelation: 0.40,
        explanation: 'Both benefit from flight to safety, but gold wins when currency/inflation concerns arise.'
      },
      {
        contract: '/CL',
        relationship: 'Inflation Hedge Ally',
        currentCorrelation: 0.50,
        explanation: 'Both rise with inflation expectations, but gold is the ultimate store of value.'
      },
      {
        contract: '/NQ',
        relationship: 'Old vs New Money',
        currentCorrelation: -0.10,
        explanation: 'Traditional store of value vs innovation. Compete for investment flows during uncertainty.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Sleepy - investors prefer risk assets, gold sits idle',
      riskOff: 'Shines bright - first asset investors flee to during crisis',
      inflation: 'Best friend - ultimate inflation hedge with 5,000 year track record',
      recession: 'Mixed - benefits from rate cuts, hurt by deflation fears'
    }
  },
  CL: {
    symbol: '/CL',
    name: 'Crude Oil (WTI)',
    personality: 'The Bipolar Energy Chad',
    personalityIcon: '💥',
    description: 'The absolute psychopath who goes from zero to hero in 0.5 seconds. Powered by pure chaos, OPEC drama, and geopolitical Twitter beef.',
    temperament: 'Explosive and unpredictable, driven by real-world events',
    violentDirection: 'Both directions - can move 5-10% in a single day on news',
    keyTriggers: ['OPEC decisions', 'Geopolitical tensions', 'Economic growth data', 'Dollar strength', 'Weather events', 'Refinery issues'],
    tradingHours: '9:00 AM - 2:30 PM ET (most active), nearly 24-hour trading',
    beginnerTips: [
      'Most volatile major futures contract - manage risk carefully',
      'Watch weekly inventory reports (EIA) every Wednesday',
      'Geopolitical events can cause instant 5%+ moves',
      'Economic data impacts oil more than other commodities'
    ],
    currentMood: 'Agitated',
    moodIcon: '😤',
    directionalBias: 'bearish',
    biasStrength: 'moderate',
    biasReasoning: 'Recession fears and potential demand destruction offset by OPEC+ supply cuts',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Economic Growth Mirror',
        currentCorrelation: 0.30,
        explanation: 'Higher oil often signals economic growth (good for stocks) but also inflation concerns (bad for stocks).'
      },
      {
        contract: '/GC',
        relationship: 'Inflation Hedge Partner',
        currentCorrelation: 0.50,
        explanation: 'Both rise with inflation expectations, oil leads and gold follows during supply shocks.'
      },
      {
        contract: '/ZB',
        relationship: 'Inflation Enemy',
        currentCorrelation: -0.45,
        explanation: 'Rising oil prices increase inflation expectations, leading to higher rates and lower bond prices.'
      },
      {
        contract: '/NQ',
        relationship: 'Cost Input Factor',
        currentCorrelation: 0.25,
        explanation: 'Energy costs impact tech companies, but less direct relationship than with industrial stocks.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Rises with economic optimism - more demand expected',
      riskOff: 'Falls on demand destruction fears, spikes on supply disruptions',
      inflation: 'Primary driver - oil shocks often trigger broader inflation',
      recession: 'Deep selloff - demand destruction fears dominate supply concerns'
    }
  },
  ZB: {
    symbol: '/ZB',
    name: '30-Year Treasury Bond',
    personality: 'The Theta Gang Boomer',
    personalityIcon: '🏦',
    description: 'The risk-averse grandpa who sells covered calls and collects coupons while lecturing everyone about "real investing." Boring but rich AF.',
    temperament: 'Methodical and forward-thinking, rarely panics',
    violentDirection: 'Upside during crisis - can rally 5-10% when investors flee to safety',
    keyTriggers: ['Fed policy decisions', 'Economic data', 'Inflation expectations', 'Fiscal policy', 'International capital flows'],
    tradingHours: '8:20 AM - 3:00 PM ET (most active), nearly 24-hour trading',
    beginnerTips: [
      'Bond prices move inverse to interest rates - remember this relationship',
      'Long-term bonds are more sensitive to rate changes than short-term',
      'Watch Fed meeting minutes and economic data closely',
      'Flight to quality during crisis drives bond prices higher'
    ],
    currentMood: 'Thoughtful',
    moodIcon: '🤔',
    directionalBias: 'neutral',
    biasStrength: 'weak',
    biasReasoning: 'Fed uncertainty creates range-bound trading between growth fears and inflation concerns',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Economic Indicator',
        currentCorrelation: -0.60,
        explanation: 'Inverse relationship - when bonds rally (rates fall), stocks often follow due to lower discount rates.'
      },
      {
        contract: '/NQ',
        relationship: 'Growth Stock Determinant',
        currentCorrelation: -0.75,
        explanation: 'Strongest inverse relationship - rising rates (falling bonds) hurt growth stocks most.'
      },
      {
        contract: '/GC',
        relationship: 'Safe Haven Competition',
        currentCorrelation: 0.40,
        explanation: 'Both benefit from flight to safety, but bonds pay interest while gold costs storage.'
      },
      {
        contract: '/CL',
        relationship: 'Inflation Gauge',
        currentCorrelation: -0.45,
        explanation: 'Rising oil increases inflation expectations, leading to higher rates and lower bond prices.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Sells off - investors prefer risk assets over safe bonds',
      riskOff: 'Rallies hard - flight to quality drives massive buying',
      inflation: 'Biggest enemy - inflation erodes bond values and drives rates higher',
      recession: 'Best performer - rate cut expectations drive prices higher'
    }
  }
}

export default function ContractPersonalityPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [contract, setContract] = useState<ContractPersonality | null>(null)
  const [liveAnalysis, setLiveAnalysis] = useState<any>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    const symbol = params.symbol as string
    const contractInfo = contractData[symbol.toUpperCase()]
    
    if (contractInfo) {
      setContract(contractInfo)
      // Fetch live analysis
      fetchLiveAnalysis(symbol.toUpperCase())
    } else {
      // Redirect to dashboard if invalid contract
      router.push('/dashboard')
    }
  }, [params.symbol, user, loading, router])

  const fetchLiveAnalysis = async (symbol: string) => {
    try {
      setAnalysisLoading(true)
      const response = await fetch('/api/contract-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: `/${symbol}` })
      })

      if (response.ok) {
        const analysis = await response.json()
        setLiveAnalysis(analysis)
      }
    } catch (error) {
      console.error('Failed to fetch live analysis:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !contract) {
    return null
  }

  const getBiasColor = (bias: string, strength: string) => {
    if (bias === 'bullish') return strength === 'strong' ? '#059669' : '#10b981'
    if (bias === 'bearish') return strength === 'strong' ? '#dc2626' : '#ef4444'
    return '#64748b'
  }

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.7) return 'Very Strong'
    if (abs >= 0.5) return 'Strong'
    if (abs >= 0.3) return 'Moderate'
    if (abs >= 0.1) return 'Weak'
    return 'Very Weak'
  }

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (correlation > 0) {
      if (abs >= 0.7) return '#059669'
      if (abs >= 0.5) return '#10b981'
      return '#34d399'
    } else {
      if (abs >= 0.7) return '#dc2626'
      if (abs >= 0.5) return '#ef4444'
      return '#f87171'
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          onClick={() => router.push('/dashboard')} 
          className={styles.backButton}
        >
          ← Back to Dashboard
        </button>
        <h1 className={styles.headerTitle}>Contract Personality Profile</h1>
      </header>

      <main className={styles.main}>
        {/* Contract Header */}
        <section className={styles.contractHeader}>
          <div className={styles.contractIntro}>
            <div className={styles.contractSymbolSection}>
              <span className={styles.personalityIcon}>{contract.personalityIcon}</span>
              <div className={styles.contractTitles}>
                <h1 className={styles.contractSymbol}>{contract.symbol}</h1>
                <h2 className={styles.contractPersonality}>{contract.personality}</h2>
                <p className={styles.contractName}>{contract.name}</p>
              </div>
            </div>
            <div className={styles.currentStatus}>
              <div className={styles.mood}>
                <span className={styles.moodIcon}>{contract.moodIcon}</span>
                <span className={styles.moodText}>Current Mood: {contract.currentMood}</span>
              </div>
              <div 
                className={styles.directionalBias}
                style={{ backgroundColor: getBiasColor(contract.directionalBias, contract.biasStrength) }}
              >
                <span className={styles.biasLabel}>
                  {contract.biasStrength.toUpperCase()} {contract.directionalBias.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <p className={styles.contractDescription}>{contract.description}</p>
        </section>

        {/* Personality Profile */}
        <section className={styles.personalityProfile}>
          <h3 className={styles.sectionTitle}>Personality Profile</h3>
          <div className={styles.profileGrid}>
            <div className={styles.profileCard}>
              <h4 className={styles.profileLabel}>Temperament</h4>
              <p className={styles.profileValue}>{contract.temperament}</p>
            </div>
            <div className={styles.profileCard}>
              <h4 className={styles.profileLabel}>Violent Direction</h4>
              <p className={styles.profileValue}>{contract.violentDirection}</p>
            </div>
            <div className={styles.profileCard}>
              <h4 className={styles.profileLabel}>Trading Hours</h4>
              <p className={styles.profileValue}>{contract.tradingHours}</p>
            </div>
          </div>
        </section>

        {/* Current Market Analysis */}
        <section className={styles.marketAnalysis}>
          <h3 className={styles.sectionTitle}>Current Market Analysis</h3>
          
          {/* Live AI Analysis */}
          {liveAnalysis && (
            <div className={styles.liveAnalysisCard}>
              <div className={styles.liveHeader}>
                <h4 className={styles.liveTitle}>🤖 Live AI Analysis</h4>
                <span className={styles.liveTimestamp}>
                  Updated: {new Date(liveAnalysis.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={styles.biasSection}>
                <h4 className={styles.biasTitle}>
                  AI Directional Bias: 
                  <span 
                    className={styles.biasValue}
                    style={{ color: getBiasColor(liveAnalysis.directionalBias, liveAnalysis.biasStrength) }}
                  >
                    {liveAnalysis.biasStrength} {liveAnalysis.directionalBias}
                  </span>
                </h4>
                <p className={styles.biasReasoning}>{liveAnalysis.biasReasoning}</p>
                
                <div className={styles.marketRegime}>
                  <strong>Market Regime:</strong> {liveAnalysis.marketRegimeAnalysis?.currentRegime.replace('_', ' ').toUpperCase()} 
                  ({liveAnalysis.marketRegimeAnalysis?.regimeConfidence}% confidence)
                </div>
                <p className={styles.regimeImpact}>{liveAnalysis.marketRegimeAnalysis?.impactOnContract}</p>
              </div>
            </div>
          )}
          
          {analysisLoading && (
            <div className={styles.analysisLoading}>
              <div className={styles.spinner}></div>
              <span>Generating live market analysis...</span>
            </div>
          )}
          
          {/* Static Analysis for Comparison */}
          <div className={styles.analysisCard}>
            <div className={styles.staticHeader}>
              <h4 className={styles.staticTitle}>📚 Educational Baseline</h4>
            </div>
            <div className={styles.biasSection}>
              <h4 className={styles.biasTitle}>
                Baseline Bias: 
                <span 
                  className={styles.biasValue}
                  style={{ color: getBiasColor(contract.directionalBias, contract.biasStrength) }}
                >
                  {contract.biasStrength} {contract.directionalBias}
                </span>
              </h4>
              <p className={styles.biasReasoning}>{contract.biasReasoning}</p>
            </div>
          </div>
        </section>

        {/* Market Relationships - THE KEY INSIGHT */}
        <section className={styles.relationships}>
          <h3 className={styles.sectionTitle}>🔗 How {contract.symbol} Relates to Other Markets</h3>
          <p className={styles.relationshipsIntro}>
            Understanding these relationships is the key to market awareness. Each contract doesn't trade in isolation - 
            they're all connected in a complex web of economic relationships.
          </p>
          
          <div className={styles.relationshipGrid}>
            {contract.keyRelationships.map((rel, index) => (
              <div key={index} className={styles.relationshipCard}>
                <div className={styles.relationshipHeader}>
                  <span className={styles.relatedContract}>{rel.contract}</span>
                  <div 
                    className={styles.correlationBadge}
                    style={{ backgroundColor: getCorrelationColor(rel.currentCorrelation) }}
                  >
                    {rel.currentCorrelation > 0 ? '+' : ''}{rel.currentCorrelation.toFixed(2)}
                  </div>
                </div>
                <h4 className={styles.relationshipType}>{rel.relationship}</h4>
                <p className={styles.relationshipExplanation}>{rel.explanation}</p>
                <div className={styles.correlationStrength}>
                  <strong>{getCorrelationStrength(rel.currentCorrelation)} {rel.currentCorrelation > 0 ? 'Positive' : 'Negative'} Correlation</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Market Regime Impact */}
        <section className={styles.marketRegimes}>
          <h3 className={styles.sectionTitle}>📊 How {contract.symbol} Behaves in Different Market Regimes</h3>
          <div className={styles.regimeGrid}>
            <div className={styles.regimeCard}>
              <h4 className={styles.regimeTitle}>🚀 Risk On</h4>
              <p className={styles.regimeDescription}>{contract.marketRegimeImpact.riskOn}</p>
            </div>
            <div className={styles.regimeCard}>
              <h4 className={styles.regimeTitle}>🛡️ Risk Off</h4>
              <p className={styles.regimeDescription}>{contract.marketRegimeImpact.riskOff}</p>
            </div>
            <div className={styles.regimeCard}>
              <h4 className={styles.regimeTitle}>📈 Inflation</h4>
              <p className={styles.regimeDescription}>{contract.marketRegimeImpact.inflation}</p>
            </div>
            <div className={styles.regimeCard}>
              <h4 className={styles.regimeTitle}>📉 Recession</h4>
              <p className={styles.regimeDescription}>{contract.marketRegimeImpact.recession}</p>
            </div>
          </div>
        </section>

        {/* Key Triggers */}
        <section className={styles.triggers}>
          <h3 className={styles.sectionTitle}>⚡ What Makes {contract.symbol} Move</h3>
          <div className={styles.triggerList}>
            {contract.keyTriggers.map((trigger, index) => (
              <div key={index} className={styles.triggerItem}>
                <span className={styles.triggerBullet}>•</span>
                <span className={styles.triggerText}>{trigger}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Beginner Tips */}
        <section className={styles.beginnerTips}>
          <h3 className={styles.sectionTitle}>💡 Beginner Tips for Trading {contract.symbol}</h3>
          <div className={styles.tipsList}>
            {contract.beginnerTips.map((tip, index) => (
              <div key={index} className={styles.tipItem}>
                <span className={styles.tipNumber}>{index + 1}</span>
                <span className={styles.tipText}>{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <section className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={() => router.push('/dashboard')}
          >
            ← Back to All Contracts
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => router.push('/learn')}
          >
            📚 Continue Learning
          </button>
        </section>
      </main>
    </div>
  )
}