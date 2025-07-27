'use client'

import { useState, useEffect, useRef } from 'react'
import { MarketDataService, SearchResult } from '@/lib/market-data'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Notification from '@/components/ui/Notification'
import ConfirmModal from '@/components/ui/ConfirmModal'
import styles from './StockSearch.module.css'

interface StockSearchProps {
  onSelect?: (result: SearchResult) => void
  onStockAdded?: () => void
  placeholder?: string
  showAddToWatchlist?: boolean
}

export default function StockSearch({ 
  onSelect, 
  onStockAdded,
  placeholder = "Search stocks, futures... (e.g., AAPL, TSLA, ES1!)",
  showAddToWatchlist = true 
}: StockSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [addingToWatchlist, setAddingToWatchlist] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    isVisible: boolean
  }>({ message: '', type: 'info', isVisible: false })
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    result: SearchResult | null
  }>({ isOpen: false, result: null })
  
  const { user } = useAuth()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    if (query.length < 1) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const searchResults = await MarketDataService.searchSymbols(query)
        setResults(searchResults)
        
        
        setIsOpen(true)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search failed:', error)
        setResults([])
      }
      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (result: SearchResult) => {
    setQuery(result.symbol)
    setIsOpen(false)
    setSelectedIndex(-1)
    onSelect?.(result)
  }

  const getAssetType = (resultType: string): string => {
    const type = resultType.toLowerCase()
    if (type === 'equity') return 'stock'
    if (type === 'future') return 'future'
    if (type === 'cryptocurrency') return 'crypto'
    if (type === 'option') return 'option'
    return 'stock' // default fallback
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ message, type, isVisible: true })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }))
  }

  const handleAddToWatchlist = (result: SearchResult) => {
    if (!user) return
    setIsOpen(false) // Close dropdown when modal opens
    setConfirmModal({ isOpen: true, result })
  }

  const confirmAddToWatchlist = async () => {
    const result = confirmModal.result
    if (!result || !user) return

    setConfirmModal({ isOpen: false, result: null })
    setAddingToWatchlist(result.symbol)
    
    try {
      const { error } = await supabase
        .from('watchlists')
        .insert({
          user_id: user.id,
          symbol: result.symbol,
          name: result.name,
          asset_type: getAssetType(result.type)
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          showNotification(`${result.symbol} is already in your watchlist!`, 'warning')
        } else {
          throw error
        }
      } else {
        showNotification(`${result.symbol} successfully added to your watchlist!`, 'success')
        onStockAdded?.()
      }
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
      showNotification('Failed to add to watchlist. Please try again.', 'error')
    } finally {
      setAddingToWatchlist(null)
    }
  }

  const cancelAddToWatchlist = () => {
    setConfirmModal({ isOpen: false, result: null })
  }

  return (
    <div ref={searchRef} className={styles.searchContainer}>
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={styles.searchInput}
          autoComplete="off"
        />
        {isLoading && (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className={styles.dropdown}>
          {results.map((result, index) => (
            <div
              key={result.symbol}
              className={`${styles.resultItem} ${
                index === selectedIndex ? styles.selected : ''
              }`}
              onClick={() => handleSelect(result)}
            >
              <div className={styles.resultMain}>
                <div className={styles.symbolInfo}>
                  <span className={styles.symbol}>{result.symbol}</span>
                  <span className={styles.type}>{result.type}</span>
                </div>
                <div className={styles.name}>{result.name}</div>
                <div className={styles.details}>
                  {result.region} • {result.currency}
                  <span className={styles.matchScore}>
                    {Math.round(result.matchScore * 100)}% match
                  </span>
                </div>
              </div>
              
              {showAddToWatchlist && user && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToWatchlist(result)
                  }}
                  disabled={addingToWatchlist === result.symbol}
                  className={styles.addButton}
                >
                  {addingToWatchlist === result.symbol ? (
                    <div className={styles.buttonSpinner}></div>
                  ) : (
                    '+ Add'
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && query.length > 0 && results.length === 0 && !isLoading && (
        <div className={styles.dropdown}>
          <div className={styles.noResults}>
            No results found for "{query}"
          </div>
        </div>
      )}

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Add to Watchlist"
        message={confirmModal.result ? 
          `Are you sure you want to add ${confirmModal.result.symbol} (${confirmModal.result.name}) to your watchlist?` : 
          ''
        }
        confirmText="Add to Watchlist"
        cancelText="Cancel"
        onConfirm={confirmAddToWatchlist}
        onCancel={cancelAddToWatchlist}
        type="success"
      />
    </div>
  )
}