'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import styles from './landing.module.css'

export default function LandingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleStartLearning = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  const handleLearnMore = (section: string) => {
    // Smooth scroll to section
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            From Stocks to Futures:<br />
            <span className={styles.heroAccent}>Your Guided Journey</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Learn futures trading through live market examples and personality-driven education.<br />
            No intimidation, just clear explanations that make complex markets accessible.
          </p>
          <button className={styles.ctaButton} onClick={handleStartLearning}>
            Start Learning
          </button>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.contractPreview}>
            <div className={styles.contractCard}>
              <span className={styles.contractSymbol}>/ES</span>
              <span className={styles.contractName}>The Paper-Handed Boomer</span>
              <div className={styles.contractMood}>📰 Paper Handing</div>
            </div>
            <div className={styles.contractCard}>
              <span className={styles.contractSymbol}>/NQ</span>
              <span className={styles.contractName}>The YOLO Diamond Hands Ape</span>
              <div className={styles.contractMood}>🚀 MOONING</div>
            </div>
            <div className={styles.contractCard}>
              <span className={styles.contractSymbol}>/GC</span>
              <span className={styles.contractName}>The Paranoid Prepper King</span>
              <div className={styles.contractMood}>😤 Hoarding</div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section id="features" className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Why Learn Futures This Way?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎭</div>
              <h3 className={styles.featureTitle}>Contract Personalities</h3>
              <p className={styles.featureDescription}>
                Meet 13 unique personalities across 4 asset classes: from the Paper-Handed Boomer (/ES) to the 
                Commodity Bro Surfer (/6A). Stocks, bonds, commodities, and currencies - each with serious personality issues.
              </p>
              <button 
                className={styles.featureButton}
                onClick={() => handleLearnMore('contracts')}
              >
                Meet the Contracts
              </button>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📈</div>
              <h3 className={styles.featureTitle}>Live Market Context</h3>
              <p className={styles.featureDescription}>
                Learn why markets move through real-time examples. Every lesson connects to actual 
                market events, making theory practical and immediately relevant.
              </p>
              <button 
                className={styles.featureButton}
                onClick={() => handleLearnMore('learning')}
              >
                See Daily Lessons
              </button>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎓</div>
              <h3 className={styles.featureTitle}>Beginner-Friendly</h3>
              <p className={styles.featureDescription}>
                No intimidating jargon or complex charts. Start with simple concepts and build 
                confidence through understanding, not memorization.
              </p>
              <button 
                className={styles.featureButton}
                onClick={() => handleLearnMore('learning')}
              >
                Start Learning
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section id="contracts" className={styles.featured}>
        <div className={styles.featuredContainer}>
          <h2 className={styles.sectionTitle}>Today&apos;s Market Lesson</h2>
          <div className={styles.marketLesson}>
            <div className={styles.lessonContent}>
              <h3 className={styles.lessonTitle}>Cross-Market Personality Drama in Action</h3>
              <p className={styles.lessonDescription}>
                Right now, /ZW (Geopolitical Drama Queen) is having a meltdown about grain exports, 
                /6J (Polite Kamikaze Pilot) is quietly destroying carry trades, while /6A (Commodity Bro Surfer) 
                is riding the China wave. This is why understanding ALL personalities = true market awareness.
              </p>
              <div className={styles.lessonInsight}>
                <strong>💡 Learning Insight:</strong> Real market awareness isn&apos;t just stocks - it&apos;s understanding how 
                equities, bonds, commodities, and currencies all relate to each other through their unique personalities.
              </div>
            </div>
            <div className={styles.contractSpotlight}>
              <h4 className={styles.spotlightTitle}>Contract of the Day</h4>
              <div className={styles.spotlightCard}>
                <div className={styles.spotlightHeader}>
                  <span className={styles.spotlightSymbol}>/ES</span>
                  <span className={styles.spotlightName}>The Paper-Handed Boomer</span>
                </div>
                <div className={styles.spotlightStats}>
                  <div className={styles.spotlightMood}>Current Mood: 📰 Paper Handing</div>
                  <div className={styles.spotlightTrigger}>Key Trigger: CNBC FUD Reports</div>
                  <div className={styles.spotlightTip}>
                    <strong>Ape Tip:</strong> /ES paper hands at the first sign of trouble but steady gains when confident. 
                    Perfect for learning when boomers panic sell.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Path Preview */}
      <section id="learning" className={styles.learningPath}>
        <div className={styles.learningContainer}>
          <h2 className={styles.sectionTitle}>Your Learning Journey</h2>
          <div className={styles.pathSteps}>
            <div className={styles.pathStep}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Meet the Contracts</h3>
              <p className={styles.stepDescription}>Get introduced to 13 futures personalities across 4 asset classes</p>
            </div>
            <div className={styles.pathStep}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Understand the Basics</h3>
              <p className={styles.stepDescription}>Learn futures vs stocks through simple analogies</p>
            </div>
            <div className={styles.pathStep}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Practice with Context</h3>
              <p className={styles.stepDescription}>Apply knowledge with live market examples</p>
            </div>
            <div className={styles.pathStep}>
              <div className={styles.stepNumber}>4</div>
              <h3 className={styles.stepTitle}>Build Confidence</h3>
              <p className={styles.stepDescription}>Paper trade with educational feedback</p>
            </div>
          </div>
          <button className={styles.startJourneyButton} onClick={handleStartLearning}>
            Begin Your Journey
          </button>
        </div>
      </section>

      {/* Footer CTA */}
      <section className={styles.footerCta}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready to Make Futures Less Intimidating?</h2>
          <p className={styles.ctaDescription}>
            Join thousands learning futures trading through personality-driven education and live market context.
          </p>
          <button className={styles.finalCtaButton} onClick={handleStartLearning}>
            Start Learning Today
          </button>
        </div>
      </section>
    </div>
  )
}