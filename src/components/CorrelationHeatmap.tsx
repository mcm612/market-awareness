'use client'

import { useState, useEffect } from 'react'
import styles from './CorrelationHeatmap.module.css'

interface CorrelationData {
  symbol: string
  correlations: { [key: string]: number }
}

interface CorrelationResponse {
  correlationMatrix: CorrelationData[]
  metadata: {
    totalContracts: number
    validContracts: number
    period: string
    calculatedAt: string
    dataPoints: number
  }
}

// Contract personalities mapping
const CONTRACT_PERSONALITIES: { [key: string]: { name: string; emoji: string } } = {
  '/ES': { name: 'Paper-Handed Boomer', emoji: '📰' },
  '/NQ': { name: 'YOLO Diamond Hands Ape', emoji: '🦍' },
  '/ZB': { name: 'Theta Gang Boomer', emoji: '🏦' },
  '/GC': { name: 'Paranoid Prepper King', emoji: '👑' },
  '/SI': { name: 'Poor Man\'s Gold Pleb', emoji: '🥈' },
  '/CL': { name: 'Bipolar Energy Chad', emoji: '💥' },
  '/HG': { name: 'Economic PhD Chad', emoji: '🔧' },
  '/ZC': { name: 'Midwest Karen', emoji: '🌽' },
  '/ZS': { name: 'Vegan Influencer', emoji: '🫘' },
  '/ZW': { name: 'Geopolitical Drama Queen', emoji: '🌾' },
  '/6E': { name: 'Sophisticated European Mess', emoji: '🇪🇺' },
  '/6J': { name: 'Polite Kamikaze Pilot', emoji: '🇯🇵' },
  '/6B': { name: 'Brexit Disaster', emoji: '🇬🇧' },
  '/6A': { name: 'Commodity Bro Surfer', emoji: '🇦🇺' }
}

// Get color for correlation value
function getCorrelationColor(correlation: number): string {
  const abs = Math.abs(correlation)
  
  if (correlation > 0.7) return '#10b981' // Strong positive - green
  if (correlation > 0.3) return '#34d399' // Medium positive - light green  
  if (correlation > -0.3) return '#6b7280' // Weak correlation - gray
  if (correlation > -0.7) return '#f87171' // Medium negative - light red
  return '#ef4444' // Strong negative - red
}

// Get text color for correlation cell
function getTextColor(correlation: number): string {
  const abs = Math.abs(correlation)
  return abs > 0.5 ? '#ffffff' : '#1f2937'
}

// Get correlation strength description
function getCorrelationStrength(correlation: number): string {
  const abs = Math.abs(correlation)
  if (abs > 0.7) return correlation > 0 ? 'Strong Positive' : 'Strong Negative'
  if (abs > 0.3) return correlation > 0 ? 'Moderate Positive' : 'Moderate Negative'
  return 'Weak/No Correlation'
}

export default function CorrelationHeatmap() {
  const [data, setData] = useState<CorrelationResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ x: string, y: string } | null>(null)

  useEffect(() => {
    fetchCorrelationData()
  }, [])

  const fetchCorrelationData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/correlations')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setData(result)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch correlation data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load correlation data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Calculating correlations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>Unable to load correlation data</h3>
          <p>{error}</p>
          <button onClick={fetchCorrelationData} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data || data.correlationMatrix.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noData}>
          <h3>No correlation data available</h3>
          <p>Please try again later</p>
        </div>
      </div>
    )
  }

  const symbols = data.correlationMatrix.map(item => item.symbol).sort()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Futures Contract Correlations
        </h2>
        <p className={styles.subtitle}>
          How our 13 contract personalities relate to each other
        </p>
        <div className={styles.metadata}>
          <span>📊 {data.metadata.dataPoints} days of data</span>
          <span>🔄 Last updated: {new Date(data.metadata.calculatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className={styles.heatmapWrapper}>
        <div className={styles.heatmap}>
          {/* Column headers */}
          <div className={styles.columnHeaders}>
            <div className={styles.cornerCell}></div>
            {symbols.map(symbol => (
              <div key={symbol} className={styles.columnHeader}>
                <span className={styles.headerSymbol}>{symbol}</span>
                <span className={styles.headerEmoji}>
                  {CONTRACT_PERSONALITIES[symbol]?.emoji}
                </span>
              </div>
            ))}
          </div>

          {/* Heatmap rows */}
          <div className={styles.heatmapBody}>
            {symbols.map(rowSymbol => {
              const rowData = data.correlationMatrix.find(item => item.symbol === rowSymbol)
              if (!rowData) return null

              return (
                <div key={rowSymbol} className={styles.heatmapRow}>
                  {/* Row header */}
                  <div className={styles.rowHeader}>
                    <span className={styles.rowSymbol}>{rowSymbol}</span>
                    <span className={styles.rowName}>
                      {CONTRACT_PERSONALITIES[rowSymbol]?.name}
                    </span>
                  </div>

                  {/* Correlation cells */}
                  {symbols.map(colSymbol => {
                    const correlation = rowData.correlations[colSymbol] || 0
                    const isDiagonal = rowSymbol === colSymbol
                    const isHovered = hoveredCell?.x === colSymbol && hoveredCell?.y === rowSymbol

                    return (
                      <div
                        key={`${rowSymbol}-${colSymbol}`}
                        className={`${styles.correlationCell} ${isDiagonal ? styles.diagonal : ''} ${isHovered ? styles.hovered : ''}`}
                        style={{
                          backgroundColor: getCorrelationColor(correlation),
                          color: getTextColor(correlation)
                        }}
                        onMouseEnter={() => setHoveredCell({ x: colSymbol, y: rowSymbol })}
                        onMouseLeave={() => setHoveredCell(null)}
                        title={`${rowSymbol} vs ${colSymbol}: ${correlation.toFixed(3)} (${getCorrelationStrength(correlation)})`}
                      >
                        {isDiagonal ? '1.00' : correlation.toFixed(2)}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>

        {/* Tooltip */}
        {hoveredCell && (
          <div className={styles.tooltip}>
            <div className={styles.tooltipContent}>
              <h4>{hoveredCell.y} vs {hoveredCell.x}</h4>
              <p className={styles.tooltipPersonalities}>
                <strong>{CONTRACT_PERSONALITIES[hoveredCell.y]?.name}</strong>
                <br />
                vs
                <br />
                <strong>{CONTRACT_PERSONALITIES[hoveredCell.x]?.name}</strong>
              </p>
              {(() => {
                const rowData = data.correlationMatrix.find(item => item.symbol === hoveredCell.y)
                const correlation = rowData?.correlations[hoveredCell.x] || 0
                return (
                  <div className={styles.tooltipStats}>
                    <div className={styles.correlationValue}>
                      Correlation: <strong>{correlation.toFixed(3)}</strong>
                    </div>
                    <div className={styles.correlationStrength}>
                      {getCorrelationStrength(correlation)}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className={styles.legend}>
          <h4>Correlation Strength</h4>
          <div className={styles.legendItems}>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#10b981' }}></div>
              <span>Strong Positive (0.7+)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#34d399' }}></div>
              <span>Moderate Positive (0.3-0.7)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#6b7280' }}></div>
              <span>Weak (-0.3 to 0.3)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#f87171' }}></div>
              <span>Moderate Negative (-0.7 to -0.3)</span>
            </div>
            <div className={styles.legendItem}>
              <div className={styles.legendColor} style={{ backgroundColor: '#ef4444' }}></div>
              <span>Strong Negative (-0.7+)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}