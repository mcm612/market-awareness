'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import FuturesChart from '@/components/charts/FuturesChart'
import styles from './contract.module.css'

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
  timestamp: string
}

interface ContractPersonality {
  symbol: string
  name: string
  personality: string
  personalityIcon: string
  description: string
  temperament: string
  violentDirection: string
  keyTriggers: string[]
  tradingHours: string
  beginnerTips: string[]
  currentMood: string
  moodIcon: string
  directionalBias: 'bullish' | 'bearish' | 'neutral'
  biasStrength: 'strong' | 'moderate' | 'weak'
  biasReasoning: string
  keyRelationships: {
    contract: string
    relationship: string
    currentCorrelation: number
    explanation: string
  }[]
  marketRegimeImpact: {
    riskOn: string
    riskOff: string
    inflation: string
    recession: string
  }
}

const contractData: Record<string, ContractPersonality> = {
  ES: {
    symbol: '/ES',
    name: 'E-mini S&P 500',
    personality: 'The Paper-Handed Boomer',
    personalityIcon: '📰',
    description: 'The reliable dividend-loving dad who panic sells at the first sign of trouble. Moves with whatever CNBC tells the institutions to do.',
    temperament: 'Rational most days, emotional during crises',
    violentDirection: 'Downside (fear sells faster than greed buys)',
    keyTriggers: ['Fed speeches', 'Economic data (jobs, GDP, inflation)', 'Corporate earnings seasons', 'Geopolitical events', 'Market sentiment shifts'],
    tradingHours: '9:30 AM - 4:00 PM ET (most active), 24-hour electronic trading',
    beginnerTips: [
      'Controls $240K of stonks with only ~$12K margin - this ain\'t your Robinhood account anymore',
      'Paper hands at first sign of FUD but diamond hands during bull runs',
      'Most active when boomers are awake (9:30 AM - 4:00 PM ET)',
      'When VIX goes brrr, /ES goes 📉📉📉 - fear = paper handed panic selling'
    ],
    currentMood: 'Cautious',
    moodIcon: '😐',
    directionalBias: 'neutral',
    biasStrength: 'weak',
    biasReasoning: 'Mixed signals from Fed policy uncertainty and resilient economic data create sideways bias',
    keyRelationships: [
      {
        contract: '/NQ',
        relationship: 'Highly Correlated Brother',
        currentCorrelation: 0.85,
        explanation: 'Usually moves in same direction but /NQ is more volatile. When they diverge, it signals sector rotation.'
      },
      {
        contract: '/ZB',
        relationship: 'Inverse Dance Partner',
        currentCorrelation: -0.60,
        explanation: 'When bonds rally (rates fall), stocks often follow. When bonds sell off (rates rise), stocks get nervous.'
      },
      {
        contract: '/GC',
        relationship: 'Fair Weather Friend',
        currentCorrelation: -0.20,
        explanation: 'Negative correlation during stress (flight to safety), positive during inflation fears.'
      },
      {
        contract: '/CL',
        relationship: 'Economic Indicator',
        currentCorrelation: 0.30,
        explanation: 'Oil rises often signal economic growth (good for stocks) but also inflation concerns (bad for stocks).'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Thrives - institutional money flows into equities, steady upward grind',
      riskOff: 'Panics first - massive selling as institutions reduce risk',
      inflation: 'Conflicted - corporate profits vs higher rates create volatility',
      recession: 'Deep selloff - forward-looking, prices in earnings decline early'
    }
  },
  NQ: {
    symbol: '/NQ',
    name: 'E-mini NASDAQ-100',
    personality: 'The YOLO Diamond Hands Ape',
    personalityIcon: '🦍',
    description: 'The degenerate who either rockets to the moon or crashes spectacularly. Pure hopium and FOMO energy with zero chill.',
    temperament: 'Optimistic with dramatic mood swings',
    violentDirection: 'Both directions - can rocket up or crash down violently',
    keyTriggers: ['Tech earnings', 'Interest rate changes', 'Growth vs Value rotation', 'Innovation news', 'Risk appetite shifts'],
    tradingHours: '9:30 AM - 4:00 PM ET (most active), 24-hour electronic trading',
    beginnerTips: [
      'WAY more volatile than boomer /ES - either 🚀🌙 or 💀💀💀',
      'Hates high interest rates like apes hate paper hands',
      'Follows the tech gods: TSLA, NVDA, AAPL - when they moon, /NQ goes BRRR',
      'Diverges from /ES when growth vs value rotation happens - stay woke'
    ],
    currentMood: 'Bullish',
    moodIcon: '😊',
    directionalBias: 'bullish',
    biasStrength: 'moderate',
    biasReasoning: 'AI innovation themes and tech earnings optimism offset by rate concerns',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Volatile Sibling',
        currentCorrelation: 0.85,
        explanation: 'Moves with /ES but with 30% more volatility. Divergences signal sector rotation between growth and value.'
      },
      {
        contract: '/ZB',
        relationship: 'Rate Sensitive Enemy',
        currentCorrelation: -0.75,
        explanation: 'Strong inverse relationship - rising rates (falling bonds) hurt growth stocks more than value stocks.'
      },
      {
        contract: '/GC',
        relationship: 'Inflation Hedge Competitor',
        currentCorrelation: -0.10,
        explanation: 'Both compete as inflation hedges, but gold wins during uncertainty, tech wins during optimism.'
      },
      {
        contract: '/CL',
        relationship: 'Economic Growth Indicator',
        currentCorrelation: 0.40,
        explanation: 'Higher correlation than /ES to oil - both benefit from economic growth and innovation demand.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Rocket ship - leads markets higher with growth premium',
      riskOff: 'Crashes harder - growth stocks sold first in risk-off moves',
      inflation: 'Depends - benefits from pricing power, hurt by higher rates',
      recession: 'Deep pain - growth stocks get hit hardest in economic slowdowns'
    }
  },
  GC: {
    symbol: '/GC',
    name: 'Gold Futures',
    personality: 'The Paranoid Prepper King',
    personalityIcon: '👑',
    description: 'The conspiracy theorist who hoards shiny rocks and screams "I TOLD YOU SO!" every time the market crashes. Been preparing for the apocalypse since 3000 BC.',
    temperament: 'Calm and steady, springs into action during crisis',
    violentDirection: 'Upside during panic - can spike 3-5% in hours during crisis',
    keyTriggers: ['Dollar strength/weakness', 'Real interest rates', 'Geopolitical tensions', 'Inflation expectations', 'Central bank policy'],
    tradingHours: '8:20 AM - 1:30 PM ET (most active), nearly 24-hour trading',
    beginnerTips: [
      'Inverse relationship with real interest rates is key',
      'Watch DXY (Dollar Index) - strong dollar usually means weak gold',
      'Spikes during geopolitical events and market crashes',
      'Think in terms of "real money" vs "paper money"'
    ],
    currentMood: 'Steady',
    moodIcon: '😌',
    directionalBias: 'bullish',
    biasStrength: 'moderate',
    biasReasoning: 'Geopolitical tensions and potential Fed pivot support gold, but strong dollar provides headwinds',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Crisis Inverse Partner',
        currentCorrelation: -0.20,
        explanation: 'Negative correlation during market stress (flight to safety), sometimes positive during inflation.'
      },
      {
        contract: '/ZB',
        relationship: 'Safe Haven Cousin',
        currentCorrelation: 0.40,
        explanation: 'Both benefit from flight to safety, but gold wins when currency/inflation concerns arise.'
      },
      {
        contract: '/CL',
        relationship: 'Inflation Hedge Ally',
        currentCorrelation: 0.50,
        explanation: 'Both rise with inflation expectations, but gold is the ultimate store of value.'
      },
      {
        contract: '/NQ',
        relationship: 'Old vs New Money',
        currentCorrelation: -0.10,
        explanation: 'Traditional store of value vs innovation. Compete for investment flows during uncertainty.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Sleepy - investors prefer risk assets, gold sits idle',
      riskOff: 'Shines bright - first asset investors flee to during crisis',
      inflation: 'Best friend - ultimate inflation hedge with 5,000 year track record',
      recession: 'Mixed - benefits from rate cuts, hurt by deflation fears'
    }
  },
  CL: {
    symbol: '/CL',
    name: 'Crude Oil (WTI)',
    personality: 'The Bipolar Energy Chad',
    personalityIcon: '💥',
    description: 'The absolute psychopath who goes from zero to hero in 0.5 seconds. Powered by pure chaos, OPEC drama, and geopolitical Twitter beef.',
    temperament: 'Explosive and unpredictable, driven by real-world events',
    violentDirection: 'Both directions - can move 5-10% in a single day on news',
    keyTriggers: ['OPEC decisions', 'Geopolitical tensions', 'Economic growth data', 'Dollar strength', 'Weather events', 'Refinery issues'],
    tradingHours: '9:00 AM - 2:30 PM ET (most active), nearly 24-hour trading',
    beginnerTips: [
      'Most volatile major futures contract - manage risk carefully',
      'Watch weekly inventory reports (EIA) every Wednesday',
      'Geopolitical events can cause instant 5%+ moves',
      'Economic data impacts oil more than other commodities'
    ],
    currentMood: 'Agitated',
    moodIcon: '😤',
    directionalBias: 'bearish',
    biasStrength: 'moderate',
    biasReasoning: 'Recession fears and potential demand destruction offset by OPEC+ supply cuts',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Economic Growth Mirror',
        currentCorrelation: 0.30,
        explanation: 'Higher oil often signals economic growth (good for stocks) but also inflation concerns (bad for stocks).'
      },
      {
        contract: '/GC',
        relationship: 'Inflation Hedge Partner',
        currentCorrelation: 0.50,
        explanation: 'Both rise with inflation expectations, oil leads and gold follows during supply shocks.'
      },
      {
        contract: '/ZB',
        relationship: 'Inflation Enemy',
        currentCorrelation: -0.45,
        explanation: 'Rising oil prices increase inflation expectations, leading to higher rates and lower bond prices.'
      },
      {
        contract: '/NQ',
        relationship: 'Cost Input Factor',
        currentCorrelation: 0.25,
        explanation: 'Energy costs impact tech companies, but less direct relationship than with industrial stocks.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Rises with economic optimism - more demand expected',
      riskOff: 'Falls on demand destruction fears, spikes on supply disruptions',
      inflation: 'Primary driver - oil shocks often trigger broader inflation',
      recession: 'Deep selloff - demand destruction fears dominate supply concerns'
    }
  },
  ZB: {
    symbol: '/ZB',
    name: '30-Year Treasury Bond',
    personality: 'The Theta Gang Boomer',
    personalityIcon: '🏦',
    description: 'The risk-averse grandpa who sells covered calls and collects coupons while lecturing everyone about "real investing." Boring but rich AF.',
    temperament: 'Methodical and forward-thinking, rarely panics',
    violentDirection: 'Upside during crisis - can rally 5-10% when investors flee to safety',
    keyTriggers: ['Fed policy decisions', 'Economic data', 'Inflation expectations', 'Fiscal policy', 'International capital flows'],
    tradingHours: '8:20 AM - 3:00 PM ET (most active), nearly 24-hour trading',
    beginnerTips: [
      'Bond prices move inverse to interest rates - remember this relationship',
      'Long-term bonds are more sensitive to rate changes than short-term',
      'Watch Fed meeting minutes and economic data closely',
      'Flight to quality during crisis drives bond prices higher'
    ],
    currentMood: 'Thoughtful',
    moodIcon: '🤔',
    directionalBias: 'neutral',
    biasStrength: 'weak',
    biasReasoning: 'Fed uncertainty creates range-bound trading between growth fears and inflation concerns',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Economic Indicator',
        currentCorrelation: -0.60,
        explanation: 'Inverse relationship - when bonds rally (rates fall), stocks often follow due to lower discount rates.'
      },
      {
        contract: '/NQ',
        relationship: 'Growth Stock Determinant',
        currentCorrelation: -0.75,
        explanation: 'Strongest inverse relationship - rising rates (falling bonds) hurt growth stocks most.'
      },
      {
        contract: '/GC',
        relationship: 'Safe Haven Competition',
        currentCorrelation: 0.40,
        explanation: 'Both benefit from flight to safety, but bonds pay interest while gold costs storage.'
      },
      {
        contract: '/CL',
        relationship: 'Inflation Gauge',
        currentCorrelation: -0.45,
        explanation: 'Rising oil increases inflation expectations, leading to higher rates and lower bond prices.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Sells off - investors prefer risk assets over safe bonds',
      riskOff: 'Rallies hard - flight to quality drives massive buying',
      inflation: 'Biggest enemy - inflation erodes bond values and drives rates higher',
      recession: 'Best performer - rate cut expectations drive prices higher'
    }
  },
  // Commodity Futures - The Chaos Squad
  SI: {
    symbol: '/SI',
    name: 'Silver Futures',
    personality: 'The Poor Man&apos;s Gold Pleb',
    personalityIcon: '🥈',
    description: 'The scrappy underdog who follows gold around like a loyal puppy but occasionally goes absolutely feral and 10x in a month. Industrial demand meets precious metal FOMO.',
    temperament: 'Volatile copycat with explosive potential',
    violentDirection: 'Both directions - can move 5-15% in single sessions during squeeze events',
    keyTriggers: ['Gold price movements', 'Industrial demand (solar, electronics)', 'Dollar strength', 'Investment demand', 'Supply disruptions'],
    tradingHours: '8:25 AM - 1:25 PM ET (most active), nearly 24-hour trading',
    beginnerTips: [
      'Silver-to-gold ratio is key - when it&apos;s high (80+), silver often outperforms',
      'More volatile than gold due to smaller market size',
      'Industrial demand makes it different from pure precious metals',
      'Reddit apes love silver squeezes - watch for coordinated buying'
    ],
    currentMood: 'Restless',
    moodIcon: '😤',
    directionalBias: 'bullish',
    biasStrength: 'moderate',
    biasReasoning: 'Industrial demand for green energy and electronics, plus precious metal safe haven bid during uncertainty',
    keyRelationships: [
      {
        contract: '/GC',
        relationship: 'Little Brother Complex',
        currentCorrelation: 0.80,
        explanation: 'Follows gold but with 2-3x the volatility. When gold moves, silver amplifies the move.'
      },
      {
        contract: '/ES',
        relationship: 'Risk Asset Hybrid',
        currentCorrelation: 0.10,
        explanation: 'Industrial demand creates positive correlation during growth, precious metal nature creates negative during stress.'
      },
      {
        contract: '/CL',
        relationship: 'Commodity Complex Partner',
        currentCorrelation: 0.35,
        explanation: 'Both rise with inflation expectations and commodity supercycles.'
      },
      {
        contract: '/ZB',
        relationship: 'Real Rates Enemy',
        currentCorrelation: -0.50,
        explanation: 'Rising real rates hurt silver as it pays no yield and costs storage.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Mixed - industrial demand helps, but precious metal premium fades',
      riskOff: 'Explosive upside - flight to precious metals with leverage',
      inflation: 'Rocket fuel - both industrial input costs and monetary debasement',
      recession: 'Conflicted - safe haven bid vs industrial demand destruction'
    }
  },
  HG: {
    symbol: '/HG',
    name: 'Copper Futures',
    personality: 'The Economic PhD Chad',
    personalityIcon: '🔧',
    description: 'The smartest guy in the room who has a PhD in economics and won&apos;t let you forget it. If copper is moving, it&apos;s because Dr. Copper knows something about the global economy.',
    temperament: 'Analytical and forward-looking, reacts to economic data',
    violentDirection: 'Both directions based on economic sentiment shifts',
    keyTriggers: ['China economic data', 'Infrastructure spending', 'Housing construction', 'Manufacturing PMI', 'Dollar strength'],
    tradingHours: '8:10 AM - 1:00 PM ET (most active), nearly 24-hour trading',
    beginnerTips: [
      'Called "Dr. Copper" because it predicts economic turns',
      'China demand drives 50% of global copper consumption',
      'Housing and infrastructure = copper demand',
      'Watch Chilean mine strikes and supply disruptions'
    ],
    currentMood: 'Analytical',
    moodIcon: '🤓',
    directionalBias: 'neutral',
    biasStrength: 'moderate',
    biasReasoning: 'Chinese economic uncertainty balances against US infrastructure spending and green energy transition needs',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Economic Leading Indicator',
        currentCorrelation: 0.70,
        explanation: 'Copper often leads stock markets by 3-6 months due to its economic sensitivity.'
      },
      {
        contract: '/CL',
        relationship: 'Growth Commodity Brother',
        currentCorrelation: 0.60,
        explanation: 'Both rise with economic growth expectations and industrial demand.'
      },
      {
        contract: '/GC',
        relationship: 'Growth vs Fear Trade',
        currentCorrelation: -0.30,
        explanation: 'Copper rises with growth optimism, gold with fear - often inverse relationship.'
      },
      {
        contract: '/ZB',
        relationship: 'Growth Expectations Mirror',
        currentCorrelation: -0.55,
        explanation: 'Rising copper signals growth and inflation, pressuring bonds lower.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Thrives - economic growth drives infrastructure and manufacturing demand',
      riskOff: 'Gets crushed - first commodity sold when growth fears emerge',
      inflation: 'Benefits - industrial input costs rise, but can signal demand destruction at extremes',
      recession: 'Deep decline - industrial demand evaporates, inventory builds'
    }
  },
  ZC: {
    symbol: '/ZC',
    name: 'Corn Futures',
    personality: 'The Midwest Karen',
    personalityIcon: '🌽',
    description: 'The passive-aggressive soccer mom who complains about everything - weather, ethanol mandates, Chinese trade deals. But when she&apos;s angry about crop conditions, the whole food chain feels it.',
    temperament: 'Weather-obsessed and seasonally moody',
    violentDirection: 'Upside during weather scares - drought can cause 50%+ rallies',
    keyTriggers: ['Weather conditions', 'USDA crop reports', 'Ethanol demand', 'Chinese imports', 'Planting/harvest seasons'],
    tradingHours: '9:30 AM - 2:20 PM ET (most active), limited overnight',
    beginnerTips: [
      'Weather is everything - watch Corn Belt conditions religiously',
      'USDA reports on 11th each month move markets violently',
      'Ethanol mandates create price floor through energy demand',
      'Seasonally weak during harvest (Sept-Nov), strong during growing season'
    ],
    currentMood: 'Worried',
    moodIcon: '😰',
    directionalBias: 'bullish',
    biasStrength: 'moderate',
    biasReasoning: 'La Nina weather patterns threaten South American crops while US acres may decline due to input costs',
    keyRelationships: [
      {
        contract: '/ZS',
        relationship: 'Sibling Rivalry',
        currentCorrelation: 0.75,
        explanation: 'Farmers choose between corn and soybeans - when one rallies, the other often follows.'
      },
      {
        contract: '/CL',
        relationship: 'Ethanol Energy Connection',
        currentCorrelation: 0.45,
        explanation: 'Higher oil prices make ethanol more attractive, increasing corn demand.'
      },
      {
        contract: '/ES',
        relationship: 'Food Inflation Concern',
        currentCorrelation: -0.20,
        explanation: 'Rising food prices create inflation concerns, pressuring stocks through consumer spending.'
      },
      {
        contract: '/GC',
        relationship: 'Inflation Hedge Cousin',
        currentCorrelation: 0.30,
        explanation: 'Both benefit from currency debasement and inflation fears.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Moderate gains - biofuel demand and economic growth support prices',
      riskOff: 'Mixed - food security bid vs demand destruction concerns',
      inflation: 'Major contributor - food prices directly impact CPI calculations',
      recession: 'Resilient - food demand is inelastic, weather still matters most'
    }
  },
  ZS: {
    symbol: '/ZS',
    name: 'Soybean Futures',
    personality: 'The Vegan Influencer',
    personalityIcon: '🫘',
    description: 'The trendy health influencer who&apos;s constantly talking about plant-based diets and sustainability. China can&apos;t get enough of her protein, and she knows it.',
    temperament: 'Health-conscious but trade-war sensitive',
    violentDirection: 'Both directions - China trade news can move 5-10% instantly',
    keyTriggers: ['China trade relations', 'South American weather', 'Crushing margins', 'Meal and oil demand', 'Dollar strength'],
    tradingHours: '9:30 AM - 2:20 PM ET (most active), limited overnight',
    beginnerTips: [
      'China buys 60% of global soybean exports - watch trade relations',
      'Split into meal (animal feed) and oil (food/biodiesel) products',
      'South American harvest (Feb-May) competes with US crop',
      'Crushing spread (beans vs meal/oil) shows processing demand'
    ],
    currentMood: 'Optimistic',
    moodIcon: '😊',
    directionalBias: 'bullish',
    biasStrength: 'strong',
    biasReasoning: 'Tight global stocks, strong Chinese demand recovery, and South American weather concerns support prices',
    keyRelationships: [
      {
        contract: '/ZC',
        relationship: 'Planting Competition',
        currentCorrelation: 0.75,
        explanation: 'Farmers allocate acres between corn and soybeans based on relative prices.'
      },
      {
        contract: '/CL',
        relationship: 'Biodiesel Energy Link',
        currentCorrelation: 0.40,
        explanation: 'Soybean oil competes with petroleum for biodiesel production.'
      },
      {
        contract: '/ES',
        relationship: 'Trade War Barometer',
        currentCorrelation: 0.25,
        explanation: 'US-China trade relations affect both soybeans and broader market sentiment.'
      },
      {
        contract: '/GC',
        relationship: 'Dollar Sensitivity Twin',
        currentCorrelation: 0.20,
        explanation: 'Both hurt by strong dollar as commodities priced in USD become expensive for foreign buyers.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Benefits - stronger global growth increases protein consumption',
      riskOff: 'Vulnerable - China reduces imports, demand destruction fears',
      inflation: 'Contributing factor - protein costs feed through to food inflation',
      recession: 'Moderate decline - animal feed demand relatively stable'
    }
  },
  ZW: {
    symbol: '/ZW',
    name: 'Wheat Futures',
    personality: 'The Geopolitical Drama Queen',
    personalityIcon: '🌾',
    description: 'The dramatic friend who turns every minor event into a global crisis. Ukraine conflict? "OMG FOOD SECURITY!" Bad weather in Kansas? "FAMINE INCOMING!" She\'s exhausting but occasionally right.',
    temperament: 'Dramatic and crisis-prone, geopolitically sensitive',
    violentDirection: 'Explosive upside during geopolitical crises - can double in weeks',
    keyTriggers: ['Geopolitical tensions (Russia/Ukraine)', 'Weather in major regions', 'Export restrictions', 'Food security concerns', 'Competing crops'],
    tradingHours: '9:30 AM - 2:20 PM ET (most active), limited overnight',
    beginnerTips: [
      'Most politically sensitive grain - wars and export bans cause spikes',
      'Russia and Ukraine = 30% of global wheat exports',
      'Different classes (hard red winter, spring, etc.) trade separately',
      'Food security premium during geopolitical tensions'
    ],
    currentMood: 'Anxious',
    moodIcon: '😨',
    directionalBias: 'bullish',
    biasStrength: 'strong',
    biasReasoning: 'Ongoing geopolitical tensions affecting Black Sea exports, drought concerns in key growing regions',
    keyRelationships: [
      {
        contract: '/ZC',
        relationship: 'Grain Complex Cousin',
        currentCorrelation: 0.65,
        explanation: 'Both grains but wheat more sensitive to geopolitical events and food security.'
      },
      {
        contract: '/CL',
        relationship: 'Geopolitical Twins',
        currentCorrelation: 0.50,
        explanation: 'Both spike during Middle East/Eastern Europe conflicts affecting supply.'
      },
      {
        contract: '/GC',
        relationship: 'Crisis Hedge Partners',
        currentCorrelation: 0.35,
        explanation: 'Both benefit from geopolitical uncertainty and currency debasement.'
      },
      {
        contract: '/ES',
        relationship: 'Food Inflation Threat',
        currentCorrelation: -0.25,
        explanation: 'Rising wheat prices increase food inflation, hurting consumer spending and stocks.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Moderate - steady demand but less crisis premium',
      riskOff: 'Rockets higher - food security becomes national priority',
      inflation: 'Primary driver - bread prices directly impact consumer budgets',
      recession: 'Defensive - food demand inelastic, government support likely'
    }
  },
  // Currency Futures - The International Drama Club
  '6E': {
    symbol: '/6E',
    name: 'Euro Currency Futures',
    personality: 'The Sophisticated European Mess',
    personalityIcon: '🇪🇺',
    description: 'The sophisticated European who speaks 5 languages but can\'t figure out if they want fiscal union or sovereignty. Elegant on the surface, complete chaos underneath.',
    temperament: 'Cultured but internally conflicted',
    violentDirection: 'Both ways during EU crises - can swing 5%+ on political events',
    keyTriggers: ['ECB policy decisions', 'EU political unity', 'German economic data', 'Peripheral bond spreads', 'US-EU yield differentials'],
    tradingHours: '6:00 PM - 5:00 PM ET next day (24-hour), most active during EU/US overlap',
    beginnerTips: [
      'Watch German 10-year vs US 10-year yield spread - drives EUR/USD',
      'ECB more dovish than Fed historically - rate differentials matter',
      'Political unity crises (Brexit, Italy, etc.) create volatility',
      'Energy dependence on Russia creates geopolitical sensitivity'
    ],
    currentMood: 'Uncertain',
    moodIcon: '😕',
    directionalBias: 'bearish',
    biasStrength: 'moderate',
    biasReasoning: 'ECB dovishness vs Fed hawkishness widens yield differentials, energy crisis weighs on EU growth',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Risk Sentiment Mirror',
        currentCorrelation: 0.60,
        explanation: 'Risk-on benefits both EUR and US stocks, risk-off hurts both vs USD and bonds.'
      },
      {
        contract: '/GC',
        relationship: 'USD Alternative',
        currentCorrelation: 0.40,
        explanation: 'When USD weakens, both EUR and gold often strengthen as alternatives.'
      },
      {
        contract: '/CL',
        relationship: 'Energy Import Burden',
        currentCorrelation: -0.30,
        explanation: 'Higher oil prices hurt EU more due to energy dependence, weakening EUR.'
      },
      {
        contract: '/ZB',
        relationship: 'Yield Differential Play',
        currentCorrelation: -0.45,
        explanation: 'Rising US yields (falling bonds) attract capital from EUR to USD.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Moderate strength - capital flows to higher-yielding USD limit gains',
      riskOff: 'Weakness - safe haven flows go to USD and CHF, not EUR',
      inflation: 'Mixed - ECB behind Fed on tightening, energy inflation hurts',
      recession: 'Vulnerable - EU more sensitive to global slowdown than US'
    }
  },
  '6J': {
    symbol: '/6J',
    name: 'Japanese Yen Futures',
    personality: 'The Polite Kamikaze Pilot',
    personalityIcon: '🇯🇵',
    description: 'The ultra-polite warrior who bows respectfully before absolutely destroying carry trades and risk assets. Stays calm for years, then kamikaze dives through your stop losses.',
    temperament: 'Extremely polite until violently defensive',
    violentDirection: 'Explosive upside during risk-off events - can rally 10%+ in days',
    keyTriggers: ['BoJ intervention levels', 'Risk-off events', 'Carry trade unwinding', 'US-Japan yield spreads', 'Global market volatility'],
    tradingHours: '6:00 PM - 5:00 PM ET next day (24-hour), most active during Asian/US overlap',
    beginnerTips: [
      'Ultimate safe haven currency - strengthens when markets crash',
      'BoJ intervenes when USD/JPY gets too high (historically 145-150)',
      'Carry trade funding currency - borrowed to buy higher-yielding assets',
      'Inverse correlation with risk assets and volatility'
    ],
    currentMood: 'Vigilant',
    moodIcon: '👁️',
    directionalBias: 'bullish',
    biasStrength: 'moderate',
    biasReasoning: 'Market volatility and geopolitical tensions support safe haven demand, but BoJ intervention risk caps gains',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Risk-Off Nemesis',
        currentCorrelation: -0.70,
        explanation: 'Strong inverse relationship - when stocks fall, capital flees to yen safety.'
      },
      {
        contract: '/GC',
        relationship: 'Safe Haven Competition',
        currentCorrelation: 0.50,
        explanation: 'Both strengthen during crisis, but yen more liquid and widely held.'
      },
      {
        contract: '/CL',
        relationship: 'Energy Import Vulnerability',
        currentCorrelation: -0.25,
        explanation: 'Japan imports all oil - higher prices worsen trade balance and weaken yen.'
      },
      {
        contract: '/ZB',
        relationship: 'Safe Haven Partner',
        currentCorrelation: 0.35,
        explanation: 'Both benefit from flight to quality, but yield differentials matter for relative performance.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Weakens - carry trades resume, capital flows to higher yields',
      riskOff: 'Explodes higher - ultimate safe haven repatriation trade',
      inflation: 'Conflicted - BoJ wants inflation but markets fear intervention',
      recession: 'Strongest performer - deflationary mindset and safe haven flows'
    }
  },
  '6B': {
    symbol: '/6B',
    name: 'British Pound Futures',
    personality: 'The Brexit Disaster',
    personalityIcon: '🇬🇧',
    description: 'The posh aristocrat who shot themselves in the foot with Brexit and now wanders around muttering about "sovereignty" while their empire crumbles. Occasionally rallies on nostalgia.',
    temperament: 'Formerly dignified, now erratic and crisis-prone',
    violentDirection: 'Both ways on political drama - Brexit/PM changes cause 5%+ swings',
    keyTriggers: ['BoE policy decisions', 'UK political stability', 'Brexit developments', 'Inflation data', 'US-UK yield spreads'],
    tradingHours: '6:00 PM - 5:00 PM ET next day (24-hour), most active during London/US overlap',
    beginnerTips: [
      'Most politically sensitive major currency - PM changes move markets',
      'BoE often more aggressive on rates than expected - inflation concerns',
      'Brexit aftermath still creates trade/investment uncertainty',
      'Energy crisis hits UK hard due to limited domestic production'
    ],
    currentMood: 'Struggling',
    moodIcon: '😵‍💫',
    directionalBias: 'neutral',
    biasStrength: 'weak',
    biasReasoning: 'BoE hawkishness vs political instability and economic challenges create mixed signals',
    keyRelationships: [
      {
        contract: '/6E',
        relationship: 'European Divorce Drama',
        currentCorrelation: 0.70,
        explanation: 'Still move together despite Brexit - both European currencies affected by similar factors.'
      },
      {
        contract: '/ES',
        relationship: 'Risk Sentiment Follower',
        currentCorrelation: 0.55,
        explanation: 'GBP benefits from risk-on but underperforms due to structural issues.'
      },
      {
        contract: '/CL',
        relationship: 'Energy Import Stress',
        currentCorrelation: -0.35,
        explanation: 'UK energy dependence makes higher oil prices particularly damaging to GBP.'
      },
      {
        contract: '/ZB',
        relationship: 'Yield Differential Competitor',
        currentCorrelation: -0.40,
        explanation: 'Rising US yields attract capital from UK gilts and GBP to USD.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Moderate gains - but lags other currencies due to structural issues',
      riskOff: 'Disproportionate weakness - political risk premium remains high',
      inflation: 'Volatile - BoE hawkishness vs economic weakness creates uncertainty',
      recession: 'Vulnerable - Brexit impact amplifies global slowdown effects'
    }
  },
  '6A': {
    symbol: '/6A',
    name: 'Australian Dollar Futures',
    personality: 'The Commodity Bro Surfer',
    personalityIcon: '🇦🇺',
    description: 'The laid-back surfer dude who\'s actually a commodities genius. Rides the China wave like a pro and knows exactly when iron ore and gold are about to moon. "No worries mate, just following the metals."',
    temperament: 'Chill but commodity-obsessed',
    violentDirection: 'Both ways on China/commodity news - can move 3-5% on key data',
    keyTriggers: ['China economic data', 'Commodity prices (iron ore, gold)', 'RBA policy decisions', 'US-Australia yield spreads', 'Risk appetite'],
    tradingHours: '6:00 PM - 5:00 PM ET next day (24-hour), most active during Asian/US overlap',
    beginnerTips: [
      'Ultimate China proxy - 40% of Australian exports go to China',
      'Iron ore and coal prices drive AUD more than any economic data',
      'High-yielding currency - benefits from carry trades during risk-on',
      'RBA often follows Fed but with commodity considerations'
    ],
    currentMood: 'Optimistic',
    moodIcon: '😎',
    directionalBias: 'bullish',
    biasStrength: 'moderate',
    biasReasoning: 'China reopening benefits commodity demand, high yields attractive in risk-on environment',
    keyRelationships: [
      {
        contract: '/ES',
        relationship: 'Risk-On Best Friend',
        currentCorrelation: 0.75,
        explanation: 'High-beta currency that amplifies risk sentiment - up more in bull markets, down more in bear markets.'
      },
      {
        contract: '/GC',
        relationship: 'Commodity Complex Brother',
        currentCorrelation: 0.60,
        explanation: 'Australia is major gold producer - AUD and gold often move together on commodity themes.'
      },
      {
        contract: '/CL',
        relationship: 'Commodity Cycle Partner',
        currentCorrelation: 0.55,
        explanation: 'Both benefit from commodity supercycles and global growth expectations.'
      },
      {
        contract: '/6J',
        relationship: 'Risk-On vs Risk-Off',
        currentCorrelation: -0.65,
        explanation: 'Perfect opposites - AUD thrives in risk-on when JPY weakens, vice versa in risk-off.'
      }
    ],
    marketRegimeImpact: {
      riskOn: 'Outperforms - commodity currency with high yields, benefits from carry trades',
      riskOff: 'Gets smashed - high-beta currency, China concerns amplify selling',
      inflation: 'Benefits - commodity exporter gains from higher commodity prices',
      recession: 'Deep decline - China demand destruction fears hit commodity currencies hardest'
    }
  }
}

export default function ContractPersonalityPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const [contract, setContract] = useState<ContractPersonality | null>(null)
  const [liveAnalysis, setLiveAnalysis] = useState<ContractAnalysis | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    const symbol = params.symbol as string
    const contractInfo = contractData[symbol.toUpperCase()]
    
    if (contractInfo) {
      setContract(contractInfo)
      // Fetch live analysis
      fetchLiveAnalysis(symbol.toUpperCase())
    } else {
      // Redirect to dashboard if invalid contract
      router.push('/dashboard')
    }
  }, [params.symbol, user, loading, router])

  const fetchLiveAnalysis = async (symbol: string) => {
    try {
      setAnalysisLoading(true)
      const response = await fetch('/api/contract-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: `/${symbol}` })
      })

      if (response.ok) {
        const analysis = await response.json()
        setLiveAnalysis(analysis)
      }
    } catch (error) {
      console.error('Failed to fetch live analysis:', error)
    } finally {
      setAnalysisLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || !contract) {
    return null
  }

  const getBiasColor = (bias: string, strength: string) => {
    if (bias === 'bullish') return strength === 'strong' ? '#059669' : '#10b981'
    if (bias === 'bearish') return strength === 'strong' ? '#dc2626' : '#ef4444'
    return '#64748b'
  }

  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (abs >= 0.7) return 'Very Strong'
    if (abs >= 0.5) return 'Strong'
    if (abs >= 0.3) return 'Moderate'
    if (abs >= 0.1) return 'Weak'
    return 'Very Weak'
  }

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation)
    if (correlation > 0) {
      if (abs >= 0.7) return '#059669'
      if (abs >= 0.5) return '#10b981'
      return '#34d399'
    } else {
      if (abs >= 0.7) return '#dc2626'
      if (abs >= 0.5) return '#ef4444'
      return '#f87171'
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          onClick={() => router.push('/dashboard')} 
          className={styles.backButton}
        >
          ← Back to Dashboard
        </button>
        <h1 className={styles.headerTitle}>Contract Personality Profile</h1>
      </header>

      <main className={styles.main}>
        {/* Contract Header */}
        <section className={styles.contractHeader}>
          <div className={styles.contractIntro}>
            <div className={styles.contractSymbolSection}>
              <span className={styles.personalityIcon}>{contract.personalityIcon}</span>
              <div className={styles.contractTitles}>
                <h1 className={styles.contractSymbol}>{contract.symbol}</h1>
                <h2 className={styles.contractPersonality}>{contract.personality}</h2>
                <p className={styles.contractName}>{contract.name}</p>
              </div>
            </div>
            <div className={styles.currentStatus}>
              <div className={styles.mood}>
                <span className={styles.moodIcon}>{contract.moodIcon}</span>
                <span className={styles.moodText}>Current Mood: {contract.currentMood}</span>
              </div>
              <div 
                className={styles.directionalBias}
                style={{ backgroundColor: getBiasColor(contract.directionalBias, contract.biasStrength) }}
              >
                <span className={styles.biasLabel}>
                  {contract.biasStrength.toUpperCase()} {contract.directionalBias.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <p className={styles.contractDescription}>{contract.description}</p>
        </section>

        {/* Personality Profile */}
        <section className={styles.personalityProfile}>
          <h3 className={styles.sectionTitle}>Personality Profile</h3>
          <div className={styles.profileGrid}>
            <div className={styles.profileCard}>
              <h4 className={styles.profileLabel}>Temperament</h4>
              <p className={styles.profileValue}>{contract.temperament}</p>
            </div>
            <div className={styles.profileCard}>
              <h4 className={styles.profileLabel}>Violent Direction</h4>
              <p className={styles.profileValue}>{contract.violentDirection}</p>
            </div>
            <div className={styles.profileCard}>
              <h4 className={styles.profileLabel}>Trading Hours</h4>
              <p className={styles.profileValue}>{contract.tradingHours}</p>
            </div>
          </div>
        </section>

        {/* Price Chart */}
        <section className={styles.priceChart}>
          <h3 className={styles.sectionTitle}>📈 Price Chart & Technical Analysis</h3>
          <FuturesChart symbol={contract.symbol} height={400} />
        </section>

        {/* Current Market Analysis */}
        <section className={styles.marketAnalysis}>
          <h3 className={styles.sectionTitle}>Current Market Analysis</h3>
          
          {/* Live AI Analysis */}
          {liveAnalysis && (
            <div className={styles.liveAnalysisCard}>
              <div className={styles.liveHeader}>
                <h4 className={styles.liveTitle}>🤖 Live AI Analysis</h4>
                <span className={styles.liveTimestamp}>
                  Updated: {new Date(liveAnalysis.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className={styles.biasSection}>
                <h4 className={styles.biasTitle}>
                  AI Directional Bias: 
                  <span 
                    className={styles.biasValue}
                    style={{ color: getBiasColor(liveAnalysis.directionalBias, liveAnalysis.biasStrength) }}
                  >
                    {liveAnalysis.biasStrength} {liveAnalysis.directionalBias}
                  </span>
                </h4>
                <p className={styles.biasReasoning}>{liveAnalysis.biasReasoning}</p>
                
                <div className={styles.marketRegime}>
                  <strong>Market Regime:</strong> {liveAnalysis.marketRegimeAnalysis?.currentRegime.replace('_', ' ').toUpperCase()} 
                  ({liveAnalysis.marketRegimeAnalysis?.regimeConfidence}% confidence)
                </div>
                <p className={styles.regimeImpact}>{liveAnalysis.marketRegimeAnalysis?.impactOnContract}</p>
              </div>
            </div>
          )}
          
          {analysisLoading && (
            <div className={styles.analysisLoading}>
              <div className={styles.spinner}></div>
              <span>Generating live market analysis...</span>
            </div>
          )}
          
          {/* Static Analysis for Comparison */}
          <div className={styles.analysisCard}>
            <div className={styles.staticHeader}>
              <h4 className={styles.staticTitle}>📚 Educational Baseline</h4>
            </div>
            <div className={styles.biasSection}>
              <h4 className={styles.biasTitle}>
                Baseline Bias: 
                <span 
                  className={styles.biasValue}
                  style={{ color: getBiasColor(contract.directionalBias, contract.biasStrength) }}
                >
                  {contract.biasStrength} {contract.directionalBias}
                </span>
              </h4>
              <p className={styles.biasReasoning}>{contract.biasReasoning}</p>
            </div>
          </div>
        </section>

        {/* Market Relationships - THE KEY INSIGHT */}
        <section className={styles.relationships}>
          <h3 className={styles.sectionTitle}>🔗 How {contract.symbol} Relates to Other Markets</h3>
          <p className={styles.relationshipsIntro}>
            Understanding these relationships is the key to market awareness. Each contract doesn&apos;t trade in isolation - 
            they&apos;re all connected in a complex web of economic relationships.
          </p>
          
          <div className={styles.relationshipGrid}>
            {contract.keyRelationships.map((rel, index) => (
              <div key={index} className={styles.relationshipCard}>
                <div className={styles.relationshipHeader}>
                  <span className={styles.relatedContract}>{rel.contract}</span>
                  <div 
                    className={styles.correlationBadge}
                    style={{ backgroundColor: getCorrelationColor(rel.currentCorrelation) }}
                  >
                    {rel.currentCorrelation > 0 ? '+' : ''}{rel.currentCorrelation.toFixed(2)}
                  </div>
                </div>
                <h4 className={styles.relationshipType}>{rel.relationship}</h4>
                <p className={styles.relationshipExplanation}>{rel.explanation}</p>
                <div className={styles.correlationStrength}>
                  <strong>{getCorrelationStrength(rel.currentCorrelation)} {rel.currentCorrelation > 0 ? 'Positive' : 'Negative'} Correlation</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Market Regime Impact */}
        <section className={styles.marketRegimes}>
          <h3 className={styles.sectionTitle}>📊 How {contract.symbol} Behaves in Different Market Regimes</h3>
          <div className={styles.regimeGrid}>
            <div className={styles.regimeCard}>
              <h4 className={styles.regimeTitle}>🚀 Risk On</h4>
              <p className={styles.regimeDescription}>{contract.marketRegimeImpact.riskOn}</p>
            </div>
            <div className={styles.regimeCard}>
              <h4 className={styles.regimeTitle}>🛡️ Risk Off</h4>
              <p className={styles.regimeDescription}>{contract.marketRegimeImpact.riskOff}</p>
            </div>
            <div className={styles.regimeCard}>
              <h4 className={styles.regimeTitle}>📈 Inflation</h4>
              <p className={styles.regimeDescription}>{contract.marketRegimeImpact.inflation}</p>
            </div>
            <div className={styles.regimeCard}>
              <h4 className={styles.regimeTitle}>📉 Recession</h4>
              <p className={styles.regimeDescription}>{contract.marketRegimeImpact.recession}</p>
            </div>
          </div>
        </section>

        {/* Key Triggers */}
        <section className={styles.triggers}>
          <h3 className={styles.sectionTitle}>⚡ What Makes {contract.symbol} Move</h3>
          <div className={styles.triggerList}>
            {contract.keyTriggers.map((trigger, index) => (
              <div key={index} className={styles.triggerItem}>
                <span className={styles.triggerBullet}>•</span>
                <span className={styles.triggerText}>{trigger}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Beginner Tips */}
        <section className={styles.beginnerTips}>
          <h3 className={styles.sectionTitle}>💡 Beginner Tips for Trading {contract.symbol}</h3>
          <div className={styles.tipsList}>
            {contract.beginnerTips.map((tip, index) => (
              <div key={index} className={styles.tipItem}>
                <span className={styles.tipNumber}>{index + 1}</span>
                <span className={styles.tipText}>{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <section className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={() => router.push('/dashboard')}
          >
            ← Back to All Contracts
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => router.push('/learn')}
          >
            📚 Continue Learning
          </button>
        </section>
      </main>
    </div>
  )
}