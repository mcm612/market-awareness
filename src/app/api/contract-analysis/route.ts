import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Initialize OpenAI client only when needed to avoid build-time errors
let openai: OpenAI | null = null

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

interface ContractAnalysis {
  symbol: string
  directionalBias: 'bullish' | 'bearish' | 'neutral'
  biasStrength: 'strong' | 'moderate' | 'weak'
  biasReasoning: string
  keyRelationships: {
    [contract: string]: {
      correlation: number
      relationshipType: string
      currentDynamic: string
    }
  }
  marketRegimeAnalysis: {
    currentRegime: 'risk_on' | 'risk_off' | 'transitional'
    regimeConfidence: number
    impactOnContract: string
  }
}

async function getMarketData(symbols: string[]) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://market-awareness.vercel.app'
    const promises = symbols.map(async (symbol) => {
      const url = `${baseUrl}/api/quote?symbol=${encodeURIComponent(symbol)}`
      try {
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          return { symbol, data }
        }
        return { symbol, data: null }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error)
        return { symbol, data: null }
      }
    })
    
    const results = await Promise.all(promises)
    const marketData: Record<string, any> = {}
    results.forEach(({ symbol, data }) => {
      marketData[symbol] = data
    })
    
    return marketData
  } catch (error) {
    console.error('Error fetching market data:', error)
    return {}
  }
}

