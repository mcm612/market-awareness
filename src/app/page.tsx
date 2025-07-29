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
              <span className={styles.contractName}>The Steady Giant</span>
              <div className={styles.contractMood}>😐 Cautious</div>
            </div>
            <div className={styles.contractCard}>
              <span className={styles.contractSymbol}>/NQ</span>
              <span className={styles.contractName}>The Tech Optimist</span>
              <div className={styles.contractMood}>😊 Bullish</div>
            </div>
            <div className={styles.contractCard}>
              <span className={styles.contractSymbol}>/GC</span>
              <span className={styles.contractName}>The Safe Haven</span>
              <div className={styles.contractMood}>😌 Steady</div>
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
                Meet /ES, /NQ, /GC, /CL, and /ZB as unique market characters with their own traits, 
                triggers, and behaviors. Make abstract markets feel personal and memorable.
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
          <h2 className={styles.sectionTitle}>Today's Market Lesson</h2>
          <div className={styles.marketLesson}>
            <div className={styles.lessonContent}>
              <h3 className={styles.lessonTitle}>Understanding Market Personalities in Action</h3>
              <p className={styles.lessonDescription}>
                Right now, /ES (The Steady Giant) is showing its typical cautious behavior during 
                uncertain times, while /NQ (The Tech Optimist) remains more volatile. This is exactly 
                the kind of personality difference that makes futures trading both fascinating and profitable.
              </p>
              <div className={styles.lessonInsight}>
                <strong>💡 Learning Insight:</strong> Each contract reacts differently to the same news. 
                Understanding these personalities helps you choose the right market for your trading style.
              </div>
            </div>
            <div className={styles.contractSpotlight}>
              <h4 className={styles.spotlightTitle}>Contract of the Day</h4>
              <div className={styles.spotlightCard}>
                <div className={styles.spotlightHeader}>
                  <span className={styles.spotlightSymbol}>/ES</span>
                  <span className={styles.spotlightName}>The Steady Giant</span>
                </div>
                <div className={styles.spotlightStats}>
                  <div className={styles.spotlightMood}>Current Mood: 😐 Cautious</div>
                  <div className={styles.spotlightTrigger}>Key Trigger: Fed Policy Updates</div>
                  <div className={styles.spotlightTip}>
                    <strong>Beginner Tip:</strong> /ES moves steadily but can panic quickly during uncertainty. 
                    Perfect for learning risk management.
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
              <p className={styles.stepDescription}>Get introduced to the 5 major futures personalities</p>
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