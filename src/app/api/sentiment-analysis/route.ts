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

interface NewsArticle {
  title: string
  url: string
  source: string
  published: string
  summary?: string
}

// Removed unused interface

async function fetchAlphaVantageNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}&limit=10`
    )
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data['Error Message']) {
      throw new Error(data['Error Message'])
    }
    
    // Transform Alpha Vantage news format to our format
    const articles: NewsArticle[] = (data.feed || []).slice(0, 5).map((article: Record<string, unknown>) => ({
      title: article.title as string,
      url: article.url as string,
      source: article.source as string,
      published: article.time_published as string,
      summary: article.summary as string
    }))
    
    return articles
  } catch (error) {
    console.error('Alpha Vantage news fetch error:', error)
    return []
  }
}

async function getMarketData(symbol: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/quote?symbol=${encodeURIComponent(symbol)}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn('Could not fetch market data:', error)
  }
  return null
}

async function analyzeSentimentWithOpenAI(
  symbol: string, 
  timeframe: string, 
  articles: NewsArticle[]
): Promise<{ analysis: string; timeframes: Record<string, { sentiment: string; confidence: number }>; news_sources: NewsArticle[] }> {
  const newsContext = articles.length > 0 
    ? articles.map(article => `- ${article.title} (${article.source}): ${article.summary || 'No summary'}`).join('\n')
    : 'No recent news articles available for analysis.'

  // Get current market data
  const marketData = await getMarketData(symbol)
  const now = new Date()
  const priceContext = marketData ? 
    `*** LIVE MARKET DATA (fetched ${now.toISOString()}) ***
Symbol: ${symbol}
Current Price: $${marketData.price}
Daily Change: ${marketData.change >= 0 ? '+' : ''}$${marketData.change} (${marketData.changePercent >= 0 ? '+' : ''}${marketData.changePercent}%)
Volume: ${marketData.volume?.toLocaleString() || 'N/A'}
Data Source: Yahoo Finance API
Last Updated: ${now.toLocaleString()}

NOTE: This is REAL market data fetched in real-time, NOT training data.` :
    `*** MARKET DATA UNAVAILABLE ***
No current market data available for ${symbol} from Yahoo Finance API.
Analysis must be based on news only.`

  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const prompt = `*** MARKET ANALYSIS INSTRUCTIONS ***
DATE: ${currentDate.toUpperCase()} (Year 2025)

You are analyzing ${symbol} using REAL MARKET DATA provided below, NOT your training data.

*** REAL-TIME DATA PROVIDED TO YOU ***
The following data was fetched live from market APIs on ${currentDate}:

CURRENT MARKET DATA (fetched ${currentDate}):
${priceContext}

RECENT NEWS (fetched ${currentDate}):
${newsContext}

*** CRITICAL INSTRUCTIONS ***
1. ONLY analyze the REAL DATA provided above
2. DO NOT use your training data about ${symbol}
3. DO NOT reference historical events from your training
4. DO NOT make up price levels or dates not in the provided data
5. If data is limited, state "based on available current data" 

*** ANALYSIS FRAMEWORK ***
Based on the REAL MARKET DATA provided above, write a comprehensive analysis:

**Current Context**: Analyze the provided current price and volume data
**Technical Analysis**: Use the provided current price to identify potential support/resistance
**News Impact**: Analyze how the provided recent news affects sentiment
**Forward Projections**: Based on current data, project likely scenarios
**Timeframe Outlook**: Provide directional bias for 1D, 1W, 2W, 1M, 2M periods

*** IMPORTANT REMINDERS ***
- Current date: ${currentDate}
- Only use the real market data provided in this prompt
- If you don't have enough real data, say so rather than making up information
- Focus on forward-looking analysis from the current date

For stocks: Analyze current earnings cycle, recent technical levels, current sector trends, and upcoming catalyst events in 2025.
For futures: Analyze current supply/demand, recent reports, current seasonal factors.
For crypto: Analyze current adoption trends, recent regulatory news, current technical patterns.

Provide real analysis with current market details, not historical references.

Format as JSON:
{
  "analysis": "## **[SYMBOL] Multi-Timeframe Directional Analysis**\n\n**Current Context:** [Write specific current situation]\n\n### **1) Multi-Timeframe Technical Analysis**\n[Write specific technical analysis]\n\n### **2) Fundamental Catalyst Timeline**\n[Write specific upcoming events]\n\n### **3) Risk-Reward Assessment**\n[Write specific scenarios with probabilities]\n\n### **4) Actionable Decision Framework**\n[Write specific directional calls for each timeframe]\n\n**Bottom Line:** [Write specific conclusion]",
  "timeframes": {
    "1D": {"sentiment": "bullish/bearish/neutral", "confidence": 75},
    "1W": {"sentiment": "bullish/bearish/neutral", "confidence": 80},
    "2W": {"sentiment": "bullish/bearish/neutral", "confidence": 70},
    "1M": {"sentiment": "bullish/bearish/neutral", "confidence": 65},
    "2M": {"sentiment": "bullish/bearish/neutral", "confidence": 60}
  }
}`

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
          content: `You are a real-time market data analyst. Your job is to analyze ONLY the current market data provided to you, not your training data.