async function analyzeContractWithOpenAI(
  symbol: string,
  marketData: Record<string, any>
): Promise<ContractAnalysis> {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  // Prepare market context
  const allContracts = ['/ES', '/NQ', '/GC', '/CL', '/ZB', '/SI', '/HG', '/ZC', '/ZS', '/ZW', '/6E', '/6J', '/6B', '/6A']
  const marketContext = allContracts.map(contract => {
    const data = marketData[contract]
    if (data) {
      return `${contract}: $${data.price} (${data.change >= 0 ? '+' : ''}${data.change} / ${data.changePercent >= 0 ? '+' : ''}${data.changePercent}%)`
    }
    return `${contract}: Data unavailable`
  }).join('\n')

  const prompt = `*** FUTURES CONTRACT RELATIONSHIP ANALYSIS ***
DATE: ${currentDate}
TARGET CONTRACT: ${symbol}

*** CURRENT MARKET DATA ***
${marketContext}

*** ANALYSIS INSTRUCTIONS ***
You are a futures market relationship expert. Analyze ${symbol} considering:

1. **DIRECTIONAL BIAS**: Based on current market conditions, macro environment, and inter-market relationships
2. **RELATIONSHIP DYNAMICS**: How ${symbol} is currently correlating with other major futures contracts
3. **MARKET REGIME**: Whether we're in Risk On, Risk Off, or Transitional regime and how it affects ${symbol}

*** KEY RELATIONSHIPS TO ANALYZE ***
- /ES ↔ /NQ: Stock index correlation and divergences
- /ES ↔ /ZB: Stock-bond relationship (risk on/off)
- /GC ↔ /ZB: Safe haven competition  
- /CL ↔ /GC: Inflation hedge dynamics
- /CL ↔ /ES: Economic growth vs energy costs

*** CRITICAL MARKET AWARENESS CONCEPTS ***
- Risk On Regime: Stocks up, bonds down, commodities mixed, dollar strength
- Risk Off Regime: Stocks down, bonds up, gold up, oil down
- Inflation Regime: Commodities up, bonds down, stocks mixed
- Deflation Regime: Bonds up, commodities down, stocks down

*** RESPONSE FORMAT ***
Respond in JSON format with:
{
  "symbol": "${symbol}",
  "directionalBias": "bullish/bearish/neutral",
  "biasStrength": "strong/moderate/weak", 
  "biasReasoning": "2-3 sentence explanation based on current market relationships and macro environment",
  "keyRelationships": {
    "/ES": {
      "correlation": 0.85,
      "relationshipType": "Highly Correlated",
      "currentDynamic": "Moving in sync due to risk-on sentiment"
    },
    "/NQ": {
      "correlation": 0.75,
      "relationshipType": "Growth vs Value",
      "currentDynamic": "Outperforming due to tech strength"  
    },
    "/GC": {
      "correlation": -0.20,
      "relationshipType": "Inverse During Stress",
      "currentDynamic": "Competing as safe haven asset"
    },
    "/CL": {
      "correlation": 0.40,
      "relationshipType": "Economic Growth",
      "currentDynamic": "Both benefit from economic optimism"
    },
    "/ZB": {
      "correlation": -0.60,
      "relationshipType": "Risk On/Off",
      "currentDynamic": "Inverse relationship due to rate expectations"
    }
  },
  "marketRegimeAnalysis": {
    "currentRegime": "risk_on/risk_off/transitional",
    "regimeConfidence": 75,
    "impactOnContract": "How current regime specifically affects this contract"
  }
}

*** IMPORTANT REMINDERS ***
- Focus on RELATIONSHIPS between contracts, not individual analysis
- Use CURRENT market data provided, not training data
- Explain WHY correlations matter for market awareness
- Consider both fundamental and technical relationship factors`

  try {
    const openaiClient = getOpenAIClient()
    if (!openaiClient) {
      throw new Error('OpenAI API key not configured')
    }

    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a futures market relationship expert focused on inter-market analysis. Your expertise is in understanding how futures contracts relate to each other and move in response to different market regimes.

KEY PRINCIPLES:
- Market awareness comes from understanding relationships, not individual contracts
- Every contract move affects others through economic relationships
- Current market regime determines relationship strength and direction
- Use real market data provided, not training data assumptions

Current date: ${currentDate}`
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2500
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response - handle markdown code blocks
    let analysis: ContractAnalysis
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = responseText.trim()
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      analysis = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', responseText)
      
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0])
        } catch (innerParseError) {
          throw new Error('Failed to parse OpenAI response as JSON')
        }
      } else {
        throw new Error('No valid JSON found in OpenAI response')
      }
    }
    
    return analysis
    
  } catch (error) {
    console.error('OpenAI analysis error:', error)
    
    // Fallback analysis
    return {
      symbol,
      directionalBias: 'neutral',
      biasStrength: 'weak',
      biasReasoning: 'Unable to generate analysis due to API limitations. Please try again later.',
      keyRelationships: {
        '/ES': { correlation: 0.0, relationshipType: 'Unknown', currentDynamic: 'Analysis unavailable' },
        '/NQ': { correlation: 0.0, relationshipType: 'Unknown', currentDynamic: 'Analysis unavailable' },
        '/GC': { correlation: 0.0, relationshipType: 'Unknown', currentDynamic: 'Analysis unavailable' },
        '/CL': { correlation: 0.0, relationshipType: 'Unknown', currentDynamic: 'Analysis unavailable' },
        '/ZB': { correlation: 0.0, relationshipType: 'Unknown', currentDynamic: 'Analysis unavailable' }
      },
      marketRegimeAnalysis: {
        currentRegime: 'transitional',
        regimeConfidence: 50,
        impactOnContract: 'Analysis unavailable due to API limitations'
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json()
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    // Normalize symbol
    const normalizedSymbol = symbol.startsWith('/') ? symbol : `/${symbol}`

    // Get market data for all major contracts
    const allContracts = ['/ES', '/NQ', '/GC', '/CL', '/ZB', '/SI', '/HG', '/ZC', '/ZS', '/ZW', '/6E', '/6J', '/6B', '/6A']
    const marketData = await getMarketData(allContracts)
    
    // Generate analysis
    const analysis = await analyzeContractWithOpenAI(normalizedSymbol, marketData)
    
    // Store analysis in database (optional - can implement caching later)
    // For now, return real-time analysis
    
    return NextResponse.json({
      ...analysis,
      timestamp: new Date().toISOString(),
      marketData: marketData[normalizedSymbol] || null
    })

  } catch (error) {
    console.error('Contract analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze contract relationships' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    // For GET requests, return cached analysis if available
    // For now, redirect to POST method
    return NextResponse.json({ message: 'Use POST method for real-time analysis' }, { status: 200 })

  } catch (error) {
    console.error('Get contract analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contract analysis' },
      { status: 500 }
    )
  }
}