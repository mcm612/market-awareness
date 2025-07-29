import { NextResponse } from 'next/server'

// Asset class definitions with their contracts
const ASSET_CLASSES = {
  stocks: {
    name: 'Equity Indices',
    contracts: ['/ES', '/NQ'],
    color: '#3b82f6', // blue
    icon: '📈'
  },
  bonds: {
    name: 'Fixed Income',
    contracts: ['/ZB'],
    color: '#10b981', // green
    icon: '🏦'
  },
  commodities: {
    name: 'Commodities',
    contracts: ['/GC', '/SI', '/CL', '/HG', '/ZC', '/ZS', '/ZW'],
    color: '#f59e0b', // amber
    icon: '🏗️'
  },
  currencies: {
    name: 'Currencies',
    contracts: ['/6E', '/6J', '/6B', '/6A'],
    color: '#8b5cf6', // purple
    icon: '💱'
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

interface PriceData {
  date: string
  close: number
}

interface AssetClassPerformance {
  name: string
  performance1D: number
  performance1W: number
  performance1M: number
  avgPerformance: number
  trend: 'bullish' | 'bearish' | 'neutral'
  strength: 'strong' | 'moderate' | 'weak'
  color: string
  icon: string
  contracts: string[]
}

interface Flow {
  from: string
  to: string
  strength: number // 0-1 scale
  direction: 'inflow' | 'outflow'
  magnitude: number // actual percentage
  reason: string
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

// Fetch historical data directly from Yahoo Finance
async function fetchHistoricalData(symbol: string, days: number = 30): Promise<PriceData[]> {
  try {
    const yahooSymbol = SYMBOL_MAPPING[symbol]
    if (!yahooSymbol) {
      console.error(`No Yahoo symbol mapping found for ${symbol}`)
      return []
    }

    console.log(`Fetching ${days} days of data for ${symbol} (Yahoo: ${yahooSymbol})`)
    
    // Calculate timestamps
    const endTime = Math.floor(Date.now() / 1000)
    const startTime = endTime - (days * 24 * 60 * 60)
    
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
    return priceData.sort((a, b) => a.date.localeCompare(b.date)) // Sort by date ascending
    
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    return []
  }
}

// Calculate performance over different timeframes
function calculatePerformance(prices: PriceData[]): { perf1D: number, perf1W: number, perf1M: number } {
  if (prices.length < 2) {
    return { perf1D: 0, perf1W: 0, perf1M: 0 }
  }

  const latest = prices[prices.length - 1]
  const latestPrice = latest.close

  // 1 day performance (latest vs previous)
  const prev1D = prices.length >= 2 ? prices[prices.length - 2].close : latestPrice
  const perf1D = (latestPrice - prev1D) / prev1D

  // 1 week performance (approximate - last 7 data points or available)
  const daysBack1W = Math.min(7, prices.length - 1)
  const prev1W = prices[prices.length - 1 - daysBack1W].close
  const perf1W = (latestPrice - prev1W) / prev1W

  // 1 month performance (approximate - last 21 data points or available)
  const daysBack1M = Math.min(21, prices.length - 1)
  const prev1M = prices[prices.length - 1 - daysBack1M].close
  const perf1M = (latestPrice - prev1M) / prev1M

  return { perf1D, perf1W, perf1M }
}

// Calculate asset class average performance
async function calculateAssetClassPerformance(assetClass: string): Promise<AssetClassPerformance> {
  const classConfig = ASSET_CLASSES[assetClass as keyof typeof ASSET_CLASSES]
  const contracts = classConfig.contracts

  console.log(`Calculating performance for ${assetClass} with contracts:`, contracts)

  // Fetch data for all contracts in this asset class
  const contractDataPromises = contracts.map(async (contract) => {
    const data = await fetchHistoricalData(contract, 30)
    const performance = calculatePerformance(data)
    return { contract, ...performance }
  })

  const contractResults = await Promise.all(contractDataPromises)
  const validResults = contractResults.filter(result => 
    !isNaN(result.perf1D) && !isNaN(result.perf1W) && !isNaN(result.perf1M)
  )

  if (validResults.length === 0) {
    return {
      name: classConfig.name,
      performance1D: 0,
      performance1W: 0,
      performance1M: 0,
      avgPerformance: 0,
      trend: 'neutral',
      strength: 'weak',
      color: classConfig.color,
      icon: classConfig.icon,
      contracts: contracts
    }
  }

  // Average the performance across contracts
  const avg1D = validResults.reduce((sum, r) => sum + r.perf1D, 0) / validResults.length
  const avg1W = validResults.reduce((sum, r) => sum + r.perf1W, 0) / validResults.length
  const avg1M = validResults.reduce((sum, r) => sum + r.perf1M, 0) / validResults.length

  // Calculate weighted average (more weight to recent performance)
  const avgPerformance = (avg1D * 0.5) + (avg1W * 0.3) + (avg1M * 0.2)

  // Determine trend and strength
  const trend = avgPerformance > 0.005 ? 'bullish' : avgPerformance < -0.005 ? 'bearish' : 'neutral'
  const absPerf = Math.abs(avgPerformance)
  const strength = absPerf > 0.02 ? 'strong' : absPerf > 0.01 ? 'moderate' : 'weak'

  console.log(`${assetClass} performance: 1D=${(avg1D*100).toFixed(2)}%, 1W=${(avg1W*100).toFixed(2)}%, 1M=${(avg1M*100).toFixed(2)}%, avg=${(avgPerformance*100).toFixed(2)}%`)

  return {
    name: classConfig.name,
    performance1D: avg1D,
    performance1W: avg1W,
    performance1M: avg1M,
    avgPerformance,
    trend,
    strength,
    color: classConfig.color,
    icon: classConfig.icon,
    contracts
  }
}

// Determine flows between asset classes
function calculateFlows(assetPerformances: Record<string, AssetClassPerformance>): Flow[] {
  const flows: Flow[] = []
  const assetClasses = Object.keys(assetPerformances)

  // Sort by performance (best to worst)
  const sortedAssets = assetClasses.sort((a, b) => 
    assetPerformances[b].avgPerformance - assetPerformances[a].avgPerformance
  )

  console.log('Asset class performance ranking:', sortedAssets.map(asset => 
    `${asset}: ${(assetPerformances[asset].avgPerformance * 100).toFixed(2)}%`
  ))

  // Create flows from underperforming to outperforming assets
  for (let i = 0; i < sortedAssets.length; i++) {
    for (let j = i + 1; j < sortedAssets.length; j++) {
      const fromAsset = sortedAssets[j] // Lower performance (outflow)
      const toAsset = sortedAssets[i]   // Higher performance (inflow)
      
      const performanceDiff = assetPerformances[toAsset].avgPerformance - assetPerformances[fromAsset].avgPerformance
      
      // Only create flows for significant performance differences
      if (performanceDiff > 0.005) { // 0.5% threshold
        const strength = Math.min(performanceDiff * 20, 1) // Scale to 0-1
        const magnitude = performanceDiff
        
        // Generate contextual reason
        let reason = ''
        if (fromAsset === 'stocks' && toAsset === 'bonds') {
          reason = 'Flight to safety - investors moving from equities to bonds'
        } else if (fromAsset === 'bonds' && toAsset === 'commodities') {
          reason = 'Inflation hedge - capital rotating from bonds to real assets'
        } else if (fromAsset === 'stocks' && toAsset === 'commodities') {
          reason = 'Risk-off rotation - moving from growth assets to inflation hedges'
        } else if (fromAsset === 'currencies' && toAsset === 'bonds') {
          reason = 'Safe haven demand - foreign capital flowing into US bonds'
        } else {
          reason = `Capital rotation from underperforming ${assetPerformances[fromAsset].name.toLowerCase()} to outperforming ${assetPerformances[toAsset].name.toLowerCase()}`
        }
        
        flows.push({
          from: fromAsset,
          to: toAsset,
          strength,
          direction: 'outflow',
          magnitude,
          reason
        })
      }
    }
  }

  return flows
}

export async function GET() {
  try {
    console.log('Starting asset flow calculation...')
    
    // Calculate performance for each asset class
    const assetClassPromises = Object.keys(ASSET_CLASSES).map(async (assetClass) => {
      const performance = await calculateAssetClassPerformance(assetClass)
      return { assetClass, performance }
    })
    
    const assetClassResults = await Promise.all(assetClassPromises)
    
    // Convert to object for easier access
    const assetPerformances: Record<string, AssetClassPerformance> = {}
    assetClassResults.forEach(({ assetClass, performance }) => {
      assetPerformances[assetClass] = performance
    })
    
    // Calculate flows between asset classes
    const flows = calculateFlows(assetPerformances)
    
    // Determine overall market regime based on flows
    let marketRegime = 'neutral'
    let regimeConfidence = 0.5
    
    if (flows.some(f => f.from === 'stocks' && f.to === 'bonds' && f.strength > 0.3)) {
      marketRegime = 'risk_off'
      regimeConfidence = 0.8
    } else if (flows.some(f => f.from === 'bonds' && f.to === 'stocks' && f.strength > 0.3)) {
      marketRegime = 'risk_on'
      regimeConfidence = 0.8
    } else if (flows.some(f => f.to === 'commodities' && f.strength > 0.4)) {
      marketRegime = 'inflation_hedge'
      regimeConfidence = 0.7
    }
    
    const response = {
      assetClasses: assetPerformances,
      flows,
      marketRegime: {
        current: marketRegime,
        confidence: regimeConfidence,
        description: getMarketRegimeDescription(marketRegime)
      },
      metadata: {
        calculatedAt: new Date().toISOString(),
        totalFlows: flows.length,
        strongFlows: flows.filter(f => f.strength > 0.5).length
      }
    }
    
    console.log(`Asset flow calculation complete. ${flows.length} flows detected, regime: ${marketRegime}`)
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
      }
    })

  } catch (error) {
    console.error('Asset flow calculation error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json({
      error: 'Failed to calculate asset flows',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function getMarketRegimeDescription(regime: string): string {
  switch (regime) {
    case 'risk_off':
      return 'Risk-off environment: Capital fleeing to safe havens like bonds and gold'
    case 'risk_on':
      return 'Risk-on environment: Investors embracing stocks and risk assets'
    case 'inflation_hedge':
      return 'Inflation concerns: Money rotating into commodities and real assets'
    default:
      return 'Neutral environment: Balanced flows across asset classes'
  }
}