// Market Data API integration
// Using Yahoo Finance API for reliable free data

interface YahooSearchResult {
  symbol: string
  shortname?: string
  longname?: string
  typeDisp?: string
  exchDisp?: string
  exchange?: string
}


export interface SearchResult {
  symbol: string
  name: string
  type: string
  region: string
  currency: string
  matchScore: number
}

export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  lastUpdated: string
}

export class MarketDataService {
  private static readonly YAHOO_BASE_URL = 'https://query1.finance.yahoo.com'

  // Search for stocks/symbols using Yahoo Finance + futures
  static async searchSymbols(keywords: string): Promise<SearchResult[]> {
    if (!keywords || keywords.length < 1) return []

    try {
      // Use our API route to avoid CORS issues
      const response = await fetch(`/api/search?q=${encodeURIComponent(keywords)}`)

      const results: SearchResult[] = []

      if (response.ok) {
        const data = await response.json()
        const quotes = data.quotes || []

        // Add Yahoo Finance results
        const yahooResults = quotes
          .filter((quote: YahooSearchResult) => quote.symbol)
          .map((quote: YahooSearchResult) => ({
            symbol: quote.symbol,
            name: quote.longname || quote.shortname || quote.symbol,
            type: quote.typeDisp || 'Equity',
            region: 'United States', 
            currency: 'USD',
            matchScore: 1.0
          }))

        results.push(...yahooResults)
      }

      // Add common futures symbols if searching for futures keywords
      const futuresResults = this.getFuturesResults(keywords)
      results.push(...futuresResults)

      // Add mock data that matches the search
      const mockResults = this.getMockSearchResults(keywords)
      results.push(...mockResults)

      // Remove duplicates and limit results
      const uniqueResults = results.filter((result, index, self) => 
        index === self.findIndex(r => r.symbol === result.symbol)
      )

      return uniqueResults.slice(0, 10)

    } catch (error) {
      console.warn('Search API error, using mock + futures data:', error)
      return [...this.getFuturesResults(keywords), ...this.getMockSearchResults(keywords)].slice(0, 8)
    }
  }

  // Get futures search results
  private static getFuturesResults(keywords: string): SearchResult[] {
    const futuresData: SearchResult[] = [
      { symbol: 'ES=F', name: 'E-mini S&P 500 Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'NQ=F', name: 'E-mini NASDAQ 100 Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'YM=F', name: 'E-mini Dow Jones Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'RTY=F', name: 'E-mini Russell 2000 Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'CL=F', name: 'Crude Oil WTI Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'GC=F', name: 'Gold Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'SI=F', name: 'Silver Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'NG=F', name: 'Natural Gas Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'ZN=F', name: '10-Year Treasury Note Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'ZB=F', name: '30-Year Treasury Bond Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'ZC=F', name: 'Corn Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'ZS=F', name: 'Soybean Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'ZW=F', name: 'Wheat Future', type: 'Future', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'BTC-USD', name: 'Bitcoin USD', type: 'Cryptocurrency', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'ETH-USD', name: 'Ethereum USD', type: 'Cryptocurrency', region: 'United States', currency: 'USD', matchScore: 1.0 }
    ]

    const searchTerms = keywords.toLowerCase().trim()
    
    // Filter by exact symbol/name matches first, then broader keyword matches
    return futuresData.filter(future => {
      const symbol = future.symbol.toLowerCase()
      const name = future.name.toLowerCase()
      
      // Exact matches for symbol or name parts
      if (symbol.includes(searchTerms) || name.includes(searchTerms)) {
        return true
      }
      
      // Specific keyword matches (only include relevant ones)
      if (searchTerms === 'es' && symbol.startsWith('es')) return true
      if (searchTerms === 'nq' && symbol.startsWith('nq')) return true
      if (searchTerms === 'ym' && symbol.startsWith('ym')) return true
      if (searchTerms === 'oil' && name.includes('oil')) return true
      if (searchTerms === 'gold' && name.includes('gold')) return true
      if (searchTerms === 'silver' && name.includes('silver')) return true
      if (searchTerms === 'gas' && name.includes('gas')) return true
      if (searchTerms === 'bitcoin' && name.includes('bitcoin')) return true
      if (searchTerms === 'ethereum' && name.includes('ethereum')) return true
      if (searchTerms === 'corn' && name.includes('corn')) return true
      if (searchTerms === 'wheat' && name.includes('wheat')) return true
      if (searchTerms === 'soy' && name.includes('soy')) return true
      if (searchTerms === 'bond' && name.includes('bond')) return true
      if (searchTerms === 'treasury' && name.includes('treasury')) return true
      
      return false
    })
  }

