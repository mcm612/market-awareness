'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { MarketDataService, StockQuote } from '@/lib/market-data'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Notification from '@/components/ui/Notification'
import ComprehensiveAnalysis from '@/components/sentiment/ComprehensiveAnalysis'
import styles from './WatchlistDisplay.module.css'

interface WatchlistItem {
  id: string
  symbol: string
  name: string
  added_at: string
}

interface SentimentData {
  timeframe: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  reasoning?: string
  news_sources?: any[]
}

interface WatchlistItemWithData extends WatchlistItem {
  quote?: StockQuote
  sentiment?: {
    '1D': 'bullish' | 'bearish' | 'neutral'
    '1W': 'bullish' | 'bearish' | 'neutral'
    '2W': 'bullish' | 'bearish' | 'neutral'
    '1M': 'bullish' | 'bearish' | 'neutral'
    '2M': 'bullish' | 'bearish' | 'neutral'
  }
  sentimentData?: Record<string, SentimentData>
  comprehensiveAnalysis?: string
}

export interface WatchlistDisplayRef {
  refreshWatchlist: () => void
}

const WatchlistDisplay = forwardRef<WatchlistDisplayRef>((props, ref) => {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState<WatchlistItemWithData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    isVisible: boolean
  }>({ message: '', type: 'info', isVisible: false })
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    item: { id: string; symbol: string } | null
  }>({ isOpen: false, item: null })
  const [sentimentLoading, setSentimentLoading] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user) {
      loadWatchlist()
    }
  }, [user])

  const loadWatchlist = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError('')
      
      // Get watchlist items
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('watchlists')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (watchlistError) throw watchlistError

      if (!watchlistData || watchlistData.length === 0) {
        setWatchlist([])
        setLoading(false)
        return
      }

      // Get sentiment data for all symbols
      const symbols = watchlistData.map(item => item.symbol)
      const { data: sentimentData } = await supabase
        .from('sentiment_data')
        .select('*')
        .in('symbol', symbols)
        .eq('data_date', new Date().toISOString().split('T')[0])

      // Get live quotes for all symbols (with error handling)
      const quotesPromises = symbols.map(async symbol => {
        try {
          return await MarketDataService.getQuote(symbol)
        } catch (error) {
          console.warn(`Failed to get quote for ${symbol}:`, error)
          return null
        }
      })
      const quotes = await Promise.all(quotesPromises)

      // Combine all data
      const enrichedWatchlist: WatchlistItemWithData[] = watchlistData.map((item, index) => {
        // Get sentiment for this symbol
        const symbolSentiment = sentimentData?.filter(s => s.symbol === item.symbol) || []
        const sentiment = {
          '1D': symbolSentiment.find(s => s.timeframe === '1D')?.sentiment || 'neutral',
          '1W': symbolSentiment.find(s => s.timeframe === '1W')?.sentiment || 'neutral',
          '2W': symbolSentiment.find(s => s.timeframe === '2W')?.sentiment || 'neutral',
          '1M': symbolSentiment.find(s => s.timeframe === '1M')?.sentiment || 'neutral',
          '2M': symbolSentiment.find(s => s.timeframe === '2M')?.sentiment || 'neutral'
        }

        // Create detailed sentiment data map
        const sentimentDataMap: Record<string, SentimentData> = {}
        symbolSentiment.forEach(s => {
          sentimentDataMap[s.timeframe] = {
            timeframe: s.timeframe,
            sentiment: s.sentiment,
            confidence: s.confidence,
            reasoning: s.reasoning,
            news_sources: s.news_sources
          }
        })

        return {
          ...item,
          quote: quotes[index] || undefined,
          sentiment,
          sentimentData: sentimentDataMap,
          comprehensiveAnalysis: symbolSentiment.length > 0 ? symbolSentiment[0]?.reasoning : undefined
        }
      })

      setWatchlist(enrichedWatchlist)
    } catch (err) {
      console.error('Failed to load watchlist:', err)
      setError('Failed to load watchlist')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await loadWatchlist()
    setRefreshing(false)
  }

  useImperativeHandle(ref, () => ({
    refreshWatchlist: refreshData
  }), [])

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type, isVisible: true })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  const handleRemoveFromWatchlist = (id: string, symbol: string) => {
    setConfirmModal({ isOpen: true, item: { id, symbol } })
  }

  const confirmRemoveFromWatchlist = async () => {
    const item = confirmModal.item
    if (!item || !user) return

    setConfirmModal({ isOpen: false, item: null })
    
    try {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', item.id)
        .eq('user_id', user.id)

      if (error) throw error

      setWatchlist(prev => prev.filter(watchlistItem => watchlistItem.id !== item.id))
      showNotification(`${item.symbol} removed from your watchlist`, 'success')
    } catch (err) {
      console.error('Failed to remove from watchlist:', err)
      showNotification('Failed to remove from watchlist', 'error')
    }
  }

  const cancelRemoveFromWatchlist = () => {
    setConfirmModal({ isOpen: false, item: null })
  }

  const analyzeSentiment = async (symbol: string, timeframes?: string[]): Promise<void> => {
    try {
      setSentimentLoading(prev => ({ ...prev, [symbol]: true }))
      
      const response = await fetch('/api/sentiment-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, timeframes })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze sentiment')
      }

      const result = await response.json()
      
      // Update only the specific item's sentiment data without full reload
      // This prevents the modal from closing
      const { data: sentimentData } = await supabase
        .from('sentiment_data')
        .select('*')
        .eq('symbol', symbol.toUpperCase())
        .eq('data_date', new Date().toISOString().split('T')[0])

      // Update the watchlist state with new sentiment data
      setWatchlist(prev => prev.map(item => {
        if (item.symbol === symbol) {
          const symbolSentiment = sentimentData || []
          const sentiment = {
            '1D': symbolSentiment.find(s => s.timeframe === '1D')?.sentiment || 'neutral',
            '1W': symbolSentiment.find(s => s.timeframe === '1W')?.sentiment || 'neutral',
            '2W': symbolSentiment.find(s => s.timeframe === '2W')?.sentiment || 'neutral',
            '1M': symbolSentiment.find(s => s.timeframe === '1M')?.sentiment || 'neutral',
            '2M': symbolSentiment.find(s => s.timeframe === '2M')?.sentiment || 'neutral'
          }

          const sentimentDataMap: Record<string, SentimentData> = {}
          symbolSentiment.forEach(s => {
            sentimentDataMap[s.timeframe] = {
              timeframe: s.timeframe,
              sentiment: s.sentiment,
              confidence: s.confidence,
              reasoning: s.reasoning,
              news_sources: s.news_sources
            }
          })

          return {
            ...item,
            sentiment,
            sentimentData: sentimentDataMap,
            comprehensiveAnalysis: result.analysis || symbolSentiment[0]?.reasoning
          }
        }
        return item
      }))
      
      showNotification(`Sentiment analysis updated for ${symbol}`, 'success')
    } catch (error) {
      console.error('Sentiment analysis error:', error)
      showNotification('Failed to analyze sentiment', 'error')
      throw error; // Re-throw so the modal can handle the error
    } finally {
      setSentimentLoading(prev => ({ ...prev, [symbol]: false }))
    }
  }

  const getSentimentClass = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return styles.bullish
      case 'bearish': return styles.bearish
      default: return styles.neutral
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading your watchlist...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span>{error}</span>
          <button onClick={loadWatchlist} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (watchlist.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h3>Your watchlist is empty</h3>
          <p>Use the search above to add stocks and futures to your watchlist!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Your Watchlist ({watchlist.length} items)</h3>
        <button 
          onClick={refreshData} 
          disabled={refreshing}
          className={styles.refreshButton}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Prices'}
        </button>
      </div>

      <div className={styles.list}>
        {watchlist.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.stockInfo}>
              <div className={styles.stockHeader}>
                <h4 className={styles.symbol}>{item.symbol}</h4>
                <span className={styles.name}>{item.name}</span>
                <button 
                  onClick={() => handleRemoveFromWatchlist(item.id, item.symbol)}
                  className={styles.removeButton}
                  title="Remove from watchlist"
                >
                  ×
                </button>
              </div>

              {item.quote ? (
                <div className={styles.priceInfo}>
                  <span className={styles.price}>
                    {formatCurrency(item.quote.price)}
                  </span>
                  <span className={`${styles.change} ${
                    item.quote.change >= 0 ? styles.positive : styles.negative
                  }`}>
                    {item.quote.change >= 0 ? '+' : ''}{formatCurrency(item.quote.change)} 
                    ({formatPercentage(item.quote.changePercent)})
                  </span>
                </div>
              ) : (
                <div className={styles.priceInfo}>
                  <span className={styles.priceLoading}>Loading price...</span>
                </div>
              )}

              <div className={styles.details}>
                <span>Vol: {item.quote?.volume?.toLocaleString() || 'N/A'}</span>
                <span>Added: {new Date(item.added_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className={styles.sentimentContainer}>
              <div className={styles.sentimentHeader}>
                <div className={styles.sentimentLabel}>Multi-Timeframe Analysis</div>
              </div>
              <ComprehensiveAnalysis
                symbol={item.symbol}
                analysis={item.comprehensiveAnalysis}
                timeframes={(() => {
                  const timeframes: Record<string, { sentiment: 'bullish' | 'bearish' | 'neutral', confidence: number }> = {}
                  Object.entries(item.sentiment || {}).forEach(([timeframe, sentiment]) => {
                    const detailed = item.sentimentData?.[timeframe]
                    timeframes[timeframe] = {
                      sentiment,
                      confidence: detailed?.confidence || 0
                    }
                  })
                  return timeframes
                })()}
                isLoading={sentimentLoading[item.symbol]}
                onAnalyze={() => analyzeSentiment(item.symbol)}
              />
            </div>
          </div>
        ))}
      </div>

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Remove from Watchlist"
        message={confirmModal.item ? 
          `Are you sure you want to remove ${confirmModal.item.symbol} from your watchlist?` : 
          ''
        }
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={confirmRemoveFromWatchlist}
        onCancel={cancelRemoveFromWatchlist}
        type="danger"
      />
    </div>
  )
})

WatchlistDisplay.displayName = 'WatchlistDisplay'

export default WatchlistDisplay