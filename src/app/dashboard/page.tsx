'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import StockSearch from '@/components/search/StockSearch'
import WatchlistDisplay, { WatchlistDisplayRef } from '@/components/watchlist/WatchlistDisplay'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const watchlistRef = useRef<WatchlistDisplayRef>(null)

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

  const handleStockAdded = () => {
    watchlistRef.current?.refreshWatchlist()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Market Awareness</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stock Search Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Stocks & Futures</h2>
            <p className="text-gray-600 mb-6">
              Search for stocks, futures, and other securities to add to your watchlist
            </p>
            <StockSearch onStockAdded={handleStockAdded} />
          </div>

          {/* Watchlist Display */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <WatchlistDisplay ref={watchlistRef} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>S&P 500</span>
                  <span className="text-green-600 font-medium">+0.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>NASDAQ</span>
                  <span className="text-red-600 font-medium">-0.2%</span>
                </div>
                <div className="flex justify-between">
                  <span>DOW</span>
                  <span className="text-green-600 font-medium">+0.3%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>User:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">🚀 Try the Stock Search!</h3>
            <div className="text-blue-800 text-sm space-y-1">
              <p>• Type any stock symbol (AAPL, TSLA, NVDA) or company name</p>
              <p>• Use keyboard arrows to navigate results</p>
              <p>• Click &quot;+ Add&quot; to add stocks to your watchlist</p>
              <p>• Search includes futures and other securities</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}