CORE PRINCIPLES:
- Current date: ${currentDate}
- Analyze ONLY the real market data provided in the user prompt
- Do NOT use your training data about specific stocks or historical events
- If real data is insufficient, acknowledge limitations rather than hallucinating
- Always respond in valid JSON format
- Focus on data-driven analysis, not speculation

Think of yourself as a data processor, not a knowledge base. Process the provided real market data and news to generate actionable insights.`
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Filter out any 2023 references that slip through
    const filteredResponse = responseText
      .replace(/2023/g, '2025')
      .replace(/October 2023/g, `${currentDate}`)
      .replace(/September 2023/g, `${currentDate}`)
      .replace(/\b(2022|2021|2020)\b/g, '2025')

    let analysis
    try {
      // Try to parse as JSON first
      analysis = JSON.parse(filteredResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', responseText)
      
      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = filteredResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0])
        } catch (innerParseError) {
          console.error('Inner JSON parse error:', innerParseError)
          analysis = null
        }
      }
      
      // If still no valid JSON, create fallback with the raw response as analysis
      if (!analysis) {
        analysis = {
          analysis: filteredResponse || 'Analysis completed but formatting issues encountered. Please try again.',
          timeframes: {
            '1D': { sentiment: 'neutral', confidence: 50 },
            '1W': { sentiment: 'neutral', confidence: 50 },
            '2W': { sentiment: 'neutral', confidence: 50 },
            '1M': { sentiment: 'neutral', confidence: 50 },
            '2M': { sentiment: 'neutral', confidence: 50 }
          }
        }
      }
    }
    
    return {
      analysis: analysis.analysis || 'No analysis available',
      timeframes: analysis.timeframes || {},
      news_sources: articles
    }
    
  } catch (error) {
    console.error('OpenAI analysis error:', error)
    
    // Fallback analysis if OpenAI fails
    return {
      analysis: 'Unable to perform detailed analysis due to API limitations. Please try again later.',
      timeframes: {
        '1D': { sentiment: 'neutral', confidence: 50 },
        '1W': { sentiment: 'neutral', confidence: 50 },
        '2W': { sentiment: 'neutral', confidence: 50 },
        '1M': { sentiment: 'neutral', confidence: 50 },
        '2M': { sentiment: 'neutral', confidence: 50 }
      },
      news_sources: articles
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { symbol } = await request.json()
    
    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    // Fetch news for comprehensive analysis
    const articles = await fetchAlphaVantageNews(symbol)
    
    try {
      // Get comprehensive multi-timeframe analysis
      const analysis = await analyzeSentimentWithOpenAI(symbol, 'comprehensive', articles)
      
      // Save each timeframe to database
      const allTimeframes = ['1D', '1W', '2W', '1M', '2M']
      const results = []
      
      for (const timeframe of allTimeframes) {
        const timeframeData = analysis.timeframes?.[timeframe]
        if (timeframeData) {
          try {
            const { error } = await supabase
              .from('sentiment_data')
              .upsert({
                symbol: symbol.toUpperCase(),
                timeframe,
                sentiment: timeframeData.sentiment,
                confidence: timeframeData.confidence,
                reasoning: analysis.analysis, // Store full analysis for each timeframe
                news_sources: analysis.news_sources || articles,
                data_date: new Date().toISOString().split('T')[0],
                last_updated: new Date().toISOString()
              }, {
                onConflict: 'symbol,timeframe,data_date'
              })
            
            if (error) {
              console.error('Database error:', error)
            }
            
            results.push({
              timeframe,
              sentiment: timeframeData.sentiment,
              confidence: timeframeData.confidence,
              reasoning: analysis.analysis,
              news_sources: analysis.news_sources || articles
            })
          } catch (dbError) {
            console.error(`Database error for ${timeframe}:`, dbError)
          }
        }
      }

      return NextResponse.json({
        symbol,
        analysis: analysis.analysis,
        timeframes: analysis.timeframes,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Comprehensive analysis error:', error)
      return NextResponse.json(
        { error: 'Failed to generate comprehensive analysis' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Sentiment analysis API error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze sentiment' },
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

    // Fetch existing sentiment data from database
    const { data, error } = await supabase
      .from('sentiment_data')
      .select('*')
      .eq('symbol', symbol.toUpperCase())
      .eq('data_date', new Date().toISOString().split('T')[0])
      .order('timeframe')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      sentiment_data: data || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get sentiment API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sentiment data' },
      { status: 500 }
    )
  }
}