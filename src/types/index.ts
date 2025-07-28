export interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
}

export interface WatchlistItem {
  id: string
  userId: string
  symbol: string
  name: string
  addedAt: string
  sentiment: {
    '1D': SentimentType
    '1W': SentimentType
    '2W': SentimentType
    '1M': SentimentType
    '2M': SentimentType
  }
}

export type SentimentType = 'bullish' | 'bearish' | 'neutral'

export interface MarketData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  marketCap?: number
  pe?: number
  eps?: number
  dividend?: number
  beta?: number
}

export interface TechnicalIndicators {
  rsi: number
  macd: {
    macd: number
    signal: number
    histogram: number
  }
  sma50: number
  sma200: number
  ema20: number
  bollingerBands: {
    upper: number
    middle: number
    lower: number
  }
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  sentiment: SentimentType
  symbols: string[]
}