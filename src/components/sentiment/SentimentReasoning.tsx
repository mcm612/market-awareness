'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './SentimentReasoning.module.css'

interface NewsSource {
  title: string
  url: string
  source: string
  published: string
  summary?: string
}

interface SentimentData {
  timeframe: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  reasoning?: string
  news_sources?: NewsSource[]
}

interface SentimentReasoningProps {
  timeframe: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  reasoning?: string
  newsSources?: NewsSource[]
  isLoading?: boolean
  symbol?: string
  confidence?: number
}

export default function SentimentReasoning({
  timeframe,
  sentiment,
  reasoning,
  newsSources = [],
  isLoading = false,
  symbol = '',
  confidence = 0
}: SentimentReasoningProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '🟢'
      case 'bearish': return '🔴'
      case 'neutral': return '🟡'
      default: return '⚪'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return '#10b981'
      case 'bearish': return '#ef4444'
      case 'neutral': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getTimeframeLabel = (timeframe: string) => {
    const labels = {
      '1D': '1D - 0DTE',
      '1W': '1W - Weekly',
      '2W': '2W - Events',
      '1M': '1M - Monthly',
      '2M': '2M - Theta'
    }
    return labels[timeframe as keyof typeof labels] || timeframe
  }

  const parseStructuredReasoning = (reasoning: string) => {
    const sections = reasoning.split('**').filter(section => section.trim())
    const parsed: Record<string, string> = {}
    
    for (let i = 0; i < sections.length; i += 2) {
      if (sections[i + 1]) {
        const key = sections[i].trim().toLowerCase().replace(/\s+/g, '_')
        const content = sections[i + 1].trim()
        parsed[key] = content
      }
    }
    
    return parsed
  }

  const renderCatalysts = (catalystsText: string) => {
    const catalysts = catalystsText.split('•').filter(c => c.trim())
    return catalysts.map((catalyst, index) => (
      <div key={index} className={styles.catalystItem}>
        <span className={styles.catalystIcon}>🎯</span>
        <p className={styles.catalystText}>{catalyst.trim()}</p>
      </div>
    ))
  }

  const formatDate = (dateString: string) => {
    try {
      // Alpha Vantage format: 20240115T103000
      if (dateString.includes('T')) {
        const year = dateString.slice(0, 4)
        const month = dateString.slice(4, 6)
        const day = dateString.slice(6, 8)
        const date = new Date(`${year}-${month}-${day}`)
        return date.toLocaleDateString()
      }
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  const modalContent = (
    <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={styles.modalSymbol}>{symbol}</span>
            <span className={styles.modalTimeframe}>{getTimeframeLabel(timeframe)}</span>
            <div className={styles.modalSentiment} style={{ color: getSentimentColor(sentiment) }}>
              {getSentimentIcon(sentiment)} {sentiment.toUpperCase()}
              {confidence > 0 && (
                <span className={styles.confidenceScore}>({confidence}% confidence)</span>
              )}
            </div>
          </div>
          <button 
            className={styles.closeButton}
            onClick={() => setIsModalOpen(false)}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {isLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Analyzing sentiment with AI...</p>
            </div>
          ) : reasoning ? (
            <>
              {(() => {
                const sections = parseStructuredReasoning(reasoning)
                return (
                  <>
                    {sections.key_catalysts && (
                      <div className={styles.analysisSection}>
                        <h3 className={styles.sectionHeader}>
                          🎯 Key Catalysts
                        </h3>
                        <div>
                          {renderCatalysts(sections.key_catalysts)}
                        </div>
                      </div>
                    )}

                    {sections.compelling_reasoning && (
                      <div className={styles.analysisSection}>
                        <h3 className={styles.sectionHeader}>
                          💡 Why This Direction Makes Sense
                        </h3>
                        <p className={styles.analysisContent}>
                          {sections.compelling_reasoning}
                        </p>
                      </div>
                    )}

                    {sections.what_to_watch && (
                      <div className={styles.analysisSection}>
                        <h3 className={styles.sectionHeader}>
                          👀 What To Watch
                        </h3>
                        <p className={styles.analysisContent}>
                          {sections.what_to_watch}
                        </p>
                      </div>
                    )}

                    {newsSources.length > 0 && (
                      <div className={styles.analysisSection}>
                        <h3 className={styles.sectionHeader}>
                          📰 Supporting News Sources
                        </h3>
                        <div className={styles.sourcesList}>
                          {newsSources.map((source, index) => (
                            <div key={index} className={styles.sourceItem}>
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.sourceLink}
                              >
                                <div className={styles.sourceTitle}>
                                  {source.title}
                                </div>
                                <div className={styles.sourceMeta}>
                                  {source.source} • {formatDate(source.published)}
                                </div>
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )
              })()}
            </>
          ) : (
            <div className={styles.noReasoning}>
              <p>No detailed analysis available for this timeframe.</p>
              <p>Click "Update AI Analysis" to generate reasoning for all timeframes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.container}>
      <div className={styles.compactView}>
        <div className={styles.timeframeBadge}>
          {getSentimentIcon(sentiment)} {getTimeframeLabel(timeframe)}
        </div>
        <button
          className={styles.whyButton}
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Why?'}
        </button>
      </div>

      {isModalOpen && typeof window !== 'undefined' && createPortal(
        modalContent,
        document.body
      )}
    </div>
  )
}