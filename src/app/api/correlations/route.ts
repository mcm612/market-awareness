import { NextResponse } from 'next/server'

// All 13 futures contracts
const FUTURES_CONTRACTS = [
  '/ES', '/NQ', '/ZB', '/GC', '/SI', 
  '/CL', '/HG', '/ZC', '/ZS', '/ZW',
  '/6E', '/6J', '/6B', '/6A'
]

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

// Fetch historical data for a symbol
async function fetchHistoricalData(symbol: string): Promise<PriceData[]> {
  try {
    const encodedSymbol = encodeURIComponent(symbol)
    
    // Use absolute URL for production deployment
    const baseUrl = 'https://market-awareness.vercel.app'
    
    console.log(`Fetching data for ${symbol} from ${baseUrl}`)
    
    const response = await fetch(
      `${baseUrl}/api/historical-data?symbol=${encodedSymbol}&period=3mo&interval=1d`,
      { 
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'User-Agent': 'market-awareness-internal'
        }
      }
    )

    if (!response.ok) {
      console.error(`Failed to fetch data for ${symbol}: ${response.status} ${response.statusText}`)
      const errorText = await response.text()
      console.error(`Error response: ${errorText}`)
      return []
    }

    const data = await response.json()
    
    if (data.error || !data.data || !Array.isArray(data.data)) {
      console.error(`Invalid data structure for ${symbol}:`, data.error || 'No data array found')
      return []
    }

    console.log(`Successfully fetched ${data.data.length} data points for ${symbol}`)
    
    return data.data.map((price: { date: string; close: number }) => ({
      date: price.date,
      close: price.close
    }))
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