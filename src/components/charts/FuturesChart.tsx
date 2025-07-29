'use client'

import { useState, useEffect } from 'react'
import { 
  ComposedChart, 
  AreaChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Line,
  Bar,
  Area
} from 'recharts'
import styles from './FuturesChart.module.css'

interface HistoricalDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface FuturesChartProps {
  symbol: string
  height?: number
}

type ChartType = 'candlestick' | 'line' | 'area'
type TimePeriod = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y'


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isUp = data.close > data.open
    
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipDate}>{new Date(label).toLocaleDateString()}</p>
        <div className={styles.tooltipData}>
          <div className={styles.tooltipRow}>
            <span>Open:</span>
            <span>${data.open?.toFixed(2)}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span>High:</span>
            <span>${data.high?.toFixed(2)}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span>Low:</span>
            <span>${data.low?.toFixed(2)}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span>Close:</span>
            <span style={{ color: isUp ? '#10b981' : '#ef4444' }}>
              ${data.close?.toFixed(2)}
            </span>
          </div>
          <div className={styles.tooltipRow}>
            <span>Volume:</span>
            <span>{data.volume?.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export default function FuturesChart({ symbol, height = 400 }: FuturesChartProps) {
  const [data, setData] = useState<HistoricalDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartType, setChartType] = useState<ChartType>('candlestick')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1mo')

  useEffect(() => {
    fetchHistoricalData()
  }, [symbol, timePeriod])

  const fetchHistoricalData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/historical-data?symbol=${encodeURIComponent(symbol)}&period=${timePeriod}&interval=1d`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical data')
      }
      
      const result = await response.json()
      setData(result.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chart data')
      console.error('Chart data error:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem)
    if (timePeriod === '1d') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getChartColor = () => {
    if (data.length === 0) return '#64748b'
    const first = data[0]
    const last = data[data.length - 1]
    return last.close > first.close ? '#10b981' : '#ef4444'
  }

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisTick}
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            domain={['dataMin - 1', 'dataMax + 1']}
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke={getChartColor()}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: getChartColor() }}
          />
        </ComposedChart>
      )
    }

    if (chartType === 'area') {
      return (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={getChartColor()} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatXAxisTick}
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            domain={['dataMin - 1', 'dataMax + 1']}
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="close" 
            stroke={getChartColor()}
            strokeWidth={2}
            fill="url(#colorClose)"
            dot={false}
          />
        </AreaChart>
      )
    }

    // Candlestick chart (simplified as line with high/low indicators)
    return (
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatXAxisTick}
          stroke="#64748b"
          fontSize={12}
        />
        <YAxis 
          domain={['dataMin - 1', 'dataMax + 1']}
          stroke="#64748b"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        {/* High-Low range as bars */}
        <Bar 
          dataKey="high" 
          fill="rgba(100, 116, 139, 0.1)"
          stroke="#64748b"
          strokeWidth={1}
        />
        {/* Close price line */}
        <Line 
          type="monotone" 
          dataKey="close" 
          stroke={getChartColor()}
          strokeWidth={2}
          dot={{ fill: getChartColor(), r: 3 }}
          activeDot={{ r: 5, fill: getChartColor() }}
        />
      </ComposedChart>
    )
  }

  if (loading) {
    return (
      <div className={styles.container} style={{ height }}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading chart data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container} style={{ height }}>
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          <p>{error}</p>
          <button onClick={fetchHistoricalData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container} style={{ height: height + 80 }}>
      {/* Chart Controls */}
      <div className={styles.controls}>
        <div className={styles.periodButtons}>
          {(['1d', '5d', '1mo', '3mo', '6mo', '1y'] as TimePeriod[]).map(period => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`${styles.periodButton} ${timePeriod === period ? styles.active : ''}`}
            >
              {period.replace('mo', 'M').replace('y', 'Y')}
            </button>
          ))}
        </div>
        
        <div className={styles.chartTypeButtons}>
          {(['candlestick', 'line', 'area'] as ChartType[]).map(type => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`${styles.typeButton} ${chartType === type ? styles.active : ''}`}
            >
              {type === 'candlestick' ? '📊' : type === 'line' ? '📈' : '📉'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      {data.length > 0 && (
        <div className={styles.chartInfo}>
          <div className={styles.priceInfo}>
            <span className={styles.currentPrice}>
              Current: ${data[data.length - 1]?.close?.toFixed(2)}
            </span>
            <span className={`${styles.priceChange} ${
              data[data.length - 1]?.close > data[0]?.close ? styles.positive : styles.negative
            }`}>
              {data.length > 1 && (
                `${data[data.length - 1]?.close > data[0]?.close ? '+' : ''}${
                  (((data[data.length - 1]?.close - data[0]?.close) / data[0]?.close) * 100).toFixed(2)
                }%`
              )}
            </span>
          </div>
          <div className={styles.periodInfo}>
            {timePeriod.replace('mo', ' month').replace('y', ' year')} • {data.length} data points
          </div>
        </div>
      )}
    </div>
  )
}