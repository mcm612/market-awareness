'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './ComprehensiveAnalysis.module.css'

interface TimeframeData {
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
}

interface ComprehensiveAnalysisProps {
  symbol: string
  analysis?: string
  timeframes?: Record<string, TimeframeData>
  isLoading?: boolean
  onAnalyze?: () => Promise<void>
}

export default function ComprehensiveAnalysis({
  symbol,
  analysis,
  timeframes = {},
  isLoading = false,
  onAnalyze
}: ComprehensiveAnalysisProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const handleViewFullAnalysis = async () => {
    setIsModalOpen(true)
    setErrorMessage(null)
    
    // If no analysis exists, fetch it
    if (!analysis && onAnalyze) {
      setModalLoading(true)
      try {
        await onAnalyze()
        // Modal stays open and will show the analysis once it's available
      } catch (error) {
        console.error('Failed to fetch analysis:', error)
        setErrorMessage('Failed to generate analysis. Please try again.')
      } finally {
        setModalLoading(false)
      }
    }
  }

  const getOverallSentiment = () => {
    const sentiments = Object.values(timeframes).map(tf => tf.sentiment)
    const bullishCount = sentiments.filter(s => s === 'bullish').length
    const bearishCount = sentiments.filter(s => s === 'bearish').length
    
    if (bullishCount > bearishCount) return 'bullish'
    if (bearishCount > bullishCount) return 'bearish'
    return 'neutral'
  }

  const formatAnalysisContent = (content: string) => {
    // Split content into lines for better processing
    const lines = content.split('\n')
    const formattedLines: string[] = []
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim()
      if (!line) continue
      
      // Main title (## **Title**)
      if (line.match(/^## \*\*(.+?)\*\*/)) {
        line = line.replace(/^## \*\*(.+?)\*\*/, '<h2>$1</h2>')
      }
      // Section headers (### **Title** or numbered sections)
      else if (line.match(/^### \*\*(.+?)\*\*/)) {
        line = line.replace(/^### \*\*(.+?)\*\*/, '<h3>$1</h3>')
      }
      else if (line.match(/^\d+\) .+/)) {
        line = line.replace(/^(\d+\)) (.+)/, '<h3>$1 $2</h3>')
      }
      // Sub-headers like "1-Week Directional Bias: BEARISH (65% confidence)"
      else if (line.match(/^.+-Week Directional Bias:|^.+-Month Directional Bias:|^Bull Case|^Bear Case|^Base Case|^Bottom Line:/)) {
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        line = `<h4>${line}</h4>`
      }
      // Bullet points
      else if (line.match(/^[•-] /)) {
        line = line.replace(/^[•-] (.+)/, '<li>$1</li>')
        // Also handle bold text within bullet points
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      }
      // Regular content with bold text
      else {
        line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        if (!line.startsWith('<')) {
          line = `<p>${line}</p>`
        }
      }
      
      formattedLines.push(line)
    }
    
    // Join lines and group consecutive list items
    let result = formattedLines.join('\n')
    
    // Group consecutive list items into ul tags
    result = result.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
      const items = match.match(/<li>.*?<\/li>/g) || []
      return `<ul>${items.join('')}</ul>`
    })
    
    // Highlight financial data
    result = result
      .replace(/(\$[\d,.]+)/g, '<code>$1</code>')
      .replace(/(\d+%)/g, '<em>$1</em>')
      .replace(/(Probability: \d+%)/g, '<em>$1</em>')
    
    return result
  }

  // Removed unused function

  const modalContent = (
    <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={styles.modalSymbol}>{symbol}</span>
            <span className={styles.modalSubtitle}>Comprehensive Multi-Timeframe Analysis</span>
          </div>
          <button 
            className={styles.closeButton}
            onClick={() => setIsModalOpen(false)}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          {modalLoading || (isLoading && !analysis) ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Generating comprehensive analysis...</p>
            </div>
          ) : errorMessage ? (
            <div className={styles.noAnalysis}>
              <p>{errorMessage}</p>
              <button 
                onClick={handleViewFullAnalysis}
                className={styles.retryButton}
              >
                Try Again
              </button>
            </div>
          ) : analysis ? (
            <div className={styles.analysisContent}>
              <div 
                className={styles.analysisText}
                dangerouslySetInnerHTML={{
                  __html: formatAnalysisContent(analysis)
                }}
              />
            </div>
          ) : (
            <div className={styles.noAnalysis}>
              <p>No comprehensive analysis available.</p>
              <p>Click &quot;Update AI Analysis&quot; to generate a detailed multi-timeframe report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        className={styles.viewButton}
        onClick={handleViewFullAnalysis}
        disabled={isLoading}
        title={`View comprehensive analysis for ${symbol}`}
      >
        {isLoading ? 'Analyzing...' : 'View Analysis'}
      </button>

      {isModalOpen && typeof window !== 'undefined' && createPortal(
        modalContent,
        document.body
      )}
    </>
  )
}