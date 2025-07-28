'use client'

import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react'
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
  news_sources?: Record<string, unknown>[]
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
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortableValue = (item: WatchlistItemWithData, key: string) => {
    switch (key) {
      case 'symbol':
        return item.symbol
      case 'company':
        return item.name
      case 'price':
        return item.quote?.price || 0
      case 'change':
        return item.quote?.change || 0
      case 'changePercent':
        return item.quote?.changePercent || 0
      case 'volume':
        return item.quote?.volume || 0
      default:
        return ''
    }
  }

  const sortedWatchlist = React.useMemo(() => {
    if (!sortConfig) return watchlist

    return [...watchlist].sort((a, b) => {
      const aValue = getSortableValue(a, sortConfig.key)
      const bValue = getSortableValue(b, sortConfig.key)

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue
        return sortConfig.direction === 'asc' ? comparison : -comparison
      }

      return 0
    })
  }, [watchlist, sortConfig])

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return '↕'
    }
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  const loadWatchlist = useCallback(async () => {
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
  }, [user])

  useEffect(() => {
    if (user) {
      loadWatchlist()
    }
  }, [user, loadWatchlist])

  const refreshData = useCallback(async () => {
    setRefreshing(true)
    await loadWatchlist()
    setRefreshing(false)
  }, [loadWatchlist])

  useImperativeHandle(ref, () => ({
    refreshWatchlist: refreshData
  }), [refreshData])

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

  // Function removed as it's no longer used

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
        <div className={styles.header}>
          <h3>Your Watchlist (0 items)</h3>
          <button 
            onClick={refreshData} 
            disabled={refreshing}
            className={styles.refreshButton}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Prices'}
          </button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.watchlistTable}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.symbolHeader}>Symbol</th>
                <th className={styles.companyHeader}>Company</th>
                <th className={styles.priceHeader}>Price</th>
                <th className={styles.changeHeader}>Change</th>
                <th className={styles.volumeHeader}>Volume</th>
                <th className={styles.sentimentHeader}>Sentiment</th>
                <th className={styles.analysisHeader}>Analysis</th>
                <th className={styles.actionsHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className={styles.emptyRow}>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyContent}>
                    <h4>Start Building Your Watchlist</h4>
                    <p>Search for stocks above (try AAPL, TSLA, or NVDA) and click &quot;Add&quot; to see them here.</p>
                    <p className={styles.emptySubtext}>Track prices, sentiment analysis, and more in one organized table.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const getSentimentIcon = (sentiment: 'bullish' | 'bearish' | 'neutral') => {
    switch (sentiment) {
      case 'bullish': return '🟢'
      case 'bearish': return '🔴'
      case 'neutral': return '🟡'
      default: return '⚪'
    }
  }

  const formatVolume = (volume?: number) => {
    if (!volume) return 'N/A'
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
    return volume.toLocaleString()
  }

  const shortenCompanyName = (name: string) => {
    return name
      .replace(/\b(Inc\.|Corp\.|Corporation|Company|Ltd\.|Limited)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 25)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Your Watchlist ({sortedWatchlist.length} items)</h3>
        <button 
          onClick={refreshData} 
          disabled={refreshing}
          className={styles.refreshButton}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Prices'}
        </button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.watchlistTable}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className={styles.symbolHeader} onClick={() => handleSort('symbol')}>
                <div className={styles.headerContent}>
                  <span>Symbol</span>
                  <span className={styles.sortIcon}>{getSortIcon('symbol')}</span>
                </div>
              </th>
              <th className={styles.companyHeader} onClick={() => handleSort('company')}>
                <div className={styles.headerContent}>
                  <span>Company</span>
                  <span className={styles.sortIcon}>{getSortIcon('company')}</span>
                </div>
              </th>
              <th className={styles.priceHeader} onClick={() => handleSort('price')}>
                <div className={styles.headerContent}>
                  <span>Price</span>
                  <span className={styles.sortIcon}>{getSortIcon('price')}</span>
                </div>
              </th>
              <th className={styles.changeHeader} onClick={() => handleSort('change')}>
                <div className={styles.headerContent}>
                  <span>Change</span>
                  <span className={styles.sortIcon}>{getSortIcon('change')}</span>
                </div>
              </th>
              <th className={styles.volumeHeader} onClick={() => handleSort('volume')}>
                <div className={styles.headerContent}>
                  <span>Volume</span>
                  <span className={styles.sortIcon}>{getSortIcon('volume')}</span>
                </div>
              </th>
              <th className={styles.sentimentHeader}>Sentiment</th>
              <th className={styles.analysisHeader}>Analysis</th>
              <th className={styles.actionsHeader}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedWatchlist.map((item) => (
              <tr key={item.id} className={styles.tableRow}>
                <td className={styles.symbolCell}>
                  <span className={styles.symbol}>{item.symbol}</span>
                </td>
                <td className={styles.companyCell}>
                  <span className={styles.companyName}>
                    {shortenCompanyName(item.name)}
                  </span>
                </td>
                <td className={styles.priceCell}>
                  {item.quote ? (
                    <span className={styles.price}>
                      {formatCurrency(item.quote.price)}
                    </span>
                  ) : (
                    <span className={styles.priceLoading}>Loading...</span>
                  )}
                </td>
                <td className={styles.changeCell}>
                  {item.quote ? (
                    <span className={`${styles.change} ${
                      item.quote.change >= 0 ? styles.positive : styles.negative
                    }`}>
                      {item.quote.change >= 0 ? '+' : ''}{formatCurrency(item.quote.change)}
                      <br />
                      <span className={styles.changePercent}>
                        ({formatPercentage(item.quote.changePercent)})
                      </span>
                    </span>
                  ) : (
                    <span className={styles.changeLoading}>--</span>
                  )}
                </td>
                <td className={styles.volumeCell}>
                  <span className={styles.volume}>
                    {formatVolume(item.quote?.volume)}
                  </span>
                </td>
                <td className={styles.sentimentCell}>
                  <div className={styles.sentimentIndicators}>
                    {['1D', '1W', '2W', '1M', '2M'].map(timeframe => (
                      <span
                        key={timeframe}
                        className={styles.sentimentIcon}
                        title={`${timeframe}: ${item.sentiment?.[timeframe as keyof typeof item.sentiment] || 'neutral'}`}
                      >
                        {getSentimentIcon(item.sentiment?.[timeframe as keyof typeof item.sentiment] || 'neutral')}
                      </span>
                    ))}
                  </div>
                </td>
                <td className={styles.analysisCell}>
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
                </td>
                <td className={styles.actionsCell}>
                  <button 
                    onClick={() => handleRemoveFromWatchlist(item.id, item.symbol)}
                    className={styles.removeButton}
                    title="Remove from watchlist"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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