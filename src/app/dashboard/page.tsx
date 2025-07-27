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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg mr-3 flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">
                Market Awareness
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-slate-600">
                Welcome, <span className="text-slate-900 font-semibold">{user.email}</span>
              </span>
              <button
                onClick={handleSignOut}
                className="bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 px-6 py-3 rounded-xl text-sm font-semibold text-slate-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8" style={{overflow: 'visible'}}>
        <div className="px-4 py-6 sm:px-0 space-y-8" style={{overflow: 'visible'}}>
          {/* Stock Search Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 p-8 relative" style={{overflow: 'visible', minHeight: '400px', zIndex: 1}}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500"></div>
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Search Stocks & Futures
            </h2>
            <p className="text-slate-600 mb-8 text-lg font-medium">
              Search for stocks, futures, and other securities to add to your watchlist
            </p>
            <StockSearch onStockAdded={handleStockAdded} />
          </div>

          {/* Watchlist Display */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500"></div>
            <WatchlistDisplay ref={watchlistRef} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200/50 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Market Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">S&P 500</span>
                  <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 px-3 py-1 rounded-lg">
                    <span className="text-emerald-700 font-bold">+0.5%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">NASDAQ</span>
                  <div className="bg-gradient-to-r from-red-100 to-red-200 px-3 py-1 rounded-lg">
                    <span className="text-red-700 font-bold">-0.2%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">DOW</span>
                  <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 px-3 py-1 rounded-lg">
                    <span className="text-emerald-700 font-bold">+0.3%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200/50 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Account Status</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">User:</span>
                  <span className="font-bold text-slate-900">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">Status:</span>
                  <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 px-3 py-1 rounded-lg">
                    <span className="text-emerald-700 font-bold">Active</span>
                  </div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="w-full mt-4 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 font-semibold px-4 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/50 rounded-2xl p-8 mt-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 tracking-tight">
              🚀 Get Started with Market Awareness
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="font-medium">Type any stock symbol (AAPL, TSLA, NVDA) or company name</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  <p className="font-medium">Use keyboard arrows to navigate results</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <p className="font-medium">Click &quot;+ Add&quot; to add stocks to your watchlist</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  <p className="font-medium">Search includes futures and other securities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}