import { NextRequest, NextResponse } from 'next/server'

interface HistoricalDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface YahooHistoricalResponse {
  chart: {
    result: [{
      meta: {
        symbol: string
        exchangeTimezoneName: string
        regularMarketPrice: number
      }
      timestamp: number[]
      indicators: {
        quote: [{
          open: number[]
          high: number[]
          low: number[]
          close: number[]
          volume: number[]
        }]
      }
    }]
  }
}

// Map our symbols to Yahoo Finance symbols
const SYMBOL_MAPPING: Record<string, string> = {
  '/ES': 'ES=F',
  '/NQ': 'NQ=F', 
  '/GC': 'GC=F',
  '/CL': 'CL=F',
  '/ZB': 'ZB=F',
  '/SI': 'SI=F',
  '/HG': 'HG=F',
  '/ZC': 'ZC=F',
  '/ZS': 'ZS=F',
  '/ZW': 'ZW=F',
  '/6E': 'EURUSD=X',
  '/6J': 'USDJPY=X',
  '/6B': 'GBPUSD=X',
  '/6A': 'AUDUSD=X'
}

async function fetchHistoricalData(
  symbol: string, 
  period: string = '1mo', 
  interval: string = '1d'
): Promise<HistoricalDataPoint[]> {
  try {
    const yahooSymbol = SYMBOL_MAPPING[symbol] || symbol
    
    // Calculate timestamps for the period
    const endTime = Math.floor(Date.now() / 1000)
    let startTime: number
    
    switch (period) {
      case '1d':
        startTime = endTime - (24 * 60 * 60)
        break
      case '5d':
        startTime = endTime - (5 * 24 * 60 * 60)
        break
      case '1mo':
        startTime = endTime - (30 * 24 * 60 * 60)
        break
      case '3mo':
        startTime = endTime - (90 * 24 * 60 * 60)
        break
      case '6mo':
        startTime = endTime - (180 * 24 * 60 * 60)
        break
      case '1y':
        startTime = endTime - (365 * 24 * 60 * 60)
        break
      default:
        startTime = endTime - (30 * 24 * 60 * 60)
    }

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${startTime}&period2=${endTime}&interval=${interval}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: YahooHistoricalResponse = await response.json()
    
    if (!data.chart?.result?.[0]) {
      throw new Error('No data available for symbol')
    }

    const result = data.chart.result[0]
    const timestamps = result.timestamp
    const quotes = result.indicators.quote[0]

    const historicalData: HistoricalDataPoint[] = []

    for (let i = 0; i < timestamps.length; i++) {
      // Skip if any required data is null
      if (
        quotes.open[i] !== null && 
        quotes.high[i] !== null && 
        quotes.low[i] !== null && 
        quotes.close[i] !== null
      ) {
        historicalData.push({
          date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          open: quotes.open[i],
          high: quotes.high[i],
          low: quotes.low[i],
          close: quotes.close[i],
          volume: quotes.volume[i] || 0
        })
      }
    }

    return historicalData

  } catch (error) {
    console.error('Error fetching historical data:', error)
    
    // Return mock data for development/demo purposes
    return generateMockHistoricalData(period)
  }
}

function generateMockHistoricalData(period: string): HistoricalDataPoint[] {
  const days = period === '1d' ? 1 : period === '5d' ? 5 : period === '1mo' ? 30 : 90
  const data: HistoricalDataPoint[] = []
  
  let basePrice = 100
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Generate realistic OHLC data
    const open = basePrice + (Math.random() - 0.5) * 2
    const change = (Math.random() - 0.5) * 4
    const close = open + change
    const high = Math.max(open, close) + Math.random() * 2
    const low = Math.min(open, close) - Math.random() * 2
    const volume = Math.floor(Math.random() * 1000000) + 100000
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume
    })
    
    basePrice = close
  }
  
  return data
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const period = searchParams.get('period') || '1mo'
    const interval = searchParams.get('interval') || '1d'

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      )
    }

    const historicalData = await fetchHistoricalData(symbol, period, interval)

    return NextResponse.json({
      symbol,
      period,
      interval,
      data: historicalData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Historical data API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symbol, period, interval } = await request.json()

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    const historicalData = await fetchHistoricalData(symbol, period || '1mo', interval || '1d')

    return NextResponse.json({
      symbol,
      period: period || '1mo',
      interval: interval || '1d',
      data: historicalData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Historical data API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
      { status: 500 }
    )
  }
}