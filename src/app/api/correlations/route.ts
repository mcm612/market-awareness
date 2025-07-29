import { NextResponse } from 'next/server'

// All 13 futures contracts
const FUTURES_CONTRACTS = [
  '/ES', '/NQ', '/ZB', '/GC', '/SI', 
  '/CL', '/HG', '/ZC', '/ZS', '/ZW',
  '/6E', '/6J', '/6B', '/6A'
]

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

interface PriceData {
  date: string
  close: number
}

interface CorrelationMatrix {
  symbol: string
  correlations: { [key: string]: number }
}

// Calculate correlation coefficient between two price series
function calculateCorrelation(series1: number[], series2: number[]): number {
  const n = Math.min(series1.length, series2.length)
  if (n < 2) return 0

  const x = series1.slice(0, n)
  const y = series2.slice(0, n)

  const meanX = x.reduce((sum, val) => sum + val, 0) / n
  const meanY = y.reduce((sum, val) => sum + val, 0) / n

  let numerator = 0
  let sumSqX = 0
  let sumSqY = 0

  for (let i = 0; i < n; i++) {
    const deltaX = x[i] - meanX
    const deltaY = y[i] - meanY
    numerator += deltaX * deltaY
    sumSqX += deltaX * deltaX
    sumSqY += deltaY * deltaY
  }

  const denominator = Math.sqrt(sumSqX * sumSqY)
  return denominator === 0 ? 0 : numerator / denominator
}

// Fetch historical data directly from Yahoo Finance
async function fetchHistoricalData(symbol: string): Promise<PriceData[]> {
  try {
    const yahooSymbol = SYMBOL_MAPPING[symbol]
    if (!yahooSymbol) {
      console.error(`No Yahoo symbol mapping found for ${symbol}`)
      return []
    }

    console.log(`Fetching data for ${symbol} (Yahoo: ${yahooSymbol}) directly from Yahoo Finance`)
    
    // Calculate timestamps for 3 months ago and now
    const endTime = Math.floor(Date.now() / 1000)
    const startTime = endTime - (90 * 24 * 60 * 60) // 90 days ago
    
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?period1=${startTime}&period2=${endTime}&interval=1d&includePrePost=true&events=div%2Csplit`
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.error(`Yahoo Finance API error for ${symbol}: ${response.status} ${response.statusText}`)
      return []
    }

    const data: YahooHistoricalResponse = await response.json()
    
    if (!data.chart?.result?.[0]) {
      console.error(`No chart data returned for ${symbol}`)
      return []
    }

    const result = data.chart.result[0]
    const timestamps = result.timestamp
    const closes = result.indicators.quote[0].close

    if (!timestamps || !closes || timestamps.length !== closes.length) {
      console.error(`Invalid data structure for ${symbol}`)
      return []
    }

    const priceData: PriceData[] = []
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && closes[i] !== undefined) {
        priceData.push({
          date: new Date(timestamps[i] * 1000).toISOString().split('T')[0],
          close: closes[i]
        })
      }
    }

    console.log(`Successfully fetched ${priceData.length} data points for ${symbol}`)
    return priceData
    
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    return []
  }
}

// Calculate percentage returns from price data
function calculateReturns(prices: PriceData[]): number[] {
  if (prices.length < 2) return []
  
  const returns = []
  for (let i = 1; i < prices.length; i++) {
    const prevPrice = prices[i - 1].close
    const currPrice = prices[i].close
    if (prevPrice > 0) {
      returns.push((currPrice - prevPrice) / prevPrice)
    }
  }
  return returns
}

export async function GET() {
  try {
    console.log('Starting correlation data fetch for all contracts...')
    console.log('Contracts to fetch:', FUTURES_CONTRACTS)
    
    // Fetch historical data for all contracts in parallel
    const dataPromises = FUTURES_CONTRACTS.map(symbol => 
      fetchHistoricalData(symbol).then(data => ({ symbol, data }))
    )
    
    console.log('Waiting for all data fetches to complete...')
    const allData = await Promise.all(dataPromises)
    
    // Log data counts for each contract
    allData.forEach(({ symbol, data }) => {
      console.log(`${symbol}: ${data.length} data points`)
    })
    
    // Filter out contracts with insufficient data
    const validContracts = allData.filter(({ data }) => data.length >= 30) // Need at least 30 days
    
    console.log(`Valid contracts: ${validContracts.length}/${FUTURES_CONTRACTS.length}`)
    console.log('Valid contracts:', validContracts.map(c => c.symbol))
    
    if (validContracts.length < 2) {
      console.error('Insufficient valid contracts for correlation calculation')
      return NextResponse.json({
        error: 'Insufficient data to calculate correlations',
        validContracts: validContracts.length,
        contractDetails: allData.map(({ symbol, data }) => ({ symbol, dataPoints: data.length }))
      }, { status: 500 })
    }

    // Calculate returns for each contract
    const contractReturns = validContracts.map(({ symbol, data }) => ({
      symbol,
      returns: calculateReturns(data)
    }))

    // Build correlation matrix
    const correlationMatrix: CorrelationMatrix[] = []
    
    for (const contract1 of contractReturns) {
      const correlations: { [key: string]: number } = {}
      
      for (const contract2 of contractReturns) {
        if (contract1.symbol === contract2.symbol) {
          correlations[contract2.symbol] = 1.0
        } else {
          const correlation = calculateCorrelation(contract1.returns, contract2.returns)
          correlations[contract2.symbol] = Math.round(correlation * 1000) / 1000 // Round to 3 decimal places
        }
      }
      
      correlationMatrix.push({
        symbol: contract1.symbol,
        correlations
      })
    }

    // Add metadata
    const response = {
      correlationMatrix,
      metadata: {
        totalContracts: FUTURES_CONTRACTS.length,
        validContracts: validContracts.length,
        period: '3mo',
        calculatedAt: new Date().toISOString(),
        dataPoints: contractReturns[0]?.returns.length || 0
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('Correlation calculation error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({
      error: 'Failed to calculate correlations',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}