  // Get real-time quote for a symbol using Yahoo Finance
  static async getQuote(symbol: string): Promise<StockQuote | null> {
    try {
      // Use our API route to avoid CORS issues
      const response = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`)

      if (!response.ok) {
        console.warn('Yahoo Finance quote API failed, using mock data')
        return this.getMockQuote(symbol)
      }

      const data = await response.json()
      const result = data.chart?.result?.[0]
      
      if (!result) return this.getMockQuote(symbol)

      const meta = result.meta
      const currentPrice = meta.regularMarketPrice || meta.chartPreviousClose || 0
      const previousClose = meta.chartPreviousClose || meta.previousClose || 0
      
      // Handle NaN calculations gracefully
      const change = (currentPrice && previousClose) ? currentPrice - previousClose : 0
      const changePercent = (change && previousClose) ? (change / previousClose) * 100 : 0

      return {
        symbol: meta.symbol,
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        volume: meta.regularMarketVolume || 0,
        high: meta.regularMarketDayHigh || currentPrice,
        low: meta.regularMarketDayLow || currentPrice,
        open: meta.regularMarketOpen || currentPrice,
        previousClose: previousClose,
        lastUpdated: new Date().toISOString().split('T')[0]
      }

    } catch (error) {
      console.warn('Quote API error, using mock data:', error)
      return this.getMockQuote(symbol)
    }
  }

  // Mock data for development/demo
  private static getMockSearchResults(keywords: string): SearchResult[] {
    const mockData: SearchResult[] = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', currency: 'USD', matchScore: 1.0 },
      { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Equity', region: 'United States', currency: 'USD', matchScore: 0.9 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States', currency: 'USD', matchScore: 0.8 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States', currency: 'USD', matchScore: 0.8 },
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', type: 'Equity', region: 'United States', currency: 'USD', matchScore: 0.7 },
      { symbol: 'AMZN', name: 'Amazon.com, Inc.', type: 'Equity', region: 'United States', currency: 'USD', matchScore: 0.7 },
      { symbol: 'META', name: 'Meta Platforms, Inc.', type: 'Equity', region: 'United States', currency: 'USD', matchScore: 0.6 },
      { symbol: 'NFLX', name: 'Netflix, Inc.', type: 'Equity', region: 'United States', currency: 'USD', matchScore: 0.6 }
    ]

    return mockData.filter(item => 
      item.symbol.toLowerCase().includes(keywords.toLowerCase()) ||
      item.name.toLowerCase().includes(keywords.toLowerCase())
    )
  }

  private static getMockQuote(symbol: string): StockQuote {
    const mockPrices: Record<string, Partial<StockQuote>> = {
      'AAPL': { price: 175.50, change: 2.30, changePercent: 1.33 },
      'TSLA': { price: 245.30, change: -8.70, changePercent: -3.43 },
      'NVDA': { price: 890.25, change: 15.75, changePercent: 1.80 },
      'MSFT': { price: 378.85, change: 4.20, changePercent: 1.12 },
      'GOOGL': { price: 138.75, change: -1.25, changePercent: -0.89 }
    }

    const base = mockPrices[symbol] || { price: 100.00, change: 0.50, changePercent: 0.50 }
    
    return {
      symbol,
      price: base.price!,
      change: base.change!,
      changePercent: base.changePercent!,
      volume: Math.floor(Math.random() * 50000000) + 1000000,
      high: base.price! + Math.random() * 5,
      low: base.price! - Math.random() * 5,
      open: base.price! + (Math.random() - 0.5) * 3,
      previousClose: base.price! - base.change!,
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  }
}